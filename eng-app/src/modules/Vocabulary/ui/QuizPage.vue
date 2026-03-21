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

        <q-separator class="q-my-sm" />

        <q-card-actions class="column q-gutter-xs q-pa-sm">
          <!-- 切換類別：無損失 -->
          <q-btn
            flat
            no-caps
            color="primary"
            label="切換類別"
            @click="openCategorySelection"
            icon="category"
            class="full-width"
            align="left"
          >
            <q-tooltip>僅切換測驗類別，保留所有答題記錄</q-tooltip>
            <span class="q-ml-sm text-caption text-grey-6">保留記錄</span>
          </q-btn>

          <!-- 重新開始：清除當前類別 -->
          <q-btn
            flat
            no-caps
            color="orange-8"
            label="重新開始"
            @click="confirmResetDialog = true"
            icon="restart_alt"
            class="full-width"
            align="left"
          >
            <q-tooltip>清除當前類別的答題記錄，從頭開始練習</q-tooltip>
            <span class="q-ml-sm text-caption text-grey-6">清除當前類別記錄</span>
          </q-btn>

          <!-- 清除所有記憶：全部清空 -->
          <q-btn
            flat
            no-caps
            color="deep-orange"
            label="清除所有記憶"
            @click="confirmClearDialog = true"
            icon="delete_forever"
            class="full-width"
            align="left"
          >
            <q-tooltip>清除所有類別的答題記錄，無法復原</q-tooltip>
            <span class="q-ml-sm text-caption text-grey-6">清除所有類別記錄</span>
          </q-btn>
        </q-card-actions>
      </q-card>
    </div>
    <InfoStrip :meta="store.meta" v-if="!isSelectingCategory" class="col-auto" @clickStat="showStatWords" />

    <!-- 重新開始確認對話框 -->
    <q-dialog v-model="confirmResetDialog" persistent>
      <q-card style="min-width: 320px">
        <q-card-section class="row items-center">
          <q-icon name="restart_alt" color="orange-8" size="2rem" class="q-mr-sm" />
          <span class="text-h6">確認重新開始？</span>
        </q-card-section>
        <q-card-section>
          此操作會清除<strong>當前所選類別</strong>的單字答題記錄（答對次數、答錯次數、連續記錄等），其他類別的記錄不會受影響。
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" color="grey-7" v-close-popup />
          <q-btn flat label="確認重新開始" color="orange-8" @click="handleResetQuiz" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 清除所有記憶確認對話框 -->
    <q-dialog v-model="confirmClearDialog" persistent>
      <q-card style="min-width: 320px">
        <q-card-section class="row items-center">
          <q-icon name="warning" color="deep-orange" size="2rem" class="q-mr-sm" />
          <span class="text-h6">確認清除所有記憶？</span>
        </q-card-section>
        <q-card-section>
          此操作會清除<strong>所有類別、所有單字</strong>的答題記錄，且無法復原。
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" color="grey-7" v-close-popup />
          <q-btn flat label="確認清除全部" color="deep-orange" @click="handleClearMemory" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="statDialog">
      <q-card style="width: 90vw; max-width: 900px" class="bg-grey-1">
        <q-card-section class="row items-center q-pb-none bg-white">
          <div class="text-h5 text-primary text-weight-bold">{{ statDialogTitle }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        
        <q-card-section class="q-pa-none">
          <StatWordList :words="statWords" />
        </q-card-section>

        <q-card-actions align="right" class="bg-white">
          <q-btn flat label="關閉" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
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
import StatWordList from './QuizPage/StatWordList.vue';

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

const statDialog = ref(false);
const statDialogTitle = ref('');
const statWords = ref<QuizWord[]>([]);

const showStatWords = (type: string) => {
  statWords.value = store.words.filter(w => {
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
    count: '總單字數',
    e1: '連答錯 1 次',
    e2: '連答錯 2 次',
    e3: '連答錯 3+ 次',
    c1: '連答對 1 次',
    c2: '連答對 2 次',
    c3: '連答對 3+ 次',
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
  questionsAnswered.value = 0;
};

// 清除所有記憶
const confirmClearDialog = ref(false);
const handleClearMemory = () => {
  store.clearMemory();
  confirmClearDialog.value = false;
  nextQuestion();
  questionsAnswered.value = 0;
};
</script>

<style scoped></style>
