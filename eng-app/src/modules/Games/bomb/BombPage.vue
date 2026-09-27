<template>
  <GameShell :session="session" @quit="bomb.quit">
    <!-- 標題畫面：選房間、介紹這間會出現的炸彈 -->
    <template #settings>
      <StagePicker v-model="bomb.mode.value" :stages="ROOMS" :stars="bomb.stars.value">
        <div v-if="room" class="room-info q-mt-sm">
          <div class="text-weight-bold">
            🚪 拆除 {{ room.bombs }} 顆炸彈就能逃出去 · 🔍 放大鏡 {{ room.magnifiers }} 個
          </div>
          <div class="bomb-types q-mt-xs">
            <span v-for="t in room.types" :key="t">
              {{ BOMB_TYPES[t].icon }} {{ BOMB_TYPES[t].name }}：{{ BOMB_TYPES[t].desc }}
            </span>
          </div>
        </div>
      </StagePicker>
    </template>

    <div class="row items-center no-wrap q-mb-sm">
      <LivesBar :lives="state.lives" :max="state.maxLives" icon="🛡️" />
      <q-space />
      <div v-if="room" class="door q-mr-sm" :aria-label="`已拆除 ${state.defused} / ${room.bombs}`">
        {{ room.emoji }}
        <span v-for="n in room.bombs" :key="n">{{ n <= state.defused ? '🔓' : '🔒' }}</span>
      </div>
      <div class="text-subtitle1 text-weight-bold">⭐ {{ state.score }}</div>
    </div>

    <q-card
      class="bomb-card soft-shadow q-pa-md text-center relative-position column no-wrap justify-center"
    >
      <!-- 炸彈種類 -->
      <div v-if="room" class="bomb-type" :class="`bomb-type--${state.bombType}`">
        {{ BOMB_TYPES[state.bombType].icon }} {{ BOMB_TYPES[state.bombType].name }}
        <template v-if="state.bombType === 'chain'">
          · 第 {{ state.chainStep + 1 }} / {{ CHAIN_LENGTH }} 個字
        </template>
      </div>

      <!-- 炸彈 + 引信 -->
      <div class="bomb" :class="state.status">
        {{ bombFace }}
      </div>
      <q-linear-progress
        :value="state.timeLeft / state.fuse"
        :color="fuseColor"
        size="12px"
        rounded
        class="fuse q-mx-auto"
      />
      <div class="text-caption q-mt-xs" :class="{ 'text-negative text-weight-bold': urgent }">
        ⏱ {{ Math.ceil(state.timeLeft) }} 秒
      </div>

      <div v-if="bomb.hideMeaning.value" class="q-mt-md">
        <q-btn
          round
          size="xl"
          color="secondary"
          icon="volume_up"
          aria-label="再聽一次"
          @click="bomb.replay"
        />
        <div class="text-caption text-grey-8 q-mt-xs">聽發音，拼出這個單字</div>
      </div>
      <div v-else class="text-h5 text-weight-bold q-mt-md">{{ state.word?.chinese }}</div>

      <div class="answer q-mt-sm">
        <span
          v-for="(c, i) in bomb.display.value"
          :key="i"
          class="char"
          :class="{ blank: !c.shown, space: c.ch === ' ', reveal: state.status === 'exploded' }"
        >
          {{ c.shown ? c.ch : '' }}
        </span>
      </div>

      <div class="row justify-center items-center q-gutter-sm q-mt-sm">
        <div class="text-caption text-grey-8">
          猜錯：
          <span
            v-for="n in MAX_WRONG"
            :key="n"
            class="wire"
            :class="{ cut: n <= state.wrong.length }"
          />
        </div>
        <q-btn
          v-if="state.bombType !== 'mystery' || bomb.hideMeaning.value"
          flat
          no-caps
          color="secondary"
          :icon="state.bombType === 'mystery' ? 'translate' : 'hearing'"
          :label="`${state.bombType === 'mystery' ? '看中文' : '聽提示'} (-${bomb.hintCost}秒)`"
          :disable="state.status !== 'playing'"
          @click="bomb.hint"
        />
        <q-btn
          v-if="state.magnifiers > 0"
          flat
          no-caps
          color="orange-9"
          :label="`🔍 放大鏡 ×${state.magnifiers}`"
          :disable="state.status !== 'playing'"
          @click="bomb.magnify"
        />
      </div>

      <div v-if="state.chainNext" class="banner text-orange-9">還有下一個字！</div>
      <div v-else-if="state.status === 'defused'" class="banner text-positive">拆除成功！</div>
      <div v-else-if="state.status === 'exploded'" class="banner text-negative">轟！</div>

      <PauseOverlay v-if="bomb.loop.paused.value" @resume="bomb.loop.resume" />
    </q-card>

    <template #result-actions>
      <q-btn
        v-if="nextRoom"
        class="btn-3d"
        color="primary"
        size="lg"
        icon="meeting_room"
        :label="`下一間：${nextRoom.emoji} ${nextRoom.name}`"
        @click="playNext"
      />
    </template>

    <LetterKeyboard
      class="q-mt-sm keyboard-dock"
      :status="bomb.letterStatus"
      :disabled="state.status !== 'playing'"
      @press="bomb.guess"
    />
  </GameShell>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEventListener } from '@vueuse/core';
