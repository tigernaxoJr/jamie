import type { QuizWord } from './QuizWord';

export class WordQuizService {
  // 設置不重複次數的參數
  private readonly BUFFER_SIZE = 5;

  /**
   * 服務公開方法：從詞彙列表中選出下一個優先級最高的考題。
   *
   * @param words 所有的單詞列表。
   * @param lastWordIds 最近 N 次考過的單字 ID 清單。
   * @returns 優先級最高的單詞 (QuizWord) 或 undefined。
   */
  public getNextQuizWord(words: QuizWord[], lastWordIds: number[] = []): QuizWord | undefined {
    if (words.length < 1) return undefined;

    // 1. 分出2個 pool，最近一次答錯 (預設未答過歸類)、最近一次答對
    const incorrectPool = words.filter(
      (w) => w.errorRec.lastTime >= w.correctRec.lastTime,
    );
    const correctPool = words.filter(
      (w) => w.correctRec.lastTime > w.errorRec.lastTime,
    );

    // 2. 設置不重複次數的參數
    // 優先取得不熟的作為測驗單字，原則是距離上次出現大於等於不重複次數
    const recentIds = new Set(lastWordIds.slice(-this.BUFFER_SIZE));

    const filteredIncorrectPool = incorrectPool.filter((w) => !recentIds.has(w.id));
    const filteredCorrectPool = correctPool.filter((w) => !recentIds.has(w.id));

    // 3. 從錯誤的 pool 中取得單字
    if (filteredIncorrectPool.length > 0) {
      filteredIncorrectPool.sort((a, b) => {
        // (1) 連續答錯次數由大到小排序
        if (a.errorRec.consecutive !== b.errorRec.consecutive) {
          return b.errorRec.consecutive - a.errorRec.consecutive;
        }
        // (2) 總答錯次數/總答對次數由小到大排序
        const ratioA = this.getRatio(a);
        const ratioB = this.getRatio(b);
        if (ratioA !== ratioB) {
          return ratioA - ratioB;
        }
        // (3) 以上都相同的話比較上次答錯時間愈接近者優先
        return b.errorRec.lastTime - a.errorRec.lastTime;
      });
      return filteredIncorrectPool[0];
    }

    // 4. 如果錯誤的 pool 沒有單字，則從正確的 pool 中取得單字
    if (filteredCorrectPool.length > 0) {
      filteredCorrectPool.sort((a, b) => {
        // (1) 連續答對次數由小到大排序
        if (a.correctRec.consecutive !== b.correctRec.consecutive) {
          return a.correctRec.consecutive - b.correctRec.consecutive;
        }
        // (2) 總答錯次數/總答對次數由小到大排序
        const ratioA = this.getRatio(a);
        const ratioB = this.getRatio(b);
        if (ratioA !== ratioB) {
          return ratioA - ratioB;
        }
        // (3) 以上都相同的話比較上次答對時間愈久者優先
        return a.correctRec.lastTime - b.correctRec.lastTime;
      });
      return filteredCorrectPool[0];
    }

    // 5. 如果所有單字距離上次出現的間隔都小於不重複次數，則以距離上次出現最遠的單字作為測驗單字
    const sortedByFurthest = [...words].sort((a, b) => {
      const lastTimeA = Math.max(a.errorRec.lastTime, a.correctRec.lastTime);
      const lastTimeB = Math.max(b.errorRec.lastTime, b.correctRec.lastTime);
      return lastTimeA - lastTimeB;
    });

    return sortedByFurthest[0];
  }

  /**
   * 計算總答錯次數/總答對次數的比例
   */
  private getRatio(word: QuizWord): number {
    const err = word.errorRec.count;
    const corr = word.correctRec.count;
    if (corr === 0) {
      return err === 0 ? 0 : Infinity;
    }
    return err / corr;
  }
}
