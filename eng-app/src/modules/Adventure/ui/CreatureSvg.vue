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

    <g class="creature__body">
      <!-- 身體後面的部件 -->
      <g v-if="has('crown')" :stroke="accent" stroke-width="5" stroke-linecap="round">
        <line
          v-for="i in 12"
          :key="i"
          :x1="60 + Math.cos((i * Math.PI) / 6) * 40"
          :y1="g.cy + Math.sin((i * Math.PI) / 6) * 40"
          :x2="60 + Math.cos((i * Math.PI) / 6) * 50"
          :y2="g.cy + Math.sin((i * Math.PI) / 6) * 50"
        />
      </g>
      <g v-if="has('wings')" :fill="accent" :stroke="line" stroke-width="2">
        <ellipse cx="24" :cy="g.cy" rx="14" ry="8" :transform="`rotate(-30 24 ${g.cy})`" />
        <ellipse cx="96" :cy="g.cy" rx="14" ry="8" :transform="`rotate(30 96 ${g.cy})`" />
      </g>
      <g v-if="has('fins')" :fill="accent" :stroke="line" stroke-width="2">
        <path :d="`M30 ${g.cy + 6} L12 ${g.cy - 4} L16 ${g.cy + 16} Z`" />
        <path :d="`M90 ${g.cy + 6} L108 ${g.cy - 4} L104 ${g.cy + 16} Z`" />
      </g>
      <g v-if="has('ears')" :stroke="line" stroke-width="2">
        <circle cx="38" :cy="g.top + 8" r="10" :fill="look.color" />
        <circle cx="82" :cy="g.top + 8" r="10" :fill="look.color" />
        <circle cx="38" :cy="g.top + 8" r="5" :fill="look.belly" stroke="none" />
        <circle cx="82" :cy="g.top + 8" r="5" :fill="look.belly" stroke="none" />
      </g>
      <g v-if="has('leafEars')" fill="#4ade80" :stroke="line" stroke-width="2">
        <ellipse
          cx="46"
          :cy="g.top - 6"
          rx="7"
          ry="18"
          :transform="`rotate(-18 46 ${g.top - 6})`"
        />
        <ellipse cx="74" :cy="g.top - 6" rx="7" ry="18" :transform="`rotate(18 74 ${g.top - 6})`" />
      </g>
      <g v-if="has('shell')" :stroke="line" stroke-width="2">
        <circle cx="88" :cy="g.cy - 4" r="20" :fill="accent" />
        <path
          :d="`M88 ${g.cy - 4} m-10 0 a10 10 0 1 1 10 10 a6 6 0 1 1 -6 -6`"
          fill="none"
          stroke-width="2.5"
        />
      </g>
      <g v-if="has('bulb')">
        <path
          :d="`M88 ${g.cy + 12} Q104 ${g.cy + 8} 104 ${g.cy - 12}`"
          fill="none"
          :stroke="line"
          stroke-width="3"
        />
        <circle cx="104" :cy="g.cy - 20" r="12" fill="#fef08a" opacity="0.45" class="glow" />
        <circle cx="104" :cy="g.cy - 20" r="7" fill="#fde047" :stroke="line" stroke-width="2" />
      </g>

      <!-- 腳 -->
      <g
        v-if="look.body !== 'drop' && look.body !== 'blob'"
        :fill="dark"
        :stroke="line"
        stroke-width="2"
      >
        <ellipse cx="46" cy="102" rx="9" ry="5" />
        <ellipse cx="74" cy="102" rx="9" ry="5" />
      </g>

      <!-- 身體 -->
      <g :fill="look.color" :stroke="line" stroke-width="2.5">
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

      <!-- 身體前面的部件 -->
      <g v-if="has('moss')" fill="#4ade80" :stroke="line" stroke-width="1.5">
        <circle cx="42" :cy="g.top + 8" r="6" />
        <circle cx="53" :cy="g.top + 3" r="7" />
        <circle cx="67" :cy="g.top + 3" r="7" />
        <circle cx="78" :cy="g.top + 8" r="6" />
      </g>
      <path
        v-if="has('cap')"
        :d="`M20 ${g.top + 18} Q60 ${g.top - 30} 100 ${g.top + 18} Z`"
        :fill="accent"
        :stroke="line"
        stroke-width="2.5"
      />
      <g v-if="has('cap')" fill="#fff" opacity="0.7">
        <circle cx="44" :cy="g.top + 4" r="4" />
        <circle cx="62" :cy="g.top - 4" r="5" />
        <circle cx="78" :cy="g.top + 6" r="3.5" />
      </g>
      <g v-if="has('horns')" :fill="accent" :stroke="line" stroke-width="2">
        <path :d="`M40 ${g.top + 10} L44 ${g.top - 8} L52 ${g.top + 6} Z`" />
        <path :d="`M80 ${g.top + 10} L76 ${g.top - 8} L68 ${g.top + 6} Z`" />
      </g>
      <g v-if="has('antenna')" :stroke="line" stroke-width="2.5" fill="none">
        <path :d="`M52 ${g.top + 4} Q48 ${g.top - 8} 42 ${g.top - 14}`" />
        <path :d="`M68 ${g.top + 4} Q72 ${g.top - 8} 78 ${g.top - 14}`" />
        <circle cx="42" :cy="g.top - 14" r="3.5" :fill="accent" />
        <circle cx="78" :cy="g.top - 14" r="3.5" :fill="accent" />
      </g>
      <g v-if="has('sprout')" :stroke="line" stroke-width="2">
        <path
          :d="`M60 ${g.top + 2} L60 ${g.top - 12}`"
          fill="none"
          stroke="#15803d"
          stroke-width="3"
        />
        <ellipse
          cx="52"
          :cy="g.top - 14"
          rx="9"
          ry="5"
          fill="#4ade80"
          :transform="`rotate(-25 52 ${g.top - 14})`"
        />
        <ellipse
          cx="68"
          :cy="g.top - 14"
          rx="9"
          ry="5"
          fill="#4ade80"
          :transform="`rotate(25 68 ${g.top - 14})`"
        />
      </g>
      <g v-if="has('flame')" class="flicker">
        <path
          :d="`M60 ${g.top - 24} C74 ${g.top - 10} 74 ${g.top + 2} 60 ${g.top + 8} C46 ${g.top + 2} 46 ${g.top - 10} 60 ${g.top - 24} Z`"
          fill="#f97316"
          :stroke="line"
          stroke-width="2"
        />
        <path
          :d="`M60 ${g.top - 12} C66 ${g.top - 4} 66 ${g.top + 2} 60 ${g.top + 5} C54 ${g.top + 2} 54 ${g.top - 4} 60 ${g.top - 12} Z`"
          fill="#fde047"
        />
      </g>
      <g v-if="has('bubbles')" fill="#fff" fill-opacity="0.75" stroke="#0284c7" stroke-width="1.5">
        <circle cx="48" :cy="g.top - 6" r="6" />
        <circle cx="64" :cy="g.top - 16" r="4.5" />
        <circle cx="74" :cy="g.top - 4" r="3.5" />
      </g>
      <path
        v-if="has('star')"
        :d="starPath(60, g.face - 16, 8)"
        :fill="accent"
        :stroke="line"
        stroke-width="1.5"
      />

      <!-- 臉 -->
      <g class="creature__face">
        <template v-for="x in [48, 72]" :key="x">
          <g v-if="look.eyes === 'dot'">
            <circle :cx="x" :cy="g.face" r="4.5" fill="#1f2937" />
            <circle :cx="x + 1.5" :cy="g.face - 1.5" r="1.4" fill="#fff" />
          </g>
          <g v-else-if="look.eyes === 'big'">
            <circle :cx="x" :cy="g.face" r="7.5" fill="#fff" :stroke="line" stroke-width="1.5" />
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
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CreaturePart, Species } from '../domain/species';

