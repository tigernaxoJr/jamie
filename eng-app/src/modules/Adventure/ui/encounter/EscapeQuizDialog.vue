<template>
  <q-dialog v-model="show" persistent>
    <div class="escape-dialog app-card q-pa-md">
      <div class="escape-header text-center q-mb-sm">
        <div class="text-h6 text-weight-bold text-deep-orange">
          <q-icon name="cloud" class="q-mr-xs" />丟出煙霧彈！💨
        </div>
        <div class="text-caption text-grey-8">
          回答這題單字才能趁亂逃跑！逃跑會中斷探索連鎖喔。
        </div>
      </div>

      <div v-if="question" class="q-my-md">
        <QuestionCard
          :key="quizKey"
          :question="question"
          :disabled="resolving"
          @answer="handleAnswer"
        />
      </div>

      <div v-if="feedback" class="text-center text-weight-bold q-my-sm" :class="feedbackClass">
        {{ feedback }}
      </div>

      <div class="row justify-end q-mt-sm">
        <q-btn flat color="grey-7" label="留下繼續面對" :disabled="resolving" @click="cancel" />
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { GameWord } from 'src/modules/Games/shared';
import { randomInt } from 'src/modules/Games/shared';
import { makeQuestion, type Question } from '../../domain/questions';
import QuestionCard from '../QuestionCard.vue';

const props = defineProps<{
  modelValue: boolean;
  words: readonly GameWord[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'escaped'): void;
  (e: 'failed'): void;
}>();

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const question = ref<Question | null>(null);
const quizKey = ref(0);
const resolving = ref(false);
const feedback = ref<string | null>(null);
const feedbackClass = ref('text-negative');

const generateQuiz = () => {
  if (!props.words || props.words.length === 0) return;
  const word = props.words[randomInt(props.words.length)]!;
  // 快問快答：隨機出 listen-zh (聽音選義) 或 zh-en (看中文選英文)
  const kind = Math.random() < 0.5 ? 'listen-zh' : 'zh-en';
  question.value = makeQuestion(kind, word, props.words);
  quizKey.value++;
  resolving.value = false;
  feedback.value = null;
};

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      generateQuiz();
    }
  },
);

const handleAnswer = (correct: boolean) => {
  resolving.value = true;
  if (correct) {
    feedback.value = '💨 趁著煙霧逃跑成功！';
    feedbackClass.value = 'text-positive';
    setTimeout(() => {
      show.value = false;
      emit('escaped');
    }, 700);
  } else {
    feedback.value = '❌ 煙霧彈熄火了！被字靈擋住了去路！';
    feedbackClass.value = 'text-negative';
    setTimeout(() => {
      show.value = false;
      emit('failed');
    }, 1200);
  }
};

const cancel = () => {
  show.value = false;
};
</script>

<style scoped>
.escape-dialog {
  min-width: 320px;
  max-width: 90vw;
  background: white;
  border-radius: 16px;
}
</style>
