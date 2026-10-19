import { describe, expect, it } from 'vitest';
import type { GameWord } from 'src/modules/Games/shared';
import { AREAS, leaderLevels } from './areas';
import { MAX_LEVEL } from './rules';
import { REMATCH_LEVEL_BONUS, REMATCH_WORDS, rematchLevels, rematchWords } from './rematch';

const word = (english: string, weight: number): GameWord => ({
  english,
  chinese: english,
  answer: english,
  weight,
});

describe('rematch', () => {
  it('館主字靈比第一次挑戰高幾級，但不超過上限', () => {
    const meadow = AREAS[0]!;
    expect(rematchLevels(meadow)).toEqual(leaderLevels(meadow).map((l) => l + REMATCH_LEVEL_BONUS));
    for (const area of AREAS) {
      expect(Math.max(...rematchLevels(area))).toBeLessThanOrEqual(MAX_LEVEL);
    }
  });

  it('挑最不熟的字', () => {
    const words = [
      ...Array.from({ length: REMATCH_WORDS }, (_, i) => word(`weak${i}`, 3)),
      ...Array.from({ length: REMATCH_WORDS }, (_, i) => word(`known${i}`, 1)),
    ];
    const picked = rematchWords(words);
    expect(picked).toHaveLength(REMATCH_WORDS);
    expect(picked.every((w) => w.english.startsWith('weak'))).toBe(true);
  });

  it('字不夠多時全部都出', () => {
    expect(rematchWords([word('a', 1), word('b', 4)]).map((w) => w.english)).toEqual(['b', 'a']);
  });
});
