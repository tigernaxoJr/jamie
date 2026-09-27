<template>
  <GameShell :session="session" @quit="battle.quit">
    <!-- 標題畫面：最高紀錄與出發樓層 -->
    <template #settings>
      <div class="tower-setup">
        <div class="text-weight-bold">
          🏰 最高紀錄：{{
            battle.save.value.bestFloor > 0 ? `第 ${battle.save.value.bestFloor} 層` : '還沒爬過'
          }}
        </div>
        <template v-if="battle.startPoints.value.length > 1">
          <div class="text-caption q-mt-sm">
            從哪一層出發？（打倒魔王後解鎖，出發前可以先挑增益卡）
          </div>
          <q-btn-toggle
            v-model="battle.startFloor.value"
            rounded
            unelevated
            no-caps
            toggle-color="white"
            toggle-text-color="deep-orange"
            color="deep-orange-9"
            text-color="white"
            class="q-mt-xs"
            :options="battle.startPoints.value.map((f) => ({ label: `第 ${f} 層`, value: f }))"
          />
        </template>
      </div>
    </template>

    <q-card
      class="arena soft-shadow q-pa-md column no-wrap"
      :class="{ 'arena--boss': isBossFight }"
    >
      <!-- 狀態列 -->
      <div class="row items-center no-wrap">
        <LivesBar :lives="state.playerHp" :max="state.maxHp" />
        <span v-if="state.shield > 0" class="shield q-ml-xs">🛡️×{{ state.shield }}</span>
        <q-space />
        <q-chip
          v-if="state.combo >= 2"
          dense
          color="orange"
          text-color="white"
          icon="local_fire_department"
        >
          {{ state.combo }} 連擊
        </q-chip>
        <div class="text-subtitle1 text-weight-bold">⭐ {{ state.score }}</div>
      </div>
      <div v-if="ownedPerks.length" class="perk-row q-mt-xs">
        <span v-for="p in ownedPerks" :key="p.perk.id" class="perk-chip" :title="p.perk.desc">
          {{ p.perk.icon }}<b v-if="p.count > 1">×{{ p.count }}</b>
        </span>
      </div>

      <!-- 怪物 -->
      <div class="stage-center text-center">
        <div class="floor">
          🏰 第 {{ state.floor }} 層
          <span v-if="isBossFight" class="boss-tag">魔王</span>
        </div>
        <template v-if="state.mode === 'fight'">
          <div class="text-caption text-grey-7">{{ monster.name }}</div>
          <div class="monster" :class="[`fx-${state.effect}`, { 'monster--boss': monster.boss }]">
            {{ monster.emoji }}
          </div>
          <div v-if="state.effect === 'crit'" class="pop-text text-orange-9">爆擊！</div>
          <div v-else-if="state.effect === 'blocked'" class="pop-text text-blue-8">
            守護盾擋住了！
          </div>
          <q-linear-progress
            :value="state.monsterHp / monster.hp"
            color="red"
            track-color="red-2"
            size="14px"
            rounded
            class="hp-bar q-mx-auto"
          />
          <div class="text-caption q-mt-xs">HP {{ state.monsterHp }} / {{ monster.hp }}</div>
        </template>
        <div v-else class="text-h6 q-mt-sm">✨ 挑一張增益卡，繼續往上爬！</div>
      </div>
    </q-card>

    <!-- 挑增益卡 -->
    <div v-if="state.mode === 'perk'" class="perks q-mt-sm">
      <button
        v-for="(p, i) in state.perkChoices"
        :key="p.id"
        type="button"
        class="perk app-card"
        @click="battle.choosePerk(p)"
      >
        <span class="choice-key gt-xs">{{ i + 1 }}</span>
        <span class="perk__icon">{{ p.icon }}</span>
        <span class="perk__name">{{ p.name }}</span>
        <span class="perk__desc">{{ p.desc }}</span>
      </button>
    </div>

    <!-- 題目 -->
    <q-card
      v-else-if="q"
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
import { PERKS, type PerkId } from './tower';
import { type QuestionType, useBattle } from './useBattle';

const session = useGameSession(battleInfo, (words) => battle.start(words));
const battle = useBattle(session);
const state = battle.state;
const monster = battle.monster;
const q = computed(() => state.question);

const isBossFight = computed(() => state.mode === 'fight' && monster.value.boss);

const ownedPerks = computed(() =>
  (Object.entries(state.perks) as [PerkId, number][])
    .filter(([id, n]) => n > 0 && id !== 'heal' && id !== 'shield')
    .map(([id, count]) => ({ perk: PERKS[id], count })),
);

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

// 電腦可以按 1~4 作答、1~3 挑增益卡
useEventListener(window, 'keydown', (e: KeyboardEvent) => {
  if (session.phase !== 'playing') return;
  if (state.mode === 'perk') {
    const perk = state.perkChoices[Number(e.key) - 1];
    if (perk) battle.choosePerk(perk);
    return;
  }
  if (!q.value) return;
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
.arena--boss {
  background: linear-gradient(180deg, #ffe0db 0%, #fff 100%);
}
.tower-setup {
  text-align: center;
}
.shield {
  font-weight: 800;
}
.perk-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.perk-chip {
  padding: 1px 8px;
  border-radius: 999px;
  background: #fff7ed;
  font-size: 0.95rem;
}
.floor {
  font-weight: 900;
  color: #bf360c;
}
.boss-tag {
  margin-left: 4px;
  padding: 1px 8px;
  border-radius: 999px;
  background: #d84315;
  color: #fff;
  font-size: 0.75rem;
}
.monster--boss {
  font-size: clamp(5rem, 20vh, 10rem);
  filter: drop-shadow(0 0 14px rgba(216, 67, 21, 0.5));
}
.perks {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.perk {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 14px 8px;
  border: 3px solid transparent;
  font: inherit;
  color: inherit;
  cursor: pointer;
  animation: deal 0.35s ease-out backwards;
  transition:
    transform 0.15s,
    border-color 0.15s;
}
.perk:nth-child(2) {
  animation-delay: 0.08s;
}
.perk:nth-child(3) {
  animation-delay: 0.16s;
}
.perk:hover {
  transform: translateY(-4px);
  border-color: #ff7043;
}
.perk__icon {
  font-size: 2.4rem;
  line-height: 1.2;
}
.perk__name {
  font-weight: 900;
}
.perk__desc {
  font-size: 0.8rem;
  color: var(--app-muted, #64748b);
  text-align: center;
  line-height: 1.35;
}
.pop-text {
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
@keyframes deal {
  from {
    transform: translateY(30px) scale(0.8);
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
