<template>
  <router-view />
</template>

<script setup lang="ts">
import { nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';

/** 等字型最多多久（毫秒）；網路慢時不要卡在啟動畫面 */
const FONT_WAIT_MS = 1500;

const router = useRouter();

// 第一個頁面（含延遲載入的元件）和字型都準備好，才淡出 index.html 的啟動畫面
onMounted(async () => {
  await router.isReady();
  await Promise.race([
    document.fonts.ready,
    new Promise((resolve) => setTimeout(resolve, FONT_WAIT_MS)),
  ]);
  await nextTick();
  window.hideBootSplash?.();
});
</script>
