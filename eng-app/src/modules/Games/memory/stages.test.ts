import { describe, expect, it } from 'vitest';
import { MEMORY_STAGES, endlessRound, memoryStars } from './stages';

describe('memory stages', () => {
  it('每一對牌的兩面都不一樣，牌數能排成 4 欄', () => {
    for (const s of MEMORY_STAGES) {
      for (const [a, b] of s.kinds) expect(a, s.name).not.toBe(b);
      expect((s.pairs * 2) % 4, s.name).toBe(0);
    }
  });

  it('無盡模式越後面牌越多、平均每對的時間越少', () => {
    const perPair = (r: number) => endlessRound(r).timeLimit! / endlessRound(r).pairs;
    expect(endlessRound(0).pairs).toBe(4);
    expect(endlessRound(5).pairs).toBe(8);
    expect(perPair(6)).toBeLessThan(perPair(2));
    expect(perPair(50)).toBeGreaterThan(0);
  });

  it('星等看翻錯次數', () => {
    expect(memoryStars(3, 6)).toBe(3);
    expect(memoryStars(6, 6)).toBe(2);
    expect(memoryStars(7, 6)).toBe(1);
  });
});
