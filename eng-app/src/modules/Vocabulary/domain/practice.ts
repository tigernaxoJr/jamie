import type { AnswerRecords } from './QuizWord';

/** 連續答對幾次算熟練（與 MASTERED_STREAK 相同） */
const MASTERED = 3;
/** 最近答錯的字，這段時間內權重加倍（毫秒） */
const RECENT_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * 遊戲出題的權重（1～4）：數字越大，在一輪抽牌中出現越多次。
 * - 連續答錯越多次、最近才答錯的字越常出現
 * - 還沒練過的字稍微多一點，讓新字有機會被看到
 * - 已經熟練的字維持 1
 */
export const practiceWeight = (rec: AnswerRecords, now = Date.now()): number => {
  const { errorRec, correctRec } = rec;
  if (errorRec.consecutive > 0) {
    const recent = now - errorRec.lastTime < RECENT_MS ? 1 : 0;
    return Math.min(4, 1 + errorRec.consecutive + recent);
  }
  if (correctRec.consecutive >= MASTERED) return 1;
  if (errorRec.count + correctRec.count === 0) return 2;
  // 答對過但還不熟，之前錯過的多給一點
  return errorRec.count > 0 ? 2 : 1;
};
