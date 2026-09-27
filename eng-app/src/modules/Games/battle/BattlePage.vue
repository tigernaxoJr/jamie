<template>
  <GameShell :session="session" @quit="battle.quit">
    <q-card class="arena soft-shadow q-pa-md column no-wrap">
      <!-- 狀態列 -->
      <div class="row items-center no-wrap">
        <LivesBar :lives="state.playerHp" :max="battle.maxHp" />
        <q-space />
        <q-chip
          v-if="state.combo >= 2"
          color="orange"
          text-color="white"
          icon="local_fire_department"
        >
          {{ state.combo }} 連擊
        </q-chip>
        <div class="text-subtitle1 text-weight-bold">⭐ {{ state.score }}</div>
      </div>

      <!-- 怪物 -->
      <div class="stage-center text-center">
        <div class="text-caption text-grey-7">第 {{ state.stage + 1 }} 關 · {{ monster.name }}</div>
        <div class="monster" :class="`fx-${state.effect}`">{{ monster.emoji }}</div>
        <div v-if="state.effect === 'crit'" class="crit-text">爆擊！</div>
        <q-linear-progress
          :value="state.monsterHp / monster.hp"
          color="red"
          track-color="red-2"
          size="14px"
          rounded
          class="hp-bar q-mx-auto"
        />
        <div class="text-caption q-mt-xs">HP {{ state.monsterHp }} / {{ monster.hp }}</div>
      </div>
    </q-card>

    <!-- 題目 -->
    <q-card
      v-if="q"
      class="question soft-shadow q-pa-md q-mt-sm"
      :class="{ 'fx-hurt': state.effect === 'hurt' }"
    >
      <div class="text-center">
        <div class="text-caption text-grey-7">{{ prompts[q.type] }}</div>
        <div v-if="q.type === 'listen'" class="q-my-sm">
          <q-btn
            round
            size="xl"
            color="secondary"
            icon="volume_up"
            aria-label="再聽一次"
            @click="WordPronunciation(q.word.answer)"
          />
        </div>
        <div v-else class="text-h4 text-weight-bold q-my-sm">
          {{ q.type === 'meaning' ? q.word.chinese : q.word.answer }}
          <q-btn
            v-if="q.type === 'reverse'"
            flat
            round
            icon="volume_up"
            aria-label="發音"
            @click="WordPronunciation(q.word.answer)"
          />
        </div>
      </div>

      <div class="choices q-mt-sm">
        <q-btn
          v-for="(c, i) in q.choices"
          :key="c.answer"
          no-caps
          unelevated
          size="lg"
          :color="choiceColor(c)"
          :text-color="state.chosen ? 'white' : 'dark'"
          class="choice"
          @click="battle.answer(c)"
        >
          <span class="choice-key gt-xs">{{ i + 1 }}</span>
          {{ q.type === 'reverse' ? c.chinese : c.answer }}
        </q-btn>
      </div>
    </q-card>
  </GameShell>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEventListener } from '@vueuse/core';
import { WordPronunciation } from 'src/modules/Vocabulary';
import { type GameWord, GameShell, LivesBar, useGameSession } from '../shared';
import { battleInfo } from './info';
import { type QuestionType, useBattle } from './useBattle';

const session = useGameSession(battleInfo, (words) => battle.start(words));
const battle = useBattle(session);
const state = battle.state;
const monster = battle.monster;
const q = computed(() => state.question);

const prompts: Record<QuestionType, string> = {
  meaning: '這個中文的英文是？',
  reverse: '這個英文是什麼意思？',
  listen: '聽聽看，是哪個單字？',
};

const choiceColor = (c: GameWord) => {
  if (!state.chosen || !q.value) return 'grey-3';
  if (c.answer === q.value.word.answer) return 'positive';
  if (c.answer === state.chosen.answer) return 'negative';
  return 'grey-5';
};

// 電腦可以按 1~4 作答
useEventListener(window, 'keydown', (e: KeyboardEvent) => {
  if (session.phase !== 'playing' || !q.value) return;
  const choice = q.value.choices[Number(e.key) - 1];
  if (choice) battle.answer(choice);
});
</script>

<style scoped>
.arena {
  flex: 1;
  min-height: 0;
  background: linear-gradient(180deg, #fff1e6 0%, #fff 100%);
}
/* 怪物區置中並佔滿剩餘高度 */
.stage-center {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.question {
  flex-shrink: 0;
}
.monster {
  font-size: clamp(4rem, 16vh, 8rem);
  line-height: 1.2;
  display: inline-block;
}
.hp-bar {
  width: 100%;
  max-width: 260px;
}
.crit-text {
  color: #ff6f00;
  font-weight: 900;
  font-size: 1.4rem;
  animation: pop 0.6s;
}
.choices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.choice {
  min-height: 64px;
  font-size: 1.15rem;
}
.choice-key {
  position: absolute;
  top: 4px;
  left: 8px;
  font-size: 0.7rem;
  opacity: 0.5;
}
.fx-hit,
.fx-crit {
  animation: hit 0.4s;
}
.fx-crit {
  animation-duration: 0.6s;
}
.fx-hurt {
  animation: shake 0.4s;
}
.fx-defeated {
  animation: defeated 1.1s forwards;
}
@keyframes hit {
  0%,
  100% {
    transform: none;
    filter: none;
  }
  30% {
    transform: translateX(12px) rotate(8deg);
    filter: brightness(2) saturate(0);
  }
}
@keyframes shake {
  0%,
  100% {
    transform: none;
  }
  20%,
  60% {
    transform: translateX(-8px);
  }
  40%,
  80% {
    transform: translateX(8px);
  }
}
@keyframes defeated {
  to {
    transform: scale(0.2) rotate(360deg);
    opacity: 0;
  }
}
@keyframes pop {
  from {
    transform: scale(2);
    opacity: 0;
  }
}
</style>
