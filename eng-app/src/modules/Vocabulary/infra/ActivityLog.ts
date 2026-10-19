import { readJson, writeJson } from 'src/utils/storage';
import { type ActivityData, type AnswerEvent, emptyActivity, logAnswer } from '../domain/activity';

const STORAGE_KEY = 'activity-log';

/** 學習日誌的儲存（localStorage 'activity-log'） */
export const ActivityLog = {
  load(): ActivityData {
    return { ...emptyActivity(), ...readJson<ActivityData>(STORAGE_KEY) };
  },

  log(event: AnswerEvent): ActivityData {
    const data = logAnswer(this.load(), event);
    // 空間不足時放棄記錄日誌，不影響答題
    writeJson(STORAGE_KEY, data);
    return data;
  },
};
