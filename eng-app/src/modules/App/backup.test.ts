import { describe, expect, it } from 'vitest';
import { BackupError, createBackup, parseBackup, restoreBackup, summarizeBackup } from './backup';

/** 記憶體版 localStorage */
const memoryStorage = (init: Record<string, string> = {}) => {
  const data = new Map(Object.entries(init));
  return {
    get length() {
      return data.size;
    },
    key: (i: number) => [...data.keys()][i] ?? null,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
    dump: () => Object.fromEntries(data),
  };
};

describe('backup', () => {
  it('備份包含所有進度，但不含裝置專屬設定', () => {
    const s = memoryStorage({
      'word-metadata': '{"apple":{}}',
      'adventure-save': '{"creatures":[1,2]}',
      'speech-notice-dismissed': 'true',
    });
    const b = createBackup(s, new Date('2026-01-01T00:00:00Z'));
    expect(Object.keys(b.data).sort()).toEqual(['adventure-save', 'word-metadata']);
    expect(b.exportedAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('還原會取代目前的進度', () => {
    const source = memoryStorage({ 'word-metadata': '{"apple":{}}', 'game-best-snake': '120' });
    const target = memoryStorage({ 'word-metadata': '{"old":{}}', 'quiz-last-word-ids': '[1]' });
    restoreBackup(target, parseBackup(JSON.stringify(createBackup(source))));
    expect(target.dump()).toEqual({ 'word-metadata': '{"apple":{}}', 'game-best-snake': '120' });
  });

  it('摘要算出單字數與字靈數', () => {
    const b = createBackup(
      memoryStorage({
        'word-metadata': '{"a":{},"b":{}}',
        'adventure-save': '{"creatures":[1,2,3]}',
      }),
    );
    const s = summarizeBackup(b);
    expect(s.words).toBe(2);
    expect(s.creatures).toBe(3);
  });

  it('格式不對的內容會被拒絕', () => {
    expect(() => parseBackup('not json')).toThrow(BackupError);
    expect(() => parseBackup('{"app":"other","version":1,"data":{}}')).toThrow(BackupError);
    expect(() => parseBackup('{"app":"jamie-english","version":99,"data":{}}')).toThrow(
      BackupError,
    );
    expect(() => parseBackup('{"app":"jamie-english","version":1,"data":{"a":1}}')).toThrow(
      BackupError,
    );
  });
});
