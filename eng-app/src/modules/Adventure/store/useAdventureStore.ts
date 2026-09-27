import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { recordWordAnswer } from 'src/modules/Vocabulary';
import type { GameWord } from 'src/modules/Games/shared';
import { type Area, AREAS, getArea } from '../domain/areas';
import { MAX_LEVEL, xpToNext } from '../domain/rules';

export interface OwnedCreature {
  uid: string;
  speciesId: number;
  level: number;
  xp: number;
  caughtAt: number;
}

interface AdventureSave {
  creatures: OwnedCreature[];
  partnerUid: string | null;
  /** 遇過的字靈編號 */
  seen: number[];
  /** 最近 10 題的對錯，用來計算暴擊率 */
  recentAnswers: boolean[];
}

const RECENT_SIZE = 10;

const emptySave = (): AdventureSave => ({
  creatures: [],
  partnerUid: null,
  seen: [],
  recentAnswers: [],
});

const newUid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const useAdventureStore = defineStore('adventure', () => {
  const save = useLocalStorage<AdventureSave>('adventure-save', emptySave(), {
    mergeDefaults: true,
  });

  const creatures = computed(() => save.value.creatures);
  const hasStarter = computed(() => save.value.creatures.length > 0);
  const partner = computed(
    () =>
      save.value.creatures.find((c) => c.uid === save.value.partnerUid) ?? save.value.creatures[0],
  );

  const caughtIds = computed(() => new Set(save.value.creatures.map((c) => c.speciesId)));
  const seenIds = computed(() => new Set([...save.value.seen, ...caughtIds.value]));
  const isCaught = (speciesId: number) => caughtIds.value.has(speciesId);
  const isSeen = (speciesId: number) => seenIds.value.has(speciesId);

  const recentAccuracy = computed(() => {
    const r = save.value.recentAnswers;
    return r.length === 0 ? 0.5 : r.filter(Boolean).length / r.length;
  });

  const markSeen = (speciesId: number) => {
    if (!save.value.seen.includes(speciesId)) save.value.seen.push(speciesId);
  };

  const catchCreature = (speciesId: number, level: number): OwnedCreature => {
    const c: OwnedCreature = { uid: newUid(), speciesId, level, xp: 0, caughtAt: Date.now() };
    save.value.creatures.push(c);
    markSeen(speciesId);
    save.value.partnerUid ??= c.uid;
    return c;
  };

  const setPartner = (uid: string) => {
    save.value.partnerUid = uid;
  };

  /** 增加經驗值，回傳升了幾級 */
  const gainXp = (uid: string, amount: number): number => {
    const c = save.value.creatures.find((x) => x.uid === uid);
    if (!c) return 0;
    let gained = 0;
    c.xp += amount;
    while (c.level < MAX_LEVEL && c.xp >= xpToNext(c.level)) {
      c.xp -= xpToNext(c.level);
      c.level++;
      gained++;
    }
    return gained;
  };

  /** 記錄答題：更新暴擊率，並寫入單字記憶（影響單字測驗出題） */
  const recordAnswer = (word: GameWord, correct: boolean) => {
    const r = save.value.recentAnswers;
    r.push(correct);
    if (r.length > RECENT_SIZE) r.splice(0, r.length - RECENT_SIZE);
    recordWordAnswer(word.english, correct, 'adventure');
  };

  const caughtInArea = (area: Area) => area.species.filter((id) => isCaught(id)).length;

  const isAreaUnlocked = (area: Area) => {
    if (!area.unlockAfter) return true;
    const prev = getArea(area.unlockAfter.area);
    return !!prev && caughtInArea(prev) >= area.unlockAfter.caught;
  };

  const unlockedAreas = computed(() => AREAS.filter(isAreaUnlocked));

  return {
    creatures,
    hasStarter,
    partner,
    recentAccuracy,
    unlockedAreas,
    isCaught,
    isSeen,
    markSeen,
    catchCreature,
    setPartner,
    gainXp,
    recordAnswer,
    caughtInArea,
    isAreaUnlocked,
  };
});
