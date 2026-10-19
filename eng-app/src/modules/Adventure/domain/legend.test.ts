import { describe, expect, it } from 'vitest';
import { AREAS } from './areas';
import { LEGEND, LEGEND_LEVEL, canAppearInWild, isLegendUnlocked } from './legend';
import { MAX_LEVEL } from './rules';

describe('legend', () => {
  it('有一隻傳說字靈，不會在野外出現', () => {
    expect(LEGEND.rarity).toBe('legendary');
    expect(canAppearInWild(LEGEND)).toBe(false);
  });

  it('集滿所有徽章才解鎖', () => {
    expect(isLegendUnlocked(AREAS.length - 1)).toBe(false);
    expect(isLegendUnlocked(AREAS.length)).toBe(true);
  });

  it('等級比最後一區的館主高，不超過上限', () => {
    expect(LEGEND_LEVEL).toBeGreaterThan(AREAS[AREAS.length - 1]!.levels[1] + 3);
    expect(LEGEND_LEVEL).toBeLessThanOrEqual(MAX_LEVEL);
  });
});
