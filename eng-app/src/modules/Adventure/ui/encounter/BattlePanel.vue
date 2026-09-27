<template>
  <div>
    <!-- 戰場 -->
    <div class="arena app-card" :style="{ background }">
      <div class="side side--enemy">
        <div class="status">
          <div class="row items-center no-wrap q-gutter-x-xs">
            <b>{{ enemy.name }}</b>
            <span class="text-caption">Lv {{ enemyLevel }}</span>
            <ElementBadge :element="enemy.element" />
          </div>
          <q-linear-progress
            :value="enemyHp / enemyMax"
            :color="hpColor(enemyHp / enemyMax)"
            track-color="grey-3"
            size="10px"
            rounded
            class="q-mt-xs"
          />
          <div class="text-caption">{{ enemyHp }} / {{ enemyMax }}</div>
        </div>
        <div class="fighter" :class="{ hit: fx === 'enemyHit', faint: enemyHp <= 0 }">
          <CreatureSvg :species="enemy" :size="120" />
          <span v-if="popup && popup.target === 'enemy'" :key="popup.id" class="popup">{{
            popup.text
          }}</span>
        </div>
      </div>

      <div class="side side--partner">
        <div
          class="fighter"
          :class="{ hit: fx === 'partnerHit', faint: partnerHp <= 0, lunge: fx === 'attack' }"
        >
          <CreatureSvg :species="partnerSpecies" :size="120" flip />
          <span v-if="popup && popup.target === 'partner'" :key="popup.id" class="popup">{{
            popup.text
          }}</span>
        </div>
        <div class="status">
          <div class="row items-center no-wrap q-gutter-x-xs">
            <b>{{ partnerSpecies.name }}</b>
            <span class="text-caption">Lv {{ partner.level }}</span>
            <ElementBadge :element="partnerSpecies.element" />
          </div>
          <q-linear-progress
            :value="partnerHp / partnerMax"
            :color="hpColor(partnerHp / partnerMax)"
            track-color="grey-3"
            size="10px"
            rounded
            class="q-mt-xs"
          />
          <div class="text-caption">{{ partnerHp }} / {{ partnerMax }}</div>
        </div>
      </div>
    </div>

    <div class="message app-card q-pa-md q-mt-md">{{ message }}</div>

    <!-- 選招式 -->
    <div v-if="phase === 'choose'" class="q-mt-md">
      <div class="row items-center q-mb-sm text-weight-bold">
        <span>連擊</span>
        <span v-for="n in ULTIMATE_COMBO" :key="n" class="combo" :class="{ on: n <= combo }" />
        <q-space />
        <span class="text-caption text-muted"
          >暴擊率 {{ Math.round(critChance(store.recentAccuracy) * 100) }}%（看最近答對率）</span
        >
      </div>
      <div class="moves">
        <q-btn
          v-for="m in moves"
          :key="m.kind"
          class="btn-3d move"
          :color="m.color"
          :text-color="m.textColor"
          :disable="m.disabled"
          @click="useMove(m.kind)"
        >
          <div class="column items-center">
            <span class="text-subtitle1 text-weight-bold">{{ m.name }}</span>
            <span class="text-caption">{{ m.desc }}</span>
          </div>
        </q-btn>
      </div>
      <div class="text-center q-mt-sm">
        <q-btn flat color="grey-7" label="逃跑" icon="directions_run" @click="$emit('leave')" />
      </div>
    </div>

    <QuestionCard
      v-else-if="phase === 'question' && question"
      :question="question"
      class="q-mt-md"
      @answered="onAnswered"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { type GameWord, WordDeck, sfx, useTimers } from 'src/modules/Games/shared';
import { ELEMENTS } from '../../domain/elements';
import { type Species, getSpecies } from '../../domain/species';
import {
  type MoveKind,
  MOVE_POWER,
  ULTIMATE_COMBO,
  battleXp,
  critChance,
  enemyDamage,
  maxHp,
  playerDamage,
} from '../../domain/rules';
import { MOVE_KIND, type Question, makeQuestion } from '../../domain/questions';
import { type OwnedCreature, useAdventureStore } from '../../store/useAdventureStore';
import CreatureSvg from '../CreatureSvg.vue';
import ElementBadge from '../ElementBadge.vue';
import QuestionCard from '../QuestionCard.vue';

const props = defineProps<{
  enemy: Species;
  enemyLevel: number;
  partner: OwnedCreature;
  words: GameWord[];
  background: string;
}>();
const emit = defineEmits<{
  (e: 'won', reward: { xp: number; levels: number }): void;
  (e: 'lost'): void;
  (e: 'leave'): void;
}>();

const store = useAdventureStore();
const timers = useTimers();
const deck = new WordDeck(props.words);

const partnerSpecies = computed(() => getSpecies(props.partner.speciesId));
const partnerMax = maxHp(partnerSpecies.value, props.partner.level);
const enemyMax = maxHp(props.enemy, props.enemyLevel);
const partnerHp = ref(partnerMax);
const enemyHp = ref(enemyMax);
const combo = ref(0);

type Phase = 'choose' | 'question' | 'busy';
const phase = ref<Phase>('choose');
const question = ref<Question | null>(null);
const message = ref(`野生的${props.enemy.name}出現了！要用什麼招式？`);
const fx = ref<'' | 'enemyHit' | 'partnerHit' | 'attack'>('');
const popup = ref<{ id: number; target: 'enemy' | 'partner'; text: string } | null>(null);
let popupId = 0;
let currentMove: MoveKind = 'normal';

