import type { QuizWord } from './QuizWord';

/**
 * 出題服務：依答題記錄選出下一個要考的單字。規則見 Vocabulary/Readme.md。
 */
export class WordQuizService {
  /** 最近考過的幾個字暫時不再出 */
  private readonly BUFFER_SIZE = 5;

  /** @param random 隨機來源（測試時可傳入固定值） */
  constructor(private readonly random: () => number = Math.random) {}

  /**
   * 從詞彙列表中選出下一個優先級最高的考題。
   *
   * @param words 所有的單詞列表。
   * @param lastWordIds 最近出過的單字 ID（越後面越新）。
   * @returns 優先級最高的單詞，沒有單字時回傳 undefined。
   */
  public getNextQuizWord(words: QuizWord[], lastWordIds: number[] = []): QuizWord | undefined {
    if (words.length < 1) return undefined;

    // 1. 排除最近出過的字；先洗牌，讓條件相同的字（例如都還沒考過）隨機出題
    const recentIds = new Set(lastWordIds.slice(-this.BUFFER_SIZE));
    const candidates = this.shuffle(words.filter((w) => !recentIds.has(w.id)));

    // 2. 分成兩個 pool：最近一次答錯（含還沒考過）、最近一次答對
    const incorrectPool = candidates.filter((w) => w.errorRec.lastTime >= w.correctRec.lastTime);
    const correctPool = candidates.filter((w) => w.correctRec.lastTime > w.errorRec.lastTime);

    // 3. 優先從答錯的 pool 出題
    if (incorrectPool.length > 0) {
      return incorrectPool.sort((a, b) => {
        // (1) 連續答錯次數多的優先
        if (a.errorRec.consecutive !== b.errorRec.consecutive) {
          return b.errorRec.consecutive - a.errorRec.consecutive;
        }
        // (2) 答錯率高的優先
        const ratioDiff = this.getRatio(b) - this.getRatio(a);
        if (ratioDiff !== 0 && !Number.isNaN(ratioDiff)) return ratioDiff;
        // (3) 最近答錯的優先
        return b.errorRec.lastTime - a.errorRec.lastTime;
      })[0];
    }

    // 4. 沒有答錯的字，就從答對的 pool 出題
    if (correctPool.length > 0) {
      return correctPool.sort((a, b) => {
        // (1) 連續答對次數少的優先
        if (a.correctRec.consecutive !== b.correctRec.consecutive) {
          return a.correctRec.consecutive - b.correctRec.consecutive;
        }
        // (2) 答錯率高的優先
        const ratioDiff = this.getRatio(b) - this.getRatio(a);
        if (ratioDiff !== 0 && !Number.isNaN(ratioDiff)) return ratioDiff;
        // (3) 最久沒答對的優先
        return a.correctRec.lastTime - b.correctRec.lastTime;
      })[0];
    }

    // 5. 所有字都剛出過（單字很少時）：選最久沒出現的字。
    //    用出題紀錄而不是答題時間，因為「跳過」不會更新答題時間。
    const lastShown = (w: QuizWord) => lastWordIds.lastIndexOf(w.id);
    return [...words].sort((a, b) => lastShown(a) - lastShown(b))[0];
  }

  /**
   * 總答錯次數 / 總答對次數；沒答對過但有答錯時為 Infinity
   */
  private getRatio(word: QuizWord): number {
    const err = word.errorRec.count;
    const corr = word.correctRec.count;
    if (corr === 0) {
      return err === 0 ? 0 : Infinity;
    }
    return err / corr;
  }

  private shuffle<T>(items: T[]): T[] {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j] as T, arr[i] as T];
    }
    return arr;
  }
}
