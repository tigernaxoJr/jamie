<template>
  <q-page padding>
    <div class="page-container page-container--narrow">
      <!-- 選擇類別 -->
      <template v-if="isSelectingCategory">
        <PageTitle emoji="✏️" title="單字測驗" subtitle="看中文，拼出英文單字" />
        <div class="app-card q-pa-lg">
          <CategorySelector
            v-model="tempSelectedCategories"
            :categories="store.categoryOptions"
            confirm-label="開始測驗"
            @confirm="confirmCategorySelection"
          >
            <template #title>選擇測驗主題</template>
          </CategorySelector>
        </div>
      </template>

      <!-- 測驗 -->
      <template v-else>
        <PageTitle emoji="✏️" title="單字測驗" :subtitle="`這一輪共 ${store.meta.count} 個單字`">
          <template #actions>
            <QuizActionsMenu
              @change-topic="openCategorySelection"
              @reset="handleResetQuiz"
              @clear-all="handleClearMemory"
            />
          </template>
        </PageTitle>

        <div
          class="app-card quiz-card q-pa-lg"
          :class="{ 'quiz-card--correct': correctAns, 'quiz-card--wrong': errorAns }"
        >
          <template v-if="currentWord">
            <div v-if="currentCategoryInfo" class="text-center">
              <span class="pill">{{ currentCategoryInfo }}</span>
            </div>
            <div class="question">{{ currentWord.chinese }}</div>

            <!-- 提示 -->
            <HintButtons
              v-if="!answerChecked"
              v-model:show-length="showLength"
              v-model:show-hint="showHint"
              v-model:show-answer="showAnswer"
              :word="currentWord.english"
            />
            <div
              v-if="!answerChecked && (showHint || showLength)"
              class="text-center text-caption text-muted q-mt-xs"
            >
              用了提示，這題答對不會算分喔
            </div>
            <div v-if="showAnswer && !answerChecked" class="text-center q-mt-xs">
              <SpeechStrip :word="currentWord.english" />
            </div>

            <!-- 結果 -->
            <AnswerFeedback
              v-if="answerChecked"
              class="q-mt-md"
              :result="correctAns ? 'correct' : errorAns ? 'wrong' : 'hinted'"
              :word="currentWord.english"
              :goal-reached="goalJustReached"
            />

            <input
              ref="inputEl"
              v-model="answer"
              class="answer-input q-mt-lg"
              :class="{ 'answer-input--locked': answerChecked }"
              placeholder="在這裡輸入英文"
              autocomplete="off"
              autocapitalize="off"
              autocorrect="off"
              spellcheck="false"
              :readonly="answerChecked"
              @keyup.enter="() => (answerChecked ? nextQuestion() : checkAnswer())"
            />
            <q-btn
              class="btn-3d full-width q-mt-md"
              size="lg"
              :color="answerChecked ? 'secondary' : 'primary'"
              :icon-right="answerChecked || showAnswer || !answer ? 'arrow_forward' : 'check'"
              :label="showAnswer || !answer || answerChecked ? '下一題' : '檢查答案'"
              @click="() => (answerChecked ? nextQuestion() : checkAnswer())"
            />
          </template>

          <div v-else class="text-center q-py-lg">
            <div style="font-size: 3rem">📭</div>
            <div class="text-h6 q-mt-sm">沒有題目</div>
            <div class="text-muted q-mt-xs">請換個主題試試看</div>
            <q-btn
              class="btn-3d q-mt-md"
              color="primary"
              label="選擇主題"
              @click="openCategorySelection"
            />
          </div>
        </div>

        <InfoStrip :meta="store.meta" class="q-mt-lg" @click-stat="(type) => (statType = type)" />
      </template>
    </div>

    <StatWordsDialog v-model:type="statType" :words="store.words" />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, nextTick } from 'vue';
import PageTitle from 'src/components/PageTitle.vue';
import { useQuizStore } from './QuizStore';
import { DAILY_GOAL, getTodayProgress } from '../index';
import { type QuizWord, WordQuizService, isCorrectAnswer } from '../domain';
import InfoStrip from './QuizPage/InfoStrip.vue';
import SpeechStrip from './QuizPage/SpeechStrip.vue';
import AnswerFeedback from './QuizPage/AnswerFeedback.vue';
import HintButtons from './QuizPage/HintButtons.vue';
import QuizActionsMenu from './QuizPage/QuizActionsMenu.vue';
import StatWordsDialog from './QuizPage/StatWordsDialog.vue';
import CategorySelector from './CategorySelector.vue';

