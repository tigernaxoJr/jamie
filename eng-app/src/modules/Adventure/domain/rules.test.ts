import { describe, expect, it } from 'vitest';
import { AREAS, leaderLevels } from './areas';
import { effectiveness, strongAgainst, weakAgainst } from './elements';
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

describe('element matchups', () => {
  it('剋制 2 倍、被剋 0.5 倍', () => {
    expect(effectiveness('fire', 'grass')).toBe(2);
    expect(effectiveness('grass', 'fire')).toBe(0.5);
    expect(effectiveness('fire', 'thunder')).toBe(1);
  });

  it('光不剋任何屬性，也不被任何屬性剋', () => {
    for (const el of ['fire', 'water', 'grass', 'thunder', 'earth', 'light'] as const) {
      expect(effectiveness('light', el)).toBe(1);
      expect(effectiveness(el, 'light')).toBe(1);
    }
  });

  it('查詢剋誰、怕誰', () => {
    expect(strongAgainst('earth')).toEqual(['thunder']);
    expect(weakAgainst('water')).toEqual(['grass', 'thunder']);
    expect(strongAgainst('light')).toEqual([]);
    expect(weakAgainst('light')).toEqual([]);
  });

  it('撞擊也吃屬性相剋', () => {
    const hit = (defender: number) =>
      playerDamage({
        attacker: getSpecies(1), // 火
        attackerLevel: 5,
        defender: getSpecies(defender),
        move: 'normal',
        correct: true,
        crit: false,
      });
    expect(hit(3).effectiveness).toBe(2); // 草
    expect(hit(3).damage).toBe(hit(4).damage * 2); // 土：沒有相剋
  });
});

describe('battle length', () => {
  it('沒有相剋時，同等級的野生字靈要答對 4 題以上才打得倒', () => {
    for (const area of AREAS) {
      const level = area.levels[1];
      for (const id of area.species) {
        const s = getSpecies(id);
        const { damage } = playerDamage({
          attacker: s,
          attackerLevel: level,
          defender: s,
          move: 'normal',
          correct: true,
          crit: false,
        });
        expect(Math.ceil(maxHp(s, level) / damage)).toBeGreaterThanOrEqual(4);
      }
    }
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
