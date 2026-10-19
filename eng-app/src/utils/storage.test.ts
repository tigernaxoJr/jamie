import { beforeEach, describe, expect, it } from 'vitest';
import { readJson, writeJson } from './storage';

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

describe('readJson / writeJson', () => {
  it('寫入後可以讀回來', () => {
    expect(writeJson('k', { a: 1 })).toBe(true);
    expect(readJson<{ a: number }>('k')).toEqual({ a: 1 });
  });

  it('沒有資料或格式錯誤回傳 null', () => {
    expect(readJson('missing')).toBeNull();
    localStorage.setItem('bad', '{not json');
    expect(readJson('bad')).toBeNull();
  });

  it('空間不足時回傳 false，不丟例外', () => {
    Object.assign(globalThis, {
      localStorage: {
        getItem: () => null,
        setItem: () => {
          throw new Error('QuotaExceededError');
        },
      },
    });
    expect(writeJson('k', 1)).toBe(false);
  });
});
