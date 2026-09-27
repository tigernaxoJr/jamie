import { baseAnswer, getWordsByCategories, practiceWeight } from 'src/modules/Vocabulary';
import type { GameWord } from './types';
import { shuffle } from './deck';

export { WordDeck, randomInt, shuffle } from './deck';

export const isLetter = (ch: string): boolean => /^[a-z]$/i.test(ch);

/** 答案中需要玩家拼出的字母（小寫） */
export const lettersOf = (answer: string): string => answer.toLowerCase().replace(/[^a-z]/g, '');

/**
 * 讀取指定類別的遊戲單字（依答案去除重複）。
 * 每個字帶有出題權重：越不熟的字在遊戲裡越常出現。
 */
export const loadGameWords = (
  categoryIds: string[],
  filter?: (w: GameWord) => boolean,
): GameWord[] => {
  const byKey = new Map<string, GameWord>();
  const now = Date.now();
  for (const w of getWordsByCategories(categoryIds)) {
    const gw: GameWord = {
      english: w.english,
      chinese: w.chinese,
      answer: baseAnswer(w.english),
      weight: practiceWeight(w, now),
    };
    const key = gw.answer.toLowerCase();
    if (!gw.answer || (filter && !filter(gw))) continue;
    const prev = byKey.get(key);
    // 同一個答案出現在多個主題：保留第一個，權重取最高
    if (prev) prev.weight = Math.max(prev.weight ?? 1, gw.weight ?? 1);
    else byKey.set(key, gw);
  }
  return [...byKey.values()];
};

/**
 * 產生選擇題選項：正確答案 + 干擾選項（答案與中文都不重複）。
 */
export const makeChoices = (
  target: GameWord,
  pool: readonly GameWord[],
  count: number,
): GameWord[] => {
  const distractors = shuffle(
    pool.filter((w) => w.answer !== target.answer && w.chinese !== target.chinese),
  ).slice(0, count - 1);
  return shuffle([target, ...distractors]);
};
