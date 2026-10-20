<template>
  <!-- 攻擊特效：依屬性飛出粒子，打中時爆開；key 換了就重播 -->
  <div
    v-if="shot"
    :key="shot.id"
    class="attack-fx"
    :class="[`fx--${shot.element}`, `from-${shot.from}`, { 'fx--big': shot.big }]"
    :style="{ '--scale': shot.scale, '--delay': `${shot.delay}ms` }"
  >
    <div v-if="shot.big" class="flash" />
    <template v-if="shot.element !== 'normal'">
      <span
        v-for="i in shot.big ? 6 : 3"
        :key="i"
        class="bolt"
        :style="{
          '--i': i - 1,
          '--jx': `${JITTER[i - 1]![0]}px`,
          '--jy': `${JITTER[i - 1]![1]}px`,
        }"
      />
    </template>
    <div class="impact">
      <span class="ring" />
      <span v-for="a in 6" :key="a" class="spark" :style="{ '--a': `${a * 60}deg` }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AttackShot } from './attackShot';

defineProps<{ shot: AttackShot | null }>();

/** 每顆粒子的偏移，讓它們不要疊在一起 */
const JITTER: [number, number][] = [
  [0, 0],
  [-14, 10],
  [12, -12],
  [-8, -16],
  [16, 8],
  [4, 18],
];
</script>

<style scoped lang="scss">
/* 字靈中心的位置：我方在左下、對手在右上（BattlePanel 的 .side，字靈圖 120px） */
.attack-fx {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  --c: #fff;
}
.from-partner {
  --sx: 72px;
  --sy: calc(100% - 68px);
  --ex: calc(100% - 72px);
  --ey: 72px;
}
.from-enemy {
  --sx: calc(100% - 72px);
  --sy: 72px;
  --ex: 72px;
  --ey: calc(100% - 68px);
}

.fx--fire {
  --c: #f97316;
}
.fx--water {
  --c: #38bdf8;
}
.fx--grass {
  --c: #22c55e;
}
.fx--thunder {
  --c: #facc15;
}
.fx--earth {
  --c: #a16207;
}
.fx--light {
  --c: #f9a8d4;
}

.bolt {
  position: absolute;
  width: calc(20px * var(--scale));
  height: calc(20px * var(--scale));
  margin: calc(-10px * var(--scale)) 0 0 calc(-10px * var(--scale));
  opacity: 0;
  animation:
    travel 0.26s ease-in calc(var(--delay) + var(--i) * 40ms) forwards,
    spin 0.26s linear calc(var(--delay) + var(--i) * 40ms);
}
.fx--fire .bolt {
  border-radius: 50%;
  background: radial-gradient(circle, #fef08a 0 25%, #f97316 55%, rgba(249, 115, 22, 0) 72%);
}
.fx--water .bolt {
  border-radius: 50%;
  border: 2px solid #e0f2fe;
  background: radial-gradient(circle at 35% 35%, #fff 0 12%, rgba(56, 189, 248, 0.7) 30%);
}
.fx--grass .bolt {
  border-radius: 0 100%;
  background: linear-gradient(135deg, #86efac, #16a34a);
}
.fx--thunder .bolt {
  background: #facc15;
  clip-path: polygon(40% 0, 100% 0, 60% 42%, 90% 42%, 20% 100%, 38% 55%, 8% 55%);
  filter: drop-shadow(0 0 4px #fde047);
}
.fx--earth .bolt {
  background: linear-gradient(135deg, #d6a35c, #78350f);
  clip-path: polygon(20% 0, 80% 10%, 100% 60%, 70% 100%, 10% 85%, 0 35%);
}
.fx--light .bolt {
  background: linear-gradient(135deg, #fff, #f472b6);
  clip-path: polygon(
    50% 0,
    61% 35%,
    98% 35%,
    68% 57%,
    79% 91%,
    50% 70%,
    21% 91%,
    32% 57%,
    2% 35%,
    39% 35%
  );
}

.impact {
  position: absolute;
  left: var(--ex);
  top: var(--ey);
}
.ring {
  position: absolute;
  width: calc(70px * var(--scale));
  height: calc(70px * var(--scale));
  margin: calc(-35px * var(--scale)) 0 0 calc(-35px * var(--scale));
  border: 4px solid var(--c);
  border-radius: 50%;
  opacity: 0;
  animation: ring 0.45s ease-out calc(var(--delay) + 0.25s) forwards;
}
.fx--normal .ring {
  border-color: #fff;
}
.spark {
  position: absolute;
  width: 8px;
  height: 8px;
  margin: -4px 0 0 -4px;
  border-radius: 50%;
  background: var(--c);
  box-shadow: 0 0 4px #fff;
  opacity: 0;
  animation: spark 0.5s ease-out calc(var(--delay) + 0.25s) forwards;
}
.flash {
  position: absolute;
  inset: 0;
  background: var(--c);
  opacity: 0;
  animation: flash 0.6s ease-out calc(var(--delay) + 0.2s);
}

@keyframes travel {
  0% {
    left: calc(var(--sx) + var(--jx));
    top: calc(var(--sy) + var(--jy));
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    left: calc(var(--ex) + var(--jx));
    top: calc(var(--ey) + var(--jy));
    opacity: 0;
  }
}
@keyframes spin {
  to {
    transform: rotate(540deg);
  }
}
@keyframes ring {
  0% {
    transform: scale(0.2);
    opacity: 1;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}
@keyframes spark {
  0% {
    transform: rotate(var(--a)) translateY(0);
    opacity: 1;
  }
  100% {
    transform: rotate(var(--a)) translateY(calc(-44px * var(--scale)));
    opacity: 0;
  }
}
@keyframes flash {
  0%,
  100% {
    opacity: 0;
  }
  30% {
    opacity: 0.35;
  }
}

@media (prefers-reduced-motion: reduce) {
  .attack-fx {
    display: none;
  }
}
</style>
