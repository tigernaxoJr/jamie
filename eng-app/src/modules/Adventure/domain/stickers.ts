import { SPECIES, getSpecies } from './species';
import { lovesNight } from './daytime';

/** 貼紙用的累計數字（存在存檔的 stats） */
export interface AdventureStats {
  /** 探險中拼字題答對的次數 */
  spelled: number;
  /** 打贏的對戰場數（野外、館主、迷路字靈、傳說都算） */
  battlesWon: number;
  /** 對戰中最高的連擊數 */
  bestCombo: number;
  /** 找回的迷路單字數 */
  rescued: number;
  /** 孵出的字靈蛋數 */
  hatched: number;
}

export const emptyStats = (): AdventureStats => ({
  spelled: 0,
  battlesWon: 0,
  bestCombo: 0,
  rescued: 0,
  hatched: 0,
});

/** 判斷貼紙需要的存檔資料 */
export interface StickerInput {
  creatures: readonly { speciesId: number; level: number; stage?: number; shiny?: boolean }[];
  badges: number;
  completedAreas: number;
  stats: AdventureStats;
}

export interface Sticker {
  id: string;
  emoji: string;
  name: string;
  /** 怎麼拿到（還沒拿到時顯示） */
  hint: string;
  goal: number;
  progress: (s: StickerInput) => number;
}

const caughtSpecies = (s: StickerInput) => [...new Set(s.creatures.map((c) => c.speciesId))];
const countCaught = (s: StickerInput, ok: (id: number) => boolean) =>
  caughtSpecies(s).filter(ok).length;

export const STICKERS: readonly Sticker[] = [
  {
    id: 'first-friend',
    emoji: '🤝',
    name: '第一個夥伴',
    hint: '選擇第一隻夥伴',
    goal: 1,
    progress: (s) => s.creatures.length,
  },
  {
    id: 'catch-10',
    emoji: '🎒',
    name: '小小收藏家',
    hint: '收服 10 種字靈',
    goal: 10,
    progress: (s) => caughtSpecies(s).length,
  },
  {
    id: 'catch-25',
    emoji: '📚',
    name: '字靈博士',
    hint: '收服 25 種字靈',
    goal: 25,
    progress: (s) => caughtSpecies(s).length,
  },
  {
    id: 'catch-all',
    emoji: '🏆',
    name: '圖鑑大師',
    hint: `收服全部 ${SPECIES.length} 種字靈`,
    goal: SPECIES.length,
    progress: (s) => caughtSpecies(s).length,
  },
  {
    id: 'shiny',
    emoji: '✨',
    name: '閃閃發光',
    hint: '收服一隻色違字靈',
    goal: 1,
    progress: (s) => s.creatures.filter((c) => c.shiny).length,
  },
  {
    id: 'evolve',
    emoji: '🌟',
    name: '長大了',
    hint: '讓一隻字靈進化',
    goal: 1,
    progress: (s) => s.creatures.filter((c) => (c.stage ?? 1) >= 2).length,
  },
  {
    id: 'level-20',
    emoji: '💪',
    name: '最強搭檔',
    hint: '把一隻字靈升到 Lv 20',
    goal: 20,
    progress: (s) => Math.max(0, ...s.creatures.map((c) => c.level)),
  },
  {
    id: 'hatch',
    emoji: '🥚',
    name: '孵蛋囉',
    hint: '孵出一顆字靈蛋',
    goal: 1,
    progress: (s) => s.stats.hatched,
  },
  {
    id: 'night',
    emoji: '🌙',
    name: '夜空收藏家',
    hint: '收服 3 種喜歡夜晚的字靈',
    goal: 3,
    progress: (s) => countCaught(s, (id) => lovesNight(getSpecies(id))),
  },
  {
    id: 'spell-50',
    emoji: '✏️',
    name: '拼字小高手',
    hint: '在探險中拼對 50 個字',
    goal: 50,
    progress: (s) => s.stats.spelled,
  },
  {
    id: 'spell-200',
    emoji: '🖋️',
    name: '拼字大師',
    hint: '在探險中拼對 200 個字',
    goal: 200,
    progress: (s) => s.stats.spelled,
  },
  {
    id: 'win-10',
    emoji: '⚔️',
    name: '對戰新手',
    hint: '打贏 10 場對戰',
    goal: 10,
    progress: (s) => s.stats.battlesWon,
  },
  {
    id: 'win-50',
    emoji: '🛡️',
    name: '對戰高手',
    hint: '打贏 50 場對戰',
    goal: 50,
    progress: (s) => s.stats.battlesWon,
  },
  {
    id: 'combo-5',
    emoji: '🔥',
    name: '5 連擊',
    hint: '對戰中攻擊連續答對 5 題',
    goal: 5,
    progress: (s) => s.stats.bestCombo,
  },
  {
    id: 'combo-10',
    emoji: '💥',
    name: '10 連擊',
    hint: '對戰中攻擊連續答對 10 題（用必殺技會重新算）',
    goal: 10,
    progress: (s) => s.stats.bestCombo,
  },
  {
    id: 'rescue-10',
    emoji: '🔦',
    name: '迷路救援隊',
    hint: '找回 10 個迷路單字',
    goal: 10,
    progress: (s) => s.stats.rescued,
  },
  {
    id: 'badge-1',
    emoji: '🎖️',
    name: '第一個徽章',
    hint: '打贏一位館主',
    goal: 1,
    progress: (s) => s.badges,
  },
  {
    id: 'badge-10',
    emoji: '👑',
    name: '冠軍',
    hint: '集滿 10 個徽章',
    goal: 10,
    progress: (s) => s.badges,
  },
  {
    id: 'area-complete',
    emoji: '🗺️',
    name: '地區全收集',
    hint: '收齊一區所有字靈',
    goal: 1,
    progress: (s) => s.completedAreas,
  },
  {
    id: 'legend',
    emoji: '🐉',
    name: '傳說的朋友',
    hint: '收服傳說字靈',
    goal: 1,
    progress: (s) => countCaught(s, (id) => getSpecies(id).rarity === 'legendary'),
  },
];

export interface StickerState {
  sticker: Sticker;
  earned: boolean;
  /** 目前進度（不超過 goal） */
  value: number;
}

export const stickerStates = (s: StickerInput): StickerState[] =>
  STICKERS.map((sticker) => {
    const value = Math.min(sticker.goal, sticker.progress(s));
    return { sticker, earned: value >= sticker.goal, value };
  });
