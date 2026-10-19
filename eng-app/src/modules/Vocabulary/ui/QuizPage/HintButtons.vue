<template>
  <div class="hints">
    <button
      type="button"
      class="hint"
      :class="{ 'hint--on': showLength }"
      @click="showLength = true"
    >
      <q-icon name="straighten" size="18px" />
      {{ showLength ? `${letterCount(word)} 個字母` : '幾個字母？' }}
    </button>
    <button type="button" class="hint" :class="{ 'hint--on': showHint }" @click="showHint = true">
      <q-icon name="lightbulb" size="18px" />
      {{ showHint ? `${word.charAt(0).toUpperCase()} 開頭` : '第一個字母' }}
    </button>
    <button
      type="button"
      class="hint hint--peek"
      :class="{ 'hint--on': showAnswer }"
      @click="showAnswer = true"
    >
      <q-icon name="visibility" size="18px" />
      {{ showAnswer ? word : '偷看答案' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { letterCount } from '../../domain';

/** 三種提示：字母數、第一個字母、偷看答案；按下後就一直亮著 */
defineProps<{ word: string }>();
const showLength = defineModel<boolean>('showLength', { required: true });
const showHint = defineModel<boolean>('showHint', { required: true });
const showAnswer = defineModel<boolean>('showAnswer', { required: true });
</script>

<style scoped lang="scss">
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
</style>
