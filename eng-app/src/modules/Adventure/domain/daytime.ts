import type { Rarity, Species } from './species';

/** 晚上 6 點到早上 6 點是夜晚（用裝置的時間） */
export const NIGHT_START = 18;
export const DAY_START = 6;

export const isNight = (date: Date = new Date()): boolean => {
  const h = date.getHours();
  return h >= NIGHT_START || h < DAY_START;
};

/** 喜歡夜晚的字靈：從英文名字的意思挑（會發光的、夜空裡的、睡覺用的） */
const NIGHT_LOVERS = new Set([
  'Glow',
  'Candle',
  'Star',
  'Pillow',
  'Shadow',
  'Moon',
  'Comet',
  'Lantern',
  'Firework',
  'Wish',
]);

export const lovesNight = (s: Species): boolean => NIGHT_LOVERS.has(s.english);

/** 野生字靈出現的權重（依稀有度） */
export const WILD_WEIGHT: Record<Rarity, number> = {
  common: 6,
  uncommon: 3,
  rare: 1,
  legendary: 0.5,
};

/** 夜晚時喜歡夜晚的字靈權重乘上這個倍數 */
export const NIGHT_BONUS = 3;

export const wildWeight = (s: Species, night: boolean): number =>
  WILD_WEIGHT[s.rarity] * (night && lovesNight(s) ? NIGHT_BONUS : 1);
