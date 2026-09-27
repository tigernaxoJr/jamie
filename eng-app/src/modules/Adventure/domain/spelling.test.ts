import { describe, expect, it } from 'vitest';
import { letterTiles, spellHintFor } from './spelling';

describe('spelling hints', () => {
  it('越熟提示越少：字母方塊 → 第一個字母 → 沒提示', () => {
    expect(spellHintFor(0)).toBe('tiles');
    expect(spellHintFor(1)).toBe('first');
    expect(spellHintFor(2)).toBe('first');
    expect(spellHintFor(3)).toBe('none');
  });

  it('字母方塊是答案的字母打散，不含空白與符號，也不會剛好是正確順序', () => {
    for (let i = 0; i < 20; i++) {
      const tiles = letterTiles('ice-cream');
      expect([...tiles].sort().join('')).toBe([...'icecream'].sort().join(''));
      expect(tiles.join('')).not.toBe('icecream');
    }
    expect(letterTiles('zzz')).toEqual(['z', 'z', 'z']);
  });
});
