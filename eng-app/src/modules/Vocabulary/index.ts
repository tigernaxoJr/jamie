/**
 * Vocabulary 模組的公開介面。
 * 其他模組（例如 Games）只透過這裡取用單字、類別與答題記錄，不直接依賴內部結構。
 */
import type { QuizWord, Word } from './domain';
import { loadQuizWords, topicOf } from './infra/WordBank';
import { WordMetaStorage } from './infra/WordMetaStorage';
import { ActivityLog } from './infra/ActivityLog';
import {
  type ActivityReport,
  type AnswerSource,
  type TodayProgress,
  activityReport,
  todayProgress,
} from './domain/activity';

export { DAILY_GOAL, dayKey } from './domain/activity';
export type { ActivityReport, AnswerSource, DayStat, TodayProgress } from './domain/activity';

export type { Category, QuizWord, Word } from './domain';
export { practiceWeight } from './domain/practice';
import Categories from './infra/Category';

export { Categories };
export { default as CategorySelector } from './ui/CategorySelector.vue';
export { WordPronunciation, speechStatus } from './speech';
export { baseAnswer, isCorrectAnswer, letterCount } from './domain/answers';

/** 取得屬於指定類別的單字（含答題記錄） */
export const getWordsByCategories = (categoryIds: string[]): QuizWord[] =>
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

/** 某一級（例如 '1'）的單字中，已熟練幾個（同一個英文字只算一次） */
export const getMasteredCount = (levelId: string): number => {
  const ids = Categories.filter((c) => c.parentId === levelId).map((c) => c.id);
  const mastered = new Set(
    loadQuizWords(new Set(ids))
      .filter((w) => w.correctRec.consecutive >= MASTERED_STREAK)
      .map((w) => w.english.toLowerCase()),
  );
  return mastered.size;
};

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

/**
 * 記錄一次答題結果：寫入長期記憶（影響單字測驗的出題順序）與學習日誌（每日目標、家長報告）
 */
export const recordWordAnswer = (
  english: string,
  correct: boolean,
  source: AnswerSource = 'game',
): void => {
  WordMetaStorage.record(english, correct);
  ActivityLog.log({ english, correct, source, topic: topicOf(english), now: Date.now() });
};

/** 某個單字目前連續答對幾次（沒作答過為 0） */
export const getCorrectStreak = (english: string): number =>
  WordMetaStorage.loadAll()[english.toLowerCase()]?.correctRec.consecutive ?? 0;

/** 今天的目標進度與連續天數 */
export const getTodayProgress = (): TodayProgress => todayProgress(ActivityLog.load(), Date.now());

/** 最近 n 天的學習報告 */
export const getActivityReport = (days = 7): ActivityReport =>
  activityReport(ActivityLog.load(), Date.now(), days);

/** 由英文字查中文（同一個字有多個意思時以「、」合併），報告顯示用 */
export const chineseOf = (english: string): string => {
  const key = english.toLowerCase();
  const meanings = loadQuizWords(new Set(Categories.map((c) => c.id)))
    .filter((w) => w.english.toLowerCase() === key)
    .map((w) => w.chinese);
  return [...new Set(meanings)].join('、');
};
