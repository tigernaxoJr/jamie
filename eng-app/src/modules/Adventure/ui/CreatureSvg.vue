<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 120 120"
    class="creature"
    :class="{
      'creature--silhouette': silhouette,
      'creature--idle': animated,
      'creature--flip': flip,
    }"
    role="img"
    :aria-label="silhouette ? '未知的字靈' : species.name"
  >
    <ellipse cx="60" cy="110" rx="30" ry="5" class="shadow" />

    <!-- 進化後的光環 -->
    <g v-if="evolved" class="aura">
      <circle cx="60" :cy="g.cy" r="56" :fill="elementColor" opacity="0.2" />
      <circle
        cx="60"
        :cy="g.cy"
        r="50"
        fill="none"
        :stroke="elementColor"
        stroke-width="2.5"
        stroke-dasharray="5 7"
        class="aura__ring"
      />
    </g>

    <g class="creature__body">
      <CreatureBackParts :look="look" :g="g" :accent="accent" />

      <!-- 腳 -->
      <g
        v-if="look.body !== 'drop' && look.body !== 'blob'"
        :fill="dark"
        :stroke="LINE"
        stroke-width="2"
      >
        <ellipse cx="46" cy="102" rx="9" ry="5" />
        <ellipse cx="74" cy="102" rx="9" ry="5" />
      </g>

      <!-- 身體 -->
      <g :fill="look.color" :stroke="LINE" stroke-width="2.5">
        <circle v-if="look.body === 'round'" cx="60" cy="70" r="34" />
        <ellipse v-else-if="look.body === 'bean'" cx="60" cy="74" rx="40" ry="28" />
        <ellipse v-else-if="look.body === 'tall'" cx="60" cy="68" rx="27" ry="38" />
        <path
          v-else-if="look.body === 'drop'"
          d="M60 28 C78 48 94 62 94 78 A34 28 0 0 1 26 78 C26 62 42 48 60 28 Z"
        />
        <path
          v-else
          d="M30 96 C14 96 12 74 28 70 C24 52 44 44 54 52 C60 38 84 40 86 56 C102 54 108 76 96 84 C102 96 90 100 82 96 Z"
        />
      </g>
      <ellipse :cx="60" :cy="g.belly[0]" :rx="g.belly[1]" :ry="g.belly[2]" :fill="look.belly" />

      <CreatureFrontParts :look="look" :g="g" :accent="accent" />

      <!-- 臉 -->
      <g class="creature__face">
        <template v-for="x in [48, 72]" :key="x">
          <g v-if="look.eyes === 'dot'">
            <circle :cx="x" :cy="g.face" r="4.5" fill="#1f2937" />
            <circle :cx="x + 1.5" :cy="g.face - 1.5" r="1.4" fill="#fff" />
          </g>
          <g v-else-if="look.eyes === 'big'">
            <circle :cx="x" :cy="g.face" r="7.5" fill="#fff" :stroke="LINE" stroke-width="1.5" />
            <circle :cx="x + 1" :cy="g.face + 1" r="4.5" fill="#1f2937" />
            <circle :cx="x + 2.5" :cy="g.face - 1" r="1.6" fill="#fff" />
          </g>
          <path
            v-else-if="look.eyes === 'sleepy'"
            :d="`M${x - 5} ${g.face} Q${x} ${g.face + 4} ${x + 5} ${g.face}`"
            fill="none"
            stroke="#1f2937"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <path
            v-else
            :d="`M${x - 5} ${g.face + 2} Q${x} ${g.face - 5} ${x + 5} ${g.face + 2}`"
            fill="none"
            stroke="#1f2937"
            stroke-width="2.5"
            stroke-linecap="round"
          />
        </template>

        <template v-if="look.cheeks">
          <ellipse cx="39" :cy="g.face + 8" rx="5" ry="3" fill="#fb7185" opacity="0.55" />
          <ellipse cx="81" :cy="g.face + 8" rx="5" ry="3" fill="#fb7185" opacity="0.55" />
        </template>

        <path
          v-if="look.mouth === 'smile'"
          :d="`M54 ${g.face + 10} Q60 ${g.face + 16} 66 ${g.face + 10}`"
          fill="none"
          stroke="#1f2937"
          stroke-width="2.5"
          stroke-linecap="round"
        />
        <g v-else-if="look.mouth === 'open'">
          <ellipse cx="60" :cy="g.face + 12" rx="5" ry="4.5" fill="#7f1d1d" />
          <ellipse cx="60" :cy="g.face + 14" rx="3" ry="2" fill="#fb7185" />
        </g>
        <path
          v-else-if="look.mouth === 'cat'"
          :d="`M53 ${g.face + 10} Q56.5 ${g.face + 14} 60 ${g.face + 10} Q63.5 ${g.face + 14} 67 ${g.face + 10}`"
          fill="none"
          stroke="#1f2937"
          stroke-width="2.2"
          stroke-linecap="round"
        />
        <circle v-else cx="60" :cy="g.face + 11" r="2" fill="#1f2937" />
      </g>
    </g>
    <path
      v-if="evolved && !silhouette"
      :d="starPath(100, 18, 9)"
      fill="#facc15"
      stroke="rgba(0,0,0,0.3)"
      stroke-width="1.5"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Species } from '../domain/species';
import { ELEMENTS } from '../domain/elements';
import { GEOMETRY, LINE, darken, starPath } from './creature/geometry';
import CreatureBackParts from './creature/CreatureBackParts.vue';
import CreatureFrontParts from './creature/CreatureFrontParts.vue';

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
  }>(),
  { size: 120, silhouette: false, animated: true, flip: false, evolved: false },
);

const look = computed(() => props.species.look);
const accent = computed(() => look.value.accent ?? darken(look.value.color));
const dark = computed(() => darken(look.value.color, 0.25));
const g = computed(() => GEOMETRY[look.value.body]);
const elementColor = computed(() => ELEMENTS[props.species.element].color);
</script>

<style scoped>
.creature {
  /* Tailwind 的 preflight 會把 svg 設成 block，這裡改回 inline 才能用 text-align 置中 */
  display: inline-block;
  vertical-align: middle;
  overflow: visible;
}
.aura__ring {
  animation: spin 8s linear infinite;
  transform-origin: 60px 70px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.creature--silhouette .aura {
  display: none;
}
.shadow {
  fill: rgba(0, 0, 0, 0.12);
}
.creature--flip .creature__body {
  transform: scaleX(-1);
  transform-origin: 60px 60px;
}
.creature--idle .creature__body {
  animation: bob 2.4s ease-in-out infinite;
  transform-origin: 60px 104px;
}
.creature--flip.creature--idle .creature__body {
  animation-name: bob-flip;
}
.creature--silhouette .creature__body {
  filter: brightness(0);
  opacity: 0.75;
}
.creature--silhouette .creature__face {
  visibility: hidden;
}
@keyframes bob {
  50% {
    transform: translateY(-4px) scaleY(1.02);
  }
}
@keyframes bob-flip {
  0%,
  100% {
    transform: scaleX(-1);
  }
  50% {
    transform: scaleX(-1) translateY(-4px) scaleY(1.02);
  }
}
</style>
