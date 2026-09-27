import { computed, reactive, ref, shallowRef } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { recordWordAnswer } from 'src/modules/Vocabulary';
import { grantGameCandies } from 'src/modules/Adventure';
import type { GameInfo, GameResult, GameWord } from './types';
import { loadGameWords, shuffle } from './words';
import { reviewDeck } from './review';

export type GamePhase = 'setup' | 'playing' | 'result';

export const bestScoreKey = (gameId: string) => `game-best-${gameId}`;

/**
 * 所有單字遊戲共用的流程：選類別 → 遊戲中 → 結算。
 * 各遊戲只需要在 onStart 收到單字後開始自己的邏輯，結束時呼叫 finish。
 */
export function useGameSession(info: GameInfo, onStart: (words: GameWord[]) => void) {
  const categories = useLocalStorage<string[]>('games-selected-categories', []);
  const phase = ref<GamePhase>('setup');
  const result = shallowRef<GameResult | null>(null);
  const bestScore = useLocalStorage<number>(bestScoreKey(info.id), 0);
  const isNewBest = ref(false);
  /** 這局答對幾題（換算糖果用） */
  let correctCount = 0;

  const availableWords = computed(() => loadGameWords(categories.value, info.wordFilter));
  const canStart = computed(() => availableWords.value.length >= info.minWords);

  /** 這局是不是「只練答錯的字」 */
  const reviewing = ref(false);

  const begin = (list: GameWord[], review: boolean) => {
    result.value = null;
    isNewBest.value = false;
    correctCount = 0;
    reviewing.value = review;
    phase.value = 'playing';
    onStart(shuffle(list));
  };

  const start = () => {
    if (canStart.value) begin(availableWords.value, false);
  };

  /** 複習：答錯的字大量出現，再補幾個其他字，讓遊戲有足夠的選項 */
  const startReview = (words: readonly GameWord[]) => {
    if (words.length === 0) return start();
    begin(reviewDeck(words, availableWords.value, info.minWords), true);
  };

  const finish = (r: GameResult) => {
    result.value = { ...r, reward: grantGameCandies(correctCount, r.won) };
    isNewBest.value = r.score > bestScore.value;
    if (isNewBest.value) bestScore.value = r.score;
    phase.value = 'result';
  };

  const setCategories = (ids: string[]) => {
    categories.value = ids;
  };

  const toSetup = () => {
    phase.value = 'setup';
  };

  /** 記錄答題：累計糖果，並寫入單字長期記憶（僅限設定為會記錄的遊戲） */
  const record = (word: GameWord, correct: boolean) => {
    if (correct) correctCount++;
    if (info.recordsProgress) recordWordAnswer(word.english, correct);
  };

  return reactive({
    info,
    categories,
    phase,
    result,
    bestScore,
    isNewBest,
    availableCount: computed(() => availableWords.value.length),
    canStart,
    setCategories,
    start,
    startReview,
    reviewing,
    finish,
    toSetup,
    record,
  });
}

export type GameSession = ReturnType<typeof useGameSession>;
