<template>
  <!-- 位置以地面中央為原點；動畫由 stage 決定，時間軸在 CapturePanel -->
  <div class="net" :class="`net--${stage}`" :style="colors">
    <div class="net__x">
      <div class="net__y">
        <!-- 張開的網：罩住字靈 -->
        <svg v-if="stage === 'wrap'" class="net__open" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" class="open-fill" />
          <circle v-for="r in [16, 31, 46]" :key="r" cx="50" cy="50" :r="r" class="open-line" />
          <path d="M50 4 V96 M4 50 H96 M17 17 L83 83 M83 17 L17 83" class="open-line" />
        </svg>

        <!-- 收起來的網球；key 換了會重播搖晃動畫 -->
        <svg :key="shakeKey" class="net__ball" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" class="ball-fill" />
          <ellipse cx="50" cy="50" rx="22" ry="45" class="ball-line" />
          <path d="M5 50 H95 M14 28 Q50 40 86 28 M14 72 Q50 60 86 72" class="ball-line" />
          <ellipse cx="34" cy="26" rx="12" ry="7" fill="#fff" opacity="0.55" />
          <circle cx="50" cy="50" r="13" fill="#fff" class="ball-line" />
          <circle
            cx="50"
            cy="50"
            r="6"
            :fill="stage === 'caught' ? '#22c55e' : 'var(--net-line)'"
          />
        </svg>
      </div>
    </div>

    <!-- 抓到：星星往外噴 -->
    <div v-if="stage === 'caught'" class="net__stars">
      <span v-for="n in 8" :key="n" :style="{ '--a': `${n * 45}deg` }">★</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { NetStage, NetTier } from '../../domain/rules';

const props = defineProps<{ tier: NetTier; stage: NetStage; shakeKey: number }>();

/** 白網、藍網、金網 */
const NET_COLORS: Record<NetTier, { main: string; line: string }> = {
  basic: { main: '#f8fafc', line: '#64748b' },
  great: { main: '#60a5fa', line: '#1e3a8a' },
  ultra: { main: '#fbbf24', line: '#92400e' },
};

const colors = computed(() => ({
  '--net-main': NET_COLORS[props.tier].main,
  '--net-line': NET_COLORS[props.tier].line,
}));
</script>

<style scoped lang="scss">
/* 字靈中心離地面的高度（字靈圖是 min(150px, 22vh)） */
$lift: calc(min(150px, 22vh) / 2 - 24px);
$ball: 48px;

.net {
  position: absolute;
  left: 50%;
  bottom: 28px;
  width: 0;
  height: 0;
  pointer-events: none;
}
.net__x {
  position: absolute;
  left: calc($ball / -2);
  bottom: 0;
}
.net__y {
  position: relative;
  width: $ball;
  height: $ball;
}
.net__ball {
  width: $ball;
  height: $ball;
  transform-origin: 50% 100%;
  filter: drop-shadow(0 3px 2px rgba(0, 0, 0, 0.25));
}
.ball-fill {
  fill: var(--net-main);
  stroke: var(--net-line);
  stroke-width: 4;
}
.ball-line {
  fill: none;
  stroke: var(--net-line);
  stroke-width: 3.5;
}
circle.ball-line {
  fill: #fff;
}
.net__open {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 150px;
  height: 150px;
  margin: -75px 0 0 -75px;
  animation: net-open 0.8s ease-in-out forwards;
}
.open-fill {
  fill: var(--net-main);
  opacity: 0.3;
}
.open-line {
  fill: none;
  stroke: var(--net-line);
  stroke-width: 2.5;
}

/* 還沒丟：在左下角輕輕跳 */
.net--idle {
  .net__x {
    transform: translateX(-150px);
  }
  .net__y {
    animation: bob 1.1s ease-in-out infinite;
  }
}
/* 丟出去：x 等速、y 先上後下，合起來是弧線 */
.net--fly {
  .net__x {
    animation: fly-x 0.7s linear forwards;
  }
  .net__y {
    animation: fly-y 0.7s forwards;
  }
  .net__ball {
    animation: spin 0.7s linear;
  }
}
/* 罩住：停在字靈中心，網張開時球先藏起來 */
.net--wrap {
  .net__y {
    transform: translateY(calc(-1 * $lift));
  }
  .net__ball {
    animation: ball-hide 0.8s forwards;
  }
}
.net--drop .net__y {
  animation: drop 0.45s ease-in forwards;
}
.net--shake .net__ball {
  animation: wobble 0.6s ease-in-out;
}
.net--caught .net__ball {
  animation: glow 1.2s ease-out forwards;
}
.net--broke .net__ball {
  animation: burst 0.35s ease-out forwards;
}

.net__stars span {
  position: absolute;
  left: -8px;
  bottom: 16px;
  font-size: 18px;
  color: #fde047;
  text-shadow: 0 0 4px #f59e0b;
  animation: star 0.9s ease-out forwards;
}

@keyframes bob {
  0%,
  100% {
    transform: translateY(20px);
  }
  50% {
    transform: translateY(8px) rotate(-8deg);
  }
}
@keyframes fly-x {
  from {
    transform: translateX(-150px);
  }
  to {
    transform: translateX(0);
  }
}
@keyframes fly-y {
  0% {
    transform: translateY(20px);
    animation-timing-function: ease-out;
  }
  50% {
    transform: translateY(-160px);
    animation-timing-function: ease-in;
  }
  100% {
    transform: translateY(calc(-1 * $lift));
  }
}
@keyframes spin {
  to {
    transform: rotate(720deg);
  }
}
@keyframes net-open {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  40% {
    transform: scale(1.15);
    opacity: 1;
  }
  100% {
    transform: scale(0.3);
    opacity: 0.4;
  }
}
@keyframes ball-hide {
  0%,
  75% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes drop {
  0% {
    transform: translateY(calc(-1 * $lift));
  }
  70% {
    transform: translateY(0);
  }
  85% {
    transform: translateY(-8px);
  }
  100% {
    transform: translateY(0);
  }
}
@keyframes wobble {
  0%,
  100% {
    transform: rotate(0);
  }
  25% {
    transform: rotate(-22deg);
  }
  75% {
    transform: rotate(22deg);
  }
}
@keyframes glow {
  0% {
    filter: drop-shadow(0 0 0 #fde047);
  }
  30% {
    filter: drop-shadow(0 0 14px #fde047);
    transform: scale(1.15);
  }
  100% {
    filter: drop-shadow(0 0 6px #fde047);
    transform: scale(1);
  }
}
@keyframes burst {
  to {
    transform: scale(1.6);
    opacity: 0;
  }
}
@keyframes star {
  from {
    transform: rotate(var(--a)) translateY(0) scale(0.4);
    opacity: 1;
  }
  to {
    transform: rotate(var(--a)) translateY(-70px) scale(1);
    opacity: 0;
  }
}
</style>
