<template>
  <GameShell :session="session" @quit="space.quit">
    <!-- 標題畫面：選關卡、看飛船升級 -->
    <template #settings>
      <div class="picker">
        <div class="picker__head">
          <span>選擇關卡</span>
          <span>⭐ {{ space.totalStars.value }} / {{ STAGES.length * 3 }}</span>
        </div>
        <div class="stages">
          <button
            v-for="(st, i) in STAGES"
            :key="st.name"
            type="button"
            class="stage-btn"
            :class="{ on: isSelected({ kind: 'stage', index: i }) }"
            :disabled="!unlocked(i)"
            @click="select({ kind: 'stage', index: i })"
          >
            <span class="stage-btn__emoji">{{ unlocked(i) ? st.emoji : '🔒' }}</span>
            <span class="stage-btn__name">{{ i + 1 }}. {{ st.name }}</span>
            <span class="stage-btn__stars">
              <span v-for="n in 3" :key="n" :class="{ lit: n <= starsOf(i) }">★</span>
            </span>
          </button>
          <button
            type="button"
            class="stage-btn stage-btn--endless"
            :class="{ on: isSelected({ kind: 'endless' }) }"
            @click="select({ kind: 'endless' })"
          >
            <span class="stage-btn__emoji">♾️</span>
            <span class="stage-btn__name">無盡模式</span>
            <span class="stage-btn__stars">挑戰最高分</span>
          </button>
        </div>

        <div class="picker__head q-mt-md"><span>🚀 飛船升級（星星越多越強）</span></div>
        <div class="upgrades">
          <div
            v-for="u in UPGRADES"
            :key="u.id"
            class="upgrade"
            :class="{ got: space.totalStars.value >= u.needStars }"
          >
            <span class="upgrade__icon">{{
              space.totalStars.value >= u.needStars ? u.icon : '🔒'
            }}</span>
            <span class="upgrade__name">{{ u.name }}</span>
            <span class="upgrade__desc">
              {{ space.totalStars.value >= u.needStars ? u.desc : `⭐ ${u.needStars} 解鎖` }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <div class="row items-center no-wrap q-mb-sm">
      <LivesBar :lives="state.shields" :max="state.maxShields" icon="🛡️" />
      <q-space />
      <q-chip dense color="blue-9" text-color="white">{{ hudLabel }}</q-chip>
      <div class="text-subtitle1 text-weight-bold q-ml-sm">⭐ {{ state.score }}</div>
    </div>

    <div class="field" :class="{ damaged: state.damaged }">
      <div class="stars" />

      <div v-if="boss?.boss" class="boss-bar">
        <span>👾 魔王隕石</span>
        <span
          v-for="n in boss.boss.maxHp"
          :key="n"
          class="boss-bar__cell"
          :class="{ on: n <= boss.boss.hp }"
        />
      </div>

      <div
        v-for="m in state.meteors"
        :key="m.id"
        class="meteor"
        :class="{ 'meteor--boss': m.boss }"
        :style="{ left: `${m.x}%`, top: `${m.y}%` }"
      >
        <span class="rock">{{ m.boss ? '🌑' : '☄️' }}</span>
        <span class="label">{{ m.word.chinese }}</span>
      </div>

      <svg class="fx" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line v-for="e in lasers" :key="e.id" x1="50" y1="100" :x2="e.x" :y2="e.y" class="laser" />
      </svg>
      <div
        v-for="e in booms"
        :key="e.id"
        class="boom"
        :class="{ 'boom--big': e.kind === 'bigboom' }"
        :style="{ left: `${e.x}%`, top: `${Math.min(e.y, 92)}%` }"
      >
        💥
      </div>

      <div class="ship">🚀</div>
      <q-btn
        v-if="state.bombs > 0"
        round
        unelevated
        color="deep-orange"
        class="bomb-btn"
        :aria-label="`清場炸彈，剩 ${state.bombs} 顆`"
        @click="space.bomb"
      >
        💣
        <q-badge floating color="white" text-color="deep-orange">{{ state.bombs }}</q-badge>
      </q-btn>
      <PauseOverlay v-if="space.loop.paused.value" @resume="space.loop.resume" />
    </div>

    <div class="options q-mt-sm">
      <q-btn
        v-for="(o, i) in state.options"
        :key="o.answer"
        no-caps
        unelevated
        size="lg"
        color="blue-8"
        class="option"
        :disable="state.cooldown"
        @click="space.fire(o)"
      >
        <span class="option-key gt-xs">{{ i + 1 }}</span>
        {{ o.answer }}
      </q-btn>
    </div>

    <template #result-actions>
      <q-btn
        v-if="nextStage"
        class="btn-3d"
        color="primary"
        size="lg"
        icon="rocket_launch"
        :label="`下一關：${nextStage.emoji} ${nextStage.name}`"
        @click="playNext"
      />
    </template>
  </GameShell>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEventListener } from '@vueuse/core';
import { GameShell, LivesBar, PauseOverlay, useGameSession } from '../shared';
import { STAGES, UPGRADES, isStageUnlocked } from './campaign';
import { spaceInfo } from './info';
import { type SpaceMode, useSpace } from './useSpace';

