import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useWordStore = defineStore('wordStore', () => {
  const words = ref([
    {
      id: 1,
      english: 'apple',
      chinese: '蘋果',
      image: '',
      errorCount: 0,
    },
    {
      id: 2,
      english: 'banana',
      chinese: '香蕉',
      image: '',
      errorCount: 0,
    },
    {
      id: 3,
      english: 'juice',
      chinese: '果汁',
      image: '',
      errorCount: 0,
    },
    {
      id: 4,
      english: 'all',
      chinese: '全部',
      image: '',
      errorCount: 0,
    },
  ]);
  const addWord = (word) => {
    words.value.push({ ...word, errorCount: 0 });
    save();
  };
  const recordError = (wordId) => {
    const word = words.value.find((w) => w.id === wordId);
    if (word) {
      word.errorCount++;
      save();
    }
  };
  const getWeightedRandomWord = () => {
    const totalWeight = words.value.reduce((sum, w) => sum + (1 + w.errorCount), 0);
    console.log('totalWeight', totalWeight);
    let r = Math.random() * totalWeight;
    console.log('r', r);
    console.log('words.value', words.value);
    for (const w of words.value) {
      r -= 1 + w.errorCount;
      if (r <= 0) return w;
    }
    return words.value[0];
  };
  const save = () => localStorage.setItem('words', JSON.stringify(words.value));
  const load = () => {
    const data = localStorage.getItem('words');
    if (data) words.value = JSON.parse(data);
  };
  return { words, addWord, recordError, getWeightedRandomWord, save, load };
});
