import type { Area } from './areas';
import type { Rarity } from './species';

/** 一顆字靈蛋要幾顆糖果 */
export const EGG_COST = 15;

/** 蛋孵出來時，有多少機率優先孵出還沒收服的字靈 */
const NEW_SPECIES_CHANCE = 0.7;

/** 稀有度權重（和野外遇到的比例一樣，傳說字靈很難孵到） */
const WEIGHT: Record<Rarity, number> = { common: 6, uncommon: 3, rare: 1, legendary: 0.5 };

export interface EggCandidate {
  speciesId: number;
  rarity: Rarity;
  area: Area;
}

export interface Hatched {
  speciesId: number;
  level: number;
}

/**
 * 孵蛋：從已解鎖地區的字靈裡依稀有度抽一隻，
 * 大多數時候（70%）會優先抽還沒收服的，讓糖果能幫忙完成圖鑑。
 * 等級是那個地區野生字靈的最低等級。
 */
export const hatchEgg = (
  candidates: readonly EggCandidate[],
  isCaught: (speciesId: number) => boolean,
  rng = Math.random,
): Hatched | null => {
  if (candidates.length === 0) return null;
  const fresh = candidates.filter((c) => !isCaught(c.speciesId));
  const pool = fresh.length > 0 && rng() < NEW_SPECIES_CHANCE ? fresh : candidates;
  const total = pool.reduce((sum, c) => sum + WEIGHT[c.rarity], 0);
  let r = rng() * total;
  const pick = pool.find((c) => (r -= WEIGHT[c.rarity]) < 0) ?? pool[pool.length - 1]!;
  return { speciesId: pick.speciesId, level: pick.area.levels[0] };
};
