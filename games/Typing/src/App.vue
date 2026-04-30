<script setup lang="ts">
import GameBoard from './components/GameBoard.vue';
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
    <GameBoard />
  </div>
</template>

<style>
/* 可以在這裡加入全域樣式，或者直接使用 tailwind 即可 */
body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  overflow: hidden;
}
</style>
