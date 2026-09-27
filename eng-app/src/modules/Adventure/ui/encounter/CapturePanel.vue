<template>
  <div>
    <!-- 場景 -->
    <div class="scene app-card" :style="{ background }">
      <div
        class="scene__creature"
        :class="{ shaking: phase === 'throwing', gone: phase === 'caught' }"
      >
        <CreatureSvg :species="species" :size="150" />
      </div>
      <div
        v-if="phase === 'throwing' || phase === 'caught'"
        class="net"
        :class="{ 'net--shake': phase === 'throwing' }"
      >
        <svg viewBox="0 0 100 100" width="120" height="120">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="rgba(255,255,255,0.35)"
            stroke="#fff"
            stroke-width="4"
          />
          <path
            d="M10 50 H90 M50 10 V90 M22 22 L78 78 M78 22 L22 78"
            stroke="#fff"
            stroke-width="2.5"
          />
          <circle
            cx="50"
            cy="50"
            r="10"
            :fill="phase === 'caught' ? '#22c55e' : '#ffb020'"
            stroke="#fff"
            stroke-width="3"
          />
        </svg>
      </div>
      <div class="scene__label">
        <b>{{ species.name }}</b> Lv {{ level }}
        <ElementBadge :element="species.element" class="q-ml-xs" />
      </div>
    </div>

    <!-- 能量與捕捉率 -->
    <div class="app-card q-pa-md q-mt-md">
      <div class="row items-center no-wrap q-mb-xs">
        <span class="text-weight-bold">⚡ 捕捉能量</span>
        <q-space />
        <span class="rate" :class="rateClass">捕捉率 {{ Math.round(rate * 100) }}%</span>
      </div>
      <div v-if="dailyBonus" class="daily-bonus q-mb-xs">
        🎁 今日目標達成：能量 +{{ dailyBonus }}
      </div>
      <div v-if="candyUsed" class="daily-bonus q-mb-xs">🍬 字靈糖果：能量 +{{ CANDY_ENERGY }}</div>
      <q-btn
        v-else-if="(phase === 'choose' || phase === 'ready') && candyCount >= CANDY_ENERGY_COST"
        dense
        unelevated
        no-caps
        size="sm"
        color="orange-1"
        text-color="orange-10"
        class="q-mb-xs text-weight-bold"
        :label="`🍬 用 ${CANDY_ENERGY_COST} 顆糖果，能量 +${CANDY_ENERGY}（有 ${candyCount} 顆）`"
        @click="boostWithCandy"
      />
      <div class="energy">
        <span v-for="n in MAX_ENERGY" :key="n" class="energy__cell" :class="{ on: n <= energy }" />
      </div>
      <div class="text-caption text-muted q-mt-xs">
        答對越難的題目，能量越多、越容易抓到！（{{ RARITY_NAME[species.rarity] }}字靈）
      </div>
    </div>

    <!-- 選難度 -->
    <div v-if="phase === 'choose'" class="q-mt-md">
      <div class="text-center text-weight-bold q-mb-sm">
        第 {{ round + 1 }} / {{ CAPTURE_ROUNDS }} 題：選擇挑戰難度
      </div>
      <div class="difficulties">
        <q-btn
          v-for="d in difficulties"
          :key="d.key"
          class="btn-3d difficulty"
          :color="d.color"
          @click="ask(d.key)"
        >
          <div class="column items-center">
            <span class="text-h6">{{ d.label }} +{{ CAPTURE_ENERGY[d.key] }}</span>
            <span class="text-caption">{{ d.desc }}</span>
          </div>
        </q-btn>
      </div>
    </div>

    <QuestionCard
      v-else-if="phase === 'question' && question"
      :question="question"
      class="q-mt-md"
      @answered="onAnswered"
    />

    <div v-else-if="phase === 'ready'" class="q-mt-md">
      <q-btn
        class="btn-3d full-width"
        size="xl"
        color="accent"
        text-color="dark"
        icon="track_changes"
        label="丟出字靈網！"
        @click="throwNet"
      />
    </div>

    <div v-else-if="phase === 'failed'" class="app-card q-pa-md q-mt-md text-center">
      <div class="text-h6">😣 {{ species.name }} 掙脫了！</div>
      <div class="text-muted q-mb-md">再答幾題累積能量，牠還在這裡喔</div>
      <div class="row q-gutter-sm justify-center">
        <q-btn class="btn-3d" color="primary" icon="replay" label="再挑戰一次" @click="restart" />
        <q-btn flat color="grey-8" label="放牠走" @click="$emit('leave')" />
      </div>
    </div>

    <div v-if="phase === 'choose' || phase === 'ready'" class="text-center q-mt-sm">
      <q-btn flat color="grey-7" label="逃跑" icon="directions_run" @click="$emit('leave')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { type GameWord, WordDeck, sfx, useTimers } from 'src/modules/Games/shared';
