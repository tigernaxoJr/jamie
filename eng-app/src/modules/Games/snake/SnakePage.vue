<template>
  <GameShell :session="session" @quit="snake.quit">
    <template #settings>
      <q-btn-toggle
        v-model="speed"
        rounded
        unelevated
        no-caps
        toggle-color="white"
        toggle-text-color="green-8"
        color="green-9"
        text-color="white"
        :options="speedOptions"
      />
    </template>

    <!-- HUD：愛心、題目、分數 -->
    <div class="hud app-card">
      <LivesBar :lives="state.lives" :max="3" class="hud__lives" />
      <div v-if="state.word" class="hud__word">
        <div class="hud__zh">{{ state.word.chinese }}</div>
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
      </div>
      <div class="hud__score">⭐ {{ state.score }}</div>
    </div>

    <!-- 棋盤：依剩餘空間自動縮放成正方形 -->
    <div class="board-wrap">
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
    </div>

    <!-- 觸控裝置的方向鍵（也可以直接在棋盤上滑動） -->
    <div class="dpad">
      <q-btn
        v-for="d in DPAD"
        :key="d.dir"
        round
        size="lg"
        color="green"
        :icon="d.icon"
        :aria-label="d.label"
        @click="snake.turn(d.dir)"
      />
    </div>
  </GameShell>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEventListener, useLocalStorage } from '@vueuse/core';
import { GameShell, LivesBar, PauseOverlay, lettersOf, useGameSession } from '../shared';
import { snakeInfo } from './info';
import {
  BOARD_SIZE,
  type Direction,
  type Point,
  SNAKE_SPEEDS,
  type SnakeSpeed,
  useSnake,
} from './useSnake';

const session = useGameSession(snakeInfo, (words) => snake.start(words));
const speed = useLocalStorage<SnakeSpeed>('snake-speed', 'normal');
const snake = useSnake(session, speed);
const speedOptions = (Object.keys(SNAKE_SPEEDS) as SnakeSpeed[]).map((value) => ({
  value,
  label: SNAKE_SPEEDS[value].label,
}));

const DPAD: { dir: Direction; icon: string; label: string }[] = [
  { dir: 'left', icon: 'arrow_back', label: '向左' },
  { dir: 'up', icon: 'arrow_upward', label: '向上' },
  { dir: 'down', icon: 'arrow_downward', label: '向下' },
  { dir: 'right', icon: 'arrow_forward', label: '向右' },
];
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
.hud {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 6px 12px;
  margin-bottom: 10px;
}
.hud__lives {
  font-size: 1.1rem;
}
.hud__word {
  flex: 1;
  min-width: 0;
  text-align: center;
  line-height: 1.2;
}
.hud__zh {
  font-weight: 900;
  font-size: 1.1rem;
}
.hud__score {
  font-weight: 900;
  white-space: nowrap;
}
.board-wrap {
  flex: 1;
  min-height: 0;
  container-type: size;
  display: flex;
  align-items: center;
  justify-content: center;
}
.board {
  --cell: calc(100% / 12);
  position: relative;
  width: min(100cqw, 100cqh);
  height: min(100cqw, 100cqh);
  background:
    linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px) 0 0 / var(--cell) var(--cell),
    linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px) 0 0 / var(--cell) var(--cell),
    #e8f5e9;
  border: 4px solid #43a047;
  border-radius: 16px;
  box-shadow: var(--app-shadow);
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
  font-size: clamp(0.9rem, 4cqmin, 1.6rem);
  color: #12335e;
  background: #fff;
  border-radius: 50%;
  transform: scale(0.85);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.spelling {
  font-family: monospace;
  font-size: 1.7rem;
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
  display: none;
  flex-shrink: 0;
  justify-content: center;
  gap: 14px;
  padding-top: 10px;
}
/* 只有觸控裝置需要方向鍵 */
@media (pointer: coarse) {
  .dpad {
    display: flex;
  }
}
</style>
