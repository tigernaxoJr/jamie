import { describe, expect, it } from 'vitest';
import { STAGES, UPGRADES, shipStats, starsFor } from './campaign';

describe('space campaign', () => {
  it('星等：沒受傷又準確才有 3 星', () => {
    expect(starsFor(0, 0)).toBe(3);
    expect(starsFor(0, 3)).toBe(2);
    expect(starsFor(1, 0)).toBe(2);
    expect(starsFor(2, 0)).toBe(1);
  });

  it('星星越多飛船越強，全部升級都拿得到', () => {
    expect(shipStats(0)).toEqual({ shields: 3, misfireCooldown: 700, bombs: 0, speedFactor: 1 });
    const max = shipStats(STAGES.length * 3);
    expect(max).toEqual({ shields: 4, misfireCooldown: 350, bombs: 2, speedFactor: 0.85 });
    expect(Math.max(...UPGRADES.map((u) => u.needStars))).toBeLessThanOrEqual(STAGES.length * 3);
  });

  it('關卡越後面越難', () => {
    for (let i = 1; i < STAGES.length; i++) {
      expect(STAGES[i]!.speed).toBeGreaterThan(STAGES[i - 1]!.speed);
      expect(STAGES[i]!.goal).toBeGreaterThanOrEqual(STAGES[i - 1]!.goal);
    }
  });
});
