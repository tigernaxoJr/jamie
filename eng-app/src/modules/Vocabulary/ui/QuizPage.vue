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
            <q-btn flat round icon="more_vert" color="grey-8" aria-label="更多選項">
              <q-menu anchor="bottom right" self="top right">
                <q-list style="min-width: 240px">
                  <q-item v-close-popup clickable @click="openCategorySelection">
                    <q-item-section avatar
                      ><q-icon name="category" color="primary"
                    /></q-item-section>
                    <q-item-section>
                      <q-item-label>換主題</q-item-label>
                      <q-item-label caption>保留所有答題記錄</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item v-close-popup clickable @click="confirmResetDialog = true">
                    <q-item-section avatar>
                      <q-icon name="restart_alt" color="orange-8" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>重新開始</q-item-label>
                      <q-item-label caption>清除這些主題的記錄</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item v-close-popup clickable @click="confirmClearDialog = true">
                    <q-item-section avatar>
                      <q-icon name="delete_forever" color="negative" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>清除所有記憶</q-item-label>
                      <q-item-label caption>所有主題的記錄都會清掉</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
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
            <div v-if="!answerChecked" class="hints">
              <button
                type="button"
                class="hint"
                :class="{ 'hint--on': showLength }"
                @click="showLength = true"
              >
                <q-icon name="straighten" size="18px" />
                {{ showLength ? `${letterCount(currentWord.english)} 個字母` : '幾個字母？' }}
              </button>
              <button
                type="button"
                class="hint"
                :class="{ 'hint--on': showHint }"
                @click="showHint = true"
              >
                <q-icon name="lightbulb" size="18px" />
                {{
                  showHint ? `${currentWord.english.charAt(0).toUpperCase()} 開頭` : '第一個字母'
                }}
              </button>
              <button
                type="button"
                class="hint hint--peek"
                :class="{ 'hint--on': showAnswer }"
                @click="showAnswer = true"
              >
                <q-icon name="visibility" size="18px" />
                {{ showAnswer ? currentWord.english : '偷看答案' }}
              </button>
            </div>
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
            <div v-if="answerChecked" class="feedback q-mt-md">
              <template v-if="correctAns">
                <div class="feedback__emoji">🎉</div>
                <div class="feedback__title text-positive">答對了！</div>
              </template>
              <template v-else-if="errorAns">
                <div class="feedback__emoji">😅</div>
                <div class="feedback__title text-negative">差一點！</div>
              </template>
              <template v-else>
                <div class="feedback__emoji">👍</div>
                <div class="feedback__title text-primary">答對了（有用提示）</div>
              </template>
              <div class="q-mt-xs">
                正確答案：<b class="feedback__answer">{{ currentWord.english }}</b>
                <SpeechStrip :word="currentWord.english" />
              </div>
            </div>

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

        <InfoStrip :meta="store.meta" class="q-mt-lg" @click-stat="showStatWords" />
      </template>
    </div>

    <!-- 重新開始確認對話框 -->
    <q-dialog v-model="confirmResetDialog" persistent>
      <q-card class="q-pa-sm" style="min-width: 320px; max-width: 420px">
        <q-card-section class="row items-center no-wrap">
          <q-icon name="restart_alt" color="orange-8" size="2rem" class="q-mr-sm" />
          <span class="text-h6">確認重新開始？</span>
        </q-card-section>
        <q-card-section class="q-pt-none">
          會清除<strong>目前所選主題</strong>的答題記錄（答對、答錯次數等），其他主題不受影響。
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" color="grey-7" v-close-popup />
          <q-btn label="確認重新開始" color="orange-8" @click="handleResetQuiz" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 清除所有記憶確認對話框 -->
    <q-dialog v-model="confirmClearDialog" persistent>
      <q-card class="q-pa-sm" style="min-width: 320px; max-width: 420px">
        <q-card-section class="row items-center no-wrap">
          <q-icon name="warning" color="negative" size="2rem" class="q-mr-sm" />
          <span class="text-h6">確認清除所有記憶？</span>
        </q-card-section>
        <q-card-section class="q-pt-none">
          會清除<strong>所有主題、所有單字</strong>的答題記錄，而且無法復原。
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" color="grey-7" v-close-popup />
          <q-btn label="確認清除全部" color="negative" @click="handleClearMemory" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="statDialog">
      <q-card style="width: 90vw; max-width: 900px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ statDialogTitle }}</div>
          <q-space />
          <q-btn icon="close" flat round v-close-popup aria-label="關閉" />
        </q-card-section>
        <q-card-section>
          <StatWordList :words="statWords" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, nextTick } from 'vue';
import PageTitle from 'src/components/PageTitle.vue';
import { useQuizStore } from './QuizStore';
import { type QuizWord, WordQuizService, isCorrectAnswer, letterCount } from '../domain';
import InfoStrip from './QuizPage/InfoStrip.vue';
import SpeechStrip from './QuizPage/SpeechStrip.vue';
import CategorySelector from './CategorySelector.vue';
import StatWordList from './QuizPage/StatWordList.vue';

const quizService = new WordQuizService();
const answer = ref<string>('');
const store = useQuizStore();
const currentWord = ref<QuizWord | undefined>(undefined);
const showHint = ref<boolean>(false);
const showLength = ref<boolean>(false);
const showAnswer = ref<boolean>(false);
const isSelectingCategory = ref(false);
const inputEl = ref<HTMLInputElement | null>(null);

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
  }
};

const statDialog = ref(false);
const statDialogTitle = ref('');
const statWords = ref<QuizWord[]>([]);

const showStatWords = (type: string) => {
  statWords.value = store.words.filter((w) => {
    if (type === 'count') return true;
    if (type === 'e1') return w.errorRec.consecutive === 1;
    if (type === 'e2') return w.errorRec.consecutive === 2;
    if (type === 'e3') return w.errorRec.consecutive >= 3;
    if (type === 'c1') return w.correctRec.consecutive === 1;
    if (type === 'c2') return w.correctRec.consecutive === 2;
    if (type === 'c3') return w.correctRec.consecutive >= 3;
    return false;
  });

  const map: Record<string, string> = {
    count: '全部單字',
    e1: '連續答錯 1 次',
    e2: '連續答錯 2 次',
    e3: '連續答錯 3 次以上',
    c1: '連續答對 1 次',
    c2: '連續答對 2 次',
    c3: '連續答對 3 次以上',
  };
  statDialogTitle.value = map[type] || '單字清單';
  statDialog.value = true;
};

// 重新開始（清除當前類別記錄）
const confirmResetDialog = ref(false);
const handleResetQuiz = () => {
  store.resetQuiz();
  confirmResetDialog.value = false;
  nextQuestion();
};

// 清除所有記憶
const confirmClearDialog = ref(false);
const handleClearMemory = () => {
  store.clearMemory();
  confirmClearDialog.value = false;
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
.hints {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}
.hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 2px dashed var(--app-line);
  background: #fff;
  font: inherit;
  font-weight: 700;
  color: var(--app-muted);
  cursor: pointer;
  &:hover {
    border-color: $accent;
    color: $accent;
  }
}
.hint--on {
  border-style: solid;
  border-color: $accent;
  background: #fff7e6;
  color: #b45309;
  cursor: default;
}
.hint--peek.hint--on {
  font-family: monospace;
  font-size: 1.05rem;
}
.feedback {
  text-align: center;
  font-size: 1.05rem;
}
.feedback__emoji {
  font-size: 2.6rem;
  line-height: 1;
}
.feedback__title {
  font-size: 1.4rem;
  font-weight: 900;
}
.feedback__answer {
  font-size: 1.3rem;
  color: $primary;
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
