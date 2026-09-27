export interface Leader {
  name: string;
  emoji: string;
  /** 徽章名稱 */
  badge: string;
  /** 出場的字靈（依序） */
  team: number[];
}

export interface Area {
  id: string;
  name: string;
  emoji: string;
  description: string;
  /** 題庫級別（Category 的 parent id），出題會用這個級別底下的所有主題 */
  wordLevel: string;
  /** 野生字靈的等級範圍 */
  levels: [number, number];
  /** 會出現的字靈編號 */
  species: number[];
  /** 背景漸層 */
  background: string;
  /** 解鎖條件：打贏這一區的館主 */
  unlockAfter?: string;
  /** 館主：在這區收服足夠字靈後可以挑戰，打贏拿到徽章 */
  leader: Leader;
}

export const AREAS: readonly Area[] = [
  {
    id: 'meadow',
    name: '微風草原',
    emoji: '🌼',
    description: '綠油油的草地，最適合新手探險。',
    wordLevel: '1',
    levels: [1, 3],
    species: [4, 5, 6, 7, 8, 3],
    leader: { name: '小葵', emoji: '👧', badge: '花朵徽章', team: [5, 4, 6] },
    background: 'linear-gradient(180deg, #bae6fd 0%, #dcfce7 55%, #86efac 100%)',
  },
  {
    id: 'forest',
    name: '螢光森林',
    emoji: '🌲',
    description: '大樹遮住了陽光，聽說晚上會有會發光的字靈。',
    wordLevel: '2',
    levels: [3, 5],
    species: [9, 10, 11, 12, 13, 1],
    leader: { name: '阿森', emoji: '🧑', badge: '森林徽章', team: [9, 11, 13] },
    background: 'linear-gradient(180deg, #14532d 0%, #166534 50%, #4d7c0f 100%)',
    unlockAfter: 'meadow',
  },
  {
    id: 'beach',
    name: '星星海灘',
    emoji: '🏖️',
    description: '沙灘上有好多貝殼，海浪裡好像藏著什麼。',
    wordLevel: '3',
    levels: [5, 7],
    species: [14, 15, 16, 17, 18, 2],
    leader: { name: '海海', emoji: '🧒', badge: '貝殼徽章', team: [14, 15, 17] },
    background: 'linear-gradient(180deg, #7dd3fc 0%, #bae6fd 45%, #fde68a 100%)',
    unlockAfter: 'forest',
  },
  {
    id: 'town',
    name: '熱鬧小鎮',
    emoji: '🏘️',
    description: '家家戶戶的用品都變成了字靈，連時鐘都會說話！',
    wordLevel: '4',
    levels: [7, 9],
    species: [19, 20, 21, 22, 23],
    leader: { name: '鐘錶爺爺', emoji: '👴', badge: '齒輪徽章', team: [19, 21, 23] },
    background: 'linear-gradient(180deg, #fde68a 0%, #fed7aa 50%, #fdba74 100%)',
    unlockAfter: 'beach',
  },
  {
    id: 'bakery',
    name: '甜點工坊',
    emoji: '🧁',
    description: '空氣裡都是甜甜的香味，小心別被糖果字靈黏住。',
    wordLevel: '5',
    levels: [9, 11],
    species: [24, 25, 26, 27, 28],
    leader: { name: '甜甜主廚', emoji: '👩‍🍳', badge: '蛋糕徽章', team: [24, 27, 28] },
    background: 'linear-gradient(180deg, #fce7f3 0%, #fbcfe8 50%, #fda4af 100%)',
    unlockAfter: 'town',
  },
  {
    id: 'valley',
    name: '風雨山谷',
    emoji: '🌦️',
    description: '天氣說變就變，雨停之後聽說會出現彩虹。',
    wordLevel: '6',
    levels: [11, 13],
    species: [29, 30, 31, 32, 33],
    leader: { name: '風哥', emoji: '🧗', badge: '彩虹徽章', team: [29, 31, 33] },
    background: 'linear-gradient(180deg, #94a3b8 0%, #cbd5e1 50%, #a7f3d0 100%)',
    unlockAfter: 'bakery',
  },
  {
    id: 'park',
    name: '運動公園',
    emoji: '⚽',
    description: '到處都是在跑跳的字靈，一起來比賽吧！',
    wordLevel: '7',
    levels: [13, 15],
    species: [34, 35, 36, 37, 38],
    leader: { name: '教練', emoji: '🏃', badge: '獎盃徽章', team: [34, 36, 38] },
    background: 'linear-gradient(180deg, #7dd3fc 0%, #bbf7d0 60%, #4ade80 100%)',
    unlockAfter: 'valley',
  },
  {
    id: 'jungle',
    name: '叢林探險',
    emoji: '🌴',
    description: '茂密的叢林深處，住著會噴閃電的龍。',
    wordLevel: '8',
    levels: [15, 17],
    species: [39, 40, 41, 42, 43],
    leader: { name: '叢林隊長', emoji: '🤠', badge: '猛獸徽章', team: [40, 42, 43] },
    background: 'linear-gradient(180deg, #065f46 0%, #047857 50%, #65a30d 100%)',
    unlockAfter: 'park',
  },
  {
    id: 'castle',
    name: '星空城堡',
    emoji: '🏰',
    description: '只有晚上才會開門的城堡，騎士字靈在門口站崗。',
    wordLevel: '9',
    levels: [17, 19],
    species: [44, 45, 46, 47, 48],
    leader: { name: '騎士團長', emoji: '🤴', badge: '盾牌徽章', team: [46, 47, 48] },
    background: 'linear-gradient(180deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)',
    unlockAfter: 'jungle',
  },
  {
    id: 'festival',
    name: '節慶王國',
    emoji: '🎆',
    description: '天天都在過節的王國，傳說中的願望字靈就藏在這裡。',
    wordLevel: '10',
    levels: [19, 21],
    species: [49, 50, 51, 52, 53],
    leader: { name: '節慶女王', emoji: '👸', badge: '星光徽章', team: [50, 52, 49] },
    background: 'linear-gradient(180deg, #7f1d1d 0%, #b91c1c 50%, #f59e0b 100%)',
    unlockAfter: 'castle',
  },
];

export const getArea = (id: string): Area | undefined => AREAS.find((a) => a.id === id);

/** 字靈的主要棲息地（第一個出現的地區），進化看這一區的單字熟練數 */
export const homeAreaOf = (speciesId: number): Area | undefined =>
  AREAS.find((a) => a.species.includes(speciesId));

/** 館主字靈的等級：比該區野生字靈的最高等級再高一點 */
export const leaderLevels = (area: Area): number[] =>
  area.leader.team.map((_, i) => area.levels[1] + 1 + i);

/** 某隻字靈的棲息地名稱 */
export const habitatsOf = (speciesId: number): string[] =>
  AREAS.filter((a) => a.species.includes(speciesId)).map((a) => a.name);
