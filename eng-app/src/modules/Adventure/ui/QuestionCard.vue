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

    <!-- 拼字題：字母方塊 -->
    <div v-else-if="question.hint === 'tiles'">
      <div class="slots q-mb-sm">
        <template v-for="(slot, i) in slots" :key="i">
          <span v-if="slot.gap" class="slot-gap" />
          <button
            v-else
            type="button"
            class="slot"
            :class="{ filled: slot.tile !== null }"
            :disabled="result !== null || slot.tile === null"
            @click="unpick(slot.index)"
          >
            {{ slot.tile === null ? '' : tiles[slot.tile] }}
          </button>
        </template>
      </div>
      <div class="tiles">
        <button
          v-for="(t, i) in tiles"
          :key="i"
          type="button"
          class="tile"
          :class="{ used: picked.includes(i) }"
          :disabled="result !== null || picked.includes(i)"
          @click="pick(i)"
        >
          {{ t }}
        </button>
      </div>
      <div class="text-center text-caption text-muted q-mt-xs">
        點字母排出單字，點上面的格子可以拿回來
      </div>
    </div>

    <!-- 拼字題：打字 -->
    <div v-else>
      <div class="blanks text-center q-mb-sm">
        <span v-for="(ch, i) in blanks" :key="i" :class="{ gap: ch === ' ' }">{{
          ch === ' ' ? '' : i === 0 && question.hint === 'first' ? ch : '_'
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
import { type GameWord, isLetter, lettersOf, sfx } from 'src/modules/Games/shared';
import {
  type Question,
  QUESTION_PROMPT,
  isListening,
  isSpelling,
  isSpellingCorrect,
  letterTiles,
} from '../domain/questions';

const props = defineProps<{ question: Question }>();
const emit = defineEmits<{ (e: 'answered', correct: boolean): void }>();

const listening = computed(() => isListening(props.question.kind));
const spelling = computed(() => isSpelling(props.question.kind));
const blanks = computed(() => [...props.question.word.answer]);
const letterCount = computed(() => lettersOf(props.question.word.answer).length);

const chosen = ref<GameWord | null>(null);
const typed = ref('');
// 字母方塊：tiles 是打散的字母，picked 依序記錄放進格子的方塊編號
const tiles = ref<string[]>([]);
const picked = ref<number[]>([]);
const result = ref<boolean | null>(null);
const inputEl = ref<HTMLInputElement | null>(null);

const speak = () => WordPronunciation(props.question.word.answer);

const reset = () => {
  chosen.value = null;
  typed.value = '';
  result.value = null;
  tiles.value = props.question.hint === 'tiles' ? letterTiles(props.question.word.answer) : [];
  picked.value = [];
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

/** 答案的每個位置：空白/符號是間隔，字母是格子（index 是第幾個字母格） */
const slots = computed(() => {
  let n = 0;
  return [...props.question.word.answer].map((ch) => {
    if (!isLetter(ch)) return { gap: true, index: -1, tile: null };
    const index = n++;
    return { gap: false, index, tile: picked.value[index] ?? null };
  });
});

const pick = (i: number) => {
  if (result.value !== null || picked.value.includes(i)) return;
  picked.value.push(i);
  sfx.click();
  if (picked.value.length === tiles.value.length) {
    finish(
      isSpellingCorrect(picked.value.map((t) => tiles.value[t]).join(''), props.question.word),
    );
  }
};

/** 拿回某一格的字母，後面的字母往前補 */
const unpick = (index: number) => {
  if (result.value !== null) return;
  picked.value.splice(index, 1);
};

const choiceColor = (c: GameWord) => {
  if (result.value === null) return 'grey-2';
  if (c.answer === props.question.word.answer) return 'positive';
  if (c.answer === chosen.value?.answer) return 'negative';
  return 'grey-5';
};

// 電腦可以按 1~4 作答
useEventListener(window, 'keydown', (e: KeyboardEvent) => {
  // 字母方塊：電腦可以直接打字挑方塊，Backspace 拿回最後一個
  if (props.question.hint === 'tiles') {
    if (e.key === 'Backspace') unpick(picked.value.length - 1);
    else if (isLetter(e.key)) {
      const i = tiles.value.findIndex(
        (t, idx) => !picked.value.includes(idx) && t.toLowerCase() === e.key.toLowerCase(),
      );
      if (i >= 0) pick(i);
    }
    return;
  }
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
.slots,
.tiles {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}
.slot,
.tile {
  width: 42px;
  height: 48px;
  border-radius: 10px;
  font: inherit;
  font-size: 1.5rem;
  font-weight: 900;
  cursor: pointer;
}
.slot {
  border: 3px dashed var(--app-line);
  background: transparent;
  color: inherit;
  &.filled {
    border-style: solid;
    border-color: $primary;
  }
}
.slot-gap {
  width: 14px;
}
.tile {
  border: none;
  background: $primary;
  color: white;
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.2);
  &.used {
    visibility: hidden;
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
