<template>
  <div>
    <!-- 戰場 -->
    <div class="arena app-card" :style="{ background }">
      <div class="side side--enemy">
        <FighterStatus
          :name="enemy.species.name"
          :level="enemy.level"
          :element="enemy.species.element"
          :hp="enemyHp"
          :max="enemyMax"
          :pips="enemies.map((e, i) => ({ key: i, down: i < enemyIdx }))"
        />
        <BattleFighter
          :species="enemy.species"
          :shiny="enemy.shiny"
          :creature-key="enemyIdx"
          :fx="fx === 'enemyHit' ? 'hit' : ''"
          :fainted="enemyHp <= 0"
          :popup="popupFor('enemy')"
        />
        <div v-if="enemyCharged" class="charge-tag">⚡ 蓄力中</div>
      </div>

      <div class="side side--partner">
        <BattleFighter
          :species="activeSpecies"
          :creature-key="active.uid"
          :evolved="(active.stage ?? 1) >= 2"
          :shiny="active.shiny"
          flip
          :fx="fx === 'partnerHit' ? 'hit' : fx === 'attack' ? 'lunge' : ''"
          :fainted="activeHp <= 0"
          :popup="popupFor('partner')"
        />
        <div v-if="guarded" class="guard-tag"><q-icon name="shield" /> 防禦中</div>
        <FighterStatus
          :name="creatureName(activeSpecies, active.stage)"
          :level="active.level"
          :element="activeSpecies.element"
          :hp="activeHp"
          :max="activeMax"
          :pips="team.map((c) => ({ key: c.uid, down: (hp[c.uid] ?? 0) <= 0 }))"
          mine
        />
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
      <div v-if="matchups.length" class="matchups q-mb-sm">
        <MatchupTag v-for="m in matchups" :key="m.text" :good="m.good">{{ m.text }}</MatchupTag>
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
    <SwitchBench
      v-else-if="phase === 'switch'"
      :team="team"
      :hp="hp"
      :active-uid="activeUid"
      :forced="forcedSwitch"
      class="q-mt-md"
      @pick="switchTo"
      @cancel="phase = 'choose'"
    />

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
import { getCorrectStreak } from 'src/modules/Vocabulary';
import {
  ELEMENTS,
  battleMatchups,
  effectiveness,
  formatEffectiveness as times,
} from '../../domain/elements';
import { creatureName, getSpecies } from '../../domain/species';
import {
  type MoveKind,
  type Opponent,
  MOVE_POWER,
  ULTIMATE_COMBO,
  battleXp,
  critChance,
  GUARD_REDUCTION,
  HEAVY_MULTIPLIER,
  enemyAction,
  enemyDamage,
  guardedDamage,
  healAmount,
  maxHp,
  playerDamage,
} from '../../domain/rules';
import { GUARD_KIND, MOVE_KIND, type Question, makeQuestion } from '../../domain/questions';
import { type OwnedCreature, useAdventureStore } from '../../store/useAdventureStore';
import MatchupTag from '../MatchupTag.vue';
import QuestionCard from '../QuestionCard.vue';
import BattleFighter from './BattleFighter.vue';
import FighterStatus from './FighterStatus.vue';
import SwitchBench from './SwitchBench.vue';

