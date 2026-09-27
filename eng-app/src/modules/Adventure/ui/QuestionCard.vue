<template>
  <div
    class="question app-card q-pa-md"
    :class="{ 'question--right': result === true, 'question--wrong': result === false }"
  >
    <div class="text-center text-muted text-weight-bold">{{ QUESTION_PROMPT[question.kind] }}</div>

    <div class="text-center q-my-sm">
      <q-btn
        v-if="listening"
        round
        size="xl"
        color="secondary"
        icon="volume_up"
        aria-label="再聽一次"
        class="btn-3d"
        @click="speak"
      />
      <div v-else class="prompt">{{ question.word.chinese }}</div>
    </div>

    <!-- 選擇題 -->
    <div v-if="!spelling" class="choices">
      <q-btn
        v-for="(c, i) in question.choices"
        :key="c.answer"
        unelevated
        size="lg"
        class="choice"
        :color="choiceColor(c)"
        :text-color="result === null ? 'dark' : 'white'"
        @click="choose(c)"
      >
        <span class="choice__key gt-xs">{{ i + 1 }}</span>
        {{ question.kind === 'listen-zh' ? c.chinese : c.answer }}
      </q-btn>
    </div>

    <!-- 拼字題 -->
    <div v-else>
      <div class="blanks text-center q-mb-sm">
        <span v-for="(ch, i) in blanks" :key="i" :class="{ gap: ch === ' ' }">{{
          ch === ' ' ? '' : '_'
        }}</span>
        <span class="text-caption text-muted q-ml-sm">（{{ letterCount }} 個字母）</span>
      </div>
      <input
        ref="inputEl"
        v-model="typed"
        class="spell-input"
        placeholder="輸入英文"
        autocomplete="off"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
        :readonly="result !== null"
        @keyup.enter="submitSpelling"
      />
      <q-btn
        class="btn-3d full-width q-mt-sm"
        size="lg"
        color="primary"
        label="確定"
        :disable="result !== null || !typed.trim()"
        @click="submitSpelling"
      />
    </div>

    <div v-if="result !== null" class="feedback text-center q-mt-sm">
      <span v-if="result" class="text-positive">⭕ 答對了！</span>
      <span v-else class="text-negative">
        ❌ 答案是 <b>{{ question.word.answer }}</b
        >（{{ question.word.chinese }}）
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useEventListener } from '@vueuse/core';
import { WordPronunciation } from 'src/modules/Vocabulary';
import { type GameWord, lettersOf, sfx } from 'src/modules/Games/shared';
import {
  type Question,
  QUESTION_PROMPT,
  isListening,
  isSpelling,
  isSpellingCorrect,
} from '../domain/questions';

const props = defineProps<{ question: Question }>();
const emit = defineEmits<{ (e: 'answered', correct: boolean): void }>();

const listening = computed(() => isListening(props.question.kind));
const spelling = computed(() => isSpelling(props.question.kind));
const blanks = computed(() => [...props.question.word.answer]);
const letterCount = computed(() => lettersOf(props.question.word.answer).length);

const chosen = ref<GameWord | null>(null);
const typed = ref('');
const result = ref<boolean | null>(null);
const inputEl = ref<HTMLInputElement | null>(null);

const speak = () => WordPronunciation(props.question.word.answer);

const reset = () => {
  chosen.value = null;
  typed.value = '';
  result.value = null;
  if (listening.value) speak();
  if (spelling.value) void nextTick(() => inputEl.value?.focus());
};
onMounted(reset);
watch(() => props.question, reset);

const finish = (correct: boolean) => {
  result.value = correct;
  if (correct) sfx.correct();
  else sfx.wrong();
  // 答對時唸一次，加深印象
  if (correct && !listening.value) speak();
  setTimeout(() => emit('answered', correct), correct ? 800 : 1800);
};

const choose = (c: GameWord) => {
  if (result.value !== null) return;
  chosen.value = c;
  finish(c.answer === props.question.word.answer);
};

const submitSpelling = () => {
  if (result.value !== null || !typed.value.trim()) return;
  finish(isSpellingCorrect(typed.value, props.question.word));
};

const choiceColor = (c: GameWord) => {
  if (result.value === null) return 'grey-2';
  if (c.answer === props.question.word.answer) return 'positive';
  if (c.answer === chosen.value?.answer) return 'negative';
  return 'grey-5';
};

// 電腦可以按 1~4 作答
useEventListener(window, 'keydown', (e: KeyboardEvent) => {
  if (spelling.value) return;
  const c = props.question.choices[Number(e.key) - 1];
  if (c) choose(c);
});
</script>

<style scoped lang="scss">
.question {
  border: 3px solid transparent;
  transition: border-color 0.2s;
}
.question--right {
  border-color: $positive;
}
.question--wrong {
  border-color: $negative;
}
.prompt {
  font-size: 2rem;
  font-weight: 900;
  line-height: 1.2;
}
.choices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.choice {
  min-height: 60px;
  border-radius: 14px;
  font-weight: 800;
}
.choice__key {
  position: absolute;
  top: 3px;
  left: 8px;
  font-size: 0.7rem;
  opacity: 0.5;
}
.blanks {
  font-family: monospace;
  font-size: 1.5rem;
  letter-spacing: 4px;
  .gap {
    display: inline-block;
    width: 0.8em;
  }
}
.spell-input {
  display: block;
  width: 100%;
  padding: 12px;
  border: 3px solid var(--app-line);
  border-radius: 14px;
  font: inherit;
  font-size: 1.5rem;
  font-weight: 800;
  text-align: center;
  outline: none;
  &:focus {
    border-color: $primary;
  }
}
.feedback {
  font-weight: 800;
  font-size: 1.1rem;
}
</style>
