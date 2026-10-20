import { describe, expect, it } from 'vitest';
import { getArea } from './areas';
import { LEGEND } from './legend';
import { RADAR_CHANCE, pickWithRadar, radarCandidates } from './radar';

describe('radar', () => {
  it('只能找還沒收服、會出現在野外的字靈', () => {
    const meadow = getArea('meadow')!;
    expect(radarCandidates(meadow, (id) => id === 4)).toEqual(
      meadow.species.filter((id) => id !== 4),
    );
    expect(radarCandidates(meadow, () => true)).toEqual([]);
    const festival = getArea('festival')!;
    expect(radarCandidates(festival, () => false)).not.toContain(LEGEND.id);
  });

  it('雷達中了就遇到目標，沒中或沒有目標就照原本的方式抽', () => {
    const roll = () => 'normal';
    expect(pickWithRadar('target', roll, () => RADAR_CHANCE - 0.01)).toBe('target');
    expect(pickWithRadar('target', roll, () => RADAR_CHANCE)).toBe('normal');
    expect(pickWithRadar(null, roll, () => 0)).toBe('normal');
  });
});