const props = defineProps<{
  /** 對手：野生字靈只有一隻；館主有好幾隻，依序上場 */
  enemies: Opponent[];
  team: OwnedCreature[];
  words: GameWord[];
  /** 選擇題的干擾選項從這裡挑；沒給就用 words（words 很少時要另外給） */
  choicePool?: GameWord[] | undefined;
  background: string;
  mode: 'wild' | 'gym';
  /** 開場訊息 */
  intro: string;
}>();
const emit = defineEmits<{
  (e: 'won', summary: string): void;
  (e: 'lost'): void;
  (e: 'leave'): void;
  (e: 'answered', word: GameWord, correct: boolean): void;
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
/** 館主字靈的狀態：上回合蓄力了、這隻補過血了 */
const enemyCharged = ref(false);
const enemyHealed = ref(false);
/** 我方擺好防禦：對手下一次行動時，攻擊傷害減半 */
const guarded = ref(false);

const combo = ref(0);
type Phase = 'choose' | 'question' | 'busy' | 'switch';
const phase = ref<Phase>('choose');
const forcedSwitch = ref(false);
const question = ref<Question | null>(null);
const message = ref(props.intro);
const fx = ref<'' | 'enemyHit' | 'partnerHit' | 'attack'>('');
const popup = ref<{ id: number; target: 'enemy' | 'partner'; text: string } | null>(null);
let popupId = 0;
type Action = MoveKind | 'guard';
let currentMove: Action = 'normal';

const activeName = () => creatureName(activeSpecies.value, active.value.stage);

const moves = computed(() => {
  const el = ELEMENTS[activeSpecies.value.element];
  return [
    {
      kind: 'normal' as const,
      name: '撞擊',
      desc: `看中文拼英文（有提示） · 威力 ${MOVE_POWER.normal.hit}`,
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
          ? `看中文拼英文（沒提示） · 威力 ${MOVE_POWER.ultimate.hit}`
          : `連擊 ${ULTIMATE_COMBO} 次解鎖`,
      color: 'deep-orange',
      textColor: 'white',
      disabled: combo.value < ULTIMATE_COMBO,
    },
    {
      kind: 'guard' as const,
      name: '防禦',
      desc: `聽發音選中文 · 下次受到的傷害 -${GUARD_REDUCTION * 100}%`,
      color: 'teal',
      textColor: 'white',
      disabled: false,
    },
  ];
});

/** 出招前提示屬性相剋 */
const matchups = computed(() =>
  battleMatchups(activeSpecies.value.element, enemy.value.species.element),
);

const popupFor = (target: 'enemy' | 'partner') =>
  popup.value?.target === target ? popup.value : null;

const showPopup = (target: 'enemy' | 'partner', text: string) => {
  popup.value = { id: ++popupId, target, text };
};

const useMove = (kind: Action) => {
  currentMove = kind;
  const word = deck.draw();
  // 必殺技不給提示；撞擊依熟練度給提示
  const streak = kind === 'ultimate' ? null : getCorrectStreak(word.english);
  const qKind = kind === 'guard' ? GUARD_KIND : MOVE_KIND[kind];
  question.value = makeQuestion(qKind, word, props.choicePool ?? props.words, streak);
  phase.value = 'question';
};

const onAnswered = (correct: boolean) => {
  if (question.value) {
    store.recordAnswer(question.value.word, correct);
    emit('answered', question.value.word, correct);
  }
  phase.value = 'busy';

  const move = currentMove;
  if (move === 'guard') return guard(correct);

  const crit = correct && Math.random() < critChance(store.recentAccuracy);
  const { damage, effectiveness } = playerDamage({
    attacker: activeSpecies.value,
    attackerLevel: active.value.level,
    attackerStage: active.value.stage ?? 1,
    defender: enemy.value.species,
    move,
    correct,
    crit,
  });

  combo.value = move === 'ultimate' || !correct ? 0 : combo.value + 1;
  const moveName = moves.value.find((m) => m.kind === move)?.name ?? '';

  if (damage > 0) {
    fx.value = 'attack';
    timers.later(() => {
      fx.value = 'enemyHit';
      enemyHp.value = Math.max(0, enemyHp.value - damage);
      const effText = effectiveness === 1 ? '' : ` ${times(effectiveness)}`;
      showPopup('enemy', `-${damage}${effText}${crit ? ' 暴擊！' : ''}`);
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

/** 防禦：答對就擺好架式（不影響連擊），答錯連擊歸零 */
const guard = (correct: boolean) => {
  guarded.value = correct;
  if (!correct) combo.value = 0;
  message.value = correct
    ? `${activeName()}擺好防禦架式！`
    : `${activeName()}想防禦，可是來不及了！`;
  if (correct) sfx.correct();
  timers.later(enemyTurn, 900);
};

const enemyFainted = () => {
  const next = enemyIdx.value + 1;
  if (next >= props.enemies.length) return win();
  message.value = `${enemy.value.species.name}倒下了！對手派出了${props.enemies[next]!.species.name}！`;
  sfx.correct();
  timers.later(() => {
    enemyIdx.value = next;
    enemyHp.value = enemyMax.value;
    enemyCharged.value = false;
    enemyHealed.value = false;
    phase.value = 'choose';
  }, 1300);
};

const backToPlayer = (text: string) => {
  message.value = text;
  phase.value = 'choose';
};

const enemyTurn = () => {
  const name = enemy.value.species.name;
  // 防禦只擋對手的下一次行動（對手蓄力或補血就白擋了）
  const wasGuarded = guarded.value;
  guarded.value = false;
  const action = enemyAction({
    isLeader: props.mode === 'gym',
    hp: enemyHp.value,
    maxHp: enemyMax.value,
    charged: enemyCharged.value,
    healed: enemyHealed.value,
  });

  if (action === 'charge') {
    enemyCharged.value = true;
    message.value = `${name}正在蓄力！下一回合會使出重擊！`;
    timers.later(() => backToPlayer('趁現在打倒牠，或是換上耐打的字靈！'), 1300);
    return;
  }
  if (action === 'heal') {
    enemyHealed.value = true;
    const amount = Math.min(healAmount(enemyMax.value), enemyMax.value - enemyHp.value);
    enemyHp.value += amount;
    message.value = `${name}吃了一顆樹果，恢復了體力！`;
    showPopup('enemy', `+${amount}`);
    timers.later(() => backToPlayer('輪到你了！要用什麼招式？'), 1300);
    return;
  }

  const heavy = action === 'heavy';
  enemyCharged.value = false;
  const base = enemyDamage(enemy.value.species, enemy.value.level, activeSpecies.value);
  const raw = heavy ? Math.round(base * HEAVY_MULTIPLIER) : base;
  const dmg = wasGuarded ? guardedDamage(raw) : raw;
  const eff = effectiveness(enemy.value.species.element, activeSpecies.value.element);
  const note = [
    eff > 1 ? '效果絕佳！' : eff < 1 ? '效果不太好…' : '',
    wasGuarded ? `${activeName()}擋下了一半的傷害！` : '',
  ].join('');
  message.value = `${name}${heavy ? '使出重擊' : '發動攻擊'}！${note}`;
  timers.later(() => {
    fx.value = 'partnerHit';
    hp[activeUid.value] = Math.max(0, activeHp.value - dmg);
    showPopup('partner', `-${dmg}${eff === 1 ? '' : ` ${times(eff)}`}`);
    sfx.hit();
  }, 400);
  timers.later(() => {
    fx.value = '';
    if (activeHp.value > 0) return backToPlayer('輪到你了！要用什麼招式？');
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
  guarded.value = false;
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
.guard-tag {
  position: absolute;
  left: 0;
  top: -6px;
  padding: 2px 10px;
  border-radius: 999px;
  background: #0d9488;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 800;
}
.charge-tag {
  position: absolute;
  right: 0;
  bottom: -4px;
  padding: 2px 10px;
  border-radius: 999px;
  background: #f97316;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 800;
  animation: pulse 0.8s ease-in-out infinite;
}
@keyframes pulse {
  50% {
    transform: scale(1.1);
  }
}
.side--partner {
  bottom: 8px;
  left: 12px;
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
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.matchups {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.move {
  min-height: 72px;
  padding: 6px 4px;
}
@media (max-width: 599px) {
  .moves {
    gap: 6px;
  }
  .move {
    min-height: 56px;
  }
}
</style>
