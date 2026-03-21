import type { AnswerRecord } from '../domain/QuizWord';

const STORAGE_KEY = 'word-metadata';

/**
 * 單字長期記憶的儲存格式。
 * 以英文單字（小寫）為 key，儲存其答題記錄。
 */
export interface WordMetaEntry {
  errorRec: AnswerRecord;
  correctRec: AnswerRecord;
}

export type WordMetaMap = Record<string, WordMetaEntry>;

/**
 * WordMetaStorage - 將單字的答題 metadata 獨立儲存於 localStorage，
 * 使得切換類別或重新開始測驗時不會遺失長期記憶。
 */
export const WordMetaStorage = {
  /**
   * 從 localStorage 載入所有已儲存的單字 metadata。
   */
  loadAll(): WordMetaMap {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw) as WordMetaMap;
    } catch {
      return {};
    }
  },

  /**
   * 將整份 metadata map 寫入 localStorage。
   */
  saveAll(map: WordMetaMap): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  },

  /**
   * 儲存單一單字的 metadata（merge 到現有 map 中）。
   */
  save(englishKey: string, entry: WordMetaEntry): void {
    const map = this.loadAll();
    map[englishKey.toLowerCase()] = entry;
    this.saveAll(map);
  },

  /**
   * 取得單一單字的 metadata，如果不存在則回傳 undefined。
   */
  get(englishKey: string): WordMetaEntry | undefined {
    const map = this.loadAll();
    return map[englishKey.toLowerCase()];
  },

  /**
   * 清除指定單字的 metadata（僅遺忘這些單字的記憶）。
   */
  removeMany(englishKeys: string[]): void {
    const map = this.loadAll();
    for (const key of englishKeys) {
      delete map[key.toLowerCase()];
    }
    this.saveAll(map);
  },

  /**
   * 清除所有儲存的單字 metadata（遺忘所有記憶）。
   */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
