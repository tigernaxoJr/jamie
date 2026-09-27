/**
 * 學習進度的備份與還原。
 * 所有進度都存在這個網站的 localStorage，備份就是把全部 key 打包成 JSON。
 * 用「全部 key」而不是列舉，之後新增的資料也會自動包含。
 */

export const BACKUP_APP = 'jamie-english';
export const BACKUP_VERSION = 1;

/** 不需要備份的 key（裝置專屬的暫存設定） */
const EXCLUDED_KEYS = new Set(['speech-notice-dismissed']);

export interface Backup {
  app: typeof BACKUP_APP;
  version: number;
  exportedAt: string;
  data: Record<string, string>;
}

type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>;

const keysOf = (storage: KeyValueStorage) => {
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const k = storage.key(i);
    if (k !== null && !EXCLUDED_KEYS.has(k)) keys.push(k);
  }
  return keys;
};

export const createBackup = (storage: KeyValueStorage, now = new Date()): Backup => {
  const data: Record<string, string> = {};
  for (const k of keysOf(storage)) {
    const v = storage.getItem(k);
    if (v !== null) data[k] = v;
  }
  return { app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: now.toISOString(), data };
};

export class BackupError extends Error {}

/** 解析並檢查備份內容，格式不對會丟出 BackupError（訊息給使用者看） */
export const parseBackup = (text: string): Backup => {
  let raw: unknown;
  try {
    raw = JSON.parse(text.trim());
  } catch {
    throw new BackupError('這不是備份檔（內容無法讀取）');
  }
  const b = raw as Partial<Backup>;
  if (!b || b.app !== BACKUP_APP || typeof b.data !== 'object' || b.data === null) {
    throw new BackupError('這不是 Jamie 英文 App 的備份檔');
  }
  if (typeof b.version !== 'number' || b.version > BACKUP_VERSION) {
    throw new BackupError('備份檔的版本比這個 App 新，請先更新 App');
  }
  const entries = Object.entries(b.data);
  if (entries.some(([, v]) => typeof v !== 'string')) {
    throw new BackupError('備份檔內容損毀');
  }
  return b as Backup;
};

/** 用備份取代目前的所有進度 */
export const restoreBackup = (storage: KeyValueStorage, backup: Backup): void => {
  for (const k of keysOf(storage)) storage.removeItem(k);
  for (const [k, v] of Object.entries(backup.data)) storage.setItem(k, v);
};

/** 備份摘要，給使用者確認用 */
export const summarizeBackup = (backup: Backup) => {
  const count = (key: string) => {
    try {
      const v: unknown = JSON.parse(backup.data[key] ?? 'null');
      return v && typeof v === 'object' ? v : null;
    } catch {
      return null;
    }
  };
  const words = count('word-metadata');
  const adventure = count('adventure-save') as { creatures?: unknown[] } | null;
  return {
    exportedAt: new Date(backup.exportedAt),
    words: words ? Object.keys(words).length : 0,
    creatures: Array.isArray(adventure?.creatures) ? adventure.creatures.length : 0,
  };
};
