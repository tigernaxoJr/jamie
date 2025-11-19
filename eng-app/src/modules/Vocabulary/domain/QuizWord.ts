import { Word } from './Word';

/**
 * AnswerRecord: 值物件 (Value Object) - 代表單次答題記錄的統計。
 * (DDD 概念：描述性值物件，沒有唯一識別碼)
 */
export type AnswerRecord = {
  /** 答錯/答對的次數 */
  count: number;
  /** 上一次答題的時間戳 (Unix Time) */
  lastTime: number;
  /** 連續答錯/答對的次數 (如果上一次答題類型不同，會重置為 1) */
  consecutive: number;
};

/**
 * Word: 領域實體 (Domain Entity) - 代表單個單詞。
 * (DDD 概念：具有唯一識別碼 (id) 和生命週期)
 */
export class QuizWord extends Word {
  /** 答錯記錄 */
  public errorRec: AnswerRecord;
  /** 答對記錄 */
  public correctRec: AnswerRecord;

  /**
   * 建立一個新的 Word 實體。
   *
   * @param id 唯一識別碼。
   * @param english 英文單詞。
   * @param chinese 中文解釋。
   * @param image 圖片 URL (可選，預設為空字串)。
   * @param audio 音訊 URL (可選，預設為空字串)。
   * @param errorRec 初始的答錯記錄 (可選，預設為計數 0)。
   * @param correctRec 初始的答對記錄 (可選，預設為計數 0)。
   */
  constructor(
    id: number,
    english: string,
    chinese: string,
    image?: string,
    audio?: string,
    categories?: string[],
    errorRec?: AnswerRecord,
    correctRec?: AnswerRecord,
  ) {
    super(id, english, chinese, image, audio, categories);
    // 初始化記錄或使用傳入的記錄 (常用於從 API 或本地儲存載入資料)
    const initialRecord: AnswerRecord = { count: 0, lastTime: 0, consecutive: 0 };

    this.errorRec = errorRec || { ...initialRecord };
    this.correctRec = correctRec || { ...initialRecord };
  }
}
