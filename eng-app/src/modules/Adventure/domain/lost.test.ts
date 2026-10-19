import { describe, expect, it } from 'vitest';
import type { GameWord } from 'src/modules/Games/shared';
import { LOST_MAX, LOST_WIN_CANDY, addLostWord, lostRewardCandies } from './lost';

const word = (english: string): GameWord => ({
  english,
  chinese: '中文',
  answer: english,
  weight: 3,
});

describe('lost words', () => {
  it('答錯的字加進清單，不重複', () => {
    const once = addLostWord([], word('apple'));
    expect(once.map((w) => w.english)).toEqual(['apple']);
    expect(addLostWord(once, word('apple'))).toHaveLength(1);
  });

  it('只存需要的欄位', () => {
    expect(addLostWord([], word('apple'))[0]).toEqual({
      english: 'apple',
      chinese: '中文',
      answer: 'apple',
    });
  });

  it('超過上限時丟掉最早的', () => {
    let list: GameWord[] = [];
    for (let i = 0; i <= LOST_MAX; i++) list = addLostWord(list, word(`w${i}`));
    expect(list).toHaveLength(LOST_MAX);
    expect(list[0]!.english).toBe('w1');
  });

  it('找回越多字，糖果越多', () => {
    expect(lostRewardCandies(0)).toBe(LOST_WIN_CANDY);
    expect(lostRewardCandies(3)).toBeGreaterThan(lostRewardCandies(1));
  });
});
