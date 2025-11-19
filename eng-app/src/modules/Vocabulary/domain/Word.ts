// import type { Category } from '.';

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
  public readonly categories: string[];

  /**
   * 建立一個新的 Word 實體。
   *
   * @param id 唯一識別碼。
   * @param english 英文單詞。
   * @param chinese 中文解釋。
   * @param image 圖片 URL (可選，預設為空字串)。
   * @param audio 音訊 URL (可選，預設為空字串)。
   */
  constructor(
    id: number,
    english: string,
    chinese: string,
    image?: string,
    audio?: string,
    categories?: string[],
  ) {
    this.id = id;
    this.english = english;
    this.chinese = chinese;
    this.image = image || '';
    this.audio = audio || '';
    this.categories = categories || [];
  }
}

/**
 * @description 代表一個尚未被儲存、因此沒有 ID 的新單詞資料。
 * 使用 Omit<Word, 'id'> 從 Word 類別中排除 'id' 屬性。
 */
export type NewWord = Omit<Word, 'id'>;
