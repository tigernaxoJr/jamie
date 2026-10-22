import { describe, expect, it } from 'vitest';
import {
  dynamicWildWeight,
  rollShinyWithStreak,
  streakBonusCandy,
  streakRareMultiplier,
  STREAK_TIER_MAX,
  STREAK_TIER_WARMUP,
} from './streak';
import { type Species } from './species';
import { WILD_WEIGHT } from './daytime';
import { SHINY_CHANCE } from './shiny';

const mockSpecies = (rarity: Species['rarity'], english = 'Bird'): Species => ({
  id: 1,
  name: '測試靈',
  english,
  element: 'grass',
  rarity,
  description: '測試用',
  look: {
    color: '#000000',
    belly: '#ffffff',
    shape: 'round',
    eye: 'round',
    mouth: 'smile',
    ears: 'none',
    tail: 'none',
  },
  baseHp: 50,
  baseAtk: 10,
  baseDef: 10,
  baseSpd: 10,
  moves: [],
});

describe('streak', () => {
  it('streakRareMultiplier gives expected bonuses at tiers', () => {
    expect(streakRareMultiplier(0)).toBe(1);
    expect(streakRareMultiplier(STREAK_TIER_WARMUP - 1)).toBe(1);
    expect(streakRareMultiplier(STREAK_TIER_WARMUP)).toBe(1.5);
    expect(streakRareMultiplier(STREAK_TIER_MAX)).toBe(2.5);
    expect(streakRareMultiplier(10)).toBe(2.5);
  });

  it('streakBonusCandy gives bonus candy when streak is high enough', () => {
    expect(streakBonusCandy(0)).toBe(0);
    expect(streakBonusCandy(2)).toBe(0);
    expect(streakBonusCandy(3)).toBe(1);
    expect(streakBonusCandy(5)).toBe(1);
  });

  it('rollShinyWithStreak rolls once normally, and twice on streak >= max', () => {
    let callCount = 0;
    const rng = () => {
      callCount++;
      return 1; // always false
    };

    rollShinyWithStreak(0, rng);
    expect(callCount).toBe(1);

    callCount = 0;
    rollShinyWithStreak(STREAK_TIER_MAX, rng);
    expect(callCount).toBe(2);

    // If first roll succeeds
    callCount = 0;
    const luckyRng = () => {
      callCount++;
      return SHINY_CHANCE / 2;
    };
    const result = rollShinyWithStreak(STREAK_TIER_MAX, luckyRng);
    expect(result).toBe(true);
    expect(callCount).toBe(1);
  });

  it('dynamicWildWeight applies daytime and streak bonuses', () => {
    const common = mockSpecies('common');
    const rare = mockSpecies('rare');

    // Common is unaffected by streak
    expect(dynamicWildWeight(common, false, 0)).toBe(WILD_WEIGHT.common);
    expect(dynamicWildWeight(common, false, 5)).toBe(WILD_WEIGHT.common);

    // Rare has base weight without bonuses
    expect(dynamicWildWeight(rare, false, 0)).toBe(WILD_WEIGHT.rare);

    // Streak bonus
    expect(dynamicWildWeight(rare, false, 3)).toBe(WILD_WEIGHT.rare * 1.5);
    expect(dynamicWildWeight(rare, false, 5)).toBe(WILD_WEIGHT.rare * 2.5);
  });
});
