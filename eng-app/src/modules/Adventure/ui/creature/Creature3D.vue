<template>
  <canvas ref="canvas" class="creature-3d" :aria-label="label" role="img" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { CreatureView } from './three/viewer';

const props = defineProps<{
  url: string;
  shiny: boolean;
  animated: boolean;
  flip: boolean;
  label: string;
}>();
const emit = defineEmits<{ failed: [] }>();

const canvas = ref<HTMLCanvasElement>();
let view: CreatureView | null = null;
let unmounted = false;

onMounted(async () => {
  try {
    const { createView } = await import('./three/viewer');
    if (unmounted || !canvas.value) return;
    view = createView(
      canvas.value,
      { url: props.url, shiny: props.shiny, animated: props.animated, flip: props.flip },
      () => emit('failed'),
    );
  } catch {
    emit('failed');
  }
});

watch(
  () => [props.url, props.shiny, props.animated, props.flip] as const,
  ([url, shiny, animated, flip]) => view?.update({ url, shiny, animated, flip }),
);

onBeforeUnmount(() => {
  unmounted = true;
  view?.dispose();
});
</script>

<style scoped>
.creature-3d {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  /* 左右拖曳轉字靈，上下仍可捲動頁面 */
  touch-action: pan-y;
  cursor: grab;
}
</style>
