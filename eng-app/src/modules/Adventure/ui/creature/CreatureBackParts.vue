<template>
  <!-- 畫在身體後面的部件：只露出身體外的部分 -->
  <g>
    <g v-if="has('rainbow')" fill="none" stroke-width="6">
      <path
        v-for="(c, i) in RAINBOW"
        :key="c"
        :d="`M${60 - (50 - i * 6)} ${g.cy} A${50 - i * 6} ${50 - i * 6} 0 0 1 ${60 + (50 - i * 6)} ${g.cy}`"
        :stroke="c"
      />
    </g>
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
    <path
      v-if="has('cape')"
      :d="`M${60 - g.rx + 6} ${g.cy - 16} L${60 - g.rx - 10} 104 Q60 112 ${60 + g.rx + 10} 104 L${60 + g.rx - 6} ${g.cy - 16} Z`"
      :fill="accent"
      :stroke="LINE"
      stroke-width="2"
    />
    <g v-if="has('spikes')" :fill="accent" :stroke="LINE" stroke-width="2">
      <path
        v-for="(s, i) in SPIKES"
        :key="i"
        :d="`M${s.x - 7} ${g.top + 12} L${s.x} ${g.top + s.tip} L${s.x + 7} ${g.top + 12} Z`"
      />
    </g>
    <g v-if="has('wings')" :fill="accent" :stroke="LINE" stroke-width="2">
      <ellipse cx="24" :cy="g.cy" rx="14" ry="8" :transform="`rotate(-30 24 ${g.cy})`" />
      <ellipse cx="96" :cy="g.cy" rx="14" ry="8" :transform="`rotate(30 96 ${g.cy})`" />
    </g>
    <g v-if="has('fins')" :fill="accent" :stroke="LINE" stroke-width="2">
      <path :d="`M30 ${g.cy + 6} L12 ${g.cy - 4} L16 ${g.cy + 16} Z`" />
      <path :d="`M90 ${g.cy + 6} L108 ${g.cy - 4} L104 ${g.cy + 16} Z`" />
    </g>
    <g v-if="has('ears')" :stroke="LINE" stroke-width="2">
      <circle cx="38" :cy="g.top + 8" r="10" :fill="look.color" />
      <circle cx="82" :cy="g.top + 8" r="10" :fill="look.color" />
      <circle cx="38" :cy="g.top + 8" r="5" :fill="look.belly" stroke="none" />
      <circle cx="82" :cy="g.top + 8" r="5" :fill="look.belly" stroke="none" />
    </g>
    <g v-if="has('patches')" :fill="accent" :stroke="LINE" stroke-width="2">
      <circle cx="38" :cy="g.top + 8" r="10" />
      <circle cx="82" :cy="g.top + 8" r="10" />
    </g>
    <g v-if="has('leafEars')" fill="#4ade80" :stroke="LINE" stroke-width="2">
      <ellipse cx="46" :cy="g.top - 6" rx="7" ry="18" :transform="`rotate(-18 46 ${g.top - 6})`" />
      <ellipse cx="74" :cy="g.top - 6" rx="7" ry="18" :transform="`rotate(18 74 ${g.top - 6})`" />
    </g>
    <g v-if="has('shell')" :stroke="LINE" stroke-width="2">
      <circle cx="88" :cy="g.cy - 4" r="20" :fill="accent" />
      <path
        :d="`M88 ${g.cy - 4} m-10 0 a10 10 0 1 1 10 10 a6 6 0 1 1 -6 -6`"
        fill="none"
        stroke-width="2.5"
      />
    </g>
    <g v-if="has('tail')" fill="none" stroke-linecap="round">
      <path :d="tailPath" :stroke="LINE" stroke-width="9" />
      <path :d="tailPath" :stroke="look.color" stroke-width="6" />
    </g>
    <path
      v-if="has('handle')"
      :d="`M${60 + g.rx - 3} ${g.cy - 14} C${60 + g.rx + 18} ${g.cy - 16} ${60 + g.rx + 18} ${g.cy + 14} ${60 + g.rx - 3} ${g.cy + 12}`"
      fill="none"
      :stroke="accent"
      stroke-width="7"
      stroke-linecap="round"
    />
    <g v-if="has('bulb')">
      <path
        :d="`M88 ${g.cy + 12} Q104 ${g.cy + 8} 104 ${g.cy - 12}`"
        fill="none"
        :stroke="LINE"
        stroke-width="3"
      />
      <circle cx="104" :cy="g.cy - 20" r="12" fill="#fef08a" opacity="0.45" class="glow" />
      <circle cx="104" :cy="g.cy - 20" r="7" fill="#fde047" :stroke="LINE" stroke-width="2" />
    </g>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CreatureLook, CreaturePart } from '../../domain/species';
import { type Geometry, LINE } from './geometry';

const props = defineProps<{ look: CreatureLook; g: Geometry; accent: string }>();
const has = (p: CreaturePart) => props.look.parts.includes(p);

const RAINBOW = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'];
/** 背上尖刺的位置與高度（相對頭頂） */
const SPIKES = [
  { x: 38, tip: -4 },
  { x: 52, tip: -12 },
  { x: 68, tip: -12 },
  { x: 82, tip: -4 },
];

const tailPath = computed(() => {
  const { rx, cy } = props.g;
  const x = 60 + rx;
  return `M${x - 6} ${cy + 16} C${x + 14} ${cy + 18} ${x + 18} ${cy - 4} ${x + 8} ${cy - 12}`;
});
</script>

<style scoped>
.glow {
  animation: glow 1.4s ease-in-out infinite alternate;
}
@keyframes glow {
  to {
    opacity: 0.15;
  }
}
</style>
