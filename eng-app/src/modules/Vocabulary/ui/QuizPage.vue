<template>
  <q-page padding class="flex flex-center">
    <q-card flat bordered style="width: 100%; max-width: 400px" class="q-pa-lg">
      <q-card-section class="q-pa-none" v-if="currentWord">
        <div class="text-h5 text-weight-bold text-center">
          {{ currentWord?.chinese || '取得題目失敗' }}
        </div>
        <div
          v-if="!anserChecked"
          class="row justify-center text-subtitle1 text-grey-6 q-gutter-x-sm q-my-sm"
        >
          <span v-if="showLength"> ( {{ currentWord.english.length }} 字 ) </span>
          <BtnHint v-else label="字數: 開" @click="showAnswer = true" />

          <span v-if="showHint"> [ {{ currentWord.english.charAt(0).toUpperCase() }}*** ] </span>
          <BtnHint v-else label="首字: 開" @click="showAnswer = true" />

          <span v-if="showAnswer || anserChecked">
            [ {{ currentWord.english }} ]
            <SpeechStrip :word="currentWord.english" />
          </span>
          <BtnHint v-else label="答案" @click="showAnswer = true" />
        </div>

        <div v-if="anserChecked" class="q-my-md text-center">
          <q-chip
            v-if="correctAns"
            color="green"
            text-color="white"
            icon="check_circle"
            label="答案正確！"
            class="q-pa-sm"
          />

          <div v-else-if="errorAns">
            <q-chip
              color="red"
              text-color="white"
              icon="cancel"
              label="答案錯誤"
              class="q-pa-sm q-mb-sm"
            />
            <div class="text-subtitle1 text-red-8">
              正確答案為：
              <span class="text-weight-bold q-ml-xs">
                {{ currentWord.english }}
              </span>
              <SpeechStrip :word="currentWord.english" />
            </div>
          </div>
        </div>
        <q-input
          v-model="answer"
          placeholder="請輸入答案"
          @keyup.enter="() => (anserChecked ? nextQuestion() : checkAnswer())"
          class="q-mb-sm"
        />
        <q-btn
          :label="showAnswer || !answer || anserChecked ? '下一題' : '檢查答案'"
          @click="() => (anserChecked ? nextQuestion() : checkAnswer())"
          class="full-width q-mb-md"
        />
      </q-card-section>
      <q-card-actions>
        <q-btn flat color="grey-7" label="重新開始" @click="resetQuiz" size="md" icon="refresh" />
      </q-card-actions>
    </q-card>
    <InfoStrip :meta="store.meta" />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useWordStore } from '../store';
import { type QuizWord, WordQuizService } from '../domain';
import BtnHint from './QuizPage/BtnHint.vue';
import InfoStrip from './QuizPage/InfoStrip.vue';
import SpeechStrip from './QuizPage/SpeechStrip.vue';
const wordQuizeService = new WordQuizService();
const answer = ref<string>('');
const store = useWordStore();
const currentWord = ref<QuizWord | undefined>(undefined);
const showHint = ref<boolean>(false);
const showLength = ref<boolean>(false);
const showAnswer = ref<boolean>(false);
const questionsAnswered = ref(0);

// next
onMounted(() => nextQuestion());
const nextQuestion = () => {
  if (anserChecked.value && currentWord.value) {
    if (correctAns.value) store.recordCorrectAns(currentWord.value.id);
    if (errorAns.value) store.recordErrorAns(currentWord.value.id);
    anserChecked.value = false;
    correctAns.value = false;
    errorAns.value = false;
  }
  currentWord.value = wordQuizeService.getNextQuizWord(store.words);
  console.log('nextQuestion', currentWord.value);
  answer.value = '';
  showHint.value = false;
  showLength.value = false;
  showAnswer.value = false;
};
const resetQuiz = () => {
  store.resetQuiz();
  nextQuestion();
  questionsAnswered.value = 0;
};
const anserChecked = ref<boolean>(false);
const correctAns = ref<boolean>(false);
const errorAns = ref<boolean>(false);
//
const checkAnswer = () => {
  console.log('checkAnswer', answer.value);
  // 沒有輸入答案就下一題
  if (!answer.value.trim()) return nextQuestion();
  // 沒有題目就略過動作，照理說不會出現這個情況
  if (!currentWord.value) return;

  // 計算答案是否正確
  const correct = answer.value.trim().toLowerCase() === currentWord.value.english.toLowerCase();
  questionsAnswered.value++;
  if (showAnswer.value) return nextQuestion();

  // 有顯示提示就不計算
  anserChecked.value = true;
  correctAns.value = correct && !showHint.value && !showLength.value;
  errorAns.value = !correct;
};
</script>

<style scoped></style>
