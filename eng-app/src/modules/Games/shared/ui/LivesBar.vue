<template>
  <div class="lives" :aria-label="`剩餘 ${lives} / ${max}`">
    <span v-for="i in max" :key="i" :class="{ lost: i > lives }">{{ icon }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ lives: number; max: number; icon?: string }>(), { icon: '❤️' });
</script>

<style scoped>
.lives {
  font-size: 1.4rem;
  letter-spacing: 2px;
  white-space: nowrap;
}
.lost {
  filter: grayscale(1);
  opacity: 0.3;
}
</style>
