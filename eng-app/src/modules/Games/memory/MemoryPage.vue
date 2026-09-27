<template>
  <GameShell :session="session" @quit="memory.quit">
    <div class="row items-center no-wrap q-mb-sm q-gutter-x-sm">
      <q-chip dense color="teal" text-color="white"
        >第 {{ state.round + 1 }} / {{ ROUNDS.length }} 關</q-chip
      >
      <div class="text-caption text-grey-8">
        ⏱ {{ Math.floor(state.seconds) }} 秒 · 翻錯 {{ state.misses }} 次
      </div>
      <q-space />
      <div class="text-subtitle1 text-weight-bold">⭐ {{ state.score }}</div>
    </div>

    <div class="board relative-position">
      <button
        v-for="c in state.cards"
        :key="`${state.round}-${c.id}`"
        type="button"
        class="card"
        :class="{ open: c.flipped || c.matched, matched: c.matched }"
        :aria-label="c.flipped || c.matched ? c.word.answer : '蓋著的牌'"
        @click="memory.flip(c)"
      >
        <span class="inner">
          <span class="back">❓</span>
          <span class="front" :class="c.face">
            {{ c.face === 'en' ? c.word.answer : c.word.chinese }}
          </span>
        </span>
      </button>

      <div v-if="state.roundCleared" class="cleared absolute-full flex flex-center">
        <div class="text-h4 text-weight-bold">🎉 第 {{ state.round + 1 }} 關完成！</div>
      </div>
      <PauseOverlay v-if="memory.loop.paused.value" @resume="memory.loop.resume" />
    </div>
  </GameShell>
</template>

<script setup lang="ts">
import { GameShell, PauseOverlay, useGameSession } from '../shared';
import { memoryInfo } from './info';
import { ROUNDS, useMemory } from './useMemory';

const session = useGameSession(memoryInfo, (words) => memory.start(words));
const memory = useMemory(session);
const state = memory.state;
</script>

<style scoped>
.board {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(4, 1fr);
}
.card {
  aspect-ratio: 3 / 4;
  max-height: 20vh;
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  perspective: 600px;
  cursor: pointer;
}
.inner {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  transition: transform 0.35s;
  transform-style: preserve-3d;
}
.card.open .inner {
  transform: rotateY(180deg);
}
.back,
.front {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  backface-visibility: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}
.back {
  background: linear-gradient(135deg, #26a69a, #00796b);
  font-size: 1.8rem;
}
.front {
  transform: rotateY(180deg);
  background: #fff;
  padding: 4px;
  text-align: center;
  font-weight: bold;
  line-height: 1.2;
  word-break: break-word;
}
.front.en {
  color: #1565c0;
  font-size: clamp(0.9rem, 3.5vw, 1.3rem);
}
.front.zh {
  color: #4e342e;
  font-size: clamp(0.8rem, 3vw, 1.1rem);
}
.card.matched .front {
  background: #c8e6c9;
  animation: pulse 0.4s;
}
.cleared {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 12px;
  z-index: 5;
}
@keyframes pulse {
  50% {
    transform: rotateY(180deg) scale(1.08);
  }
}
</style>
