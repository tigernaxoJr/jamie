/**
 * Vocabulary 模組的公開介面。
 * 其他模組（例如 Games）只透過這裡取用單字、類別與答題記錄，不直接依賴內部結構。
 */
import type { Word } from './domain';
import { GeQuiztWords } from './infra/WordBank';
import { WordMetaStorage } from './infra/WordMetaStorage';

export type { Category, Word } from './domain';
export { default as Categories } from './infra/Category';
export { default as CategorySelector } from './ui/CategorySelector.vue';
export { WordPronunciation } from './utils';

/** 取得屬於指定類別的單字 */
export const getWordsByCategories = (categoryIds: string[]): Word[] =>
  GeQuiztWords(new Set(categoryIds));

/** 記錄一次答題結果到長期記憶，會影響單字測驗的出題優先順序 */
export const recordWordAnswer = (english: string, correct: boolean): void =>
  WordMetaStorage.record(english, correct);
