import { describe, expect, it } from 'vitest';
import { STICKERS, type StickerInput, emptyStats, stickerStates } from './stickers';
import { SPECIES } from './species';

const input = (o: Partial<StickerInput> = {}): StickerInput => ({
  creatures: [],
  badges: 0,
  completedAreas: 0,
  stats: emptyStats(),
  ...o,
});
const earned = (s: StickerInput) =>
  stickerStates(s)
    .filter((x) => x.earned)
    .map((x) => x.sticker.id);

describe('stickers', () => {
  it('貼紙 id 不重複，目標都大於 0', () => {
    expect(new Set(STICKERS.map((s) => s.id)).size).toBe(STICKERS.length);
    expect(STICKERS.every((s) => s.goal > 0)).toBe(true);
  });

  it('新存檔一張都沒有', () => {
    expect(earned(input())).toEqual([]);
  });

  it('收服字靈：同一種只算一次，色違、進化、等級各有貼紙', () => {
    const creatures = [
      { speciesId: 1, level: 20, stage: 2 },
      { speciesId: 1, level: 3, shiny: true },
      { speciesId: 4, level: 3 },
    ];
    const s = input({ creatures });
    expect(earned(s)).toEqual(['first-friend', 'shiny', 'evolve', 'level-20']);
    expect(stickerStates(s).find((x) => x.sticker.id === 'catch-10')!.value).toBe(2);
  });

  it('進度不超過目標', () => {
    const s = input({ stats: { ...emptyStats(), spelled: 120 } });
    const states = stickerStates(s);
    expect(states.find((x) => x.sticker.id === 'spell-50')).toMatchObject({
      earned: true,
      value: 50,
    });
    expect(states.find((x) => x.sticker.id === 'spell-200')).toMatchObject({
      earned: false,
      value: 120,
    });
  });

  it('夜晚和傳說字靈的貼紙看收服的物種', () => {
    const id = (english: string) => SPECIES.find((s) => s.english === english)!.id;
    const legendary = SPECIES.find((s) => s.rarity === 'legendary')!;
    const creatures = ['Moon', 'Star', 'Lantern'].map((e) => ({ speciesId: id(e), level: 5 }));
    creatures.push({ speciesId: legendary.id, level: 25 });
    expect(earned(input({ creatures }))).toEqual(expect.arrayContaining(['night', 'legend']));
  });
});
