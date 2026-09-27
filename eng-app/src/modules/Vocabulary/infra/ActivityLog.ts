import { type ActivityData, type AnswerEvent, emptyActivity, logAnswer } from '../domain/activity';

const STORAGE_KEY = 'activity-log';

/** 學習日誌的儲存（localStorage 'activity-log'） */
export const ActivityLog = {
  load(): ActivityData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...emptyActivity(), ...(JSON.parse(raw) as ActivityData) } : emptyActivity();
    } catch {
      return emptyActivity();
    }
  },

  log(event: AnswerEvent): ActivityData {
    const data = logAnswer(this.load(), event);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // 空間不足時放棄記錄日誌，不影響答題
    }
    return data;
  },
};
