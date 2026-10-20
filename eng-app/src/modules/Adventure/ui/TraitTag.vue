<template>
  <span class="trait"
    >{{ info.emoji }} {{ info.name }}<template v-if="full">：{{ info.effect }}</template></span
  >
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type Trait, TRAITS } from '../domain/traits';

/** full：連效果一起顯示（地方夠大時用） */
const props = defineProps<{ trait: Trait; full?: boolean }>();
const info = computed(() => TRAITS[props.trait]);
</script>

<style scoped>
.trait {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  background: rgba(245, 158, 11, 0.15);
  color: #92400e;
}
</style>
