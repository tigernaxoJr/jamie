import type { Area } from './areas';
import { canAppearInWild } from './legend';
import { getSpecies } from './species';

// ---------- 字靈雷達：花糖果鎖定一隻還沒收服的字靈，在牠的地區探險時比較容易遇到 ----------

/** 鎖定一次要幾顆糖果（收服後雷達自動關掉） */
export const RADAR_COST = 5;

/** 每次遭遇直接遇到雷達目標的機率；沒中就照稀有度抽（也可能抽到牠） */
export const RADAR_CHANCE = 0.35;

export interface RadarTarget {
  areaId: string;
  speciesId: number;
}

/** 這一區可以用雷達找的字靈：還沒收服、會出現在野外 */
export const radarCandidates = (area: Area, isCaught: (speciesId: number) => boolean) =>
  area.species.filter((id) => !isCaught(id) && canAppearInWild(getSpecies(id)));

/** 遭遇時先看雷達：有目標而且這次中了就是牠，否則照原本的方式抽 */
export const pickWithRadar = <T>(target: T | null, roll: () => T, rng = Math.random): T =>
  target !== null && rng() < RADAR_CHANCE ? target : roll();
