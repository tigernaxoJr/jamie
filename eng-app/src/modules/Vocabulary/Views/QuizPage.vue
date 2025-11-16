<template>
  <!-- <div>{{ store.words }}</div> -->

  <div>題目:{{ currentWord?.chinese || '取得題目失敗' }}</div>
  <!-- 作答： -->
  <q-input @keyup.enter="checkAnswer" v-model="answer" />

  <q-btn @click="checkAnswer">checkAnswer</q-btn>
  <q-btn @click="resetQuiz">resetQuiz</q-btn>
  <div>連續答錯1次的單字: ? 個</div>
  <div>連續答錯2次的單字: ? 個</div>
  <div>連續答錯3次以上的單字: ? 個</div>
  <div>連續答對3次的單字: ? 個</div>
  <div>所有單字: ? 個</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useWordStore } from '../store';
import { type Word, WordQuizService } from '../domain';
const wordQuizeService = new WordQuizService();
const answer = ref<string>('');
const store = useWordStore();
const currentWord = ref<Word | undefined>(wordQuizeService.getNextQuizWord(store.words));
const showHint = ref<boolean>(false);
const questionsAnswered = ref(0);

// next

const nextQuestion = () => {
  currentWord.value = wordQuizeService.getNextQuizWord(store.words);
  answer.value = '';
  showHint.value = false;
};
const resetQuiz = () => {
  nextQuestion();
  questionsAnswered.value = 0;
};
const checkAnswer = () => {
  if (!currentWord.value || !answer.value.trim()) return;
  const correct = answer.value.trim().toLowerCase() === currentWord.value.english.toLowerCase();
  questionsAnswered.value++;
  if (correct) {
    currentWord.value.recordCorrectAnswer();
  } else {
    currentWord.value.recordErrorAnswer();
  }
  nextQuestion();
};
</script>

<style scoped></style>
