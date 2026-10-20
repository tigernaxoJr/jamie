import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ULTIMATE_COMBO,
  attack,
  critChance,
  enemyDamage,
  guardHeal,
  hpAfterHit,
  maxHp,
  playerDamage,
  ultimateCombo,
} from './rules';
import { SPECIES, type Species, getSpecies } from './species';
import { TRAITS, type Trait } from './traits';

/** 同一隻字靈換成別的特性，用來比較有沒有這個特性的差別 */
const withTrait = (s: Species, trait: Trait): Species => ({ ...s, trait });
const panda = getSpecies(41); // 強壯
const tiger = getSpecies(42); // 大力
const shell = getSpecies(14); // 堅硬

afterEach(() => vi.restoreAllMocks());

describe('traits', () => {
  it('每隻字靈都有特性，每種特性至少 5 隻', () => {
    const counts = new Map<Trait, number>();
    for (const s of SPECIES) {
      expect(TRAITS[s.trait]).toBeDefined();
      counts.set(s.trait, (counts.get(s.trait) ?? 0) + 1);
    }
    for (const trait of Object.keys(TRAITS) as Trait[]) {
      expect(counts.get(trait) ?? 0).toBeGreaterThanOrEqual(5);
    }
  });

  it('強壯血量多、大力攻擊高', () => {
    expect(maxHp(panda, 10)).toBeGreaterThan(maxHp(withTrait(panda, 'quick'), 10));
    expect(attack(tiger, 10)).toBeGreaterThan(attack(withTrait(tiger, 'quick'), 10));
  });

  it('堅硬的字靈不管是我方還是對手，受到的傷害都比較少', () => {
    const hitShell = (defender: Species) =>
      playerDamage({
        attacker: tiger,
        attackerLevel: 10,
        defender,
        move: 'element',
        correct: true,
        crit: false,
      }).damage;
    expect(hitShell(shell)).toBeLessThan(hitShell(withTrait(shell, 'quick')));

    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(enemyDamage(tiger, 10, shell)).toBeLessThan(
      enemyDamage(tiger, 10, withTrait(shell, 'quick')),
    );
  });

  it('閃耀暴擊率高、靈巧比較快能用必殺技', () => {
    const sun = getSpecies(8);
    expect(critChance(0.5, sun)).toBeCloseTo(critChance(0.5) + 0.2);
    expect(critChance(0.5, panda)).toBe(critChance(0.5));
    expect(ultimateCombo(getSpecies(20))).toBeLessThan(ULTIMATE_COMBO); // Key
    expect(ultimateCombo(panda)).toBe(ULTIMATE_COMBO);
  });

  it('頑強：會被打倒時撐住剩 1 點血，沒有要倒就照常扣血', () => {
    expect(hpAfterHit(10, 30, true)).toEqual({ hp: 1, endured: true });
    expect(hpAfterHit(10, 30, false)).toEqual({ hp: 0, endured: false });
    expect(hpAfterHit(10, 4, true)).toEqual({ hp: 6, endured: false });
  });

  it('療癒的字靈防禦成功時回血，其他字靈不會', () => {
    expect(guardHeal(getSpecies(22), 100)).toBe(15); // Pillow
    expect(guardHeal(panda, 100)).toBe(0);
  });
});
