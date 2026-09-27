import { describe, expect, it } from 'vitest';
import { firstOpenStage, isStageUnlocked, nextStageIndex, sameSelection } from './stages';

describe('stages', () => {
  it('前一關拿到星星才解鎖下一關', () => {
    expect(isStageUnlocked(0, [])).toBe(true);
    expect(isStageUnlocked(1, [])).toBe(false);
    expect(isStageUnlocked(1, [1])).toBe(true);
    expect(isStageUnlocked(2, [3, 0])).toBe(false);
  });

  it('預設選還沒拿到星星的第一關，全破選最後一關', () => {
    expect(firstOpenStage(3, [])).toBe(0);
    expect(firstOpenStage(3, [2])).toBe(1);
    expect(firstOpenStage(3, [3, 3, 1])).toBe(2);
  });

  it('過關才有下一關', () => {
    const stage = (index: number) => ({ kind: 'stage' as const, index });
    expect(nextStageIndex(stage(0), true, 3)).toBe(1);
    expect(nextStageIndex(stage(0), false, 3)).toBeNull();
    expect(nextStageIndex(stage(2), true, 3)).toBeNull();
    expect(nextStageIndex({ kind: 'endless' }, true, 3)).toBeNull();
  });

  it('比較選擇', () => {
    expect(sameSelection({ kind: 'endless' }, { kind: 'endless' })).toBe(true);
    expect(sameSelection({ kind: 'endless' }, { kind: 'stage', index: 0 })).toBe(false);
    expect(sameSelection({ kind: 'stage', index: 1 }, { kind: 'stage', index: 1 })).toBe(true);
  });
});
