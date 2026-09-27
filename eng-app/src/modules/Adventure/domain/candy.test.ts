import { describe, expect, it } from 'vitest';
import {
  CORRECT_PER_CANDY,
  DAILY_CANDY_LIMIT,
  WIN_BONUS_CANDY,
  cappedCandies,
  candiesForGame,
} from './candy';

describe('candy', () => {
  it('依答對題數給糖果，勝利有額外獎勵', () => {
    expect(candiesForGame(CORRECT_PER_CANDY * 4, false)).toBe(4);
    expect(candiesForGame(CORRECT_PER_CANDY * 4, true)).toBe(4 + WIN_BONUS_CANDY);
    expect(candiesForGame(CORRECT_PER_CANDY - 1, false)).toBe(0);
  });

  it('一題都沒答對就沒有糖果（勝利也一樣）', () => {
    expect(candiesForGame(0, true)).toBe(0);
  });

  it('每天有上限', () => {
    expect(cappedCandies(5, 0)).toBe(5);
    expect(cappedCandies(5, DAILY_CANDY_LIMIT - 2)).toBe(2);
    expect(cappedCandies(5, DAILY_CANDY_LIMIT)).toBe(0);
  });
});
