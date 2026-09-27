<template>
  <span class="matchup" :class="good ? 'matchup--good' : 'matchup--bad'"><slot /></span>
</template>

<script setup lang="ts">
/** 屬性相剋的提示標籤：有利是綠色、不利是紅色 */
defineProps<{ good: boolean }>();
</script>

<style scoped>
.matchup {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
  white-space: nowrap;
}
.matchup--good {
  background: #dcfce7;
  color: #166534;
}
.matchup--bad {
  background: #fee2e2;
  color: #991b1b;
}
</style>
