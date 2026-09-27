import { type GameLogData, type GamePlayed, type GameReport, gameReport, logGame } from './gameLog';

const STORAGE_KEY = 'game-log';

const load = (): GameLogData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GameLogData) : { days: {} };
  } catch {
    return { days: {} };
  }
};

/** 記錄一局遊戲（空間不足時放棄，不影響遊戲） */
export const recordGamePlayed = (e: GamePlayed): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logGame(load(), e)));
  } catch {
    // 忽略
  }
};

/** 最近 n 天的遊戲報告 */
export const getGameReport = (days = 7): GameReport => gameReport(load(), Date.now(), days);
