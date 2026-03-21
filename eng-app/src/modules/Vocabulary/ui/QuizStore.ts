import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';
import { computed, ref } from 'vue';
import type { QuizWord } from '../domain';
import { GeQuiztWords } from '../infra/WordBank';
import { WordMetaStorage } from '../infra/WordMetaStorage';
import Categories from '../infra/Category';

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

  const words = useLocalStorage<QuizWord[]>(
    'words',
    GeQuiztWords(new Set(selectedCategories.value)),
  );

  /**
   * 重新開始：清除當前所選類別的單字 metadata，然後重新載入。
   */
  const resetQuiz = () => {
    // 清除當前單字的長期記憶
    const currentEnglishKeys = words.value.map((w) => w.english);
    WordMetaStorage.removeMany(currentEnglishKeys);
    lastWordIds.value = [];
    words.value = GeQuiztWords(new Set(selectedCategories.value));
  };

  /**
   * 切換類別：僅重新載入單字，不清除任何 metadata。
   */
  const setCategories = (ids: string[]) => {
    selectedCategories.value = ids;
    words.value = GeQuiztWords(new Set(selectedCategories.value));
  };
  const recordCorrectAns = (id: number) => {
    const w = words.value.find((word) => word.id === id);
    if (!w) return;
    w.correctRec.count += 1;
    w.correctRec.consecutive += 1;
    w.correctRec.lastTime = Date.now();
    w.errorRec.consecutive = 0;
    // 持久化到長期記憶
    WordMetaStorage.save(w.english, {
      errorRec: { ...w.errorRec },
      correctRec: { ...w.correctRec },
    });
  };

  const recordErrorAns = (id: number) => {
    const w = words.value.find((word) => word.id === id);
    if (!w) return;
    w.errorRec.count += 1;
    w.errorRec.lastTime = Date.now();
    w.errorRec.consecutive += 1;
    w.correctRec.consecutive = 0;
    // 持久化到長期記憶
    WordMetaStorage.save(w.english, {
      errorRec: { ...w.errorRec },
      correctRec: { ...w.correctRec },
    });
  };

  const meta = computed(() => {
    const _words = words.value.slice();
    const d = _words.map((x) => ({
      consecutiveCorrect: x.correctRec.consecutive,
      consecutiveError: x.errorRec.consecutive,
    }));
    const count = words.value.length;
    const e1 = d.filter(({ consecutiveError: e }) => e === 1).length;
    const e2 = d.filter(({ consecutiveError: e }) => e === 2).length;
    const e3 = d.filter(({ consecutiveError: e }) => e >= 3).length;
    const c1 = d.filter(({ consecutiveCorrect: c }) => c === 1).length;
    const c2 = d.filter(({ consecutiveCorrect: c }) => c === 2).length;
    const c3 = d.filter(({ consecutiveCorrect: c }) => c >= 3).length;
    return { count, e1, e2, e3, c1, c2, c3 };
  });
  /**
   * 清除所有長期記憶（遺忘所有單字的答題記錄）。
   * 會同時重置當前測驗。
   */
  const clearMemory = () => {
    WordMetaStorage.clearAll();
    lastWordIds.value = [];
    words.value = GeQuiztWords(new Set(selectedCategories.value));
  };

  return {
    words,
    categoryOptions,
    selectedCategories,
    setCategories,
    resetQuiz,
    recordCorrectAns,
    recordErrorAns,
    meta,
    lastWordIds,
    recordLastWord,
    clearMemory,
  };
});
