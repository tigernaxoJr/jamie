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
  // 水怕草和雷兩種，所以也剋兩種；土因此也有弱點
  water: ['fire', 'earth'],
  thunder: ['water'],
  earth: ['thunder'],
  // 光不剋任何屬性，但也沒有屬性剋得了光
  light: [],
};

/** 這個屬性剋制哪些屬性 */
export const strongAgainst = (el: Element): readonly Element[] => STRONG_AGAINST[el];

/** 哪些屬性剋制這個屬性 */
export const weakAgainst = (el: Element): Element[] =>
  (Object.keys(STRONG_AGAINST) as Element[]).filter((a) => STRONG_AGAINST[a].includes(el));

export const SUPER_EFFECTIVE = 2;
export const NOT_EFFECTIVE = 0.5;

/** 屬性相剋倍率：剋制 2、被剋 0.5、其他 1 */
export const effectiveness = (attacker: Element, defender: Element): number => {
  if (STRONG_AGAINST[attacker].includes(defender)) return SUPER_EFFECTIVE;
  if (STRONG_AGAINST[defender].includes(attacker)) return NOT_EFFECTIVE;
  return 1;
};

export interface Matchup {
  text: string;
  /** 對我方有利 */
  good: boolean;
}

/** 倍率顯示，例如 ×2、×0.5 */
export const formatEffectiveness = (eff: number) => `×${eff}`;

/** 對戰中出招前的相剋提示：我方打對手、對手打我方，只列出有相剋的 */
export const battleMatchups = (mine: Element, theirs: Element): Matchup[] => {
  const attackEff = effectiveness(mine, theirs);
  const defendEff = effectiveness(theirs, mine);
  const list: Matchup[] = [];
  if (attackEff !== 1) {
    list.push({
      text: `${ELEMENTS[mine].emoji} 你的攻擊${attackEff > 1 ? '效果絕佳' : '效果不好'} ${formatEffectiveness(attackEff)}`,
      good: attackEff > 1,
    });
  }
  if (defendEff !== 1) {
    list.push({
      text: `${ELEMENTS[theirs].emoji} 對手的攻擊${defendEff > 1 ? '很痛' : '不太痛'} ${formatEffectiveness(defendEff)}`,
      good: defendEff < 1,
    });
  }
  return list;
};

/** 圖鑑卡片上的相剋摘要，例如「剋 ⚡ · 怕 💧」；光屬性「不怕任何屬性」 */
export const matchupSummary = (el: Element): string => {
  const strong = strongAgainst(el).map((e) => ELEMENTS[e].emoji);
  const weak = weakAgainst(el).map((e) => ELEMENTS[e].emoji);
  const parts = [
    strong.length ? `剋 ${strong.join('')}` : '',
    weak.length ? `怕 ${weak.join('')}` : '',
  ];
  return parts.filter(Boolean).join(' · ') || '不怕任何屬性';
};
