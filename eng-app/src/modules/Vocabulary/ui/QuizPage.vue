<template>
  <q-page padding class="column no-wrap items-center">
    <div class="col flex flex-center full-width q-pa-md">
      <!-- Category Selection View -->
      <q-card
        v-if="isSelectingCategory"
        flat
        class="q-pa-lg soft-shadow rounded-borders bg-white"
        style="width: 100%; max-width: 600px"
      >
        <CategorySelector
          v-model="tempSelectedCategories"
          :categories="store.categoryOptions"
          confirm-label="開始測驗"
          @confirm="confirmCategorySelection"
        >
          <template #title>選擇測驗類別</template>
        </CategorySelector>
      </q-card>

      <!-- Quiz View -->
      <q-card
        v-else
        flat
        class="q-pa-lg soft-shadow rounded-borders bg-white"
        style="width: 100%; max-width: 400px"
      >
        <q-card-section class="q-pa-none" v-if="currentWord">
          <div class="text-caption text-grey-6 text-center q-mb-sm" v-if="currentCategoryInfo">
            {{ currentCategoryInfo }}
          </div>
          <div class="text-h5 text-weight-bold text-center">
            {{ currentWord?.chinese || '取得題目失敗' }}
          </div>
          <div
            v-if="!anserChecked"
            class="row justify-center text-subtitle1 text-grey-6 q-gutter-x-sm q-my-sm"
          >
            <span v-if="showLength"> ( {{ currentWord.english.length }} 字 ) </span>
            <BtnHint v-else label="字數: 開" @click="showLength = true" />

            <span v-if="showHint"> [ {{ currentWord.english.charAt(0).toUpperCase() }}*** ] </span>
            <BtnHint v-else label="首字: 開" @click="showHint = true" />

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
            unelevated
            rounded
            color="primary"
            size="lg"
          />
        </q-card-section>
        <q-card-section v-else class="text-center q-pa-lg">
          <div class="text-h6 text-grey-7">沒有題目</div>
          <div class="text-caption text-grey-6 q-mt-sm">請嘗試選擇其他類別</div>
          <q-btn
            unelevated
            rounded
            color="primary"
            label="選擇類別"
            @click="openCategorySelection"
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="center">
          <q-btn flat color="grey-7" label="重新開始" @click="resetQuiz" size="md" icon="refresh" />
          <q-btn
            flat
            color="primary"
            label="選擇類別"
            @click="openCategorySelection"
            size="md"
            icon="category"
          />
        </q-card-actions>
      </q-card>
    </div>
    <InfoStrip :meta="store.meta" v-if="!isSelectingCategory" class="col-auto" />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useQuizStore } from './QuizStore';
import { type QuizWord, WordQuizService } from '../domain';
import BtnHint from './QuizPage/BtnHint.vue';
import InfoStrip from './QuizPage/InfoStrip.vue';
import SpeechStrip from './QuizPage/SpeechStrip.vue';
import CategorySelector from './CategorySelector.vue';

const wordQuizeService = new WordQuizService();
const answer = ref<string>('');
const store = useQuizStore();
const currentWord = ref<QuizWord | undefined>(undefined);
const showHint = ref<boolean>(false);
const showLength = ref<boolean>(false);
const showAnswer = ref<boolean>(false);
const questionsAnswered = ref(0);
const isSelectingCategory = ref(false);

// Category Selection
const tempSelectedCategories = ref<string[]>([]);

const openCategorySelection = () => {
  tempSelectedCategories.value = [...store.selectedCategories];
  isSelectingCategory.value = true;
};

const confirmCategorySelection = () => {
  store.setCategories(tempSelectedCategories.value);
  isSelectingCategory.value = false;
  nextQuestion();
};

const currentCategoryInfo = computed(() => {
  if (
    !currentWord.value ||
    !currentWord.value.categories ||
    currentWord.value.categories.length === 0
  ) {
    return '';
  }
  // Assuming a word belongs to one main category for display purposes, or we pick the first one.
  const catId = currentWord.value.categories[0];
  const category = store.categoryOptions.find((c) => c.id === catId);
  if (!category) return '';

  if (category.parentId) {
    const parent = store.categoryOptions.find((c) => c.id === category.parentId);
    return parent ? `${parent.name} > ${category.name}` : category.name;
  }
  return category.name;
});

// next
onMounted(() => {
  if (store.words.length === 0) {
    openCategorySelection();
  } else {
    nextQuestion();
  }
});

const nextQuestion = () => {
  if (anserChecked.value && currentWord.value) {
    if (correctAns.value) store.recordCorrectAns(currentWord.value.id);
    if (errorAns.value) store.recordErrorAns(currentWord.value.id);
    anserChecked.value = false;
    correctAns.value = false;
    errorAns.value = false;
  }
  currentWord.value = wordQuizeService.getNextQuizWord(store.words, store.lastWordIds);
  if (currentWord.value) {
    store.recordLastWord(currentWord.value.id);
  }
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
