<template>
  <GameShell :session="session" @quit="memory.quit">
    <!-- 標題畫面：選關卡 -->
    <template #settings>
      <StagePicker v-model="memory.mode.value" :stages="MEMORY_STAGES" :stars="memory.stars.value">
        <div class="stage-tags q-mt-sm">
          <template v-if="picked">
            <span>🃏 {{ picked.pairs }} 對牌</span>
            <span>👀 先偷看 {{ picked.peek }} 秒</span>
            <span v-if="picked.kinds.some((k) => k.includes('sound'))">🔊 有聲音牌</span>
            <span v-if="picked.timeLimit">⏰ 限時 {{ picked.timeLimit }} 秒</span>
            <span v-if="picked.shuffleEvery">🌪️ 翻錯 {{ picked.shuffleEvery }} 次會洗牌</span>
          </template>
          <span v-else>♾️ 一輪一輪越來越難，時間到就結束</span>
        </div>
      </StagePicker>
    </template>

    <div class="row items-center no-wrap q-mb-sm q-gutter-x-sm">
      <q-chip dense color="teal" text-color="white">
        {{ state.board.emoji }} {{ state.board.name }}
      </q-chip>
      <div class="text-caption text-grey-8">翻錯 {{ state.misses }} 次</div>
      <q-space />
      <q-btn
        v-if="state.flashlights > 0"
        dense
        unelevated
        no-caps
        color="amber-2"
        text-color="brown-9"
        label="🔦 手電筒"
        :disable="state.busy || state.roundCleared"
        @click="memory.flashlight"
      />
      <div class="text-subtitle1 text-weight-bold">⭐ {{ Math.round(state.score) }}</div>
    </div>

    <div v-if="memory.timeLeft.value !== undefined" class="timer q-mb-sm">
      <q-linear-progress
        :value="memory.timeLeft.value / (state.board.timeLimit ?? 1)"
        :color="memory.timeLeft.value < 10 ? 'negative' : 'teal'"
        size="10px"
        rounded
      />
      <span :class="{ 'text-negative text-weight-bold': memory.timeLeft.value < 10 }">
        ⏱ {{ Math.ceil(memory.timeLeft.value) }}
      </span>
    </div>

    <div class="board-wrap relative-position">
      <TransitionGroup
        tag="div"
        name="shuffle"
        class="board"
        :class="{ windy: state.windy }"
        :style="{ '--rows': state.cards.length / 4 }"
      >
        <button
          v-for="c in state.cards"
          :key="c.id"
          type="button"
          class="card"
          :class="{ open: c.flipped || c.matched, matched: c.matched }"
          :aria-label="c.flipped || c.matched ? faceLabel(c) : '蓋著的牌'"
          @click="memory.flip(c)"
        >
          <span class="inner">
            <span class="back">❓</span>
            <span class="front" :class="c.face">
              <template v-if="c.face === 'sound'">
                <span class="sound-icon">🔊</span>
                <small v-if="c.matched">{{ c.word.answer }}</small>
              </template>
              <template v-else>{{ c.face === 'en' ? c.word.answer : c.word.chinese }}</template>
            </span>
          </span>
        </button>
      </TransitionGroup>

      <div v-if="state.peeking" class="banner">👀 記住牌的位置！</div>
      <div v-else-if="state.windy" class="banner">🌪️ 旋風把牌吹亂了！</div>
      <div v-if="state.roundCleared" class="cleared absolute-full flex flex-center">
        <div class="text-h4 text-weight-bold">🎉 {{ state.board.name }}完成！</div>
      </div>
      <PauseOverlay v-if="memory.loop.paused.value" @resume="memory.loop.resume" />
    </div>

    <template #result-actions>
      <q-btn
        v-if="nextStage"
        class="btn-3d"
        color="primary"
        size="lg"
        icon="skip_next"
        :label="`下一關：${nextStage.emoji} ${nextStage.name}`"
        @click="playNext"
      />
    </template>
  </GameShell>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  GameShell,
  PauseOverlay,
  StagePicker,
  firstOpenStage,
  nextStageIndex,
  useGameSession,
} from '../shared';
import { memoryInfo } from './info';
import { MEMORY_STAGES } from './stages';
import { type Card, useMemory } from './useMemory';

const session = useGameSession(memoryInfo, (words) => memory.start(words));
const memory = useMemory(session);
const state = memory.state;

// 預設選還沒拿到星星的第一關
memory.mode.value = {
  kind: 'stage',
  index: firstOpenStage(MEMORY_STAGES.length, memory.stars.value),
};

/** 標題畫面選到的關卡 */
const picked = computed(() => {
  const m = memory.mode.value;
  return m.kind === 'stage' ? MEMORY_STAGES[m.index] : undefined;
});

const faceLabel = (c: Card) =>
  c.face === 'sound' ? `聲音牌 ${c.word.answer}` : c.face === 'en' ? c.word.answer : c.word.chinese;

/** 過關後可以挑戰的下一關 */
const nextIndex = computed(() =>
  nextStageIndex(memory.mode.value, !!session.result?.won, MEMORY_STAGES.length),
);
const nextStage = computed(() =>
  nextIndex.value === null ? null : MEMORY_STAGES[nextIndex.value],
);

const playNext = () => {
  if (nextIndex.value === null) return;
  memory.mode.value = { kind: 'stage', index: nextIndex.value };
  session.start();
};
</script>

<style scoped>
.stage-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 800;
}
.stage-tags span {
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.2);
}
.timer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
}
.timer .q-linear-progress {
  flex: 1;
}
.board-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.board {
  /* 卡片高度依剩餘空間平均分配，一次看到整個牌桌 */
  flex: 1;
  min-height: 0;
  width: 100%;
  max-width: 560px;
  margin: auto;
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(var(--rows), minmax(0, 1fr));
  /* 卡片少的時候不要被拉得太長 */
  max-height: calc(var(--rows) * 170px);
}
.shuffle-move {
  transition: transform 0.6s ease-in-out;
}
.board.windy .card:not(.matched) {
  animation: wobble 0.6s;
}
.card {
  width: 100%;
  height: 100%;
  min-height: 0;
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
  flex-direction: column;
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
.front.sound {
  background: #fff8e1;
  color: #8d6e63;
}
.sound-icon {
  font-size: clamp(1.4rem, 5vw, 2rem);
}
.card.matched .front {
  background: #c8e6c9;
  animation: pulse 0.4s;
}
.banner {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 4;
  transform: translate(-50%, -50%);
  padding: 8px 18px;
  border-radius: 999px;
  background: rgba(0, 77, 64, 0.85);
  color: #fff;
  font-size: 1.2rem;
  font-weight: 900;
  white-space: nowrap;
  pointer-events: none;
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
@keyframes wobble {
  25% {
    transform: rotate(-6deg);
  }
  75% {
    transform: rotate(6deg);
  }
}
</style>