import { getTodayProgress } from 'src/modules/Vocabulary';
import { type Species, RARITY_NAME } from '../../domain/species';
import {
  CAPTURE_ENERGY,
  CAPTURE_ROUNDS,
  type CaptureDifficulty,
  MAX_ENERGY,
  DAILY_BONUS_ENERGY,
  captureRate,
} from '../../domain/rules';
import { CAPTURE_KIND, type Question, makeQuestion } from '../../domain/questions';
import { CANDY_ENERGY, CANDY_ENERGY_COST } from '../../domain/candy';
import { candyCount, spendCandies } from '../../store/candy';
import { useAdventureStore } from '../../store/useAdventureStore';
import CreatureSvg from '../CreatureSvg.vue';
import ElementBadge from '../ElementBadge.vue';
import QuestionCard from '../QuestionCard.vue';

const props = defineProps<{
  species: Species;
  level: number;
  words: GameWord[];
  background: string;
  /** 打贏對戰後的額外能量 */
  bonusEnergy: number;
}>();
const emit = defineEmits<{ (e: 'caught'): void; (e: 'leave'): void }>();

const store = useAdventureStore();
const timers = useTimers();
const deck = new WordDeck(props.words);

type Phase = 'choose' | 'question' | 'ready' | 'throwing' | 'caught' | 'failed';
const phase = ref<Phase>('choose');
const round = ref(0);
// 當天達成每日單字目標，捕捉多一點能量
const dailyBonus = getTodayProgress().done ? DAILY_BONUS_ENERGY : 0;
// 用糖果加的能量，這次遭遇重新挑戰時也保留
const candyUsed = ref(false);
const startEnergy = () =>
  Math.min(MAX_ENERGY, props.bonusEnergy + dailyBonus + (candyUsed.value ? CANDY_ENERGY : 0));
const energy = ref(startEnergy());
const question = ref<Question | null>(null);
let difficulty: CaptureDifficulty = 'easy';

const rate = computed(() => captureRate(props.species.rarity, energy.value));
const rateClass = computed(() =>
  rate.value >= 0.7 ? 'text-positive' : rate.value >= 0.4 ? 'text-orange-8' : 'text-negative',
);

const difficulties: { key: CaptureDifficulty; label: string; desc: string; color: string }[] = [
  { key: 'easy', label: '簡單', desc: '聽發音選中文', color: 'positive' },
  { key: 'normal', label: '普通', desc: '聽發音選拼法', color: 'primary' },
  { key: 'hard', label: '困難', desc: '聽發音拼單字', color: 'deep-orange' },
];

const ask = (d: CaptureDifficulty) => {
  difficulty = d;
  question.value = makeQuestion(CAPTURE_KIND[d], deck.draw(), props.words);
  phase.value = 'question';
};

const onAnswered = (correct: boolean) => {
  if (question.value) store.recordAnswer(question.value.word, correct);
  if (correct) energy.value = Math.min(MAX_ENERGY, energy.value + CAPTURE_ENERGY[difficulty]);
  round.value++;
  phase.value = round.value >= CAPTURE_ROUNDS ? 'ready' : 'choose';
};

const boostWithCandy = () => {
  if (candyUsed.value || !spendCandies(CANDY_ENERGY_COST)) return;
  candyUsed.value = true;
  energy.value = Math.min(MAX_ENERGY, energy.value + CANDY_ENERGY);
  sfx.correct();
};

const throwNet = () => {
  phase.value = 'throwing';
  const success = Math.random() < rate.value;
  timers.later(() => {
    if (success) {
      phase.value = 'caught';
      sfx.win();
      timers.later(() => emit('caught'), 900);
    } else {
      phase.value = 'failed';
      sfx.wrong();
    }
  }, 2000);
};

const restart = () => {
  round.value = 0;
  energy.value = startEnergy();
  phase.value = 'choose';
};
</script>

<style scoped lang="scss">
.scene {
  position: relative;
  height: clamp(170px, 30vh, 230px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
  padding-bottom: 28px;
}
.scene :deep(svg.creature) {
  width: min(150px, 22vh);
  height: min(150px, 22vh);
}
.scene__creature {
  transition:
    transform 0.4s,
    opacity 0.4s;
}
.scene__creature.shaking {
  transform: scale(0.4);
  opacity: 0.4;
}
.scene__creature.gone {
  transform: scale(0);
  opacity: 0;
}
.scene__label {
  position: absolute;
  left: 12px;
  top: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  font-weight: 700;
}
.net {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
}
.net--shake {
  animation: net-shake 0.6s ease-in-out 3;
}
.daily-bonus {
  font-size: 0.8rem;
  font-weight: 800;
  color: #b45309;
}
.energy {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 4px;
}
.energy__cell {
  height: 16px;
  border-radius: 6px;
  background: #e2e8f0;
  transition: background 0.3s;
  &.on {
    background: linear-gradient(180deg, #fde047, #f59e0b);
  }
}
.rate {
  font-weight: 900;
  font-size: 1.1rem;
}
.difficulties {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.difficulty {
  min-height: 72px;
  padding: 6px 4px;
}
@keyframes net-shake {
  0%,
  100% {
    transform: translateX(-50%) rotate(0);
  }
  25% {
    transform: translateX(-50%) rotate(-18deg);
  }
  75% {
    transform: translateX(-50%) rotate(18deg);
  }
}
@media (max-width: 599px) {
  .difficulties {
    grid-template-columns: 1fr;
  }
  .difficulty {
    min-height: 56px;
  }
}
</style>
