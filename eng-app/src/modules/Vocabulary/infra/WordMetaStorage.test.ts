import { beforeEach, describe, expect, it } from 'vitest';
import { WordMetaStorage } from './WordMetaStorage';

/** 測試環境沒有 localStorage，用記憶體版本代替 */
const memoryStorage = () => {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
};

beforeEach(() => {
  Object.assign(globalThis, { localStorage: memoryStorage() });
});

describe('WordMetaStorage.record', () => {
  it('同一個英文字的多次作答會累加，不會互相覆蓋', () => {
    // 例如「右邊→right」答對、再「正確的→right」答對
    WordMetaStorage.record('right', true);
    const entry = WordMetaStorage.record('Right', true);
    expect(entry.correctRec.count).toBe(2);
    expect(entry.correctRec.consecutive).toBe(2);
    expect(WordMetaStorage.loadAll().right?.correctRec.count).toBe(2);
  });

  it('答錯會重置連續答對', () => {
    WordMetaStorage.record('apple', true);
    const entry = WordMetaStorage.record('apple', false);
    expect(entry.correctRec.consecutive).toBe(0);
    expect(entry.errorRec.consecutive).toBe(1);
  });

  it('removeMany 只清除指定的字', () => {
    WordMetaStorage.record('apple', true);
    WordMetaStorage.record('banana', true);
    WordMetaStorage.removeMany(['Apple']);
    expect(Object.keys(WordMetaStorage.loadAll())).toEqual(['banana']);
  });
});
