<template>
  <GameShell :session="session" @quit="space.quit">
    <div class="row items-center no-wrap q-mb-sm">
      <LivesBar :lives="state.shields" :max="space.maxShields" icon="🛡️" />
      <q-space />
      <q-chip dense color="indigo" text-color="white">第 {{ space.wave.value }} 波</q-chip>
      <div class="text-subtitle1 text-weight-bold q-ml-sm">⭐ {{ state.score }}</div>
    </div>

    <div class="field" :class="{ damaged: state.damaged }">
      <div class="stars" />

      <div
        v-for="m in state.meteors"
        :key="m.id"
        class="meteor"
        :style="{ left: `${m.x}%`, top: `${m.y}%` }"
      >
        <span class="rock">☄️</span>
        <span class="label">{{ m.word.chinese }}</span>
      </div>

      <svg class="fx" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line v-for="e in lasers" :key="e.id" x1="50" y1="100" :x2="e.x" :y2="e.y" class="laser" />
      </svg>
      <div
        v-for="e in booms"
        :key="e.id"
        class="boom"
        :style="{ left: `${e.x}%`, top: `${Math.min(e.y, 92)}%` }"
      >
        💥
      </div>

      <div class="ship">🚀</div>
      <PauseOverlay v-if="space.loop.paused.value" @resume="space.loop.resume" />
    </div>

    <div class="options q-mt-sm">
      <q-btn
        v-for="(o, i) in state.options"
        :key="o.answer"
        no-caps
        unelevated
        size="lg"
        color="indigo-6"
        class="option"
        :disable="state.cooldown"
        @click="space.fire(o)"
      >
        <span class="option-key gt-xs">{{ i + 1 }}</span>
        {{ o.answer }}
      </q-btn>
    </div>
  </GameShell>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEventListener } from '@vueuse/core';
import { GameShell, LivesBar, PauseOverlay, useGameSession } from '../shared';
import { spaceInfo } from './info';
import { useSpace } from './useSpace';

const session = useGameSession(spaceInfo, (words) => space.start(words));
const space = useSpace(session);
const state = space.state;

const lasers = computed(() => state.effects.filter((e) => e.kind === 'laser'));
const booms = computed(() => state.effects.filter((e) => e.kind === 'boom'));

useEventListener(window, 'keydown', (e: KeyboardEvent) => {
  if (session.phase !== 'playing') return;
  const option = state.options[Number(e.key) - 1];
  if (option) space.fire(option);
});
</script>

<style scoped>
.field {
  position: relative;
  height: 52vh;
  min-height: 300px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(180deg, #0d1b4c 0%, #1a237e 60%, #283593 100%);
  border-bottom: 6px solid #43a047;
  user-select: none;
}
.field.damaged {
  animation: damaged 0.3s;
}
.stars {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1px 1px at 20% 30%, #fff, transparent),
    radial-gradient(1px 1px at 70% 20%, #fff, transparent),
    radial-gradient(1.5px 1.5px at 40% 70%, #fff, transparent),
    radial-gradient(1px 1px at 85% 60%, #fff, transparent),
    radial-gradient(1px 1px at 10% 80%, #fff, transparent),
    radial-gradient(1.5px 1.5px at 55% 45%, #fff, transparent);
  opacity: 0.7;
}
.meteor {
  position: absolute;
  transform: translate(-50%, -100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}
.rock {
  font-size: 2rem;
  transform: rotate(135deg);
}
.label {
  max-width: 7.5rem;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.92);
  color: #1a237e;
  font-weight: bold;
  font-size: 0.95rem;
  text-align: center;
  line-height: 1.2;
}
.fx {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.laser {
  stroke: #ffeb3b;
  stroke-width: 3;
  vector-effect: non-scaling-stroke;
  animation: fade 0.35s forwards;
}
.boom {
  position: absolute;
  font-size: 2.5rem;
  transform: translate(-50%, -80%);
  animation: fade 0.35s forwards;
  pointer-events: none;
}
.ship {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) rotate(-45deg);
  font-size: 2.2rem;
}
.options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
}
.option {
  min-height: 56px;
}
.option-key {
  position: absolute;
  top: 3px;
  left: 8px;
  font-size: 0.7rem;
  opacity: 0.6;
}
@keyframes fade {
  to {
    opacity: 0;
  }
}
@keyframes damaged {
  0%,
  100% {
    transform: none;
  }
  25% {
    transform: translate(-6px, 3px);
    filter: hue-rotate(120deg);
  }
  75% {
    transform: translate(6px, -3px);
  }
}
</style>
