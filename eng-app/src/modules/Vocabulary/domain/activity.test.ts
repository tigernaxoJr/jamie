import { describe, expect, it } from 'vitest';
import {
  DAILY_GOAL,
  type ActivityData,
  activityReport,
  dayKey,
  emptyActivity,
  logAnswer,
  streakDays,
  todayProgress,
} from './activity';

const DAY = 86_400_000;
const noon = new Date(2026, 8, 27, 12, 0, 0).getTime();

const answer = (data: ActivityData, now: number, correct = true, english = 'apple') =>
  logAnswer(data, { english, correct, source: 'quiz', topic: '1_8', now });

/** 某天答對 n 題 */
const correctOn = (data: ActivityData, dayOffset: number, n: number) => {
  for (let i = 0; i < n; i++) answer(data, noon - dayOffset * DAY + i * 1000);
};

describe('logAnswer', () => {
  it('累加題數、對錯、主題與錯字', () => {
    const d = emptyActivity();
    answer(d, noon, true);
    answer(d, noon + 5000, false, 'Dog');
    const day = d.days[dayKey(noon)]!;
    expect(day.answered).toBe(2);
    expect(day.correct).toBe(1);
    expect(day.topics['1_8']).toBe(2);
    expect(day.wrongWords.dog).toBe(1);
    expect(day.sources.quiz).toBe(2);
  });

  it('連續作答算實際間隔，間隔太久只算固定秒數', () => {
    const d = emptyActivity();
    answer(d, noon); // 第一題：15 秒
    answer(d, noon + 30_000); // +30 秒
    answer(d, noon + 30_000 + 10 * 60_000); // 隔 10 分鐘：新的一段，15 秒
    expect(d.days[dayKey(noon)]!.seconds).toBe(15 + 30 + 15);
  });

  it('只保留最近 60 天', () => {
    const d = emptyActivity();
    answer(d, noon - 70 * DAY);
    answer(d, noon);
    expect(Object.keys(d.days)).toEqual([dayKey(noon)]);
  });
});

describe('streakDays / todayProgress', () => {
  it('今天還沒達成時，從昨天往回算', () => {
    const d = emptyActivity();
    correctOn(d, 1, DAILY_GOAL);
    correctOn(d, 2, DAILY_GOAL);
    correctOn(d, 0, 3);
    expect(streakDays(d, noon)).toBe(2);
    expect(todayProgress(d, noon)).toMatchObject({ correct: 3, done: false, streak: 2 });
  });

  it('今天達成就連今天一起算；中間斷一天就重新計算', () => {
    const d = emptyActivity();
    correctOn(d, 0, DAILY_GOAL);
    correctOn(d, 1, DAILY_GOAL);
    correctOn(d, 3, DAILY_GOAL);
    expect(streakDays(d, noon)).toBe(2);
  });
});

describe('activityReport', () => {
  it('統計最近 7 天', () => {
    const d = emptyActivity();
    correctOn(d, 0, DAILY_GOAL);
    answer(d, noon - 2 * DAY, false, 'cat');
    answer(d, noon - 2 * DAY + 1000, false, 'cat');
    answer(d, noon - 10 * DAY); // 超過 7 天，不算
    const r = activityReport(d, noon);
    expect(r.days).toHaveLength(7);
    expect(r.days[6]!.key).toBe(dayKey(noon));
    expect(r.answered).toBe(DAILY_GOAL + 2);
    expect(r.correct).toBe(DAILY_GOAL);
    expect(r.goalDays).toBe(1);
    expect(r.wrongWords).toEqual([['cat', 2]]);
    expect(r.topics).toEqual([['1_8', DAILY_GOAL + 2]]);
  });
});
