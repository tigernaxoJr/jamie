import type { GameWord } from 'src/modules/Games/shared';
import { type Area, leaderLevels } from './areas';
import { MAX_LEVEL } from './rules';

// ---------- 館主重賽：拿到徽章後再挑戰，字靈更強、專考不熟的單字 ----------

/** 重賽時館主字靈多幾級 */
export const REMATCH_LEVEL_BONUS = 5;
/** 重賽出幾個字 */
export const REMATCH_WORDS = 20;
/** 打贏重賽的糖果 */
export const REMATCH_CANDY = 5;

export const rematchLevels = (area: Area): number[] =>
  leaderLevels(area).map((level) => Math.min(MAX_LEVEL, level + REMATCH_LEVEL_BONUS));

/**
 * 重賽出題：挑最不熟的 REMATCH_WORDS 個字（權重高的優先，同權重隨機）。
 */
export const rematchWords = (words: readonly GameWord[], rng = Math.random): GameWord[] =>
  words
    .map((w) => ({ w, key: (w.weight ?? 1) + rng() * 0.5 }))
    .sort((a, b) => b.key - a.key)
    .slice(0, REMATCH_WORDS)
    .map((x) => x.w);
