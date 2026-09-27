/**
 * Vocabulary 模組的公開介面。
 * 其他模組（例如 Games）只透過這裡取用單字、類別與答題記錄，不直接依賴內部結構。
 */
import type { Word } from './domain';
import { loadQuizWords } from './infra/WordBank';
import { WordMetaStorage } from './infra/WordMetaStorage';

export type { Category, Word } from './domain';
import Categories from './infra/Category';

export { Categories };
export { default as CategorySelector } from './ui/CategorySelector.vue';
export { WordPronunciation } from './utils';
export { baseAnswer, isCorrectAnswer, letterCount } from './domain/answers';

/** 取得屬於指定類別的單字 */
export const getWordsByCategories = (categoryIds: string[]): Word[] =>
  loadQuizWords(new Set(categoryIds));

/** 連續答對幾次算「熟練」 */
export const MASTERED_STREAK = 3;

export interface ProgressSummary {
  /** 題庫單字總數 */
  total: number;
  /** 至少作答過一次 */
  practiced: number;
  /** 連續答對達 MASTERED_STREAK 次 */
  mastered: number;
  /** 最近一次答錯的單字，連續答錯越多越前面 */
  weak: Word[];
}

/** 整體學習進度（涵蓋所有類別） */
export const getProgressSummary = (): ProgressSummary => {
  const seen = new Set<string>();
  const words = loadQuizWords(new Set(Categories.map((c) => c.id))).filter((w) => {
    const key = w.english.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const practiced = words.filter((w) => w.correctRec.count + w.errorRec.count > 0);
  return {
    total: words.length,
    practiced: practiced.length,
    mastered: words.filter((w) => w.correctRec.consecutive >= MASTERED_STREAK).length,
    weak: practiced
      .filter((w) => w.errorRec.consecutive > 0)
      .sort(
        (a, b) =>
          b.errorRec.consecutive - a.errorRec.consecutive ||
          b.errorRec.lastTime - a.errorRec.lastTime,
      ),
  };
};

/** 記錄一次答題結果到長期記憶，會影響單字測驗的出題優先順序 */
export const recordWordAnswer = (english: string, correct: boolean): void => {
  WordMetaStorage.record(english, correct);
};
