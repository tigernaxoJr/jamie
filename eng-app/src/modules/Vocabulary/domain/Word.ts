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
  consecutiveCount: number;
};

/**
 * Word: 領域實體 (Domain Entity) - 代表單個單詞。
 * (DDD 概念：具有唯一識別碼 (id) 和生命週期)
 */
export class Word {
  /** 唯一識別碼 */
  public readonly id: number;
  /** 英文單詞 */
  public readonly english: string;
  /** 中文解釋 */
  public readonly chinese: string;
  /** 圖片 URL */
  public readonly image: string;
  /** 音訊 URL */
  public readonly audio: string;

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
    errorRec?: AnswerRecord,
    correctRec?: AnswerRecord,
  ) {
    this.id = id;
    this.english = english;
    this.chinese = chinese;
    this.image = image || '';
    this.audio = audio || '';

    // 初始化記錄或使用傳入的記錄 (常用於從 API 或本地儲存載入資料)
    const initialRecord: AnswerRecord = { count: 0, lastTime: 0, consecutiveCount: 0 };

    this.errorRec = errorRec || { ...initialRecord };
    this.correctRec = correctRec || { ...initialRecord };
  }

  // --- 領域行為 (Domain Behavior) ---

  /**
   * 記錄一次正確的作答。
   */
  // public recordCorrectAnswer(): void {
  //   this.correctRec.count += 1;
  //   this.correctRec.lastTime = Date.now(); // 註：我們不需要判斷上次是答對還是答錯，只需要知道上次答題和本次答題的時間差
  //   // 這裡的邏輯是基於「本次作答」與「上次的作答類型」的比較
  //   // 判斷上次是哪種作答 (使用 lastTime 判斷哪個記錄是最近的)
  //   // 判斷：如果上次是答對，連續次數遞增；否則，重置為 1
  //   if (this.correctRec.lastTime > this.errorRec.lastTime) {
  //     // 這是連續答對
  //     this.correctRec.consecutiveCount += 1; // 對方的連續次數必須重置
  //     this.errorRec.consecutiveCount = 0;
  //   } else {
  //     // 上次是答錯 (或兩者時間相同/皆為 0)，新的連續答對從 1 開始
  //     this.correctRec.consecutiveCount = 1;
  //     this.errorRec.consecutiveCount = 0;
  //   }
  // }

  /**
   * 記錄一次錯誤的作答。
   */
  // public recordErrorAnswer(): void {
  //   this.errorRec.count += 1;
  //   this.errorRec.lastTime = Date.now();
  //   // 判斷：如果上次是答錯，連續次數遞增；否則，重置為 1
  //   if (this.errorRec.lastTime > this.correctRec.lastTime) {
  //     // 這是連續答錯
  //     this.errorRec.consecutiveCount += 1; // 對方的連續次數必須重置
  //     this.correctRec.consecutiveCount = 0;
  //   } else {
  //     // 上次是答對，新的連續答錯從 1 開始
  //     this.errorRec.consecutiveCount = 1;
  //     this.correctRec.consecutiveCount = 0;
  //   }
  // }

  /**
   * 取得該單詞總共答錯的次數。
   */
  // public get errorCount(): number {
  //   return this.errorRec.count;
  // }
  /**
   * 取得該單詞連續答對的次數。
   */
  // public get consecutiveCorrectCount(): number {
  //   return this.correctRec.consecutiveCount;
  // }
  /**
   * 取得該單詞連續答錯的次數。
   */
  // public get consecutiveErrorCount(): number {
  //   return this.errorRec.consecutiveCount;
  // }
}
