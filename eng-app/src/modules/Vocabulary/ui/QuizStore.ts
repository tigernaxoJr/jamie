import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';
import { computed, ref } from 'vue';
import type { QuizWord } from '../domain';
import { GeQuiztWords } from '../infra/WordBank';
import Categories from '../infra/Category';

export const useQuizStore = defineStore('quizStore', () => {
  const categoryOptions = ref(Categories);
  const selectedCategories = useLocalStorage<string[]>('quiz-selected-categories', ['2_1']);

  const wordsRaw = GeQuiztWords(new Set(selectedCategories.value));
  const words = useLocalStorage<QuizWord[]>('words', ref(wordsRaw));

  const resetQuiz = () => {
    words.value.splice(0);
    words.value.push(...wordsRaw);
  };

  const setCategories = (ids: string[]) => {
    selectedCategories.value = ids;
    resetQuiz();
  };
  const recordCorrectAns = (id: number) => {
    const w = words.value.find((word) => word.id === id);
    if (!w) return;
    w.correctRec.count += 1;
    w.correctRec.consecutive += 1;
    w.correctRec.lastTime = Date.now();
    w.errorRec.consecutive = 0;
  };

  const recordErrorAns = (id: number) => {
    const w = words.value.find((word) => word.id === id);
    if (!w) return;
    w.errorRec.count += 1;
    w.errorRec.lastTime = Date.now();
    w.errorRec.consecutive += 1;
    w.correctRec.consecutive = 0;
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
  return {
    words,
    categoryOptions,
    selectedCategories,
    setCategories,
    resetQuiz,
    recordCorrectAns,
    recordErrorAns,
    meta,
  };
});
