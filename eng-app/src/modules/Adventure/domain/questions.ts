import { type GameWord, lettersOf, makeChoices, shuffle } from 'src/modules/Games/shared';
import type { CaptureDifficulty, MoveKind } from './rules';

/**
 * listen-zh：聽發音選中文
 * listen-en：聽發音選正確拼法
 * listen-spell：聽發音拼出單字
 * zh-en：看中文選英文
 * zh-spell：看中文拼出英文
 */
export type QuestionKind = 'listen-zh' | 'listen-en' | 'listen-spell' | 'zh-en' | 'zh-spell';

export interface Question {
  kind: QuestionKind;
  word: GameWord;
  /** 選擇題的選項；拼字題為空 */
  choices: GameWord[];
}

export const QUESTION_PROMPT: Record<QuestionKind, string> = {
  'listen-zh': '聽聽看，是什麼意思？',
  'listen-en': '聽聽看，是哪一個拼法？',
  'listen-spell': '聽聽看，拼出這個單字',
  'zh-en': '這個中文的英文是？',
  'zh-spell': '拼出這個中文的英文',
};

export const isListening = (k: QuestionKind) => k.startsWith('listen');
export const isSpelling = (k: QuestionKind) => k.endsWith('spell');

/** 捕捉難度 → 題型 */
export const CAPTURE_KIND: Record<CaptureDifficulty, QuestionKind> = {
  easy: 'listen-zh',
  normal: 'listen-en',
  hard: 'listen-spell',
};

/** 招式 → 題型 */
export const MOVE_KIND: Record<MoveKind, QuestionKind> = {
  normal: 'zh-en',
  element: 'listen-en',
  ultimate: 'zh-spell',
};

/** 拼法相近的干擾選項：開頭相同、長度接近的優先 */
const similarChoices = (target: GameWord, pool: readonly GameWord[], count: number) => {
  const t = target.answer.toLowerCase();
  const score = (w: GameWord) => {
    const a = w.answer.toLowerCase();
    let prefix = 0;
    while (prefix < a.length && a[prefix] === t[prefix]) prefix++;
    return prefix * 2 + (Math.abs(a.length - t.length) <= 1 ? 1 : 0) + Math.random();
  };
  const candidates = pool
    .filter((w) => w.answer.toLowerCase() !== t)
    .map((w) => ({ w, s: score(w) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, count - 1)
    .map((x) => x.w);
  return shuffle([target, ...candidates]);
};

export const makeQuestion = (
  kind: QuestionKind,
  word: GameWord,
  pool: readonly GameWord[],
): Question => {
  if (isSpelling(kind)) return { kind, word, choices: [] };
  const choices = kind === 'listen-en' ? similarChoices(word, pool, 4) : makeChoices(word, pool, 4);
  return { kind, word, choices };
};

/** 拼字題寬鬆比對：忽略大小寫、空白與標點 */
export const isSpellingCorrect = (input: string, word: GameWord) =>
  lettersOf(input) !== '' && lettersOf(input) === lettersOf(word.answer);
