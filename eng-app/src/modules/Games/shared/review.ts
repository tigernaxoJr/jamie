import { shuffle } from './deck';
import type { GameWord } from './types';

/** 複習時答錯的字的權重（其他補進來的字是 1） */
export const REVIEW_WEIGHT = 4;
/** 至少補幾個其他字，遊戲才有干擾選項 */
const MIN_FILLERS = 6;

/**
 * 複習用的單字：答錯的字權重調高，再從目前範圍補幾個其他字
 * （數量至少到遊戲需要的最少單字數）。
 */
export const reviewDeck = (
  focus: readonly GameWord[],
  pool: readonly GameWord[],
  minWords: number,
): GameWord[] => {
  const keys = new Set(focus.map((w) => w.answer));
  const need = Math.max(MIN_FILLERS, minWords - focus.length);
  const fillers = shuffle(pool.filter((w) => !keys.has(w.answer)))
    .slice(0, need)
    .map((w) => ({ ...w, weight: 1 }));
  return [...focus.map((w) => ({ ...w, weight: REVIEW_WEIGHT })), ...fillers];
};
