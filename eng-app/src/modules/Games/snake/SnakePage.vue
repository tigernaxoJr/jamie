<template>
  <GameShell :session="session" @quit="snake.quit">
    <div class="row items-center no-wrap q-mb-sm">
      <LivesBar :lives="state.lives" :max="3" />
      <q-space />
      <div class="text-subtitle1 text-weight-bold">⭐ {{ state.score }}</div>
    </div>

    <!-- 題目：中文 + 已拼出的字母 -->
    <q-card v-if="state.word" class="soft-shadow q-pa-sm text-center q-mb-sm">
      <div class="text-h6 text-weight-bold">{{ state.word.chinese }}</div>
      <div class="spelling">
        <span
          v-for="(ch, i) in letters"
          :key="i"
          class="slot"
          :class="{ done: i < state.progress, next: i === state.progress }"
        >
          {{ i < state.progress ? ch : '_' }}
        </span>
      </div>
    </q-card>

    <div
      class="board"
      :class="{ flash: state.flash }"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
    >
      <div
        v-for="l in state.letters"
        :key="`${l.x}-${l.y}`"
        class="cell letter"
        :style="cellStyle(l)"
      >
        {{ l.ch }}
      </div>
      <div
        v-for="(s, i) in state.snake"
        :key="i"
        class="cell"
        :class="i === 0 ? 'head' : 'body'"
        :style="cellStyle(s)"
      >
        <template v-if="i === 0">👀</template>
      </div>
      <PauseOverlay v-if="snake.loop.paused.value" @resume="snake.loop.resume" />
    </div>

    <!-- 手機方向鍵 -->
    <div class="dpad q-mt-md">
      <q-btn
        class="up"
        round
        size="lg"
        color="green"
        icon="keyboard_arrow_up"
        @click="snake.turn('up')"
      />
      <q-btn
        class="left"
        round
        size="lg"
        color="green"
        icon="keyboard_arrow_left"
        @click="snake.turn('left')"
      />
      <q-btn
        class="right"
        round
        size="lg"
        color="green"
        icon="keyboard_arrow_right"
        @click="snake.turn('right')"
      />
      <q-btn
        class="down"
        round
        size="lg"
        color="green"
        icon="keyboard_arrow_down"
        @click="snake.turn('down')"
      />
    </div>
  </GameShell>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEventListener } from '@vueuse/core';
import { GameShell, LivesBar, PauseOverlay, lettersOf, useGameSession } from '../shared';
import { snakeInfo } from './info';
import { BOARD_SIZE, type Direction, type Point, useSnake } from './useSnake';

const session = useGameSession(snakeInfo, (words) => snake.start(words));
const snake = useSnake(session);
const state = snake.state;

const letters = computed(() => (state.word ? [...lettersOf(state.word.answer)] : []));

const cellStyle = (p: Point) => ({
  left: `${(p.x * 100) / BOARD_SIZE}%`,
  top: `${(p.y * 100) / BOARD_SIZE}%`,
});

const KEYS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
};

useEventListener(window, 'keydown', (e: KeyboardEvent) => {
  if (session.phase !== 'playing') return;
  const dir = KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
  if (!dir) return;
  e.preventDefault();
  snake.turn(dir);
});

// 手機滑動控制
let touchStart: Point | null = null;
const onPointerDown = (e: PointerEvent) => {
  touchStart = { x: e.clientX, y: e.clientY };
};
const onPointerUp = (e: PointerEvent) => {
  if (!touchStart) return;
  const dx = e.clientX - touchStart.x;
  const dy = e.clientY - touchStart.y;
  touchStart = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
  if (Math.abs(dx) > Math.abs(dy)) snake.turn(dx > 0 ? 'right' : 'left');
  else snake.turn(dy > 0 ? 'down' : 'up');
};
</script>

<style scoped>
.board {
  --cell: calc(100% / 12);
  position: relative;
  width: min(100%, 58vh);
  aspect-ratio: 1;
  margin: 0 auto;
  background:
    linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px) 0 0 / var(--cell) var(--cell),
    linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px) 0 0 / var(--cell) var(--cell),
    #e8f5e9;
  border: 4px solid #43a047;
  border-radius: 12px;
  overflow: hidden;
  touch-action: none;
  user-select: none;
}
.board.flash {
  border-color: #e53935;
  background-color: #ffebee;
}
.cell {
  position: absolute;
  width: var(--cell);
  height: var(--cell);
  display: flex;
  align-items: center;
  justify-content: center;
}
.body {
  background: #66bb6a;
  border-radius: 25%;
  transform: scale(0.9);
}
.head {
  background: #2e7d32;
  border-radius: 35%;
  font-size: 0.8em;
  z-index: 1;
}
.letter {
  font-weight: 900;
  font-size: clamp(0.9rem, 3.5vw, 1.4rem);
  color: #1a237e;
  background: #fff;
  border-radius: 50%;
  transform: scale(0.85);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.spelling {
  font-family: monospace;
  font-size: 1.8rem;
  letter-spacing: 4px;
}
.slot.done {
  color: #2e7d32;
  font-weight: bold;
}
.slot.next {
  color: #ff6f00;
}
.dpad {
  display: grid;
  grid-template-areas:
    '. up .'
    'left . right'
    '. down .';
  justify-content: center;
  gap: 4px 24px;
}
.up {
  grid-area: up;
}
.down {
  grid-area: down;
}
.left {
  grid-area: left;
}
.right {
  grid-area: right;
}
</style>
