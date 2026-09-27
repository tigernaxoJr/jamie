import { describe, expect, it } from 'vitest';
import { AREAS, leaderLevels } from './areas';
import {
  EVOLVE_LEVEL,
  EVOLVE_MASTERED,
  attack,
  canEvolve,
  captureRate,
  maxHp,
  playerDamage,
} from './rules';
import { SPECIES, getSpecies } from './species';

const bubble = getSpecies(2);

describe('evolution', () => {
  it('等級與熟練單字數都要達標，而且只能進化一次', () => {
    expect(canEvolve(EVOLVE_LEVEL, 1, EVOLVE_MASTERED)).toBe(true);
    expect(canEvolve(EVOLVE_LEVEL - 1, 1, EVOLVE_MASTERED)).toBe(false);
    expect(canEvolve(EVOLVE_LEVEL, 1, EVOLVE_MASTERED - 1)).toBe(false);
    expect(canEvolve(EVOLVE_LEVEL, 2, EVOLVE_MASTERED)).toBe(false);
  });

  it('進化後血量與攻擊提升 30%', () => {
    expect(maxHp(bubble, 10, 2)).toBe(Math.round(maxHp(bubble, 10, 1) * 1.3));
    expect(attack(bubble, 10, 2)).toBe(Math.round(attack(bubble, 10, 1) * 1.3));
  });

  it('進化後打出的傷害比較高', () => {
    const base = {
      attacker: bubble,
      attackerLevel: 10,
      defender: getSpecies(4),
      move: 'normal' as const,
      correct: true,
      crit: false,
    };
    expect(playerDamage({ ...base, attackerStage: 2 }).damage).toBeGreaterThan(
      playerDamage(base).damage,
    );
  });
});

describe('capture', () => {
  it('能量越多越好抓，傳說字靈最難抓', () => {
    expect(captureRate('common', 9)).toBeGreaterThan(captureRate('common', 0));
    expect(captureRate('legendary', 9)).toBeLessThan(captureRate('rare', 9));
  });
});

describe('areas', () => {
  it('每一區都有 3 隻館主字靈，而且都是存在的字靈', () => {
    const ids = new Set(SPECIES.map((s) => s.id));
    for (const area of AREAS) {
      expect(area.leader.team).toHaveLength(3);
      expect(area.leader.team.every((id) => ids.has(id))).toBe(true);
    }
  });

  it('館主字靈比該區野生字靈強', () => {
    for (const area of AREAS) {
      expect(Math.min(...leaderLevels(area))).toBeGreaterThan(area.levels[1]);
    }
  });

  it('解鎖鏈：每一區（第一區除外）都由前一區的館主解鎖', () => {
    AREAS.forEach((area, i) => {
      if (i === 0) expect(area.unlockAfter).toBeUndefined();
      else expect(area.unlockAfter).toBe(AREAS[i - 1]!.id);
    });
  });
});
