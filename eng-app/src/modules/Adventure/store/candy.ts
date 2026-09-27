import { computed } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { dayKey } from 'src/modules/Vocabulary';
import { candiesForGame, cappedCandies } from '../domain/candy';

interface CandyWallet {
  candies: number;
  /** today 是哪一天拿到的（YYYY-MM-DD） */
  day: string;
  /** 當天從小遊戲拿到的數量 */
  today: number;
}

/**
 * 字靈糖果錢包。獨立存放，不放進 adventure-save：
 * 小遊戲（Games 模組）寫入時不需要載入字靈探險的資料與 store。
 */
const wallet = useLocalStorage<CandyWallet>(
  'adventure-candy',
  { candies: 0, day: '', today: 0 },
  { mergeDefaults: true },
);

export const candyCount = computed(() => wallet.value.candies);

export interface CandyReward {
  /** 實際拿到的糖果 */
  candies: number;
  /** 被每日上限擋掉的糖果 */
  capped: number;
}

/** 小遊戲結算時發糖果 */
export const grantGameCandies = (correct: number, won: boolean): CandyReward => {
  const earned = candiesForGame(correct, won);
  const w = wallet.value;
  const today = dayKey(Date.now());
  if (w.day !== today) {
    w.day = today;
    w.today = 0;
  }
  const candies = cappedCandies(earned, w.today);
  w.today += candies;
  w.candies += candies;
  return { candies, capped: earned - candies };
};

/** 任務等額外獎勵：不受小遊戲的每日上限限制 */
export const grantBonusCandies = (n: number): void => {
  if (n > 0) wallet.value.candies += n;
};

/** 花糖果，不夠就回傳 false */
export const spendCandies = (n: number): boolean => {
  if (wallet.value.candies < n) return false;
  wallet.value.candies -= n;
  return true;
};
