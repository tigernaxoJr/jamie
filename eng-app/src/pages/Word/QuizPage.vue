<!-- eslint-disable vue/block-lang -->
<template>
  <q-page class="q-pa-lg text-center bg-gradient-to-br from-purple-400 to-blue-500">
    <!-- Progress Section -->
    <!-- {{ store.words }} -->
    <!-- <q-card class="q-mb-lg" flat>
      <q-card-section>
        <q-linear-progress
          :value="questionsAnswered / totalQuestions"
          color="positive"
          size="lg"
          class="q-mb-md"
          rounded
        />
        <div class="row justify-between text-h6 text-weight-bold">
          <span>得分: {{ score }}/{{ questionsAnswered }}</span>
          <span>第 {{ questionsAnswered + 1 }} 題</span>
        </div>
      </q-card-section>
    </q-card> -->

    <!-- Quiz Title -->
    <!-- <div
      class="text-h3 text-white text-weight-bold q-mb-xl animate__animated animate__bounce animate__infinite animate__slow"
    >
      🌟 英文小測驗 🌟
    </div> -->

    <div v-if="currentWord" class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <!-- Word Display Card -->
        <q-card
          class="q-mb-lg"
          :class="{
            'animate__animated animate__shakeX': isWrong,
            'animate__animated animate__bounce': isCorrect,
          }"
          flat
        >
          <q-card-section class="q-pa-xl">
            <!-- Image or Emoji -->
            <div v-if="currentWord.image" class="q-mb-lg">
              <q-img
                :src="currentWord.image"
                style="height: 200px; max-width: 200px"
                class="rounded-borders mx-auto"
              />
            </div>
            <div class="text-h4 text-weight-bold text-grey-8 q-mb-md">
              {{ currentWord.chinese }}
            </div>
            <my-btn
              @click="WordPronunciation(currentWord.english)"
              color="info"
              size="lg"
              class="q-px-lg"
            >
              🔊 發音
            </my-btn>
            <my-btn
              v-if="!showHint && !result"
              @click="showHint = true"
              color="orange"
              size="lg"
              class="q-px-lg q-ml-sm"
            >
              💡 提示
            </my-btn>

            <!-- Hint Display -->
            <q-banner v-if="showHint && !result" class="bg-orange-1 text-orange-9 q-mt-md" rounded>
              <div class="text-h6">
                第一個字母: <strong>{{ currentWord.english.charAt(0).toUpperCase() }}</strong>
              </div>
              <div class="text-body1 q-mt-xs">共 {{ currentWord.english.length }} 個字母</div>
            </q-banner>
          </q-card-section>
        </q-card>

        <!-- Input Section -->
        <q-card v-if="!result" class="q-mb-lg" flat>
          <q-card-section class="q-pa-xl">
            <!-- Input Field -->
            <q-input
              ref="answerInput"
              v-model="answer"
              placeholder="請輸入英文單字..."
              outlined
              size="xl"
              class="text-h5 q-mb-lg"
              :disable="isChecking"
              @keyup.enter="checkAnswer"
              clearable
            />

            <!-- Action Buttons -->
            <div class="row q-gutter-md justify-center">
              <q-btn
                @click="checkAnswer"
                :disable="!answer.trim() || isChecking"
                color="positive"
                size="lg"
                rounded
                unelevated
                class="q-px-xl"
                :loading="isChecking"
              >
                ✓ 確認答案
              </q-btn>
            </div>
          </q-card-section>
        </q-card>

        <!-- Result Section -->
        <div v-if="result">
          <q-card
            class="q-mb-lg"
            :class="result.correct ? 'bg-green-1 text-positive' : 'bg-red-1 text-negative'"
            flat
          >
            <q-card-section class="q-pa-xl text-center">
              <div class="text-h1 q-mb-md">
                {{ result.correct ? '🎉' : '😅' }}
              </div>
              <div class="text-h4 text-weight-bold q-mb-md">
                {{ result.correct ? '太棒了！' : '再試試看！' }}
              </div>
              <div class="text-h6 q-mb-lg">
                {{ result.correct ? '答對了！' : `正確答案是：${currentWord.english}` }}
              </div>

              <!-- Pronunciation for incorrect answers -->
              <q-btn
                v-if="!result.correct"
                @click="WordPronunciation(currentWord.english)"
                color="purple"
                size="lg"
                rounded
                unelevated
                class="q-mb-lg"
              >
                🔊 正確發音：{{ currentWord.english }}
              </q-btn>
            </q-card-section>
          </q-card>

          <q-btn @click="nextQuestion" color="orange" size="xl" rounded unelevated class="q-px-xl">
            {{ questionsAnswered >= totalQuestions ? '🏁 完成測驗' : '➡️ 下一題' }}
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Quiz Complete -->
    <div v-if="questionsAnswered >= totalQuestions && result" class="row justify-center q-mt-xl">
      <div class="col-12 col-md-6">
        <q-card class="bg-orange-1" flat>
          <q-card-section class="text-center q-pa-xl">
            <div class="text-h3 text-orange-9 text-weight-bold q-mb-lg">🎊 測驗完成！ 🎊</div>
            <div class="q-mb-xl">
              <div class="text-h6 text-grey-7 q-mb-sm">最終得分</div>
              <div class="text-h2 text-weight-bold text-orange-8 q-mb-sm">
                {{ score }} / {{ totalQuestions }}
              </div>
              <div class="text-h5 text-orange-7 text-weight-bold">
                {{ Math.round((score / totalQuestions) * 100) }}%
              </div>
            </div>
            <div class="row q-gutter-md justify-center">
              <q-btn @click="restartQuiz" color="positive" size="xl" rounded unelevated>
                🔄 重新開始
              </q-btn>
              <q-btn @click="goToReview" color="purple" size="xl" rounded unelevated>
                📚 複習單字
              </q-btn>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useWordStore } from './wordStore';
