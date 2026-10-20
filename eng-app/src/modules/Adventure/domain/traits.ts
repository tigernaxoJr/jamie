import {
  ARMOR_DAMAGE,
  BRIGHT_CRIT,
  COZY_HEAL,
  QUICK_COMBO,
  STRONG_ATTACK,
  TOUGH_HP,
} from './rules';

/**
 * 字靈特性：每隻一種，從英文名字的意思來（Shell 貝殼 → 堅硬、Pillow 枕頭 → 療癒），
 * 看特性也是在複習這個字。效果數值在 rules.ts。
 * 閃耀、靈巧、療癒只有我方字靈會發動（對手不會暴擊、連擊或防禦）。
 */
export type Trait = 'tough' | 'strong' | 'armor' | 'bright' | 'quick' | 'cozy' | 'tenacious';

export interface TraitInfo {
  name: string;
  emoji: string;
  /** 效果說明 */
  effect: string;
}

const pct = (x: number) => `${Math.round(x * 100)}%`;

export const TRAITS: Record<Trait, TraitInfo> = {
  tough: { name: '強壯', emoji: '❤️', effect: `血量 +${pct(TOUGH_HP - 1)}` },
  strong: { name: '大力', emoji: '👊', effect: `攻擊 +${pct(STRONG_ATTACK - 1)}` },
  armor: { name: '堅硬', emoji: '🛡️', effect: `受到的傷害 -${pct(1 - ARMOR_DAMAGE)}` },
  bright: { name: '閃耀', emoji: '🌟', effect: `暴擊率 +${pct(BRIGHT_CRIT)}` },
  quick: { name: '靈巧', emoji: '💨', effect: `連擊 ${QUICK_COMBO} 次就能用必殺技` },
  cozy: { name: '療癒', emoji: '🍵', effect: `防禦成功時回復 ${pct(COZY_HEAL)} 血量` },
  tenacious: { name: '頑強', emoji: '💪', effect: '每場對戰一次，被打倒時撐住剩 1 點血' },
};
