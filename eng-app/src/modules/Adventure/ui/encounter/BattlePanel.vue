<template>
  <div>
    <!-- 戰場 -->
    <div class="arena app-card" :style="{ background }">
      <div class="side side--enemy">
        <div class="status">
          <div class="row items-center no-wrap q-gutter-x-xs">
            <b>{{ enemy.species.name }}</b>
            <span class="text-caption">Lv {{ enemy.level }}</span>
            <ElementBadge :element="enemy.species.element" />
          </div>
          <q-linear-progress
            :value="enemyHp / enemyMax"
            :color="hpColor(enemyHp / enemyMax)"
            track-color="grey-3"
            size="10px"
            rounded
            class="q-mt-xs"
          />
          <div class="row items-center text-caption">
            <span>{{ enemyHp }} / {{ enemyMax }}</span>
            <q-space />
            <span v-if="enemies.length > 1" class="pips">
              <span
                v-for="(e, i) in enemies"
                :key="i"
                class="pip"
                :class="{ 'pip--down': i < enemyIdx }"
              />
            </span>
          </div>
        </div>
        <div class="fighter" :class="{ hit: fx === 'enemyHit', faint: enemyHp <= 0 }">
          <CreatureSvg :key="enemyIdx" :species="enemy.species" :size="120" />
          <span v-if="popup && popup.target === 'enemy'" :key="popup.id" class="popup">{{
            popup.text
          }}</span>
        </div>
      </div>

      <div class="side side--partner">
        <div
          class="fighter"
          :class="{ hit: fx === 'partnerHit', faint: activeHp <= 0, lunge: fx === 'attack' }"
        >
          <CreatureSvg
            :key="active.uid"
            :species="activeSpecies"
            :size="120"
            :evolved="(active.stage ?? 1) >= 2"
            flip
          />
          <span v-if="popup && popup.target === 'partner'" :key="popup.id" class="popup">{{
            popup.text
          }}</span>
        </div>
        <div class="status">
          <div class="row items-center no-wrap q-gutter-x-xs">
            <b>{{ creatureName(activeSpecies, active.stage) }}</b>
            <span class="text-caption">Lv {{ active.level }}</span>
            <ElementBadge :element="activeSpecies.element" />
          </div>
          <q-linear-progress
            :value="activeHp / activeMax"
            :color="hpColor(activeHp / activeMax)"
            track-color="grey-3"
            size="10px"
            rounded
            class="q-mt-xs"
          />
          <div class="row items-center text-caption">
            <span>{{ activeHp }} / {{ activeMax }}</span>
            <q-space />
            <span v-if="team.length > 1" class="pips">
              <span
                v-for="c in team"
                :key="c.uid"
                class="pip pip--mine"
                :class="{ 'pip--down': (hp[c.uid] ?? 0) <= 0 }"
              />
            </span>
          </div>
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
      <div class="row justify-center q-gutter-sm q-mt-sm">
        <q-btn
          v-if="aliveBench.length > 0"
          flat
          color="primary"
          icon="swap_horiz"
          label="換字靈"
          @click="openSwitch(false)"
        />
        <q-btn
          flat
          color="grey-7"
          :icon="mode === 'gym' ? 'flag' : 'directions_run'"
          :label="mode === 'gym' ? '認輸' : '逃跑'"
          @click="$emit('leave')"
        />
      </div>
    </div>

    <!-- 換字靈 -->
    <div v-else-if="phase === 'switch'" class="app-card q-pa-md q-mt-md">
      <div class="text-weight-bold q-mb-sm">
        {{ forcedSwitch ? '要派誰上場？' : '要換誰上場？（會用掉這一回合）' }}
      </div>
      <div class="bench">
        <button
          v-for="c in team"
          :key="c.uid"
          type="button"
          class="bench__member"
          :disabled="c.uid === active.uid || (hp[c.uid] ?? 0) <= 0"
          @click="switchTo(c.uid)"
        >
          <CreatureSvg
            :species="speciesOf(c)"
            :size="56"
            :animated="false"
            :evolved="(c.stage ?? 1) >= 2"
          />
          <span class="text-weight-bold">{{ creatureName(speciesOf(c), c.stage) }}</span>
          <span class="text-caption">Lv {{ c.level }} · ❤️ {{ hp[c.uid] ?? 0 }}</span>
        </button>
      </div>
      <div v-if="!forcedSwitch" class="text-right q-mt-sm">
        <q-btn flat color="grey-7" label="取消" @click="phase = 'choose'" />
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
import { computed, reactive, ref } from 'vue';
import { type GameWord, WordDeck, sfx, useTimers } from 'src/modules/Games/shared';
import { ELEMENTS } from '../../domain/elements';
import { creatureName, getSpecies } from '../../domain/species';
import {
  type MoveKind,
  type Opponent,
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
  /** 對手：野生字靈只有一隻；館主有好幾隻，依序上場 */
  enemies: Opponent[];
  team: OwnedCreature[];
  words: GameWord[];
  background: string;
  mode: 'wild' | 'gym';
  /** 開場訊息 */
  intro: string;
}>();
const emit = defineEmits<{
  (e: 'won', summary: string): void;
  (e: 'lost'): void;
  (e: 'leave'): void;
}>();

const store = useAdventureStore();
const timers = useTimers();
const deck = new WordDeck(props.words);

const speciesOf = (c: OwnedCreature) => getSpecies(c.speciesId);
const maxOf = (c: OwnedCreature) => maxHp(speciesOf(c), c.level, c.stage);

