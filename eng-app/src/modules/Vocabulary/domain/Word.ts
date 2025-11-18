import type { Category } from '.';

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
  public readonly categories: Category[];

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
    categories?: Category[],
  ) {
    this.id = id;
    this.english = english;
    this.chinese = chinese;
    this.image = image || '';
    this.audio = audio || '';
    this.categories = categories || [];
  }
}