const quizService = new WordQuizService();
const answer = ref<string>('');
const store = useQuizStore();
const currentWord = ref<QuizWord | undefined>(undefined);
const showHint = ref<boolean>(false);
const showLength = ref<boolean>(false);
const showAnswer = ref<boolean>(false);
const isSelectingCategory = ref(false);
const inputEl = ref<HTMLInputElement | null>(null);
const goalJustReached = ref(false);

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
    return parent ? `${parent.name} · ${category.name}` : category.name;
  }
  return category.name;
});

// next
onMounted(() => {
  store.reloadWords();
  if (store.words.length === 0) {
    openCategorySelection();
  } else {
    nextQuestion();
  }
});

const nextQuestion = () => {
  goalJustReached.value = false;
  answerChecked.value = false;
  correctAns.value = false;
  errorAns.value = false;
  currentWord.value = quizService.getNextQuizWord(store.words, store.lastWordIds);
  if (currentWord.value) {
    store.recordLastWord(currentWord.value.id);
  }
  answer.value = '';
  showHint.value = false;
  showLength.value = false;
  showAnswer.value = false;
  void nextTick(() => inputEl.value?.focus());
};
const answerChecked = ref<boolean>(false);
const correctAns = ref<boolean>(false);
const errorAns = ref<boolean>(false);
//
const checkAnswer = () => {
  // 沒有輸入答案就下一題
  if (!answer.value.trim()) return nextQuestion();
  // 沒有題目就略過動作，照理說不會出現這個情況
  if (!currentWord.value) return;

  // 偷看過答案就直接下一題，不算對也不算錯
  if (showAnswer.value) return nextQuestion();

  // 可接受括號內的其他寫法，例如 shoe(s) → shoes、airplane (plane) → plane
  const correct = isCorrectAnswer(answer.value, currentWord.value.english);

  answerChecked.value = true;
  // 有用提示時答對不算分；答錯一律記錄
  correctAns.value = correct && !showHint.value && !showLength.value;
  errorAns.value = !correct;
  // 立刻記錄，不等按下一題（離開頁面或重新開始時才不會遺失或記錯）
  if (correctAns.value || errorAns.value) {
    store.recordAnswer(currentWord.value.id, correctAns.value);
    // 這一題剛好達成每日目標
    goalJustReached.value = correctAns.value && getTodayProgress().correct === DAILY_GOAL;
  }
};

/** 點統計數字時要列出的單字類型，null = 不顯示 */
const statType = ref<string | null>(null);

// 重新開始（清除當前類別記錄）
const handleResetQuiz = () => {
  store.resetQuiz();
  nextQuestion();
};

// 清除所有記憶
const handleClearMemory = () => {
  store.clearMemory();
  nextQuestion();
};
</script>

<style scoped lang="scss">
.quiz-card {
  border: 3px solid transparent;
  transition: border-color 0.2s;
}
.quiz-card--correct {
  border-color: $positive;
  animation: pop 0.35s;
}
.quiz-card--wrong {
  border-color: $negative;
  animation: shake 0.4s;
}
.question {
  text-align: center;
  font-size: 2.4rem;
  font-weight: 900;
  line-height: 1.25;
  margin: 16px 0;
  word-break: break-word;
}
.answer-input {
  display: block;
  width: 100%;
  padding: 14px 16px;
  border: 3px solid var(--app-line);
  border-radius: 16px;
  font: inherit;
  font-size: 1.6rem;
  font-weight: 800;
  text-align: center;
  letter-spacing: 0.04em;
  color: var(--app-ink);
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
  &:focus {
    border-color: $primary;
  }
  &::placeholder {
    font-size: 1.1rem;
    font-weight: 700;
    color: #a9b4c0;
  }
}
.answer-input--locked {
  background: #f7f7fb;
}
@keyframes pop {
  50% {
    transform: scale(1.02);
  }
}
@keyframes shake {
  25%,
  75% {
    transform: translateX(-6px);
  }
  50% {
    transform: translateX(6px);
  }
}
@media (max-width: 599px) {
  .question {
    font-size: 1.9rem;
  }
}
</style>
