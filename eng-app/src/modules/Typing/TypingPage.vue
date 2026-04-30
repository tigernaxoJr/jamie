<template>
  <q-page class="bg-black overflow-hidden">
    <iframe
      src="games/typing/index.html"
      class="typing-iframe"
      title="Typing Game"
    ></iframe>
  </q-page>
</template>

<script setup lang="ts">
</script>

<style scoped>
.q-page {
  /* 強制移除可能的 min-height 限制，讓 iframe 決定高度 */
  min-height: unset !important;
  height: calc(100vh - 58px); /* 預估 Header 高度 */
  display: flex;
}

.typing-iframe {
  width: 100%;
  height: 100%;
  border: none;
  flex-grow: 1;
}
</style>
