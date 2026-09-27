<template>
  <div class="keyboard">
    <div v-for="row in ROWS" :key="row" class="kb-row">
      <button
        v-for="ch in row"
        :key="ch"
        type="button"
        class="key"
        :class="keyStatus(ch)"
        :disabled="disabled || keyStatus(ch) !== ''"
        @click="$emit('press', ch)"
      >
        {{ ch.toUpperCase() }}
      </button>
    </div>
    <div v-if="withSpace" class="kb-row">
      <button
        type="button"
        class="key key--wide"
        :disabled="disabled"
        aria-label="取消鎖定"
        @click="$emit('backspace')"
      >
        ⌫
      </button>
      <button
        type="button"
        class="key key--space"
        :disabled="disabled"
        aria-label="空白鍵"
        @click="$emit('press', ' ')"
      >
        space
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  /** 每個字母的狀態（猜過的字母會變色並停用）；不給就全部可以按 */
  status?: (ch: string) => '' | 'hit' | 'miss';
  disabled?: boolean;
  /** 多一排：取消鍵與空白鍵（打字遊戲用） */
  withSpace?: boolean;
}>();
defineEmits<{ (e: 'press', ch: string): void; (e: 'backspace'): void }>();

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

const keyStatus = (ch: string) => props.status?.(ch) ?? '';
</script>

<style scoped>
.keyboard {
  display: flex;
  flex-direction: column;
  gap: 6px;
  user-select: none;
  touch-action: manipulation;
}
.kb-row {
  display: flex;
  justify-content: center;
  gap: 5px;
}
.key {
  flex: 0 1 44px;
  height: 48px;
  min-width: 0;
  border: none;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 0 #bdbdbd;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
}
.key--wide {
  flex-basis: 70px;
}
.key--space {
  flex: 0 1 260px;
  font-size: 0.9rem;
  color: #64748b;
}
.key:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: none;
}
.key.hit {
  background: #66bb6a;
  color: #fff;
}
.key.miss {
  background: #9e9e9e;
  color: #eee;
}
.key:disabled {
  cursor: default;
}
</style>
