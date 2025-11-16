import { defineStore } from 'pinia';
// import { ref } from 'vue';
// import { Word } from '../domain/Word';
import { words } from '../domain/v2_1_5';

export const useWordStore = defineStore('wordStore', () => {
  return {
    words,
  };
});
