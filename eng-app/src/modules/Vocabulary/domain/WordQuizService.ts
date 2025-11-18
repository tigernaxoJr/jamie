/**
 * WordQuizService：一個領域服務 (Domain Service)，
 * 專門負責處理詞彙集合的複雜運算，如選題排序、難度計算等。
 */
import type { QuizWord } from './QuizWord';
// 最近出錯的定義 24 小時
const RECENT_THRESHOLD_MS = 24 * 60 * 60 * 1000;
// 定義緩衝區大小
const MIN_WORDS_COUNT_FOR_BUFFER = 5;
const BUFFER_SIZE = 2; // 例如：最近考過的 2 個單字不重複出現
export class WordQuizService {
  /**
   * 條件 (越高分越優先),判斷依據,權重/細節
   * P1: 未回答過,Total Count=0,×1000
   * P2: 最近有答錯過,Terror 屬 RECENT,×100
   * P3: 連續答錯懲罰 (New!),Cerror_consecutive,×5
   * P4: 最近沒有回答過,Tlast 屬 STALE,×10
   * P5: 總答錯次數,Cerror,×1
   *
   */
  private calculatePriorityScore(word: QuizWord, now: number): number {
    const lastAnswerTime = Math.max(word.errorRec.lastTime, word.correctRec.lastTime);
    const totalCount = word.errorRec.count + word.correctRec.count;
    const isErrorRecently = word.errorRec.lastTime >= now - RECENT_THRESHOLD_MS;
    // const isStale = lastAnswerTime < now - RECENT_THRESHOLD_MS; // P3 的邏輯也需要調整，否則會跟 P2 衝突

    // --- 1. 定義階層式優先級的二元變數 (0 或 1) ---
    // P1: 未回答過 (最高優先級)
    const P1_New = totalCount === 0 ? 1 : 0;
    // P2: 最近有答錯過 (中高優先級)
    const P2_FreshError = P1_New === 0 && isErrorRecently ? 1 : 0;
    // P4: 最近沒有回答過 (中低優先級)
    // 只有在不是新詞彙 (P1=0) 且最近沒有答錯 (P2=0) 的情況下才考慮。
    const P4_Stale =
      P1_New === 0 && P2_FreshError === 0 && lastAnswerTime < now - RECENT_THRESHOLD_MS ? 1 : 0;
    // P3: 連續答錯懲罰 (新增)
    // 只有在 P1/P2/P4 都不滿足，且有連續答錯時才作為排序依據
    const C_Error_Consecutive = word.errorRec.consecutive;
    // P5: 總答錯次數
    const C_Error_Total = word.errorRec.count;

    // console.log('all unit:', {
    //   P1_New,
    //   P2_FreshError,
    //   P4_Stale,
    //   C_Error_Consecutive,
    //   C_Error_Total,
    // });

    // --- 2. 應用加權公式 ---
    let score = 0;
    // 優先級權重：P1 (1000) > P2 (100) > P4 (10) > P3 (5) > P5 (1)
    // 1. P1: 新詞彙
    score += P1_New * 1000;
    // 2. P2: 最近錯題複習
    score += P2_FreshError * 100;
    // 3. P4: 長時間未複習
    score += P4_Stale * 10;
    // 4. P3: 連續答錯懲罰 (乘數 5)
    // 讓連續答錯的詞彙在同級中脫穎而出
    score += C_Error_Consecutive * 5;
    // 5. P5: 總錯誤次數（最細微的調整）
    score += C_Error_Total;

    return score;
  }

  /**
   * 服務公開方法：從詞彙列表中選出下一個優先級最高的考題。
   *
   * @param words 所有的單詞列表。
   * @param lastWordIds (新增) 最近 N 次考過的單字 ID 清單。
   * @returns 優先級最高的單詞 (Word) 或 undefined。
   */
  public getNextQuizWord(words: QuizWord[], lastWordIds: number[] = []): QuizWord | undefined {
    if (words.length < 1) {
      // 如果列表為空，則返回 undefined
      return undefined;
    }

    const now = Date.now();

    // 1. 計算所有單詞的優先級分數
    const scoredWords = words.map((word) => ({
      word,
      score: this.calculatePriorityScore(word, now),
    }));

    console.log('scoredWords', scoredWords);
    // 2. 根據分數從高到低排序
    scoredWords.sort((a, b) => b.score - a.score);

    const isSmallSet = words.length < MIN_WORDS_COUNT_FOR_BUFFER;

    if (isSmallSet) {
      // 處理小集合邏輯 (少於 5 個單字)
      const recentlyUsedIds = new Set(lastWordIds.slice(0, BUFFER_SIZE));

      // 過濾掉最近使用過的單字，嘗試選取下一個單字
      const filteredWords = scoredWords.filter((sw) => !recentlyUsedIds.has(sw.word.id));

      if (filteredWords.length > 0) {
        // 如果排除緩衝區後還有單字可選，就從排除後的單字中選取優先級最高的
        return this.selectTopWordFromScoredList(filteredWords);
      }

      // 情況：所有單字都在緩衝區內 (例如只有 2 個單字，但緩衝區大小是 2)
      // 必須從原始列表中選取（最高優先級）
      console.warn('所有單字都在緩衝區內，退回到最高優先級選題。');
    }

    // 3. 處理大集合 (>= 5) 或 小集合退回邏輯
    return this.selectTopWordFromScoredList(scoredWords);
  }

  /**
   * 輔助方法：從已計算分數的清單中，選出最高分且隨機的單詞。
   * @param scoredWords 已排序的單詞清單。
   * @returns 優先級最高的單詞 (Word) 或 undefined。
   */
  private selectTopWordFromScoredList(
    scoredWords: { word: QuizWord; score: number }[],
  ): QuizWord | undefined {
    // 找到最高分數
    const maxScore = scoredWords[0]?.score;
    if (maxScore === undefined) return undefined;

    // 過濾出所有分數等於最高分數的單詞
    const topScoredWords = scoredWords.filter((sw) => sw.score === maxScore);

    // 從最高分詞彙中隨機選取一個
    const randomIndex = Math.floor(Math.random() * topScoredWords.length);

    // 這裡不需要 throw Error，因為我們在開頭檢查過長度
    return topScoredWords[randomIndex]?.word;
  }
}
