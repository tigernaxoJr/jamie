import type { Rarity, Species } from './species';
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

/** 當天達成每日單字目標時，捕捉的額外能量 */
export const DAILY_BONUS_ENERGY = 2;

/** 打贏字靈後捕捉的額外能量 */
export const BATTLE_WIN_ENERGY = 3;

// ---------- 能力值與成長 ----------

export const maxHp = (s: Species, level: number) => s.baseHp + level * 4;
export const attack = (s: Species, level: number) => s.baseAtk + level * 2;

/** 升到下一級需要的經驗值 */
export const xpToNext = (level: number) => level * 20;

export const MAX_LEVEL = 30;

export const STARTER_LEVEL = 3;

// ---------- 對戰 ----------

export type MoveKind = 'normal' | 'element' | 'ultimate';

/** 招式威力；答錯時普通攻擊仍有一半威力，其他招式打偏 */
export const MOVE_POWER: Record<MoveKind, { hit: number; miss: number }> = {
  normal: { hit: 10, miss: 5 },
  element: { hit: 20, miss: 0 },
  ultimate: { hit: 40, miss: 0 },
};

/** 必殺技需要的連擊數 */
export const ULTIMATE_COMBO = 3;

/** 最近答對率越高，暴擊率越高（最高 30%） */
export const critChance = (recentAccuracy: number) => recentAccuracy * 0.3;
export const CRIT_MULTIPLIER = 1.5;

export interface DamageInput {
  attacker: Species;
  attackerLevel: number;
  defender: Species;
  move: MoveKind;
  correct: boolean;
  crit: boolean;
}

export const playerDamage = ({
  attacker,
  attackerLevel,
  defender,
  move,
  correct,
  crit,
}: DamageInput) => {
  const power = correct ? MOVE_POWER[move].hit : MOVE_POWER[move].miss;
  // 只有屬性技和必殺技吃屬性相剋
  const eff = move === 'normal' ? 1 : effectiveness(attacker.element, defender.element);
  const base = (power * attack(attacker, attackerLevel)) / 10;
  return { damage: Math.round(base * eff * (crit ? CRIT_MULTIPLIER : 1)), effectiveness: eff };
};

/** 野生字靈的攻擊，帶一點隨機 */
export const enemyDamage = (enemy: Species, level: number, target: Species) => {
  const eff = effectiveness(enemy.element, target.element);
  const roll = 0.8 + Math.random() * 0.4;
  return Math.max(1, Math.round(attack(enemy, level) * 0.6 * eff * roll));
};

/** 打贏野生字靈得到的經驗值 */
export const battleXp = (enemyLevel: number) => enemyLevel * 8 + 5;
export const CAPTURE_XP = 5;
