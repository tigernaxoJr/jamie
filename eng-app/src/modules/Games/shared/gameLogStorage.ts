import { readJson, writeJson } from 'src/utils/storage';
import { type GameLogData, type GamePlayed, type GameReport, gameReport, logGame } from './gameLog';

const STORAGE_KEY = 'game-log';

const load = (): GameLogData => readJson<GameLogData>(STORAGE_KEY) ?? { days: {} };

/** 記錄一局遊戲（空間不足時放棄，不影響遊戲） */
export const recordGamePlayed = (e: GamePlayed): void => {
  writeJson(STORAGE_KEY, logGame(load(), e));
};

/** 最近 n 天的遊戲報告 */
export const getGameReport = (days = 7): GameReport => gameReport(load(), Date.now(), days);
