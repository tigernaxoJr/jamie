import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';
import { computed, ref } from 'vue';
import type { QuizMeta, QuizWord } from '../domain';
import { loadQuizWords } from '../infra/WordBank';
import { WordMetaStorage } from '../infra/WordMetaStorage';
import Categories from '../infra/Category';

const LEGACY_WORDS_KEY = 'words';

/**
 * 舊版會把整份單字清單存在 localStorage 'words'。
 * 將其中尚未存在於 WordMetaStorage 的答題記錄搬過去，然後移除舊 key。
 */
const migrateLegacyWords = () => {
  try {
    const raw = localStorage.getItem(LEGACY_WORDS_KEY);
    if (!raw) return;
    const legacy = JSON.parse(raw) as Partial<QuizWord>[];
    if (Array.isArray(legacy)) {
      const map = WordMetaStorage.loadAll();
      for (const w of legacy) {
        if (!w.english || !w.errorRec || !w.correctRec) continue;
        const key = w.english.toLowerCase();
        const answered = w.errorRec.lastTime > 0 || w.correctRec.lastTime > 0;
        if (answered && !map[key]) {
          map[key] = { errorRec: w.errorRec, correctRec: w.correctRec };
        }
      }
      WordMetaStorage.saveAll(map);
    }
    localStorage.removeItem(LEGACY_WORDS_KEY);
  } catch {
    // 舊資料毀損就直接忽略
  }
};

export const useQuizStore = defineStore('quizStore', () => {
  const categoryOptions = ref(Categories);
  const selectedCategories = useLocalStorage<string[]>('quiz-selected-categories', []);
  const lastWordIds = useLocalStorage<number[]>('quiz-last-word-ids', []);

  const recordLastWord = (id: number) => {
    // Keep only the last 10 words
    const MAX_HISTORY = 10;
    lastWordIds.value.push(id);
    if (lastWordIds.value.length > MAX_HISTORY) {
      lastWordIds.value.shift();
    }
  };

  migrateLegacyWords();
  // 單字清單由題庫 + 長期記憶 (WordMetaStorage) 組成，不再整份存進 localStorage，
  // 避免每次答題都序列化整個清單，也讓題庫更新能直接生效。
  const words = ref<QuizWord[]>(loadQuizWords(new Set(selectedCategories.value)));

  /**
   * 重新開始：清除當前所選類別的單字 metadata，然後重新載入。
   */
  const resetQuiz = () => {
    // 清除當前單字的長期記憶
    const currentEnglishKeys = words.value.map((w) => w.english);
    WordMetaStorage.removeMany(currentEnglishKeys);
    lastWordIds.value = [];
    words.value = loadQuizWords(new Set(selectedCategories.value));
  };

  /**
   * 切換類別：僅重新載入單字，不清除任何 metadata。
   */
  const setCategories = (ids: string[]) => {
    selectedCategories.value = ids;
    words.value = loadQuizWords(new Set(selectedCategories.value));
  };
  /**
   * 從長期記憶重新載入單字（其他模組如遊戲也可能更新答題記錄）。
   */
  const reloadWords = () => {
    words.value = loadQuizWords(new Set(selectedCategories.value));
  };

  /**
   * 記錄答題結果到長期記憶。
   * 同一個英文字可能出現在多個題目（例如 right：右邊 / 正確的），
   * 記錄是共用的，所以更新後要同步到所有同字的題目，避免之後用舊資料覆蓋。
   */
  const recordAnswer = (id: number, correct: boolean) => {
    const w = words.value.find((word) => word.id === id);
    if (!w) return;
    const key = w.english.toLowerCase();
    const entry = WordMetaStorage.record(key, correct);
    for (const other of words.value) {
      if (other.english.toLowerCase() !== key) continue;
      other.errorRec = { ...entry.errorRec };
      other.correctRec = { ...entry.correctRec };
    }
  };

  const meta = computed<QuizMeta>(() => {
    const m: QuizMeta = { count: words.value.length, e1: 0, e2: 0, e3: 0, c1: 0, c2: 0, c3: 0 };
    for (const w of words.value) {
      const e = w.errorRec.consecutive;
      const c = w.correctRec.consecutive;
      if (e === 1) m.e1++;
      else if (e === 2) m.e2++;
      else if (e >= 3) m.e3++;
      if (c === 1) m.c1++;
      else if (c === 2) m.c2++;
      else if (c >= 3) m.c3++;
    }
    return m;
  });
  /**
   * 清除所有長期記憶（遺忘所有單字的答題記錄）。
   * 會同時重置當前測驗。
   */
  const clearMemory = () => {
    WordMetaStorage.clearAll();
    lastWordIds.value = [];
    words.value = loadQuizWords(new Set(selectedCategories.value));
  };

  return {
    words,
    categoryOptions,
    selectedCategories,
    setCategories,
    reloadWords,
    resetQuiz,
    recordAnswer,
    meta,
    lastWordIds,
    recordLastWord,
    clearMemory,
  };
});
