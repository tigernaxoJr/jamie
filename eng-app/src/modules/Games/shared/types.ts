/** 遊戲中使用的單字 */
export interface GameWord {
  /** 題庫原始英文（作為答題記錄的 key） */
  english: string;
  chinese: string;
  /** 玩家要拼/選的答案：去掉括號補充說明，例如 "shoe(s)" → "shoe" */
  answer: string;
  /** 出題權重（1～4，預設 1）：越不熟的字越大，在抽牌堆裡出現越多次 */
  weight?: number;
}

/** 遊戲中心卡片上顯示的資訊 */
export interface GameCard {
  id: string;
  title: string;
  /** emoji 圖示 */
  icon: string;
  description: string;
  /** 練習的能力，例如「拼字」 */
  skill: string;
  /** Quasar 顏色名稱 */
  color: string;
  desktopOnly?: boolean;
  /** 關卡制遊戲：最高分只記無盡模式 */
  stageBased?: boolean;
  /** 遊戲中心卡片上的進度，例如「⭐ 12 / 24」；沒有進度回傳 null */
  progress?: () => string | null;
}

/** 單字遊戲的完整設定 */
export interface GameInfo extends GameCard {
  rules: string[];
  /** 開始遊戲至少需要的單字數 */
  minWords: number;
  /** 只保留適合此遊戲的單字 */
  wordFilter?: (w: GameWord) => boolean;
  /** 是否把答題結果寫入單字長期記憶（影響單字測驗出題） */
  recordsProgress: boolean;
}

export interface GameStat {
  label: string;
  value: string | number;
}

export interface GameResult {
  won: boolean;
  headline: string;
  score: number;
  stats: GameStat[];
  /** 這局答錯/沒拼出來的單字 */
  missed: GameWord[];
  /** 關卡制遊戲的星等（1～3） */
  stars?: number;
  /** 是否計入最高分（關卡模式為 false，只有無盡模式算），預設 true */
  ranked?: boolean;
  /** 帶回字靈探險的糖果，由 GameSession 結算時填入 */
  reward?: { candies: number; capped: number };
}
