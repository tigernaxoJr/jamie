/**
 * 小遊戲日誌：每天玩了哪些遊戲、過了幾關、拿幾顆星、打字速度。
 * 給家長報告用；純計算，儲存在 useGameSession 結算時寫入 localStorage 'game-log'。
 */

export interface GameDay {
  /** 遊戲 id → 玩了幾局 */
  plays: Record<string, number>;
  /** 過關次數 */
  cleared: number;
  /** 過關拿到的星星（每次過關都算） */
  stars: number;
  /** 當天最快的打字速度（字母/分） */
  typingBest: number;
}

export interface GameLogData {
  days: Record<string, GameDay>;
}

export interface GamePlayed {
  gameId: string;
  cleared: boolean;
  stars: number;
  lettersPerMinute?: number;
  now: number;
}

const KEEP_DAYS = 60;

/** 當地日期 YYYY-MM-DD（往前推 back 天） */
export const localDay = (time: number, back = 0): string => {
  const d = new Date(time);
  d.setDate(d.getDate() - back);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const emptyDay = (): GameDay => ({ plays: {}, cleared: 0, stars: 0, typingBest: 0 });

/** 記錄一局（就地修改並回傳 data） */
export const logGame = (data: GameLogData, e: GamePlayed): GameLogData => {
  const day = (data.days[localDay(e.now)] ??= emptyDay());
  day.plays[e.gameId] = (day.plays[e.gameId] ?? 0) + 1;
  if (e.cleared) {
    day.cleared++;
    day.stars += e.stars;
  }
  if (e.lettersPerMinute) day.typingBest = Math.max(day.typingBest, e.lettersPerMinute);
  const oldest = localDay(e.now, KEEP_DAYS - 1);
  for (const k of Object.keys(data.days)) if (k < oldest) delete data.days[k];
  return data;
};

export interface GameReport {
  /** [遊戲 id, 局數]，多的在前 */
  plays: [string, number][];
  totalPlays: number;
  cleared: number;
  stars: number;
  /** 這段期間最快打字速度，0 表示沒玩 */
  typingBest: number;
  /** 前一段期間（例如上週）的最快打字速度 */
  typingPrevBest: number;
}

/** 最近 n 天的遊戲報告 */
export const gameReport = (data: GameLogData, now: number, n = 7): GameReport => {
  const plays: Record<string, number> = {};
  let cleared = 0;
  let stars = 0;
  let typingBest = 0;
  let typingPrevBest = 0;
  for (let i = 0; i < n * 2; i++) {
    const day = data.days[localDay(now, i)];
    if (!day) continue;
    if (i >= n) {
      typingPrevBest = Math.max(typingPrevBest, day.typingBest);
      continue;
    }
    for (const [id, count] of Object.entries(day.plays)) plays[id] = (plays[id] ?? 0) + count;
    cleared += day.cleared;
    stars += day.stars;
    typingBest = Math.max(typingBest, day.typingBest);
  }
  const sorted = Object.entries(plays).sort((a, b) => b[1] - a[1]);
  return {
    plays: sorted,
    totalPlays: sorted.reduce((sum, [, c]) => sum + c, 0),
    cleared,
    stars,
    typingBest,
    typingPrevBest,
  };
};
