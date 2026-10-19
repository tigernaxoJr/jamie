import type { GameWord } from 'src/modules/Games/shared';

// ---------- 迷路字靈：探險中答錯的單字會「迷路」，打贏迷路字靈把它們找回來 ----------

/** 迷路單字達到幾個，地圖上才會出現迷路字靈 */
export const LOST_MIN = 3;
/** 最多記幾個（超過就丟掉最早的） */
export const LOST_MAX = 30;
/** 每找回一個單字給幾顆糖果（打贏才給） */
export const LOST_CANDY_PER_WORD = 1;
/** 打贏迷路字靈的額外糖果 */
export const LOST_WIN_CANDY = 2;

/** 答錯時把單字加進迷路清單；已經在清單裡就不重複 */
export const addLostWord = (list: readonly GameWord[], word: GameWord): GameWord[] => {
  if (list.some((w) => w.english === word.english)) return [...list];
  const { english, chinese, answer } = word;
  return [...list, { english, chinese, answer }].slice(-LOST_MAX);
};

/** 打贏迷路字靈拿到的糖果 */
export const lostRewardCandies = (found: number) => found * LOST_CANDY_PER_WORD + LOST_WIN_CANDY;
