import { describe, expect, it } from 'vitest';
import type { AnswerRecord } from './QuizWord';
import { practiceWeight } from './practice';

const rec = (count: number, consecutive: number, lastTime = 0): AnswerRecord => ({
  count,
  consecutive,
  lastTime,
});
const NOW = 1_800_000_000_000;
const DAY = 24 * 60 * 60 * 1000;

describe('practiceWeight', () => {
  it('連續答錯越多次權重越高，最多 4', () => {
    const w1 = practiceWeight({ errorRec: rec(1, 1), correctRec: rec(0, 0) }, NOW);
    const w2 = practiceWeight({ errorRec: rec(2, 2), correctRec: rec(0, 0) }, NOW);
    const w9 = practiceWeight({ errorRec: rec(9, 9, NOW), correctRec: rec(0, 0) }, NOW);
    expect(w2).toBeGreaterThan(w1);
    expect(w9).toBe(4);
  });

  it('最近才答錯的字比很久以前答錯的更常出現', () => {
    const recent = practiceWeight({ errorRec: rec(1, 1, NOW - DAY), correctRec: rec(0, 0) }, NOW);
    const old = practiceWeight({ errorRec: rec(1, 1, NOW - 30 * DAY), correctRec: rec(0, 0) }, NOW);
    expect(recent).toBeGreaterThan(old);
  });

  it('熟練的字權重 1，沒練過的字權重 2', () => {
    expect(practiceWeight({ errorRec: rec(2, 0), correctRec: rec(5, 3) }, NOW)).toBe(1);
    expect(practiceWeight({ errorRec: rec(0, 0), correctRec: rec(0, 0) }, NOW)).toBe(2);
  });
});
