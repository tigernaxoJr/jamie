import { describe, expect, it } from 'vitest';
import { nameWordOf } from './nameWord';
import { getSpecies } from './species';

describe('nameWordOf', () => {
  const seed = getSpecies(5);

  it('題庫有這個字就用題庫的', () => {
    const bank = { english: 'seed', chinese: '種子', answer: 'seed', weight: 2 };
    expect(nameWordOf(seed, bank)).toBe(bank);
  });

  it('題庫沒有時用字靈的英文名字與意思', () => {
    expect(nameWordOf(seed, null)).toEqual({
      english: seed.english.toLowerCase(),
      chinese: seed.meaning,
      answer: seed.english.toLowerCase(),
    });
  });
});
