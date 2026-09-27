<template>
  <div class="pause-overlay absolute-full flex flex-center column" @click="$emit('resume')">
    <div class="text-h4 text-white text-weight-bold">⏸ 暫停中</div>
    <q-btn class="q-mt-md" color="white" text-color="primary" size="lg" rounded label="繼續遊戲" />
  </div>
</template>

<script setup lang="ts">
defineEmits<{ (e: 'resume'): void }>();
</script>

<style scoped>
.pause-overlay {
  background: rgba(0, 0, 0, 0.55);
  z-index: 10;
  cursor: pointer;
  border-radius: inherit;
}
</style>