import {
  GameShell,
  LivesBar,
  PauseOverlay,
  StagePicker,
  firstOpenStage,
  nextStageIndex,
  useGameSession,
} from '../shared';
import { bombInfo } from './info';
import LetterKeyboard from './LetterKeyboard.vue';
import { BOMB_TYPES, CHAIN_LENGTH, ROOMS } from './rooms';
import { MAX_WRONG, useBomb } from './useBomb';

const session = useGameSession(bombInfo, (words) => bomb.start(words));
const bomb = useBomb(session);
const state = bomb.state;
const room = bomb.room;

const bombFace = computed(() => {
  if (state.status === 'exploded') return '💥';
  if (state.status === 'defused') return state.chainNext ? '⛓️' : '✅';
  return '💣';
});

// 預設選還沒拿到星星的第一間
bomb.mode.value = { kind: 'stage', index: firstOpenStage(ROOMS.length, bomb.stars.value) };

/** 逃出後可以挑戰的下一間 */
const nextIndex = computed(() =>
  nextStageIndex(bomb.mode.value, !!session.result?.won, ROOMS.length),
);
const nextRoom = computed(() => (nextIndex.value === null ? null : ROOMS[nextIndex.value]));

const playNext = () => {
  if (nextIndex.value === null) return;
  bomb.mode.value = { kind: 'stage', index: nextIndex.value };
  session.start();
};

const urgent = computed(() => state.timeLeft < 8);
const fuseColor = computed(() =>
  urgent.value ? 'negative' : state.timeLeft < 20 ? 'orange' : 'positive',
);

useEventListener(window, 'keydown', (e: KeyboardEvent) => {
  if (session.phase !== 'playing' || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key.length === 1) bomb.guess(e.key);
});
</script>

<style scoped>
.bomb-card {
  flex: 1;
  min-height: 0;
}
.room-info {
  text-align: center;
  font-size: 0.85rem;
}
.bomb-types {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}
.bomb-types span {
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.22);
  font-size: 0.75rem;
}
.door {
  font-size: 0.95rem;
  letter-spacing: -1px;
  white-space: nowrap;
}
.bomb-type {
  align-self: center;
  padding: 2px 12px;
  border-radius: 999px;
  background: #eceff1;
  font-size: 0.85rem;
  font-weight: 800;
}
.bomb-type--fast {
  background: #ffe0b2;
  color: #e65100;
}
.bomb-type--mystery {
  background: #e0f2f1;
  color: #00695c;
}
.bomb-type--chain {
  background: #fff3e0;
  color: #6d4c41;
}
.bomb {
  font-size: clamp(3rem, 11vh, 5rem);
  line-height: 1.2;
  display: inline-block;
}
.bomb.playing {
  animation: tick 1s infinite;
}
.bomb.exploded {
  animation: boom 0.5s;
}
.fuse {
  max-width: 280px;
}
.answer {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}
.char {
  width: 2.2rem;
  height: 2.8rem;
  line-height: 2.8rem;
  font-size: 1.8rem;
  font-weight: bold;
  font-family: monospace;
  text-transform: uppercase;
}
.char.blank {
  border-bottom: 4px solid #37474f;
}
.char.space {
  width: 1rem;
}
.char.reveal {
  color: #c62828;
}
.wire {
  display: inline-block;
  width: 10px;
  height: 18px;
  margin: 0 2px;
  vertical-align: middle;
  border-radius: 3px;
  background: #fbc02d;
}
.wire.cut {
  background: #e53935;
  transform: scaleY(0.4);
}
.banner {
  font-size: 1.6rem;
  font-weight: 900;
  margin-top: 8px;
}
.keyboard-dock {
  flex-shrink: 0;
}
@keyframes tick {
  50% {
    transform: scale(1.06) rotate(-3deg);
  }
}
@keyframes boom {
  from {
    transform: scale(2.5);
  }
}
</style>
