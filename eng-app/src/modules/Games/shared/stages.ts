import { computed } from 'vue';
import { useLocalStorage } from '@vueuse/core';

/** 關卡制遊戲的選擇：第 index 關，或無盡模式 */
export type StageSelection = { kind: 'stage'; index: number } | { kind: 'endless' };

/** 關卡選單上顯示的資訊 */
export interface StageCard {
  name: string;
  emoji: string;
}

/** 第 index 關是否解鎖：第 1 關一定解鎖，之後要前一關拿到星星 */
export const isStageUnlocked = (index: number, stars: readonly number[]): boolean =>
  index === 0 || (stars[index - 1] ?? 0) > 0;

export const sameSelection = (a: StageSelection, b: StageSelection): boolean =>
  a.kind === 'endless' || b.kind === 'endless' ? a.kind === b.kind : a.index === b.index;

/** 還沒拿到星星的第一關（全破就回傳最後一關），當作預設選擇 */
export const firstOpenStage = (count: number, stars: readonly number[]): number => {
  for (let i = 0; i < count; i++) {
    if (isStageUnlocked(i, stars) && !(stars[i] ?? 0)) return i;
  }
  return count - 1;
};

/** 過關後的下一關；沒過關、無盡模式或已經是最後一關時回傳 null */
export const nextStageIndex = (sel: StageSelection, won: boolean, count: number): number | null =>
  sel.kind === 'stage' && won && sel.index + 1 < count ? sel.index + 1 : null;

/** 讀取 localStorage 裡的 JSON（讀不到或格式錯誤回傳 null） */
export const readSaved = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

/** 遊戲中心卡片用：「⭐ 已拿星數 / 滿星」，還沒拿過星星回傳 null */
export const starsProgress = (storageKey: string, stageCount: number) => (): string | null => {
  const stars = readSaved<{ stars?: number[] }>(storageKey)?.stars ?? [];
  const total = stars.reduce((sum, n) => sum + (n ?? 0), 0);
  return total > 0 ? `⭐ ${total} / ${stageCount * 3}` : null;
};

/** 每一關拿到的最高星數，存在 localStorage */
export function useStageProgress(storageKey: string) {
  const save = useLocalStorage<{ stars: number[] }>(
    storageKey,
    { stars: [] },
    { mergeDefaults: true },
  );
  const stars = computed(() => save.value.stars);
  const totalStars = computed(() => save.value.stars.reduce((sum, n) => sum + (n ?? 0), 0));

  /** 記錄過關星數（只保留最高） */
  const recordStars = (index: number, n: number) => {
    const next = [...save.value.stars];
    while (next.length <= index) next.push(0);
    next[index] = Math.max(next[index] ?? 0, n);
    save.value.stars = next;
  };

  return { stars, totalStars, recordStars };
}
