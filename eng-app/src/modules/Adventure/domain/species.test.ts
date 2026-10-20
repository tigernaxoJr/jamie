import { describe, expect, it } from 'vitest';
import { SPECIES, creatureEnglish, creatureName, evolvedForm, getSpecies } from './species';

const ember = getSpecies(1);
const pebble = SPECIES.find((s) => !s.evolution)!;

describe('evolution', () => {
  it('三隻初始夥伴有專屬進化，新名字不和其他字靈重複', () => {
    const evolving = SPECIES.filter((s) => s.evolution);
    expect(evolving.map((s) => s.id)).toEqual([1, 2, 3]);
    const englishes = new Set(SPECIES.map((s) => s.english));
    for (const s of evolving) expect(englishes.has(s.evolution!.english)).toBe(false);
  });

  it('進化後的樣子換名字、加部件、換配件顏色', () => {
    const blaze = evolvedForm(ember);
    expect(blaze.name).toBe('焰焰');
    expect(blaze.english).toBe('Blaze');
    expect(blaze.meaning).toBe('火焰');
    expect(blaze.look.parts).toEqual([...ember.look.parts, 'wings']);
    expect(blaze.look.accent).toBe('#f97316');
    expect(blaze.id).toBe(ember.id);
    // 原本的資料不被改到
    expect(ember.look.parts).not.toContain('wings');
  });

  it('沒有專屬進化的字靈樣子不變', () => {
    expect(evolvedForm(pebble)).toBe(pebble);
  });

  it('名字：有專屬進化用新名字，沒有的加「超級」，英文維持原本的', () => {
    expect(creatureName(ember)).toBe(ember.name);
    expect(creatureName(ember, 2)).toBe('焰焰');
    expect(creatureEnglish(ember, 2)).toBe('Blaze');
    expect(creatureName(pebble, 2)).toBe(`超級${pebble.name}`);
    expect(creatureEnglish(pebble, 2)).toBe(pebble.english);
    expect(creatureEnglish(ember, 1)).toBe(ember.english);
  });
});
