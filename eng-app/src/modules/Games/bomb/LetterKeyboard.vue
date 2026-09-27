<template>
  <div class="keyboard">
    <div v-for="row in ROWS" :key="row" class="kb-row">
      <button
        v-for="ch in row"
        :key="ch"
        type="button"
        class="key"
        :class="status(ch)"
        :disabled="disabled || status(ch) !== ''"
        @click="$emit('press', ch)"
      >
        {{ ch.toUpperCase() }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ status: (ch: string) => '' | 'hit' | 'miss'; disabled?: boolean }>();
defineEmits<{ (e: 'press', ch: string): void }>();

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
</script>

<style scoped>
.keyboard {
  display: flex;
  flex-direction: column;
  gap: 6px;
  user-select: none;
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
