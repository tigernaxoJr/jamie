import type { Species } from './species';
import { lovesNight, NIGHT_BONUS, WILD_WEIGHT } from './daytime';
import { SHINY_CHANCE } from './shiny';

// ---------- 探索熱度（Streak Chain）機制 ----------

/** 探索熱度分級門檻 */
export const STREAK_TIER_WARMUP = 3;
export const STREAK_TIER_MAX = 5;

/** Streak 對 Rare 權重的乘數加成 */
export const streakRareMultiplier = (streak: number): number => {
  if (streak >= STREAK_TIER_MAX) return 2.5;
  if (streak >= STREAK_TIER_WARMUP) return 1.5;
  return 1;
};

/** Streak 對色違 rollShiny 的重骰次數（一般 1 次判定，Streak >= 5 獲得額外 1 次判定機會） */
export const rollShinyWithStreak = (streak: number, rng = Math.random): boolean => {
  const rolls = streak >= STREAK_TIER_MAX ? 2 : 1;
  for (let i = 0; i < rolls; i++) {
    if (rng() < SHINY_CHANCE) return true;
  }
  return false;
};

/** Streak 帶來的額外放生/收服糖果獎勵 */
export const streakBonusCandy = (streak: number): number => {
  return streak >= STREAK_TIER_WARMUP ? 1 : 0;
};

/**
 * 計算字靈出現權重：結合晝夜與 Streak
 *
 * @param s 字靈物種
 * @param night 是否為夜晚
 * @param streak 當前連續面對次數
 */
export const dynamicWildWeight = (
  s: Species,
  night: boolean,
  streak: number = 0,
): number => {
  let base = WILD_WEIGHT[s.rarity];

  // 夜行性加成
  if (night && lovesNight(s)) {
    base *= NIGHT_BONUS;
  }

  // 稀有度加成（Streak）
  if (s.rarity === 'rare' || s.rarity === 'legendary') {
    base *= streakRareMultiplier(streak);
  }

  return base;
};
