import { computed } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { dayKey, getActivityReport, getTodayProgress } from 'src/modules/Vocabulary';
import {
  ALL_DONE_BONUS,
  type Quest,
  type QuestCounts,
  type QuestId,
  emptyCounts,
  questProgress,
  questsForDay,
} from '../domain/quests';

interface QuestSave {
  day: string;
  counts: QuestCounts;
  claimed: QuestId[];
  bonusClaimed: boolean;
}

const emptySave = (day: string): QuestSave => ({
  day,
  counts: emptyCounts(),
  claimed: [],
  bonusClaimed: false,
});

const save = useLocalStorage<QuestSave>('daily-quests', emptySave(''), { mergeDefaults: true });

/** 換日時重設進度 */
const today = (): QuestSave => {
  const day = dayKey(Date.now());
  if (save.value.day !== day) save.value = emptySave(day);
  return save.value;
};

/** 其他模組回報的事件 */
export type QuestEvent =
  | { type: 'game'; gameId: string; stageCleared: boolean; stars: number; review: boolean }
  | { type: 'catch' }
  | { type: 'feed' };

export const trackQuest = (e: QuestEvent): void => {
  const c = today().counts;
  if (e.type === 'game') {
    if (!c.games.includes(e.gameId)) c.games.push(e.gameId);
    if (e.stageCleared) c.stage++;
    if (e.stars >= 3) c.stars++;
    if (e.review) c.review++;
  } else {
    c[e.type]++;
  }
};

export interface QuestStatus {
  quest: Quest;
  progress: number;
  done: boolean;
  claimed: boolean;
}

/** 今天的任務與進度（畫面打開時讀一次；領取後會更新） */
export function useDailyQuests() {
  today();
  // 學習日誌不是響應式的，畫面打開時算一次，之後跟著 save 的變化重新計算
  const statuses = computed<QuestStatus[]>(() => {
    const s = save.value;
    const t = getTodayProgress();
    const live = { goalDone: t.done, quizAnswers: getActivityReport(1).sources.quiz ?? 0 };
    return questsForDay(s.day).map((quest) => {
      const progress = questProgress(quest, s.counts, live);
      return {
        quest,
        progress,
        done: progress >= quest.target,
        claimed: s.claimed.includes(quest.id),
      };
    });
  });

  const allClaimed = computed(() => statuses.value.every((q) => q.claimed));
  const bonusClaimed = computed(() => save.value.bonusClaimed);

  /** 領取任務獎勵，回傳糖果數（不能領回傳 0） */
  const claim = (id: QuestId): number => {
    const st = statuses.value.find((q) => q.quest.id === id);
    if (!st || !st.done || st.claimed) return 0;
    today().claimed.push(id);
    return st.quest.reward;
  };

  /** 3 個都領完後的額外獎勵 */
  const claimBonus = (): number => {
    if (!allClaimed.value || save.value.bonusClaimed) return 0;
    today().bonusClaimed = true;
    return ALL_DONE_BONUS;
  };

  return { statuses, allClaimed, bonusClaimed, claim, claimBonus };
}
