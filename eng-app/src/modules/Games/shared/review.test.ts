import { describe, expect, it } from 'vitest';
import { REVIEW_WEIGHT, reviewDeck } from './review';
import type { GameWord } from './types';

const word = (answer: string): GameWord => ({ english: answer, chinese: answer, answer });
const pool = 'abcdefghij'.split('').map(word);

describe('reviewDeck', () => {
  it('答錯的字權重調高，其他字補進來但不重複', () => {
    const deck = reviewDeck([word('a'), word('b')], pool, 4);
    expect(deck.filter((w) => w.weight === REVIEW_WEIGHT).map((w) => w.answer)).toEqual(['a', 'b']);
    expect(new Set(deck.map((w) => w.answer)).size).toBe(deck.length);
    expect(deck.length).toBeGreaterThanOrEqual(4);
  });

  it('範圍裡的字不夠時，有多少用多少', () => {
    expect(reviewDeck([word('a')], [word('a'), word('b')], 6)).toHaveLength(2);
  });
});
