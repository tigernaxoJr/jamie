import { describe, expect, it } from 'vitest';
import { QUESTS, emptyCounts, questProgress, questsForDay } from './quests';

describe('daily quests', () => {
  it('同一天的任務固定，每天 3 個不重複，第一個是背單字', () => {
    const a = questsForDay('2026-09-27');
    expect(questsForDay('2026-09-27')).toEqual(a);
    expect(a).toHaveLength(3);
    expect(new Set(a.map((q) => q.id)).size).toBe(3);
    expect(['goal', 'quiz']).toContain(a[0]!.id);
  });

  it('不同天的任務會換', () => {
    const days = Array.from({ length: 10 }, (_, i) => `2026-10-${String(i + 1).padStart(2, '0')}`);
    const combos = new Set(
      days.map((d) =>
        questsForDay(d)
          .map((q) => q.id)
          .join(','),
      ),
    );
    expect(combos.size).toBeGreaterThan(3);
  });

  it('進度不超過目標；玩遊戲算不同的遊戲數', () => {
    const live = { goalDone: false, quizAnswers: 25 };
    expect(questProgress(QUESTS.quiz, emptyCounts(), live)).toBe(10);
    const counts = { ...emptyCounts(), games: ['space'] };
    expect(questProgress(QUESTS.play, counts, live)).toBe(1);
    expect(questProgress(QUESTS.goal, counts, { ...live, goalDone: true })).toBe(1);
  });
});
