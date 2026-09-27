import { getWordsByCategories } from 'src/modules/Vocabulary';
import type { GameWord } from './types';

/** 去掉括號補充，例如 "have (has, had)" → "have" */
export const toAnswer = (english: string): string =>
  english
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export const isLetter = (ch: string): boolean => /^[a-z]$/i.test(ch);

/** 答案中需要玩家拼出的字母（小寫） */
export const lettersOf = (answer: string): string => answer.toLowerCase().replace(/[^a-z]/g, '');

export const randomInt = (maxExclusive: number): number => Math.floor(Math.random() * maxExclusive);

export const shuffle = <T>(items: readonly T[]): T[] => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j] as T, arr[i] as T];
  }
  return arr;
};

/** 讀取指定類別的遊戲單字（依答案去除重複） */
export const loadGameWords = (
  categoryIds: string[],
  filter?: (w: GameWord) => boolean,
): GameWord[] => {
  const seen = new Set<string>();
  const result: GameWord[] = [];
  for (const w of getWordsByCategories(categoryIds)) {
    const gw: GameWord = { english: w.english, chinese: w.chinese, answer: toAnswer(w.english) };
    const key = gw.answer.toLowerCase();
    if (!gw.answer || seen.has(key) || (filter && !filter(gw))) continue;
    seen.add(key);
    result.push(gw);
  }
  return result;
};

/**
 * 抽牌堆：洗牌後依序抽出，抽完自動重洗，且不會連續抽到同一個字。
 */
export class WordDeck {
  private pile: GameWord[] = [];
  private last: GameWord | undefined;

  constructor(private readonly words: readonly GameWord[]) {}

  draw(exclude: ReadonlySet<string> = new Set()): GameWord {
    for (let attempt = 0; attempt < this.words.length * 2; attempt++) {
      if (this.pile.length === 0) this.pile = shuffle(this.words);
      const w = this.pile.pop() as GameWord;
      const blocked = exclude.has(w.answer) || (w === this.last && this.words.length > 1);
      if (!blocked) {
        this.last = w;
        return w;
      }
    }
    // 所有字都被排除時，退而求其次
    this.last = this.words[randomInt(this.words.length)] as GameWord;
    return this.last;
  }
}

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
