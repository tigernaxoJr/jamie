import { describe, expect, it } from 'vitest';
import { AREAS, leaderLevels } from './areas';
import {
  battleMatchups,
  effectiveness,
  matchupSummary,
  strongAgainst,
  weakAgainst,
} from './elements';
import {
  EVOLVE_LEVEL,
  EVOLVE_MASTERED,
  CHARGE_CHANCE,
  type EnemyState,
  attack,
  enemyAction,
  guardedDamage,
  hitImpact,
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

  it('對戰提示只列出有相剋的方向', () => {
    expect(battleMatchups('fire', 'grass')).toEqual([
      { text: '🔥 你的攻擊效果絕佳 ×2', good: true },
      { text: expect.stringContaining('對手的攻擊不太痛 ×0.5') as string, good: true },
    ]);
    expect(battleMatchups('grass', 'fire').map((m) => m.good)).toEqual([false, false]);
    expect(battleMatchups('fire', 'thunder')).toEqual([]);
  });

  it('相剋摘要', () => {
    expect(matchupSummary('water')).toBe('剋 🔥🗻 · 怕 🌿⚡');
    expect(matchupSummary('earth')).toBe('剋 ⚡ · 怕 💧');
    expect(matchupSummary('light')).toBe('不怕任何屬性');
  });

  it('查詢剋誰、怕誰', () => {
    expect(strongAgainst('earth')).toEqual(['thunder']);
    expect(weakAgainst('water')).toEqual(['grass', 'thunder']);
    expect(strongAgainst('light')).toEqual([]);
    expect(weakAgainst('light')).toEqual([]);
  });

  it('除了光，每個屬性都有剋的、也有怕的（沒有穩贏的屬性）', () => {
    for (const el of ['fire', 'water', 'grass', 'thunder', 'earth'] as const) {
      expect(strongAgainst(el).length).toBeGreaterThan(0);
      expect(weakAgainst(el).length).toBeGreaterThan(0);
    }
    expect(effectiveness('water', 'earth')).toBe(2);
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

describe('enemyAction', () => {
  const leader: EnemyState = { isLeader: true, hp: 100, maxHp: 100, charged: false, healed: false };
  const never = () => 0.99;
  const always = () => 0;

  it('野生字靈只會普通攻擊', () => {
    expect(enemyAction({ ...leader, isLeader: false, hp: 10 }, always)).toBe('attack');
  });

  it('蓄力後下一回合一定重擊', () => {
    expect(enemyAction({ ...leader, charged: true }, never)).toBe('heavy');
    expect(enemyAction({ ...leader, isLeader: false, charged: true }, never)).toBe('heavy');
  });

  it('館主字靈血量低時補血，每隻只補一次', () => {
    expect(enemyAction({ ...leader, hp: 30 }, never)).toBe('heal');
    expect(enemyAction({ ...leader, hp: 30, healed: true }, never)).toBe('attack');
  });

  it('館主字靈依機率蓄力', () => {
    expect(enemyAction(leader, () => CHARGE_CHANCE / 2)).toBe('charge');
    expect(enemyAction(leader, never)).toBe('attack');
  });
});

describe('guard', () => {
  it('防禦讓傷害減半，至少 1 點', () => {
    expect(guardedDamage(20)).toBe(10);
    expect(guardedDamage(1)).toBe(1);
  });
});

describe('hitImpact', () => {
  const plain = { combo: 0, crit: false, ultimate: false, superEffective: false };

  it('普通一擊不放大、不震動', () => {
    expect(hitImpact(plain)).toEqual({ scale: 1, shake: false });
  });

  it('連擊越多數字越大，連擊夠多就震動', () => {
    expect(hitImpact({ ...plain, combo: 2 }).scale).toBeGreaterThan(
      hitImpact({ ...plain, combo: 1 }).scale,
    );
    expect(hitImpact({ ...plain, combo: 4 }).shake).toBe(true);
  });

  it('必殺技一定震動', () => {
    expect(hitImpact({ ...plain, ultimate: true }).shake).toBe(true);
  });
});
