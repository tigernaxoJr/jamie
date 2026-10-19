/**
 * localStorage 的 JSON 讀寫。
 * 私密模式、空間不足或資料損毀時都不丟例外，呼叫端只要處理 null / false。
 */

/** 讀取 JSON；沒有資料、格式錯誤或無法存取 localStorage 時回傳 null */
export const readJson = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

/** 寫入 JSON；空間不足等失敗時回傳 false（用在遺失也不影響使用的資料，例如日誌） */
export const writeJson = (key: string, value: unknown): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};
