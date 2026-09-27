<template>
  <q-page class="typing-page bg-black overflow-hidden" :style-fn="fillHeight">
    <iframe src="games/typing/index.html" class="typing-iframe" title="Typing Game"></iframe>
  </q-page>
</template>

<script setup lang="ts">
// 讓 iframe 填滿 header/footer 以外的高度
const fillHeight = (offset: number) => ({ height: `calc(100vh - ${offset}px)` });
</script>

<style scoped>
.typing-page {
  display: flex;
}

.typing-iframe {
  width: 100%;
  height: 100%;
  border: none;
  flex-grow: 1;
}
</style>
