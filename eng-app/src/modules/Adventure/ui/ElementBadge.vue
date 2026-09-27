<template>
  <span class="element" :style="{ background: info.color, color: info.ink ?? '#fff' }"
    >{{ info.emoji }} {{ info.name }}</span
  >
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type Element, ELEMENTS } from '../domain/elements';

const props = defineProps<{ element: Element }>();
const info = computed(() => ELEMENTS[props.element]);
</script>

<style scoped>
.element {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
  white-space: nowrap;
}
</style>
