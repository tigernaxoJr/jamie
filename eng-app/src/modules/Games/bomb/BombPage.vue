<template>
  <GameShell :session="session" @quit="bomb.quit">
    <div class="row items-center no-wrap q-mb-sm">
      <LivesBar :lives="state.lives" :max="3" icon="🛡️" />
      <q-space />
      <div class="text-subtitle1 text-weight-bold">⭐ {{ state.score }}</div>
    </div>

    <q-card
      class="bomb-card soft-shadow q-pa-md text-center relative-position column no-wrap justify-center"
    >
      <!-- 炸彈 + 引信 -->
      <div class="bomb" :class="state.status">
        {{ state.status === 'exploded' ? '💥' : state.status === 'defused' ? '✅' : '💣' }}
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

      <div class="text-h5 text-weight-bold q-mt-md">{{ state.word?.chinese }}</div>

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
          flat
          no-caps
          color="secondary"
          icon="hearing"
          :label="`聽提示 (-${bomb.hintCost}秒)`"
          :disable="state.status !== 'playing'"
          @click="bomb.hint"
        />
      </div>

      <div v-if="state.status === 'defused'" class="banner text-positive">拆除成功！</div>
      <div v-else-if="state.status === 'exploded'" class="banner text-negative">轟！</div>

      <PauseOverlay v-if="bomb.loop.paused.value" @resume="bomb.loop.resume" />
    </q-card>

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
import { GameShell, LivesBar, PauseOverlay, useGameSession } from '../shared';
import { bombInfo } from './info';
import LetterKeyboard from './LetterKeyboard.vue';
import { MAX_WRONG, useBomb } from './useBomb';

const session = useGameSession(bombInfo, (words) => bomb.start(words));
const bomb = useBomb(session);
const state = bomb.state;

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
