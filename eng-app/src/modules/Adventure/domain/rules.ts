import type { Rarity, Species } from './species';
import type { Trait } from './traits';
import { effectiveness } from './elements';

// ---------- 捕捉 ----------

/** 捕捉時可選的題目難度 */
export type CaptureDifficulty = 'easy' | 'normal' | 'hard';

export const CAPTURE_ROUNDS = 3;

/** 每種難度答對可以累積的能量 */
export const CAPTURE_ENERGY: Record<CaptureDifficulty, number> = { easy: 1, normal: 2, hard: 3 };

export const MAX_ENERGY = CAPTURE_ROUNDS * CAPTURE_ENERGY.hard;

/** 稀有度對應的捕捉率範圍：[能量 0 時, 能量滿時] */
const CAPTURE_RANGE: Record<Rarity, [number, number]> = {
  common: [0.35, 0.95],
  uncommon: [0.2, 0.8],
  rare: [0.1, 0.6],
  legendary: [0.05, 0.45],
};

/** 捕捉率，能量越高越容易抓到 */
export const captureRate = (rarity: Rarity, energy: number): number => {
  const [min, max] = CAPTURE_RANGE[rarity];
  const ratio = Math.min(1, Math.max(0, energy / MAX_ENERGY));
  return min + (max - min) * ratio;
};

/** 字靈網的等級：能量越高網越高級（只影響外觀，捕捉率照 captureRate） */
export type NetTier = 'basic' | 'great' | 'ultra';

/** 丟網動畫的階段（idle：還沒丟，在左下角輕輕跳） */
export type NetStage = 'idle' | 'fly' | 'wrap' | 'drop' | 'shake' | 'caught' | 'broke';

export const NET_TIER_NAME: Record<NetTier, string> = {
  basic: '字靈網',
  great: '藍色字靈網',
  ultra: '金色字靈網',
};

export const netTier = (energy: number): NetTier =>
  energy >= 7 ? 'ultra' : energy >= 4 ? 'great' : 'basic';

/**
 * 網落地後搖幾下。抓到時越有把握搖越少（捕捉率 70% 以上 1 下、40% 以上 2 下、其他 3 下）；
 * 掙脫時隨機在第 1～3 下彈開，讓每次都有懸念。
 */
export const netShakes = (rate: number, success: boolean, rand: number = Math.random()): number => {
  if (!success) return 1 + Math.min(2, Math.floor(rand * 3));
  return rate >= 0.7 ? 1 : rate >= 0.4 ? 2 : 3;
};

/** 當天達成每日單字目標時，捕捉的額外能量 */
export const DAILY_BONUS_ENERGY = 2;

/** 打贏字靈後捕捉的額外能量 */
export const BATTLE_WIN_ENERGY = 3;

// ---------- 特性（名稱與說明在 domain/traits.ts） ----------

/** 強壯：血量倍率 */
export const TOUGH_HP = 1.2;
/** 大力：攻擊倍率 */
export const STRONG_ATTACK = 1.15;
/** 堅硬：受到的傷害倍率 */
export const ARMOR_DAMAGE = 0.85;
/** 閃耀：暴擊率加成 */
export const BRIGHT_CRIT = 0.2;
/** 靈巧：連擊幾次就能用必殺技 */
export const QUICK_COMBO = 2;
/** 療癒：防禦成功時回復最大血量的比例 */
export const COZY_HEAL = 0.15;

/** 有這個特性時乘上倍率，沒有就是 1 */
const traitBonus = (s: Species, trait: Trait, bonus: number) => (s.trait === trait ? bonus : 1);

// ---------- 能力值與成長 ----------

/** 進化後能力提升的倍率 */
export const EVOLVED_BONUS = 1.3;
const stageBonus = (stage: number) => (stage >= 2 ? EVOLVED_BONUS : 1);

/** 血量倍率：讓每場對戰多打幾回合、多練幾個字（沒有相剋時野生字靈約 6 下） */
export const HP_SCALE = 2;

export const maxHp = (s: Species, level: number, stage = 1) =>
  Math.round(
    (s.baseHp + level * 4) * HP_SCALE * stageBonus(stage) * traitBonus(s, 'tough', TOUGH_HP),
  );
export const attack = (s: Species, level: number, stage = 1) =>
  Math.round((s.baseAtk + level * 2) * stageBonus(stage) * traitBonus(s, 'strong', STRONG_ATTACK));

// ---------- 進化與隊伍 ----------

/** 進化條件：等級，以及字靈所在地區那一級的單字熟練數 */
export const EVOLVE_LEVEL = 10;
export const EVOLVE_MASTERED = 15;

export const canEvolve = (level: number, stage: number, masteredWords: number) =>
  stage < 2 && level >= EVOLVE_LEVEL && masteredWords >= EVOLVE_MASTERED;

/** 隊伍最多幾隻 */
export const TEAM_SIZE = 3;

/** 挑戰館主前，要在該區收服幾種字靈 */
export const GYM_REQUIRED_CAUGHT = 3;

/** 升到下一級需要的經驗值 */
export const xpToNext = (level: number) => level * 20;

export const MAX_LEVEL = 30;

export const STARTER_LEVEL = 3;

// ---------- 對戰 ----------

/** 對戰中的對手 */
export interface Opponent {
  species: Species;
  level: number;
  shiny?: boolean;
}

export type MoveKind = 'normal' | 'element' | 'ultimate';

