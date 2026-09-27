import { describe, expect, it } from 'vitest';
import { WordDeck } from './deck';
import type { GameWord } from './types';

const word = (answer: string, weight?: number): GameWord => ({
  english: answer,
  chinese: answer,
  answer,
  ...(weight === undefined ? {} : { weight }),
});

describe('WordDeck', () => {
  it('權重越高出現越多次', () => {
    const deck = new WordDeck([word('weak', 4), word('a'), word('b'), word('c')]);
    const counts: Record<string, number> = {};
    for (let i = 0; i < 700; i++) {
      const w = deck.draw();
      counts[w.answer] = (counts[w.answer] ?? 0) + 1;
    }
    // 一輪 7 張：weak 4 張、其他各 1 張
    expect(counts.weak).toBeGreaterThan(counts.a! * 2.5);
  });

  it('不會連續抽到同一個字', () => {
    const deck = new WordDeck([word('weak', 4), word('a')]);
    let last = '';
    for (let i = 0; i < 200; i++) {
      const w = deck.draw();
      expect(w.answer).not.toBe(last);
      last = w.answer;
    }
  });

  it('可以排除畫面上已經有的字', () => {
    const deck = new WordDeck([word('a', 3), word('b'), word('c')]);
    for (let i = 0; i < 20; i++) expect(deck.draw(new Set(['a'])).answer).not.toBe('a');
  });
});
