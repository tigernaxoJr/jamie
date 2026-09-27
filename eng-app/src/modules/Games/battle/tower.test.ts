import { describe, expect, it } from 'vitest';
import {
  BOSS_EVERY,
  PERKS,
  attackDamage,
  availablePerks,
  checkpoints,
  critEvery,
  isBossFloor,
  monsterFor,
  rollPerks,
  startingPerkPicks,
} from './tower';

describe('battle tower', () => {
  it('每 5 層一個魔王，而且魔王比同區的怪物強', () => {
    expect(isBossFloor(BOSS_EVERY)).toBe(true);
    expect(isBossFloor(BOSS_EVERY + 1)).toBe(false);
    const boss = monsterFor(5);
    expect(boss.boss).toBe(true);
    expect(boss.hp).toBeGreaterThan(monsterFor(4, 0.99).hp);
  });

  it('越高層怪物血越多', () => {
    for (let f = 2; f < 40; f++) {
      if (isBossFloor(f) || isBossFloor(f - 1)) continue;
      expect(monsterFor(f, 0).hp).toBeGreaterThanOrEqual(monsterFor(f - 1, 0).hp);
    }
  });

  it('很高的樓層也有怪物（魔王輪完一圈變超級版）', () => {
    expect(monsterFor(99, 0.5).name).toBeTruthy();
    expect(monsterFor(30).name).toMatch(/^超級/);
  });

  it('拿滿的增益卡不會再出現，愛心全滿不出回復藥水', () => {
    const ids = (p: { id: string }[]) => p.map((x) => x.id);
    expect(ids(availablePerks({}, 5, 5))).not.toContain('heal');
    expect(ids(availablePerks({}, 3, 5))).toContain('heal');
    expect(ids(availablePerks({ crit: 1 }, 5, 5))).not.toContain('crit');
    expect(ids(availablePerks({ power: 2 }, 5, 5))).toContain('power');
  });

  it('一次抽 3 張不重複', () => {
    const picks = rollPerks({}, 3, 5);
    expect(picks).toHaveLength(3);
    expect(new Set(picks.map((p) => p.id)).size).toBe(3);
  });

  it('傷害與爆擊', () => {
    expect(attackDamage({}, false)).toBe(1);
    expect(attackDamage({ power: 2 }, true)).toBe(6);
    expect(critEvery({})).toBe(3);
    expect(critEvery({ crit: 1 })).toBe(2);
    expect(PERKS.power.max).toBe(3);
  });

  it('打倒魔王後可以從下一層出發，並補發增益卡', () => {
    expect(checkpoints(0)).toEqual([1]);
    expect(checkpoints(10)).toEqual([1, 6, 11]);
    expect(startingPerkPicks(1)).toBe(0);
    expect(startingPerkPicks(11)).toBe(2);
  });
});
