/**
 * 學習日誌：每天答了幾題、答對幾題、練習多久、用什麼方式、練了哪些主題、錯了哪些字。
 * 這裡只有純計算，儲存在 infra/ActivityLog.ts。
 */

/** 每天答對幾題算達成目標 */
export const DAILY_GOAL = 10;

/** 兩次作答間隔在這之內，算是連續在練習（秒） */
const ACTIVE_GAP_SECONDS = 120;
/** 間隔太久（新的一段練習）時，這一題算多少秒 */
const FIRST_ANSWER_SECONDS = 15;
/** 保留幾天 */
export const KEEP_DAYS = 60;

/** 答題來源，報告用來統計練習方式 */
export type AnswerSource = 'quiz' | 'game' | 'adventure';

export interface DayStat {
  answered: number;
  correct: number;
  seconds: number;
  sources: Partial<Record<AnswerSource, number>>;
  /** 子類別 id → 題數 */
  topics: Record<string, number>;
  /** 英文字（小寫）→ 答錯次數 */
  wrongWords: Record<string, number>;
}

export interface ActivityData {
  days: Record<string, DayStat>;
  /** 上一次作答時間（毫秒），用來估算練習時間 */
  lastAnswerAt: number;
}

export interface AnswerEvent {
  english: string;
  correct: boolean;
  source: AnswerSource;
  /** 所屬子類別，找不到時為 undefined */
  topic: string | undefined;
  now: number;
}

export const emptyActivity = (): ActivityData => ({ days: {}, lastAnswerAt: 0 });

const emptyDay = (): DayStat => ({
  answered: 0,
  correct: 0,
  seconds: 0,
  sources: {},
  topics: {},
  wrongWords: {},
});

/** 當地日期字串 YYYY-MM-DD */
export const dayKey = (time: number | Date): string => {
  const d = new Date(time);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** 往前推 n 天的日期字串 */
export const dayKeyBefore = (now: number, n: number): string => {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return dayKey(d);
};

/** 記錄一次作答（就地修改並回傳 data） */
export const logAnswer = (data: ActivityData, e: AnswerEvent): ActivityData => {
  const key = dayKey(e.now);
  const day = (data.days[key] ??= emptyDay());
  day.answered++;
  if (e.correct) day.correct++;
  else {
    const w = e.english.toLowerCase();
    day.wrongWords[w] = (day.wrongWords[w] ?? 0) + 1;
  }
  day.sources[e.source] = (day.sources[e.source] ?? 0) + 1;
  if (e.topic) day.topics[e.topic] = (day.topics[e.topic] ?? 0) + 1;

  const gap = (e.now - data.lastAnswerAt) / 1000;
  day.seconds += gap > 0 && gap <= ACTIVE_GAP_SECONDS ? Math.round(gap) : FIRST_ANSWER_SECONDS;
  data.lastAnswerAt = e.now;

  // 只留最近 KEEP_DAYS 天
  const oldest = dayKeyBefore(e.now, KEEP_DAYS - 1);
  for (const k of Object.keys(data.days)) if (k < oldest) delete data.days[k];
  return data;
};

const goalMet = (day: DayStat | undefined) => (day?.correct ?? 0) >= DAILY_GOAL;

/**
 * 連續達成目標的天數。今天還沒達成不會中斷（從昨天往回算），
 * 今天達成就連今天一起算。
 */
export const streakDays = (data: ActivityData, now: number): number => {
  let n = goalMet(data.days[dayKey(now)]) ? 1 : 0;
  for (let i = 1; goalMet(data.days[dayKeyBefore(now, i)]); i++) n++;
  return n;
};

export interface TodayProgress {
  correct: number;
  answered: number;
  goal: number;
  done: boolean;
  streak: number;
}

export const todayProgress = (data: ActivityData, now: number): TodayProgress => {
  const day = data.days[dayKey(now)];
  return {
    correct: day?.correct ?? 0,
    answered: day?.answered ?? 0,
    goal: DAILY_GOAL,
    done: goalMet(day),
    streak: streakDays(data, now),
  };
};

export interface ActivityReport {
  /** 由舊到新 */
  days: { key: string; stat: DayStat | undefined }[];
  answered: number;
  correct: number;
  seconds: number;
  goalDays: number;
  sources: Partial<Record<AnswerSource, number>>;
  /** 題數最多的主題，[子類別 id, 題數] */
  topics: [string, number][];
  /** 答錯最多的字，[英文, 次數] */
  wrongWords: [string, number][];
}

const add = <K extends string>(
  into: Partial<Record<K, number>>,
  from: Partial<Record<K, number>>,
) => {
  for (const [k, v] of Object.entries(from) as [K, number][]) into[k] = (into[k] ?? 0) + v;
};

const top = (m: Record<string, number>, n: number): [string, number][] =>
  Object.entries(m)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);

/** 最近 n 天的報告 */
export const activityReport = (data: ActivityData, now: number, n = 7): ActivityReport => {
  const days = Array.from({ length: n }, (_, i) => {
    const key = dayKeyBefore(now, n - 1 - i);
    return { key, stat: data.days[key] };
  });
  const sources: Partial<Record<AnswerSource, number>> = {};
  const topics: Record<string, number> = {};
  const wrong: Record<string, number> = {};
  let answered = 0;
  let correct = 0;
  let seconds = 0;
  for (const { stat } of days) {
    if (!stat) continue;
    answered += stat.answered;
    correct += stat.correct;
    seconds += stat.seconds;
    add(sources, stat.sources);
    add(topics, stat.topics);
    add(wrong, stat.wrongWords);
  }
  return {
    days,
    answered,
    correct,
    seconds,
    goalDays: days.filter((d) => goalMet(d.stat)).length,
    sources,
    topics: top(topics, 5),
    wrongWords: top(wrong, 10),
  };
};
