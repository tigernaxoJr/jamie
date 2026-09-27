import { describe, expect, it } from 'vitest';
import { TYPING_LEVELS, endlessLevel, lettersPerMinute, rollPowerUp, typingStars } from './levels';

describe('typing levels', () => {
  it('字母關卡都有設定字母', () => {
    for (const lv of TYPING_LEVELS) {
      if (lv.kind !== 'words') expect(lv.chars, lv.name).toBeTruthy();
    }
  });

  it('無盡模式分數越高越快，但有上限', () => {
    expect(endlessLevel(3000).speed).toBeGreaterThan(endlessLevel(0).speed);
    expect(endlessLevel(3000).spawnEvery).toBeLessThan(endlessLevel(0).spawnEvery);
    expect(endlessLevel(1e9).speed).toBe(12);
    expect(endlessLevel(1e9).maxItems).toBe(6);
  });

  it('愛心全滿時不會掉補血', () => {
    for (let i = 0; i < 50; i++) expect(rollPowerUp(true)).not.toBe('heal');
    expect(rollPowerUp(false, () => 0.5)).toBe('heal');
  });

  it('星等與打字速度', () => {
    expect(typingStars(0)).toBe(3);
    expect(typingStars(2)).toBe(2);
    expect(typingStars(3)).toBe(1);
    expect(lettersPerMinute(50, 30)).toBe(100);
    expect(lettersPerMinute(10, 0)).toBe(0);
  });
});
