import { describe, expect, it } from 'vitest';
import { SHINY_CHANCE, rollShiny, shinyColor, shinyLook } from './shiny';
import { SPECIES } from './species';

describe('shiny', () => {
  it('依機率決定是不是色違', () => {
    expect(rollShiny(() => SHINY_CHANCE / 2)).toBe(true);
    expect(rollShiny(() => SHINY_CHANCE)).toBe(false);
  });

  it('換出來的顏色是合法的 #rrggbb，而且和原本不同', () => {
    for (const hex of ['#4ade80', '#38bdf8', '#f97316', '#ffffff', '#9ca3af', '#000000']) {
      const out = shinyColor(hex);
      expect(out).toMatch(/^#[0-9a-f]{6}$/);
      expect(out).not.toBe(hex);
    }
  });

  it('每隻字靈的色違外觀都和一般外觀不同，部件不變', () => {
    for (const s of SPECIES) {
      const look = shinyLook(s.look);
      expect(look.color).not.toBe(s.look.color);
      expect(look.parts).toEqual(s.look.parts);
    }
  });
});
