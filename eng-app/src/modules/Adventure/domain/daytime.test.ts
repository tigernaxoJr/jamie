import { describe, expect, it } from 'vitest';
import { NIGHT_BONUS, WILD_WEIGHT, isNight, lovesNight, wildWeight } from './daytime';
import { AREAS } from './areas';
import { SPECIES, getSpecies } from './species';

const at = (hour: number) => new Date(2026, 9, 20, hour, 30);

describe('daytime', () => {
  it('晚上 6 點到早上 6 點是夜晚', () => {
    expect([5, 6, 12, 17, 18, 23, 0].map((h) => isNight(at(h)))).toEqual([
      true,
      false,
      false,
      false,
      true,
      true,
      true,
    ]);
  });

  it('喜歡夜晚的字靈都存在，而且分散在好幾區', () => {
    const lovers = SPECIES.filter(lovesNight);
    expect(lovers).toHaveLength(10);
    const areas = AREAS.filter((a) => a.species.some((id) => lovesNight(getSpecies(id))));
    expect(areas.length).toBeGreaterThanOrEqual(4);
  });

  it('夜晚時喜歡夜晚的字靈比較容易出現，白天照稀有度', () => {
    const moon = SPECIES.find((s) => s.english === 'Moon')!;
    const sun = SPECIES.find((s) => s.english === 'Sun')!;
    expect(wildWeight(moon, false)).toBe(WILD_WEIGHT[moon.rarity]);
    expect(wildWeight(moon, true)).toBe(WILD_WEIGHT[moon.rarity] * NIGHT_BONUS);
    expect(wildWeight(sun, true)).toBe(WILD_WEIGHT[sun.rarity]);
  });
});