// 我方：每隻各自的血量，第一隻先上場
const hp = reactive<Record<string, number>>(
  Object.fromEntries(props.team.map((c) => [c.uid, maxOf(c)])),
);
const activeUid = ref(props.team[0]!.uid);
const participated = new Set([activeUid.value]);
const active = computed(() => props.team.find((c) => c.uid === activeUid.value)!);
const activeSpecies = computed(() => speciesOf(active.value));
const activeMax = computed(() => maxOf(active.value));
const activeHp = computed(() => hp[activeUid.value] ?? 0);
const aliveBench = computed(() =>
  props.team.filter((c) => c.uid !== activeUid.value && (hp[c.uid] ?? 0) > 0),
);

// 對手
const enemyIdx = ref(0);
const enemy = computed(() => props.enemies[enemyIdx.value]!);
const enemyMax = computed(() => maxHp(enemy.value.species, enemy.value.level));
const enemyHp = ref(enemyMax.value);

const combo = ref(0);
type Phase = 'choose' | 'question' | 'busy' | 'switch';
const phase = ref<Phase>('choose');
const forcedSwitch = ref(false);
const question = ref<Question | null>(null);
const message = ref(props.intro);
const fx = ref<'' | 'enemyHit' | 'partnerHit' | 'attack'>('');
const popup = ref<{ id: number; target: 'enemy' | 'partner'; text: string } | null>(null);
let popupId = 0;
let currentMove: MoveKind = 'normal';

const activeName = () => creatureName(activeSpecies.value, active.value.stage);

const moves = computed(() => {
  const el = ELEMENTS[activeSpecies.value.element];
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
    attacker: activeSpecies.value,
    attackerLevel: active.value.level,
    attackerStage: active.value.stage ?? 1,
    defender: enemy.value.species,
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
    message.value = `${activeName()}使出${moveName}！${correct ? '' : '（答錯了，威力減半）'}${notes}`;
  } else {
    message.value = `${activeName()}的${moveName}打偏了！`;
  }

  timers.later(() => {
    fx.value = '';
    if (enemyHp.value <= 0) return enemyFainted();
    enemyTurn();
  }, 1100);
};

const enemyFainted = () => {
  const next = enemyIdx.value + 1;
  if (next >= props.enemies.length) return win();
  message.value = `${enemy.value.species.name}倒下了！對手派出了${props.enemies[next]!.species.name}！`;
  sfx.correct();
  timers.later(() => {
    enemyIdx.value = next;
    enemyHp.value = enemyMax.value;
    phase.value = 'choose';
  }, 1300);
};

const enemyTurn = () => {
  const dmg = enemyDamage(enemy.value.species, enemy.value.level, activeSpecies.value);
  message.value = `${enemy.value.species.name}發動攻擊！`;
  timers.later(() => {
    fx.value = 'partnerHit';
    hp[activeUid.value] = Math.max(0, activeHp.value - dmg);
    showPopup('partner', `-${dmg}`);
    sfx.hit();
  }, 400);
  timers.later(() => {
    fx.value = '';
    if (activeHp.value > 0) {
      message.value = '輪到你了！要用什麼招式？';
      phase.value = 'choose';
      return;
    }
    // 目前的字靈倒下：還有隊友就換人，沒有就輸了
    if (aliveBench.value.length > 0) {
      message.value = `${activeName()}累倒了！`;
      openSwitch(true);
      return;
    }
    message.value = `${activeName()}累倒了…`;
    sfx.lose();
    timers.later(() => emit('lost'), 1200);
  }, 1200);
};

const openSwitch = (forced: boolean) => {
  forcedSwitch.value = forced;
  phase.value = 'switch';
};

const switchTo = (uid: string) => {
  const wasForced = forcedSwitch.value;
  activeUid.value = uid;
  participated.add(uid);
  combo.value = 0;
  message.value = `上吧，${activeName()}！`;
  sfx.click();
  phase.value = 'busy';
  // 主動換人會用掉這一回合；倒下後換人則直接輪到自己
  timers.later(() => (wasForced ? (phase.value = 'choose') : enemyTurn()), 700);
};

const win = () => {
  // 每打倒一隻都給經驗值：上場過的拿全部，沒上場的隊友拿一半
  const total = props.enemies.reduce((sum, e) => sum + battleXp(e.level), 0);
  const levelUps: string[] = [];
  for (const c of props.team) {
    const xp = participated.has(c.uid) ? total : Math.round(total / 2);
    if (store.gainXp(c.uid, xp) > 0) {
      levelUps.push(`${creatureName(speciesOf(c), c.stage)} 升到 Lv ${c.level}`);
    }
  }
  const summary = `打贏了！隊伍得到 ${total} 經驗值${levelUps.length ? `，${levelUps.join('、')}！` : ''}`;
  message.value = summary;
  sfx.win();
  timers.later(() => emit('won', summary), 1500);
};
</script>

<style scoped lang="scss">
.arena {
  position: relative;
  height: clamp(230px, 38vh, 280px);
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
.pips {
  display: inline-flex;
  gap: 3px;
}
.pip {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: $negative;
}
.pip--mine {
  background: $positive;
}
.pip--down {
  background: #cbd5e1;
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
.bench {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.bench__member {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  border: 2px solid var(--app-line);
  border-radius: 14px;
  background: #fff;
  font: inherit;
  cursor: pointer;
  &:hover:not(:disabled) {
    border-color: $primary;
  }
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
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