/** 招式威力；答錯時普通攻擊仍有一半威力，其他招式打偏 */
export const MOVE_POWER: Record<MoveKind, { hit: number; miss: number }> = {
  normal: { hit: 10, miss: 5 },
  element: { hit: 20, miss: 0 },
  ultimate: { hit: 40, miss: 0 },
};

/** 防禦：答對時，對手下一次攻擊的傷害減少多少 */
export const GUARD_REDUCTION = 0.5;

export const guardedDamage = (damage: number) =>
  Math.max(1, Math.round(damage * (1 - GUARD_REDUCTION)));

/**
 * 打中時的畫面回饋：連擊越多、暴擊、必殺、效果絕佳，傷害數字越大；夠大就震動畫面。
 * 只影響畫面，不影響傷害。
 */
export const hitImpact = (o: {
  combo: number;
  crit: boolean;
  ultimate: boolean;
  superEffective: boolean;
}) => {
  const scale =
    1 +
    0.15 * Math.min(o.combo, 4) +
    (o.crit ? 0.3 : 0) +
    (o.ultimate ? 0.5 : 0) +
    (o.superEffective ? 0.2 : 0);
  return { scale: Math.round(scale * 100) / 100, shake: scale >= 1.5 };
};

/** 必殺技需要的連擊數 */
export const ULTIMATE_COMBO = 3;

/** 這隻字靈要連擊幾次才能用必殺技（靈巧的比較少） */
export const ultimateCombo = (s: Species) => (s.trait === 'quick' ? QUICK_COMBO : ULTIMATE_COMBO);

/** 最近答對率越高，暴擊率越高（最高 30%，閃耀的字靈再加） */
export const critChance = (recentAccuracy: number, s?: Species) =>
  recentAccuracy * 0.3 + (s?.trait === 'bright' ? BRIGHT_CRIT : 0);
export const CRIT_MULTIPLIER = 1.5;

export interface DamageInput {
  attacker: Species;
  attackerLevel: number;
  attackerStage?: number;
  defender: Species;
  move: MoveKind;
  correct: boolean;
  crit: boolean;
}

export const playerDamage = ({
  attacker,
  attackerLevel,
  attackerStage = 1,
  defender,
  move,
  correct,
  crit,
}: DamageInput) => {
  const power = correct ? MOVE_POWER[move].hit : MOVE_POWER[move].miss;
  const eff = effectiveness(attacker.element, defender.element);
  const base = (power * attack(attacker, attackerLevel, attackerStage)) / 10;
  const armor = traitBonus(defender, 'armor', ARMOR_DAMAGE);
  return {
    damage: Math.round(base * eff * (crit ? CRIT_MULTIPLIER : 1) * armor),
    effectiveness: eff,
  };
};

/** 野生字靈的攻擊，帶一點隨機 */
export const enemyDamage = (enemy: Species, level: number, target: Species) => {
  // 目標進化與否不影響受到的傷害；進化的好處是血量與攻擊力
  const eff = effectiveness(enemy.element, target.element);
  const roll = 0.8 + Math.random() * 0.4;
  const armor = traitBonus(target, 'armor', ARMOR_DAMAGE);
  return Math.max(1, Math.round(attack(enemy, level) * 0.6 * eff * roll * armor));
};

/**
 * 被打之後的血量。頑強的字靈每場對戰一次，被打倒時撐住剩 1 點血。
 * canEndure：這隻是頑強的字靈，而且這場還沒撐過。
 */
export const hpAfterHit = (hp: number, damage: number, canEndure: boolean) =>
  canEndure && damage >= hp
    ? { hp: 1, endured: true }
    : { hp: Math.max(0, hp - damage), endured: false };

/** 防禦成功時回復的血量（療癒的字靈才有） */
export const guardHeal = (s: Species, max: number) =>
  s.trait === 'cozy' ? Math.round(max * COZY_HEAL) : 0;

// ---------- 館主字靈的行動 ----------

/**
 * 對手這回合做什麼：
 * attack 普通攻擊；charge 蓄力（這回合不攻擊，下回合重擊）；heavy 重擊；heal 補血。
 * 野生字靈只會普通攻擊，館主字靈會蓄力和補血。
 */
export type EnemyAction = 'attack' | 'charge' | 'heavy' | 'heal';

/** 館主字靈每回合蓄力的機率 */
export const CHARGE_CHANCE = 0.25;
/** 重擊的傷害倍率 */
export const HEAVY_MULTIPLIER = 1.8;
/** 血量低於這個比例時補血（每隻只補一次） */
export const HEAL_THRESHOLD = 0.35;
/** 補血量（最大血量的比例） */
export const HEAL_RATIO = 0.3;

export interface EnemyState {
  isLeader: boolean;
  hp: number;
  maxHp: number;
  /** 上回合蓄力了 */
  charged: boolean;
  /** 這隻已經補過血 */
  healed: boolean;
}

export const enemyAction = (s: EnemyState, rng = Math.random): EnemyAction => {
  if (s.charged) return 'heavy';
  if (!s.isLeader) return 'attack';
  if (!s.healed && s.hp > 0 && s.hp <= s.maxHp * HEAL_THRESHOLD) return 'heal';
  return rng() < CHARGE_CHANCE ? 'charge' : 'attack';
};

export const healAmount = (max: number) => Math.round(max * HEAL_RATIO);

/** 打贏野生字靈得到的經驗值 */
export const battleXp = (enemyLevel: number) => enemyLevel * 8 + 5;
export const CAPTURE_XP = 5;
