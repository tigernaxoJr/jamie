<template>
  <CreatureSvg
    v-if="mode === 'svg'"
    :species="species"
    :size="size"
    :silhouette="silhouette"
    :animated="animated"
    :flip="flip"
    :evolved="evolved"
    :shiny="shiny"
  />
  <span
    v-else
    class="creature-view"
    :class="{
      'creature-view--silhouette': silhouette,
      'creature-view--idle': animated && mode === 'image',
      'creature-view--flip': flip && mode === 'image',
    }"
    :style="{ width: `${size}px`, height: `${size}px` }"
    role="img"
    :aria-label="label"
  >
    <!-- 進化後的光環（和 CreatureSvg 相同，立體圖的框和 SVG 的 viewBox 一致） -->
    <svg v-if="evolved && !silhouette" viewBox="0 0 120 120" class="creature-view__layer">
      <circle cx="60" :cy="cy" r="56" :fill="elementColor" opacity="0.2" />
      <circle
        cx="60"
        :cy="cy"
        r="50"
        fill="none"
        :stroke="elementColor"
        stroke-width="2.5"
        stroke-dasharray="5 7"
        class="aura__ring"
        :style="{ transformOrigin: `60px ${cy}px` }"
      />
    </svg>

    <Creature3D
      v-if="mode === '3d'"
      :url="creatureAsset(species.english, 'glb')"
      :shiny="!!shiny"
      :animated="animated"
      :flip="flip"
      :label="label"
      @failed="failed3d = true"
    />
    <img
      v-else
      :src="creatureAsset(species.english, 'webp', !!shiny && !silhouette)"
      :alt="label"
      class="creature-view__img"
      draggable="false"
      @error="failedImage = true"
    />

    <svg
      v-if="!silhouette && (evolved || shiny)"
      viewBox="0 0 120 120"
      class="creature-view__layer"
    >
      <path
        v-if="evolved"
        :d="starPath(100, 18, 9)"
        fill="#facc15"
        stroke="rgba(0,0,0,0.3)"
        stroke-width="1.5"
      />
      <g v-if="shiny" fill="#fde68a" stroke="#f59e0b" stroke-width="1">
        <path :d="starPath(16, 34, 9)" class="sparkle" />
        <path :d="starPath(106, 60, 7)" class="sparkle sparkle--2" />
        <path :d="starPath(20, 86, 6)" class="sparkle sparkle--3" />
      </g>
    </svg>
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Species } from '../domain/species';
import { ELEMENTS } from '../domain/elements';
import CreatureSvg from './CreatureSvg.vue';
import Creature3D from './creature/Creature3D.vue';
import { GEOMETRY, starPath } from './creature/geometry';
import { MIN_3D_SIZE, creatureAsset, creatureStyle, supportsWebgl } from './creature/style';

/** 字靈的外觀：依設定顯示插畫、立體圖或即時 3D（見 creature/style.ts） */
const props = withDefaults(
  defineProps<{
    species: Species;
    size?: number;
    /** 未發現時顯示剪影 */
    silhouette?: boolean;
    animated?: boolean;
    /** 面向左邊（對戰時我方字靈） */
    flip?: boolean;
    /** 進化後：加上屬性光環與星星 */
    evolved?: boolean;
    /** 色違：換顏色並加上閃光 */
    shiny?: boolean | undefined;
  }>(),
  { size: 120, silhouette: false, animated: true, flip: false, evolved: false, shiny: false },
);

const failed3d = ref(false);
const failedImage = ref(false);

const mode = computed(() => {
  if (creatureStyle.value === 'svg' || failedImage.value) return 'svg';
  const want3d =
    creatureStyle.value === '3d' &&
    props.size >= MIN_3D_SIZE &&
    !props.silhouette &&
    !failed3d.value &&
    supportsWebgl();
  return want3d ? '3d' : 'image';
});

const label = computed(() => (props.silhouette ? '未知的字靈' : props.species.name));
const cy = computed(() => GEOMETRY[props.species.look.body].cy);
const elementColor = computed(() => ELEMENTS[props.species.element].color);
</script>

<style scoped>
.creature-view {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  user-select: none;
}
.creature-view__img,
.creature-view__layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}
.creature-view__img {
  object-fit: contain;
}
.creature-view--silhouette .creature-view__img {
  filter: brightness(0);
  opacity: 0.75;
}
.creature-view--flip .creature-view__img {
  transform: scaleX(-1);
}
.creature-view--idle .creature-view__img {
  animation: bob 2.4s ease-in-out infinite;
  transform-origin: 50% 87%;
}
.creature-view--idle.creature-view--flip .creature-view__img {
  animation-name: bob-flip;
}
@keyframes bob {
  50% {
    transform: translateY(-3%) scaleY(1.02);
  }
}
@keyframes bob-flip {
  0%,
  100% {
    transform: scaleX(-1);
  }
  50% {
    transform: scaleX(-1) translateY(-3%) scaleY(1.02);
  }
}
.aura__ring {
  animation: spin 8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.sparkle {
  animation: twinkle 1.6s ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}
.sparkle--2 {
  animation-delay: 0.5s;
}
.sparkle--3 {
  animation-delay: 1s;
}
@keyframes twinkle {
  0%,
  100% {
    opacity: 0.2;
    transform: scale(0.6);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}
</style>