const moves = computed(() => {
  const el = ELEMENTS[partnerSpecies.value.element];
  return [
    {
      kind: 'normal' as const,
      name: '撞擊',
      desc: `看中文選英文 · 威力 ${MOVE_POWER.normal.hit}`,
      color: 'grey-2',
      textColor: 'dark',
      disabled: false,
    },
    {
      kind: 'element' as const,
      name: el.move,
      desc: `聽發音選拼法 · 威力 ${MOVE_POWER.element.hit}`,
      color: 'primary',
      textColor: 'white',
      disabled: false,
    },
    {
      kind: 'ultimate' as const,
      name: `必殺・${el.ultimate}`,
      desc:
        combo.value >= ULTIMATE_COMBO
          ? `看中文拼英文 · 威力 ${MOVE_POWER.ultimate.hit}`
          : `連擊 ${ULTIMATE_COMBO} 次解鎖`,
      color: 'deep-orange',
      textColor: 'white',
      disabled: combo.value < ULTIMATE_COMBO,
    },
  ];
});

const hpColor = (ratio: number) => (ratio > 0.5 ? 'positive' : ratio > 0.2 ? 'orange' : 'negative');

const showPopup = (target: 'enemy' | 'partner', text: string) => {
  popup.value = { id: ++popupId, target, text };
};

const useMove = (kind: MoveKind) => {
  currentMove = kind;
  question.value = makeQuestion(MOVE_KIND[kind], deck.draw(), props.words);
  phase.value = 'question';
};

const onAnswered = (correct: boolean) => {
  if (question.value) store.recordAnswer(question.value.word, correct);
  phase.value = 'busy';

  const crit = correct && Math.random() < critChance(store.recentAccuracy);
  const { damage, effectiveness } = playerDamage({
    attacker: partnerSpecies.value,
    attackerLevel: props.partner.level,
    defender: props.enemy,
    move: currentMove,
    correct,
    crit,
  });

  combo.value = currentMove === 'ultimate' || !correct ? 0 : combo.value + 1;
  const moveName = moves.value.find((m) => m.kind === currentMove)?.name ?? '';

  if (damage > 0) {
    fx.value = 'attack';
    timers.later(() => {
      fx.value = 'enemyHit';
      enemyHp.value = Math.max(0, enemyHp.value - damage);
      showPopup('enemy', `-${damage}${crit ? ' 暴擊！' : ''}`);
      sfx.hit();
    }, 250);
    const notes = [
      crit ? '暴擊！' : '',
      effectiveness > 1 ? '效果絕佳！' : effectiveness < 1 ? '效果不太好…' : '',
    ].join(' ');
    message.value = `${partnerSpecies.value.name}使出${moveName}！${correct ? '' : '（答錯了，威力減半）'}${notes}`;
  } else {
    message.value = `${partnerSpecies.value.name}的${moveName}打偏了！`;
  }

  timers.later(() => {
    fx.value = '';
    if (enemyHp.value <= 0) return win();
    enemyTurn();
  }, 1100);
};

const enemyTurn = () => {
  const dmg = enemyDamage(props.enemy, props.enemyLevel, partnerSpecies.value);
  message.value = `${props.enemy.name}發動攻擊！`;
  timers.later(() => {
    fx.value = 'partnerHit';
    partnerHp.value = Math.max(0, partnerHp.value - dmg);
    showPopup('partner', `-${dmg}`);
    sfx.hit();
  }, 400);
  timers.later(() => {
    fx.value = '';
    if (partnerHp.value <= 0) {
      message.value = `${partnerSpecies.value.name}累倒了…`;
      sfx.lose();
      timers.later(() => emit('lost'), 1200);
      return;
    }
    message.value = '輪到你了！要用什麼招式？';
    phase.value = 'choose';
  }, 1200);
};

const win = () => {
  const xp = battleXp(props.enemyLevel);
  const levels = store.gainXp(props.partner.uid, xp);
  message.value = `打贏了！${partnerSpecies.value.name}得到 ${xp} 經驗值${levels ? `，升到 Lv ${props.partner.level}！` : ''}`;
  sfx.win();
  timers.later(() => emit('won', { xp, levels }), 1500);
};
</script>

<style scoped lang="scss">
.arena {
  position: relative;
  height: 280px;
  overflow: hidden;
}
.side {
  position: absolute;
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.side--enemy {
  top: 12px;
  right: 12px;
  flex-direction: row;
  align-items: flex-start;
}
.side--partner {
  bottom: 8px;
  left: 12px;
}
.status {
  min-width: 150px;
  padding: 6px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}
.fighter {
  position: relative;
  transition:
    transform 0.25s,
    opacity 0.4s;
}
.fighter.hit {
  animation: hit 0.4s;
}
.fighter.lunge {
  transform: translate(30px, -20px);
}
.fighter.faint {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}
.popup {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.4rem;
  font-weight: 900;
  color: #dc2626;
  text-shadow: 0 2px 0 #fff;
  white-space: nowrap;
  animation: float 1s forwards;
}
.message {
  min-height: 56px;
  font-weight: 800;
  font-size: 1.05rem;
}
.combo {
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-left: 6px;
  border-radius: 50%;
  background: #e2e8f0;
  &.on {
    background: #f97316;
    box-shadow: 0 0 8px #fb923c;
  }
}
.moves {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.move {
  min-height: 72px;
  padding: 6px 4px;
}
@keyframes hit {
  0%,
  100% {
    transform: none;
    filter: none;
  }
  30% {
    transform: translateX(10px);
    filter: brightness(2);
  }
  60% {
    transform: translateX(-6px);
  }
}
@keyframes float {
  to {
    transform: translate(-50%, -40px);
    opacity: 0;
  }
}
@media (max-width: 599px) {
  .moves {
    grid-template-columns: 1fr;
  }
  .move {
    min-height: 56px;
  }
  .status {
    min-width: 130px;
  }
}
</style>
