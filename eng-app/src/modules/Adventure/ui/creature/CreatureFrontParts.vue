<template>
  <!-- 畫在身體上面的部件（臉會再畫在這些部件之上） -->
  <g>
    <!-- 身上的花紋 -->
    <g v-if="has('stripes')" fill="none" :stroke="accent" stroke-width="3.5" stroke-linecap="round">
      <template v-for="k in [-10, 2, 14]" :key="k">
        <path :d="`M${60 - g.rx + 1} ${g.cy + k} q9 3 14 -2`" />
        <path :d="`M${60 + g.rx - 1} ${g.cy + k} q-9 3 -14 -2`" />
      </template>
    </g>
    <g v-if="has('spots')" :fill="accent">
      <circle
        v-for="(s, i) in SPOTS"
        :key="i"
        :cx="s[0]"
        :cy="s[1] === 'top' ? g.top + 10 : g.cy + s[1]"
        r="3.5"
      />
    </g>
    <g v-if="has('clock')">
      <circle cx="60" :cy="g.belly[0] + 2" r="10" fill="#fff" :stroke="accent" stroke-width="2.5" />
      <path
        :d="`M60 ${g.belly[0] + 2} v-7 M60 ${g.belly[0] + 2} h5`"
        stroke="#1f2937"
        stroke-width="2.2"
        stroke-linecap="round"
      />
    </g>
    <g v-if="has('swirl')" fill="none" :stroke="accent" stroke-width="3" stroke-linecap="round">
      <path :d="`M${60 - g.rx - 16} ${g.cy - 4} h11 M${60 - g.rx - 20} ${g.cy + 6} h14`" />
      <path :d="`M80 ${g.cy + 10} m-6 0 a6 6 0 1 1 6 6 a3.5 3.5 0 1 1 -3.5 -3.5`" />
    </g>
    <g v-if="has('patches')" :fill="accent">
      <ellipse cx="48" :cy="g.face" rx="8.5" ry="7.5" :transform="`rotate(-25 48 ${g.face})`" />
      <ellipse cx="72" :cy="g.face" rx="8.5" ry="7.5" :transform="`rotate(25 72 ${g.face})`" />
    </g>

    <!-- 頭上的配件 -->
    <g v-if="has('moss')" fill="#4ade80" :stroke="LINE" stroke-width="1.5">
      <circle cx="42" :cy="g.top + 8" r="6" />
      <circle cx="53" :cy="g.top + 3" r="7" />
      <circle cx="67" :cy="g.top + 3" r="7" />
      <circle cx="78" :cy="g.top + 8" r="6" />
    </g>
    <template v-if="has('cap')">
      <path
        :d="`M20 ${g.top + 18} Q60 ${g.top - 30} 100 ${g.top + 18} Z`"
        :fill="accent"
        :stroke="LINE"
        stroke-width="2.5"
      />
      <g fill="#fff" opacity="0.7">
        <circle cx="44" :cy="g.top + 4" r="4" />
        <circle cx="62" :cy="g.top - 4" r="5" />
        <circle cx="78" :cy="g.top + 6" r="3.5" />
      </g>
    </template>
    <template v-if="has('helmet')">
      <ellipse
        cx="60"
        :cy="g.top - 12"
        rx="5"
        ry="10"
        fill="#dc2626"
        :stroke="LINE"
        stroke-width="2"
      />
      <path
        :d="`M${60 - g.rx + 1} ${g.top + 20} Q60 ${g.top - 26} ${60 + g.rx - 1} ${g.top + 20} Z`"
        :fill="accent"
        :stroke="LINE"
        stroke-width="2.5"
      />
      <path
        :d="`M${60 - g.rx + 9} ${g.top + 14} H${60 + g.rx - 9}`"
        stroke="#1f2937"
        stroke-width="2"
        stroke-linecap="round"
      />
    </template>
    <g v-if="has('horns')" :fill="accent" :stroke="LINE" stroke-width="2">
      <path :d="`M40 ${g.top + 10} L44 ${g.top - 8} L52 ${g.top + 6} Z`" />
      <path :d="`M80 ${g.top + 10} L76 ${g.top - 8} L68 ${g.top + 6} Z`" />
    </g>
    <g v-if="has('antenna')" :stroke="LINE" stroke-width="2.5" fill="none">
      <path :d="`M52 ${g.top + 4} Q48 ${g.top - 8} 42 ${g.top - 14}`" />
      <path :d="`M68 ${g.top + 4} Q72 ${g.top - 8} 78 ${g.top - 14}`" />
      <circle cx="42" :cy="g.top - 14" r="3.5" :fill="accent" />
      <circle cx="78" :cy="g.top - 14" r="3.5" :fill="accent" />
    </g>
    <g v-if="has('sprout')" :stroke="LINE" stroke-width="2">
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
        :stroke="LINE"
        stroke-width="2"
      />
      <path
        :d="`M60 ${g.top - 12} C66 ${g.top - 4} 66 ${g.top + 2} 60 ${g.top + 5} C54 ${g.top + 2} 54 ${g.top - 4} 60 ${g.top - 12} Z`"
        fill="#fde047"
      />
    </g>
    <path
      v-if="has('headband')"
      :d="`M${60 - g.rx + 5} ${g.top + 12} Q60 ${g.top + 2} ${60 + g.rx - 5} ${g.top + 12} l8 -6 M${60 + g.rx - 5} ${g.top + 12} l9 3`"
      fill="none"
      :stroke="accent"
      stroke-width="6"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <g v-if="has('tiara')" :stroke="LINE" stroke-width="2">
      <path
        :d="`M44 ${g.top + 6} L44 ${g.top - 10} L52 ${g.top - 1} L60 ${g.top - 14} L68 ${g.top - 1} L76 ${g.top - 10} L76 ${g.top + 6} Z`"
        :fill="accent"
      />
      <circle cx="60" :cy="g.top + 1" r="2.8" fill="#fff" stroke="none" />
    </g>
    <g v-if="has('bow')" :fill="accent" :stroke="LINE" stroke-width="2">
      <ellipse cx="50" :cy="g.top - 2" rx="10" ry="6" :transform="`rotate(-20 50 ${g.top - 2})`" />
      <ellipse cx="70" :cy="g.top - 2" rx="10" ry="6" :transform="`rotate(20 70 ${g.top - 2})`" />
      <circle cx="60" :cy="g.top - 1" r="4.5" />
    </g>
    <g v-if="has('cherry')">
      <path
        :d="`M60 ${g.top - 4} Q62 ${g.top - 16} 70 ${g.top - 20}`"
        fill="none"
        stroke="#15803d"
        stroke-width="2.5"
        stroke-linecap="round"
      />
      <circle cx="60" :cy="g.top - 2" r="7" fill="#ef4444" :stroke="LINE" stroke-width="2" />
      <circle cx="57.5" :cy="g.top - 4.5" r="2" fill="#fff" opacity="0.8" />
    </g>
    <g v-if="has('cloud')">
      <g :fill="LINE">
        <circle cx="48" :cy="g.top - 6" r="10.5" />
        <circle cx="60" :cy="g.top - 12" r="12.5" />
        <circle cx="72" :cy="g.top - 6" r="10.5" />
      </g>
      <g fill="#f8fafc">
        <circle cx="48" :cy="g.top - 6" r="9" />
        <circle cx="60" :cy="g.top - 12" r="11" />
        <circle cx="72" :cy="g.top - 6" r="9" />
      </g>
    </g>
    <g v-if="has('snowflake')" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round">
      <line
        v-for="a in [0, 60, 120]"
        :key="a"
        :x1="60 - 9 * Math.cos((a * Math.PI) / 180)"
        :y1="g.top - 12 - 9 * Math.sin((a * Math.PI) / 180)"
        :x2="60 + 9 * Math.cos((a * Math.PI) / 180)"
        :y2="g.top - 12 + 9 * Math.sin((a * Math.PI) / 180)"
      />
    </g>
    <path
      v-if="has('crescent')"
      :d="`M44 ${g.top - 20} A10 10 0 1 0 53 ${g.top - 6} A8 8 0 1 1 44 ${g.top - 20} Z`"
      :fill="accent"
      :stroke="LINE"
      stroke-width="1.5"
    />
    <ellipse
      v-if="has('halo')"
      cx="60"
      :cy="g.top - 18"
      rx="15"
      ry="4.5"
      fill="none"
      :stroke="accent"
      stroke-width="3.5"
      class="glow"
    />
    <path
      v-if="has('star')"
      :d="starPath(60, g.face - 16, 8)"
      :fill="accent"
      :stroke="LINE"
      stroke-width="1.5"
    />

    <!-- 脖子、表情配件 -->
    <g v-if="has('scarf')" :fill="accent">
      <path
        :d="`M${60 - g.rx + 6} ${g.face + 20} Q60 ${g.face + 28} ${60 + g.rx - 6} ${g.face + 20}`"
        fill="none"
        :stroke="accent"
        stroke-width="7"
        stroke-linecap="round"
      />
      <path :d="`M70 ${g.face + 24} l4 14 l7 -2 l-3 -13 Z`" />
    </g>
    <g v-if="has('brows')" stroke="#1f2937" stroke-width="3" stroke-linecap="round">
      <path :d="`M42 ${g.face - 11} L54 ${g.face - 7}`" />
      <path :d="`M78 ${g.face - 11} L66 ${g.face - 7}`" />
    </g>
  </g>
</template>

<script setup lang="ts">
import type { CreatureLook, CreaturePart } from '../../domain/species';
import { type Geometry, LINE, starPath } from './geometry';

const props = defineProps<{ look: CreatureLook; g: Geometry; accent: string }>();
const has = (p: CreaturePart) => props.look.parts.includes(p);

/** 巧克力豆的位置：[x, 相對身體中心的 y 或 'top'] */
const SPOTS: [number, number | 'top'][] = [
  [40, 4],
  [82, -2],
  [46, 18],
  [78, 16],
  [62, 24],
  [58, 'top'],
];
</script>

<style scoped>
.flicker {
  animation: flicker 0.6s ease-in-out infinite alternate;
  transform-origin: 60px 40px;
}
.glow {
  animation: glow 1.4s ease-in-out infinite alternate;
}
@keyframes flicker {
  to {
    transform: scaleY(1.12) skewX(3deg);
  }
}
@keyframes glow {
  to {
    opacity: 0.4;
  }
}
</style>
