// ---------- 字靈糖果：小遊戲的獎勵，帶回字靈探險使用 ----------

/** 小遊戲每答對幾題換 1 顆糖果 */
export const CORRECT_PER_CANDY = 3;
/** 過關 / 勝利的額外糖果 */
export const WIN_BONUS_CANDY = 2;
/** 每天最多從小遊戲拿到幾顆（避免一直刷同一個遊戲） */
export const DAILY_CANDY_LIMIT = 30;

/** 餵 1 顆糖果得到的經驗值 */
export const CANDY_XP = 10;
/** 捕捉時用糖果加能量：花幾顆、加幾格（每次遭遇限用一次） */
export const CANDY_ENERGY_COST = 3;
export const CANDY_ENERGY = 2;

/** 一局小遊戲應得的糖果（還沒扣每日上限） */
export const candiesForGame = (correct: number, won: boolean): number =>
  correct <= 0 ? 0 : Math.floor(correct / CORRECT_PER_CANDY) + (won ? WIN_BONUS_CANDY : 0);

/** 扣掉今天已經拿到的數量後，實際可以拿幾顆 */
export const cappedCandies = (earned: number, alreadyToday: number): number =>
  Math.max(0, Math.min(earned, DAILY_CANDY_LIMIT - alreadyToday));