const session = useGameSession(spaceInfo, (words) => space.start(words));
const space = useSpace(session);
const state = space.state;
const stage = space.stage;
const boss = space.boss;

const lasers = computed(() => state.effects.filter((e) => e.kind === 'laser'));
const booms = computed(() => state.effects.filter((e) => e.kind !== 'laser'));

const starsOf = (i: number) => space.progress.value.stars[i] ?? 0;
const unlocked = (i: number) => isStageUnlocked(i, space.progress.value.stars);

const isSelected = (m: SpaceMode) => {
  const cur = space.mode.value;
  if (m.kind === 'endless' || cur.kind === 'endless') return m.kind === cur.kind;
  return m.index === cur.index;
};

const select = (m: SpaceMode) => {
  space.mode.value = m;
};

// 預設選還沒拿到星星的第一關（全破就選最後一關）
const firstOpen = STAGES.findIndex((_, i) => unlocked(i) && starsOf(i) === 0);
select({ kind: 'stage', index: firstOpen === -1 ? STAGES.length - 1 : firstOpen });

const hudLabel = computed(() => {
  const s = stage.value;
  if (!s) return `第 ${space.wave.value} 波`;
  if (state.bossSpawned) return `${s.emoji} 魔王來了！`;
  return `${s.emoji} ${Math.min(state.hits, s.goal)} / ${s.goal}`;
});

/** 過關後可以挑戰的下一關 */
const nextIndex = computed(() => {
  const m = space.mode.value;
  if (m.kind !== 'stage' || !session.result?.won) return null;
  return m.index + 1 < STAGES.length ? m.index + 1 : null;
});
const nextStage = computed(() => (nextIndex.value === null ? null : STAGES[nextIndex.value]));

const playNext = () => {
  if (nextIndex.value === null) return;
  select({ kind: 'stage', index: nextIndex.value });
  session.start();
};

useEventListener(window, 'keydown', (e: KeyboardEvent) => {
  if (session.phase !== 'playing') return;
  if (e.key === 'b' || e.key === 'B') return space.bomb();
  const option = state.options[Number(e.key) - 1];
  if (option) space.fire(option);
});
</script>

<style scoped>
.picker {
  max-width: 560px;
  margin: 0 auto;
  text-align: left;
}
.picker__head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-weight: 800;
}
.stages {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.stage-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  padding: 6px 4px;
  border: 2px solid transparent;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.22);
  color: #fff;
  font: inherit;
  cursor: pointer;
}
.stage-btn.on {
  border-color: #fff;
  background: rgba(255, 255, 255, 0.22);
}
.stage-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.stage-btn__emoji {
  font-size: 1.5rem;
  line-height: 1.2;
}
.stage-btn__name {
  max-width: 100%;
  overflow: hidden;
  font-size: 0.8rem;
  font-weight: 800;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.stage-btn__stars {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.35);
}
.stage-btn__stars .lit {
  color: #fbbf24;
}
.stage-btn--endless .stage-btn__stars {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.7rem;
}
.upgrades {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 6px;
}
.upgrade {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 8px;
  align-items: center;
  padding: 5px 10px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.22);
  opacity: 0.65;
  font-size: 0.8rem;
}
.upgrade.got {
  background: rgba(255, 255, 255, 0.2);
  opacity: 1;
}
.upgrade__icon {
  grid-row: span 2;
  font-size: 1.2rem;
}
.upgrade__name {
  font-weight: 800;
}
.upgrade__desc {
  font-size: 0.7rem;
  opacity: 0.85;
}
.field {
  position: relative;
  flex: 1;
  min-height: 240px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(180deg, #081628 0%, #0f2a4d 60%, #174077 100%);
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
  color: #12335e;
  font-weight: bold;
  font-size: 0.95rem;
  text-align: center;
  line-height: 1.2;
}
.meteor--boss {
  z-index: 1;
}
.meteor--boss .rock {
  font-size: 4.2rem;
  transform: none;
  filter: drop-shadow(0 0 12px rgba(255, 90, 60, 0.8));
  animation: wobble 1.2s ease-in-out infinite;
}
.meteor--boss .label {
  max-width: 10rem;
  border: 2px solid #ff7043;
  background: #ffe4e0;
  color: #9f1d0f;
  font-size: 1.1rem;
}
.boss-bar {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 800;
  white-space: nowrap;
}
.boss-bar__cell {
  width: 16px;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.25);
}
.boss-bar__cell.on {
  background: #ff7043;
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
.boom--big {
  font-size: 6rem;
  animation: bigboom 1s forwards;
}
.ship {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) rotate(-45deg);
  font-size: 2.2rem;
}
.bomb-btn {
  position: absolute;
  right: 10px;
  bottom: 10px;
  font-size: 1.3rem;
}
.options {
  flex-shrink: 0;
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
@keyframes wobble {
  50% {
    transform: rotate(8deg) scale(1.05);
  }
}
@keyframes bigboom {
  from {
    transform: translate(-50%, -80%) scale(0.5);
  }
  40% {
    transform: translate(-50%, -80%) scale(1.3);
  }
  to {
    transform: translate(-50%, -80%) scale(1.6);
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
