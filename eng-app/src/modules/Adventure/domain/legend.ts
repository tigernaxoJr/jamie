import { AREAS } from './areas';
import { SPECIES, type Species } from './species';

// ---------- 傳說挑戰：集滿所有徽章後，傳說字靈才會現身（野外和字靈蛋都不會出現） ----------

/** 傳說字靈 */
export const LEGEND: Species = SPECIES.find((s) => s.rarity === 'legendary')!;
/** 傳說字靈的等級（收服後也是這個等級） */
export const LEGEND_LEVEL = 25;
/** 已經收服過，再打贏的糖果 */
export const LEGEND_REPEAT_CANDY = 10;

export const isLegendUnlocked = (badgeCount: number) => badgeCount >= AREAS.length;

/** 野外遭遇和字靈蛋都不會出現傳說字靈 */
export const canAppearInWild = (s: Species) => s.rarity !== 'legendary';
