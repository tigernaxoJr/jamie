<template>
  <!-- <div>題目:{{ currentWord?.chinese || '取得題目失敗' }}</div>
  <q-input @keyup.enter="checkAnswer" v-model="answer" />

  <q-btn @click="checkAnswer">checkAnswer</q-btn>
  <q-btn @click="resetQuiz">開始/重新開始</q-btn>
  {{ meta }}
  <div>連續答錯1次的單字: {{ meta.e1 }} 個</div>
  <div>連續答錯2次的單字: {{ meta.e3 }} 個</div>
  <div>連續答錯3次以上的單字: {{ meta.e3 }} 個</div>
  <div>連續答對3次的單字: {{ meta.c3 }} 個</div>
  <div>所有單字: {{ meta.count }} 個</div> -->
  <q-page padding class="flex flex-center">
    <!-- {{ currentWord }} -->
    <q-card flat bordered style="width: 100%; max-width: 400px" class="q-pa-lg">
      <q-card-section class="q-pa-none" v-if="currentWord">
        <div class="text-h5 text-weight-bold text-center">
          {{ currentWord?.chinese || '取得題目失敗' }}
        </div>
        <div class="row justify-center text-subtitle1 text-grey-6 q-gutter-x-sm">
          <span v-if="showLength && currentWord?.english">
            ( {{ currentWord.english.length }} 字 )
          </span>
          <span v-if="showHint && currentWord?.english">
            [ {{ currentWord.english.charAt(0).toUpperCase() }}*** ]
          </span>
          <!-- todo 加入連結讓使用者除了聆聽SpeechSynthesisUtterance 的聲音之外，可以點選另開tab 到 google 翻譯葉面：`https://translate.google.com/translate_tts?ie=UTF-8&q=${currentWord.english}&tl=en&client=tw-ob`聽更準確的發音 -->
          <span v-if="showAnswer && currentWord?.english">
            [ {{ currentWord.english }} ]
            <q-btn
              v-if="currentWord?.english"
              flat
              round
              icon="volume_up"
              color="primary"
              size="sm"
              @click="WordPronunciation(currentWord.english)"
              title="內建發音 (瀏覽器 TTS)"
              class="q-ml-xs"
            />

            <q-btn
              v-if="currentWord?.english"
              flat
              round
              icon="headphones"
              color="secondary"
              size="sm"
              @click="openGoogleTranslateTTS(currentWord.english)"
              title="Google 翻譯發音 (新分頁)"
              class="q-ml-xs"
            />
          </span>
        </div>

        <div class="row justify-center items-center q-gutter-x-sm">
          <q-btn-group flat class="q-my-sm">
            <q-btn
              :color="showLength ? 'secondary' : 'grey-5'"
              :text-color="showLength ? 'white' : 'grey-8'"
              label="字數: 開"
              @click="showLength = true"
              :disable="showLength"
              size="sm"
            />
            <q-btn
              :color="showHint ? 'secondary' : 'grey-5'"
              :text-color="showHint ? 'white' : 'grey-8'"
              label="首字: 開"
              @click="showHint = true"
              :disable="showHint"
              size="sm"
            />
            <q-btn
              :color="showAnswer ? 'secondary' : 'grey-5'"
              :text-color="showAnswer ? 'white' : 'grey-8'"
              label="答案"
              @click="showAnswer = true"
              :disable="showAnswer"
              size="sm"
            />
          </q-btn-group>
        </div>

        <q-input
          outlined
          v-model="answer"
          placeholder="請輸入答案"
          @keyup.enter="checkAnswer"
          class="q-mb-sm"
        />
        <q-btn
          color="primary"
          unelevated
          :label="showAnswer || !answer ? '下一題' : '檢查答案'"
          @click="checkAnswer"
          class="full-width q-mb-md"
        />
      </q-card-section>

      <q-btn
        flat
        color="grey-7"
        label="重新開始"
        @click="resetQuiz"
        size="sm"
        icon="refresh"
        class="col"
      />
    </q-card>

    <div class="absolute-bottom q-pa-md full-width">
      <q-separator inset class="q-my-md" />
      <div class="text-subtitle1 q-mb-sm text-grey-8 text-center">測驗進度</div>

      <div class="row q-col-gutter-sm justify-center">
        <div class="col-6 col-md-auto text-center">
          <div class="text-caption text-grey-7">總單字數</div>
          <div class="text-body1 text-weight-medium">{{ meta.count }}</div>
        </div>

        <q-separator vertical spaced inset class="gt-sm" />

        <div class="col-6 col-md-auto text-center">
          <div class="text-caption text-grey-7">連答錯 1 次</div>
          <div class="text-body1 text-negative text-weight-medium">{{ meta.e1 }}</div>
        </div>

        <div class="col-6 col-md-auto text-center">
          <div class="text-caption text-grey-7">連答錯 2 次</div>
          <div class="text-body1 text-negative text-weight-medium">{{ meta.e2 }}</div>
        </div>

        <div class="col-6 col-md-auto text-center">
          <div class="text-caption text-grey-7">連答錯 3+ 次</div>
          <div class="text-body1 text-negative text-weight-medium">{{ meta.e3 }}</div>
        </div>

        <q-separator vertical spaced inset class="gt-sm" />

        <div class="col-6 col-md-auto text-center">
          <div class="text-caption text-grey-7">連答對 1 次</div>
          <div class="text-body1 text-positive text-weight-medium">{{ meta.c1 }}</div>
        </div>
        <div class="col-6 col-md-auto text-center">
          <div class="text-caption text-grey-7">連答對 2 次</div>
          <div class="text-body1 text-positive text-weight-medium">{{ meta.c2 }}</div>
        </div>
        <div class="col-6 col-md-auto text-center">
          <div class="text-caption text-grey-7">連答對 3 次</div>
          <div class="text-body1 text-positive text-weight-medium">{{ meta.c3 }}</div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useWordStore } from '../store';
