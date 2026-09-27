import { describe, expect, it } from 'vitest';
import { AREAS } from './areas';
import { type EggCandidate, hatchEgg } from './egg';
import { getSpecies } from './species';

const meadow = AREAS[0]!;
const candidates: EggCandidate[] = meadow.species.map((id) => ({
  speciesId: id,
  rarity: getSpecies(id).rarity,
  area: meadow,
}));

describe('hatchEgg', () => {
  it('沒有可以孵的字靈時回傳 null', () => {
    expect(hatchEgg([], () => false)).toBeNull();
  });

  it('孵出來的是已解鎖地區的字靈，等級是地區最低等級', () => {
    for (let i = 0; i < 50; i++) {
      const h = hatchEgg(candidates, () => false)!;
      expect(meadow.species).toContain(h.speciesId);
      expect(h.level).toBe(meadow.levels[0]);
    }
  });

  it('大多數時候優先孵出還沒收服的字靈', () => {
    const caught = new Set(meadow.species.slice(1));
    let fresh = 0;
    for (let i = 0; i < 400; i++) {
      if (!caught.has(hatchEgg(candidates, (id) => caught.has(id))!.speciesId)) fresh++;
    }
    expect(fresh / 400).toBeGreaterThan(0.6);
  });
});