import { ref, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { WordPronunciation, type Result, type Word } from './model';
import { QInput } from 'quasar';
import MyBtn from 'src/components/MyBtn.vue';

const store = useWordStore();
const router = useRouter();

// Quiz state
const currentWord = ref<Word>(store.getWeightedRandomWord());
const answer = ref<string>('');
const result = ref<Result>(null);
const showHint = ref<boolean>(false);
const isChecking = ref<boolean>(false);
const isWrong = ref<boolean>(false);
const isCorrect = ref<boolean>(false);

// Progress tracking
const score = ref(0);
const questionsAnswered = ref(0);
const totalQuestions = ref(10);

// References
const answerInput = ref<QInput>();

onMounted(() => {
  resetQuiz();
});

const resetQuiz = () => {
  currentWord.value = store.getWeightedRandomWord();
  answer.value = '';
  result.value = null;
  showHint.value = false;
  score.value = 0;
  questionsAnswered.value = 0;
};

const checkAnswer = async () => {
  if (!currentWord.value || !answer.value.trim()) return;

  isChecking.value = true;

  // Add delay for better UX
  await new Promise((resolve) => setTimeout(resolve, 500));

  const correct = answer.value.trim().toLowerCase() === currentWord.value.english.toLowerCase();

  if (correct) {
    score.value++;
    isCorrect.value = true;
    setTimeout(() => {
      isCorrect.value = false;
    }, 1000);
  } else {
    store.recordError(currentWord.value.id);
    isWrong.value = true;
    setTimeout(() => {
      isWrong.value = false;
    }, 600);
  }

  questionsAnswered.value++;
  result.value = { correct };
  isChecking.value = false;
};

const nextQuestion = async () => {
  if (questionsAnswered.value >= totalQuestions.value) {
    return; // Quiz is complete
  }

  currentWord.value = store.getWeightedRandomWord();
  result.value = null;
  answer.value = '';
  showHint.value = false;

  await nextTick(() => {
    answerInput.value?.focus();
  });
};

const restartQuiz = async () => {
  resetQuiz();
  await nextTick(() => answerInput.value?.focus());
};

const goToReview = async () => await router.push('/review');
</script>

<style scoped lang="scss">
/* Minimal CSS using Quasar utilities - only custom animations */
.bg-gradient-to-br {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.animate__animated.animate__bounce.animate__infinite.animate__slow {
  animation: bounce 2s infinite;
}

.animate__animated.animate__shakeX {
  animation: shakeX 0.6s ease-in-out;
}

.animate__animated.animate__bounce {
  animation: bounce 1s ease-in-out;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes shakeX {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-10px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(10px);
  }
}
</style>
