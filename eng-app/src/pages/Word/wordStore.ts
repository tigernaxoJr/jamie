import { defineStore } from 'pinia';
import { ref } from 'vue';
import { CreateWord, type Word } from './model';

export const useWordStore = defineStore('wordStore', () => {
  const words = ref<Array<Word>>([
    CreateWord(1, 'apple', '蘋果'),
    CreateWord(2, 'banana', '香蕉'),
    CreateWord(3, 'juice', '果汁'),
    CreateWord(4, 'all', '全部'),
  ]);
  const addWord = (word: Word) => words.value.push(word);
  const addWords = (words: Word[]) => words.forEach((w) => addWord(w));
  const recordError = (wordId: number) => {
    const word = words.value.find((w) => w.id === wordId);
    if (word) word.error_rec.count++;
  };
  const recordCorrect = (wordId: number) => {
    const word = words.value.find((w) => w.id === wordId);
    if (word) word.correct_rec.count++;
  };
  const getWeightedRandomWord = (): Word => {
    const totalWeight = words.value.reduce((sum, w) => sum + (1 + w.error_rec.count), 0);
    console.log('totalWeight', totalWeight);
    let r = Math.random() * totalWeight;
    console.log('r', r);
    console.log('words.value', words.value);
    for (const w of words.value) {
      r -= 1 + w.error_rec.count;
      if (r <= 0) return w;
    }
    return words.value[0] as Word;
  };
  return {
    words,
    addWord,
    addWords,
    recordError,
    recordCorrect,
    getWeightedRandomWord,
    // save, load
  };
});
