/** 翻牌配對的關卡（純資料與規則，不含畫面） */

/** en：英文牌；zh：中文牌；sound：聲音牌（翻開只會唸出單字） */
export type CardFace = 'en' | 'zh' | 'sound';

/** 一對牌的兩面 */
export type PairKind = readonly [CardFace, CardFace];

export const EN_ZH: PairKind = ['en', 'zh'];
export const SOUND_ZH: PairKind = ['sound', 'zh'];
export const SOUND_EN: PairKind = ['sound', 'en'];

export interface MemoryStage {
  name: string;
  emoji: string;
  pairs: number;
  /** 會出現的牌組，每一對隨機挑一種 */
  kinds: readonly PairKind[];
  /** 開局偷看全部牌面的秒數 */
  peek: number;
  /** 時間限制（秒），undefined 表示不限時 */
  timeLimit?: number;
  /** 每翻錯幾次，還沒配對的牌會被旋風吹亂 */
  shuffleEvery?: number;
}

export const MEMORY_STAGES: readonly MemoryStage[] = [
  { name: '小試身手', emoji: '🌱', pairs: 4, kinds: [EN_ZH], peek: 3 },
  { name: '記憶暖身', emoji: '🍀', pairs: 6, kinds: [EN_ZH], peek: 3 },
  { name: '聽聽看', emoji: '🎧', pairs: 4, kinds: [SOUND_ZH], peek: 3 },
  { name: '限時挑戰', emoji: '⏰', pairs: 6, kinds: [EN_ZH], peek: 2, timeLimit: 60 },
  { name: '聲音拼字', emoji: '🔊', pairs: 6, kinds: [SOUND_EN], peek: 2, timeLimit: 75 },
  {
    name: '旋風來了',
    emoji: '🌪️',
    pairs: 6,
    kinds: [EN_ZH],
    peek: 2,
    timeLimit: 75,
    shuffleEvery: 3,
  },
  {
    name: '大牌桌',
    emoji: '🃏',
    pairs: 8,
    kinds: [EN_ZH, SOUND_ZH, SOUND_EN],
    peek: 3,
    timeLimit: 100,
  },
  {
    name: '記憶大師',
    emoji: '👑',
    pairs: 8,
    kinds: [EN_ZH, SOUND_ZH, SOUND_EN],
    peek: 2,
    timeLimit: 100,
    shuffleEvery: 3,
  },
];

/** 無盡模式第 round 輪（從 0 開始）：牌越來越多、時間越來越緊 */
export const endlessRound = (round: number): MemoryStage => {
  const pairs = Math.min(8, 4 + round * 2);
  return {
    name: `第 ${round + 1} 輪`,
    emoji: '♾️',
    pairs,
    kinds: round < 2 ? [EN_ZH] : [EN_ZH, SOUND_ZH, SOUND_EN],
    peek: round < 3 ? 2 : 1,
    timeLimit: Math.max(pairs * 6, pairs * 12 - round * 4),
  };
};

/** 過關星等：翻錯次數不超過配對數一半 3 星、不超過配對數 2 星，其他 1 星 */
export const memoryStars = (misses: number, pairs: number): number =>
  misses <= Math.floor(pairs / 2) ? 3 : misses <= pairs ? 2 : 1;

/** 每關的手電筒數量（全部牌亮一下） */
export const FLASHLIGHTS = 1;