import { type Word, WordQuizService } from '../domain';
import { WordPronunciation } from '../utils';
const wordQuizeService = new WordQuizService();
const answer = ref<string>('');
const store = useWordStore();
const currentWord = ref<Word | undefined>(undefined);
const showHint = ref<boolean>(false);
const showLength = ref<boolean>(false);
const showAnswer = ref<boolean>(false);
const questionsAnswered = ref(0);
// ⭐ 新增功能：另開分頁到 Google 翻譯 TTS
const openGoogleTranslateTTS = (word: string) => {
  if (!word) return;
  // 構造 Google 翻譯 TTS 連結
  const url = `https://translate.google.com.tw/?sl=en&tl=zh-TW&text=${word}&op=translate`;
  // 另開一個新的瀏覽器分頁 (tab)
  window.open(url, '_blank');
};
// next
onMounted(() => {
  nextQuestion();
});
const nextQuestion = () => {
  currentWord.value = wordQuizeService.getNextQuizWord(store.words);
  console.log('nextQuestion', currentWord.value);
  answer.value = '';
  showHint.value = false;
  showLength.value = false;
  showAnswer.value = false;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).test = () => nextQuestion();
const resetQuiz = () => {
  store.resetQuiz();
  nextQuestion();
  questionsAnswered.value = 0;
};
const checkAnswer = () => {
  // 沒有輸入答案就下一題
  if (!answer.value.trim()) return nextQuestion();
  // 沒有題目就略過動作，照理說不應該出現
  if (!currentWord.value) return;
  const correct = answer.value.trim().toLowerCase() === currentWord.value.english.toLowerCase();
  questionsAnswered.value++;
  if (showAnswer.value) return nextQuestion();
  if (correct) {
    // 有顯示提示就不計算
    if (!showHint.value && !showLength.value) {
      store.recordCorrectAns(currentWord.value.id);
    }
  } else {
    store.recordErrorAns(currentWord.value.id);
    // currentWord.value.recordErrorAnswer();
  }
  nextQuestion();
};
const meta = computed(() => {
  const words = store.words.slice();
  const d = words.map((x) => ({
    consecutiveCorrectCount: x.correctRec.count,
    consecutiveErrorCount: x.errorRec.count,
  }));
  const count = store.words.length;
  const e1 = d.filter(({ consecutiveErrorCount }) => consecutiveErrorCount === 1).length;
  const e2 = d.filter(({ consecutiveErrorCount }) => consecutiveErrorCount === 2).length;
  const e3 = d.filter(({ consecutiveErrorCount }) => consecutiveErrorCount >= 3).length;
  const c1 = d.filter(({ consecutiveCorrectCount }) => consecutiveCorrectCount === 1).length;
  const c2 = d.filter(({ consecutiveCorrectCount }) => consecutiveCorrectCount === 2).length;
  const c3 = d.filter(({ consecutiveCorrectCount }) => consecutiveCorrectCount >= 3).length;
  return { count, e1, e2, e3, c1, c2, c3 };
});
</script>

<style scoped></style>