const props = withDefaults(
  defineProps<{
    species: Species;
    size?: number;
    /** 未發現時顯示剪影 */
    silhouette?: boolean;
    animated?: boolean;
    /** 面向左邊（對戰時我方字靈） */
    flip?: boolean;
  }>(),
  { size: 120, silhouette: false, animated: true, flip: false },
);

const look = computed(() => props.species.look);
const has = (p: CreaturePart) => look.value.parts.includes(p);

const line = 'rgba(0, 0, 0, 0.28)';

/** 把 #rrggbb 調暗 */
const darken = (hex: string, amount = 0.35) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (shift: number) => Math.round(((n >> shift) & 255) * (1 - amount));
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
};

const accent = computed(() => look.value.accent ?? darken(look.value.color));
const dark = computed(() => darken(look.value.color, 0.25));

/** 各種身體的幾何位置：頭頂、身體中心、臉、肚子 [cy, rx, ry] */
const GEOMETRY = {
  round: { top: 38, cy: 70, face: 64, belly: [82, 18, 14] },
  bean: { top: 48, cy: 74, face: 70, belly: [86, 22, 11] },
  tall: { top: 32, cy: 68, face: 58, belly: [84, 15, 17] },
  drop: { top: 44, cy: 72, face: 68, belly: [86, 20, 11] },
  blob: { top: 50, cy: 74, face: 70, belly: [86, 20, 9] },
} as const;
const g = computed(() => GEOMETRY[look.value.body]);

const starPath = (cx: number, cy: number, r: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    pts.push(`${(cx + Math.cos(rad) * rr).toFixed(1)} ${(cy + Math.sin(rad) * rr).toFixed(1)}`);
  }
  return `M${pts.join(' L')} Z`;
};
</script>

<style scoped>
.creature {
  /* Tailwind 的 preflight 會把 svg 設成 block，這裡改回 inline 才能用 text-align 置中 */
  display: inline-block;
  vertical-align: middle;
  overflow: visible;
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
.flicker {
  animation: flicker 0.6s ease-in-out infinite alternate;
  transform-origin: 60px 40px;
}
.glow {
  animation: glow 1.4s ease-in-out infinite alternate;
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
@keyframes flicker {
  to {
    transform: scaleY(1.12) skewX(3deg);
  }
}
@keyframes glow {
  to {
    opacity: 0.15;
  }
}
</style>
