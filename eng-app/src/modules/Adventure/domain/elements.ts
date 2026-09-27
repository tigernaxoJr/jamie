export type Element = 'fire' | 'water' | 'grass' | 'thunder' | 'earth' | 'light';

export interface ElementInfo {
  name: string;
  emoji: string;
  color: string;
  /** 屬性技的招式名稱 */
  move: string;
  /** 必殺技的招式名稱 */
  ultimate: string;
  /** 徽章文字顏色（淺色底要用深色字） */
  ink?: string;
}

export const ELEMENTS: Record<Element, ElementInfo> = {
  fire: { name: '火', emoji: '🔥', color: '#f97316', move: '火花彈', ultimate: '烈焰風暴' },
  water: { name: '水', emoji: '💧', color: '#0ea5e9', move: '泡泡砲', ultimate: '巨浪衝擊' },
  grass: { name: '草', emoji: '🌿', color: '#22c55e', move: '葉片旋風', ultimate: '森林之怒' },
  thunder: {
    name: '雷',
    emoji: '⚡',
    color: '#facc15',
    move: '電光擊',
    ultimate: '萬雷轟頂',
    ink: '#422006',
  },
  earth: { name: '土', emoji: '🗻', color: '#a16207', move: '落石', ultimate: '大地震' },
  light: { name: '光', emoji: '✨', color: '#f472b6', move: '閃光', ultimate: '星光爆發' },
};

/** 攻擊方 → 被剋制的一方 */
const STRONG_AGAINST: Record<Element, Element[]> = {
  fire: ['grass'],
  grass: ['water'],
  water: ['fire'],
  thunder: ['water'],
  earth: ['thunder'],
  light: ['fire', 'water', 'grass', 'thunder', 'earth'],
};

/** 屬性相剋倍率：剋制 1.5、被剋 0.75、其他 1 */
export const effectiveness = (attacker: Element, defender: Element): number => {
  if (STRONG_AGAINST[attacker].includes(defender)) return 1.5;
  if (STRONG_AGAINST[defender].includes(attacker)) return 0.75;
  return 1;
};
