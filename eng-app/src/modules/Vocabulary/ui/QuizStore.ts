import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';
import { computed, ref } from 'vue';
import type { QuizWord } from '../domain';
import { GeQuiztWords } from '../infra/WordBank';

export const useQuizStore = defineStore('quizStore', () => {
  // const words = useLocalStorage<QuizWord[]>('words', ref(GetWords()));
  const words = useLocalStorage<QuizWord[]>('words', ref(GeQuiztWords(new Set(['2_1']))));
  const resetQuiz = () => {
    console.log('resetQuiz', '1', GeQuiztWords(new Set(['2_1'])));
    words.value.splice(0);
    // console.log('resetQuiz', GetWords());
    words.value.push(...GeQuiztWords(new Set(['2_1'])));
  };
  const recordCorrectAns = (id: number) => {
    const w = words.value.find((word) => word.id === id);
    if (!w) return;
    w.correctRec.count += 1;
    w.correctRec.lastTime = Date.now(); // 註：我們不需要判斷上次是答對還是答錯，只需要知道上次答題和本次答題的時間差
    // 這裡的邏輯是基於「本次作答」與「上次的作答類型」的比較
    // 判斷上次是哪種作答 (使用 lastTime 判斷哪個記錄是最近的)
    // 判斷：如果上次是答對，連續次數遞增；否則，重置為 1
    if (w.correctRec.lastTime > w.errorRec.lastTime) {
      // 這是連續答對
      w.correctRec.consecutive += 1; // 對方的連續次數必須重置
      w.errorRec.consecutive = 0;
    } else {
      // 上次是答錯 (或兩者時間相同/皆為 0)，新的連續答對從 1 開始
      w.correctRec.consecutive = 1;
      w.errorRec.consecutive = 0;
    }
  };
  const recordErrorAns = (id: number) => {
    const w = words.value.find((word) => word.id === id);
    if (!w) return;
    w.errorRec.count += 1;
    w.errorRec.lastTime = Date.now();
    // 判斷：如果上次是答錯，連續次數遞增；否則，重置為 1
    if (w.errorRec.lastTime > w.correctRec.lastTime) {
      // 這是連續答錯
      w.errorRec.consecutive += 1; // 對方的連續次數必須重置
      w.correctRec.consecutive = 0;
    } else {
      // 上次是答對，新的連續答錯從 1 開始
      w.errorRec.consecutive = 1;
      w.correctRec.consecutive = 0;
    }
  };
  const meta = computed(() => {
    const _words = words.value.slice();
    const d = _words.map((x) => ({
      consecutiveCorrect: x.correctRec.count,
      consecutiveError: x.errorRec.count,
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
  return { words, resetQuiz, recordCorrectAns, recordErrorAns, meta };
});
