import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { readJson } from 'src/utils/storage';
import { getMasteredCount, recordWordAnswer } from 'src/modules/Vocabulary';
import type { GameWord } from 'src/modules/Games/shared';
import { type Area, AREAS, getArea, homeAreaOf } from '../domain/areas';
import {
  EVOLVE_LEVEL,
  EVOLVE_MASTERED,
  GYM_REQUIRED_CAUGHT,
  MAX_LEVEL,
  TEAM_SIZE,
  canEvolve,
  xpToNext,
} from '../domain/rules';
import { CANDY_XP, RELEASE_CANDY } from '../domain/candy';
import { AREA_COMPLETE_CANDY, EGG_COST, hatchEgg } from '../domain/egg';
import { getSpecies } from '../domain/species';
import { rollShiny } from '../domain/shiny';
import { addLostWord } from '../domain/lost';
import { canAppearInWild } from '../domain/legend';
import { trackQuest } from 'src/modules/Quests';
import { grantBonusCandies, spendCandies } from './candy';

export interface OwnedCreature {
  uid: string;
  speciesId: number;
  level: number;
  xp: number;
  caughtAt: number;
  /** 1：一般；2：進化後（舊存檔沒有這個欄位，視為 1） */
  stage?: number;
  /** 色違字靈（舊存檔沒有這個欄位，視為 false） */
  shiny?: boolean;
}

interface AdventureSave {
  creatures: OwnedCreature[];
  /** 舊版的單一夥伴；新版以 teamUids[0] 為隊長 */
  partnerUid: string | null;
  /** 隊伍（最多 TEAM_SIZE 隻），第一隻是隊長 */
  teamUids: string[];
  /** 打贏館主拿到的徽章（地區 id） */
  badges: string[];
  /** 遇過的字靈編號 */
  seen: number[];
  /** 最近 10 題的對錯，用來計算暴擊率 */
  recentAnswers: boolean[];
  /** 探險中答錯、還沒找回的單字（迷路字靈出題用） */
  lostWords: GameWord[];
  /** 已經領過全收集獎勵的地區 id */
  completedAreas: string[];
}

const RECENT_SIZE = 10;

const emptySave = (): AdventureSave => ({
  creatures: [],
  partnerUid: null,
  teamUids: [],
  badges: [],
  seen: [],
  recentAnswers: [],
  lostWords: [],
  completedAreas: [],
});

const STORAGE_KEY = 'adventure-save';

/**
 * 舊版存檔（沒有 badges 欄位）轉換：
 * 舊規則是「前一區收服 3 種就解鎖下一區」，把當時已達成的地區補發徽章，進度不會倒退；
 * 隊伍依等級挑前幾隻補滿。只在第一次載入舊存檔時執行。
 */
const migrateLegacySave = (): Partial<AdventureSave> | null => {
  try {
    const old = readJson<Partial<AdventureSave>>(STORAGE_KEY);
    if (!old || 'badges' in old) return null;
    const creatures = old.creatures ?? [];
    const caught = new Set(creatures.map((c) => c.speciesId));
    const badges = AREAS.filter(
      (a) => a.species.filter((id) => caught.has(id)).length >= GYM_REQUIRED_CAUGHT,
    ).map((a) => a.id);
    const leader = creatures.find((c) => c.uid === old.partnerUid) ?? creatures[0];
    const others = creatures
      .filter((c) => c !== leader)
      .sort((a, b) => b.level - a.level)
      .map((c) => c.uid);
    const teamUids = leader ? [leader.uid, ...others].slice(0, TEAM_SIZE) : [];
    return { badges, teamUids };
  } catch {
    return null;
  }
};

const newUid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export interface EvolveStatus {
  canEvolve: boolean;
  evolved: boolean;
  level: number;
  needLevel: number;
  mastered: number;
  needMastered: number;
  /** 要熟練哪一級的單字 */
  wordLevelName: string;
}

export const useAdventureStore = defineStore('adventure', () => {
  const legacy = migrateLegacySave();
  const save = useLocalStorage<AdventureSave>(STORAGE_KEY, emptySave(), {
    mergeDefaults: true,
  });
  if (legacy) Object.assign(save.value, legacy);

  const creatures = computed(() => save.value.creatures);
  const hasStarter = computed(() => save.value.creatures.length > 0);
  const byUid = (uid: string | null | undefined) => save.value.creatures.find((c) => c.uid === uid);

  /** 隊伍；舊存檔沒有 teamUids 時，用原本的夥伴 */
  const team = computed<OwnedCreature[]>(() => {
    const members = save.value.teamUids.flatMap((uid) => byUid(uid) ?? []);
    if (members.length > 0) return members.slice(0, TEAM_SIZE);
    const fallback = byUid(save.value.partnerUid) ?? save.value.creatures[0];
    return fallback ? [fallback] : [];
  });
  /** 隊長（地圖上顯示、對戰先上場） */
  const partner = computed(() => team.value[0]);
  const isInTeam = (uid: string) => team.value.some((c) => c.uid === uid);

  const writeTeam = (uids: string[]) => {
    save.value.teamUids = uids.slice(0, TEAM_SIZE);
    save.value.partnerUid = save.value.teamUids[0] ?? null;
  };

  /** 加入隊伍；滿了回傳 false */
  const addToTeam = (uid: string): boolean => {
    const uids = team.value.map((c) => c.uid);
    if (uids.includes(uid)) return true;
    if (uids.length >= TEAM_SIZE) return false;
    writeTeam([...uids, uid]);
    return true;
  };

  /** 移出隊伍（至少要留一隻） */
  const removeFromTeam = (uid: string) => {
    const uids = team.value.map((c) => c.uid).filter((u) => u !== uid);
    if (uids.length > 0) writeTeam(uids);
  };

  /** 用隊伍外的字靈換下某個隊員，位置不變 */
  const replaceInTeam = (outUid: string, inUid: string) => {
    const uids = team.value.map((c) => c.uid);
    if (!uids.includes(outUid) || uids.includes(inUid) || !byUid(inUid)) return;
    writeTeam(uids.map((u) => (u === outUid ? inUid : u)));
  };

  /** 設為隊長（排到第一個，不在隊伍中就加入） */
  const setPartner = (uid: string) => {
    const rest = team.value.map((c) => c.uid).filter((u) => u !== uid);
    writeTeam([uid, ...rest]);
  };

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

  const shinyCaughtIds = computed(
    () => new Set(save.value.creatures.filter((c) => c.shiny).map((c) => c.speciesId)),
  );
  const isShinyCaught = (speciesId: number) => shinyCaughtIds.value.has(speciesId);
  const shinyCount = computed(() => shinyCaughtIds.value.size);

  const catchCreature = (speciesId: number, level: number, shiny = false): OwnedCreature => {
    const c: OwnedCreature = {
      uid: newUid(),
      speciesId,
      level,
      xp: 0,
      caughtAt: Date.now(),
      stage: 1,
      ...(shiny ? { shiny: true } : {}),
    };
    save.value.creatures.push(c);
    markSeen(speciesId);
    // 隊伍還沒滿就自動加入
    if (team.value.length < TEAM_SIZE) addToTeam(c.uid);
    return c;
  };

  /**
   * 放生重複的字靈換糖果，回傳拿到的糖果數。
   * 只有同種還有別隻時才能放生（圖鑑不會少一格），隊伍至少留一隻。
   */
  const releaseDuplicate = (uid: string): number | null => {
    const c = byUid(uid);
    if (!c) return null;
    const hasOther = save.value.creatures.some((o) => o.uid !== uid && o.speciesId === c.speciesId);
    if (!hasOther) return null;
    if (isInTeam(uid)) {
      if (team.value.length <= 1) return null;
      removeFromTeam(uid);
    }
    save.value.creatures = save.value.creatures.filter((o) => o.uid !== uid);
    const candies = RELEASE_CANDY[getSpecies(c.speciesId).rarity];
    grantBonusCandies(candies);
    return candies;
  };

  /** 增加經驗值，回傳升了幾級 */
  const gainXp = (uid: string, amount: number): number => {
    const c = byUid(uid);
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

  /** 餵 1 顆字靈糖果，回傳升了幾級；糖果不夠或已滿級回傳 null */
  const feedCandy = (uid: string): number | null => {
    const c = byUid(uid);
    if (!c || c.level >= MAX_LEVEL || !spendCandies(1)) return null;
    trackQuest({ type: 'feed' });
    return gainXp(uid, CANDY_XP);
  };

  /** 進化條件的目前狀態 */
  const evolveStatus = (c: OwnedCreature): EvolveStatus => {
    const area = homeAreaOf(c.speciesId);
    const mastered = area ? getMasteredCount(area.wordLevel) : 0;
    const stage = c.stage ?? 1;
    return {
      canEvolve: canEvolve(c.level, stage, mastered),
      evolved: stage >= 2,
      level: c.level,
      needLevel: EVOLVE_LEVEL,
      mastered,
      needMastered: EVOLVE_MASTERED,
      wordLevelName: area ? `第 ${area.wordLevel} 級` : '',
    };
  };

  const evolve = (uid: string): boolean => {
    const c = byUid(uid);
    if (!c || !evolveStatus(c).canEvolve) return false;
    c.stage = 2;
    return true;
  };

  /**
   * 記錄答題：更新暴擊率，並寫入單字記憶（影響單字測驗出題）。
   * spelled：這題是拼字題（拼對算每日任務）。
   */
  const recordAnswer = (word: GameWord, correct: boolean, spelled = false) => {
    const r = save.value.recentAnswers;
    r.push(correct);
    if (r.length > RECENT_SIZE) r.splice(0, r.length - RECENT_SIZE);
    recordWordAnswer(word.english, correct, 'adventure');
    if (!correct) save.value.lostWords = addLostWord(save.value.lostWords, word);
    else if (spelled) trackQuest({ type: 'spell' });
  };

  const lostWords = computed(() => save.value.lostWords);
  /** 在迷路字靈對戰中答對，單字就找回來了 */
  const findLostWord = (english: string): boolean => {
    const before = save.value.lostWords.length;
    save.value.lostWords = save.value.lostWords.filter((w) => w.english !== english);
    return save.value.lostWords.length < before;
  };

  const caughtInArea = (area: Area) => area.species.filter((id) => isCaught(id)).length;

  /** 這區的字靈全部收服了 */
  const isAreaComplete = (area: Area) => caughtInArea(area) === area.species.length;
  const hasClaimedArea = (area: Area) => save.value.completedAreas.includes(area.id);
  /** 領取全收集獎勵，回傳拿到的糖果；還沒收齊或領過了回傳 null */
  const claimAreaReward = (area: Area): number | null => {
    if (!isAreaComplete(area) || hasClaimedArea(area)) return null;
    save.value.completedAreas.push(area.id);
    grantBonusCandies(AREA_COMPLETE_CANDY);
    return AREA_COMPLETE_CANDY;
  };

  const hasBadge = (areaId: string) => save.value.badges.includes(areaId);
  const earnBadge = (areaId: string) => {
    if (!hasBadge(areaId)) save.value.badges.push(areaId);
  };
  const canChallengeGym = (area: Area) => caughtInArea(area) >= GYM_REQUIRED_CAUGHT;

  /** 打贏前一區的館主（拿到徽章）就解鎖 */
  const isAreaUnlocked = (area: Area) => !area.unlockAfter || hasBadge(area.unlockAfter);

  const unlockedAreas = computed(() => AREAS.filter(isAreaUnlocked));

  /** 花糖果孵一顆字靈蛋；糖果不夠或還沒有夥伴回傳 null */
  const hatch = (): { creature: OwnedCreature; isNew: boolean } | null => {
    if (!hasStarter.value) return null;
    const candidates = unlockedAreas.value.flatMap((area) =>
      area.species
        .filter((id) => canAppearInWild(getSpecies(id)))
        .map((speciesId) => ({ speciesId, rarity: getSpecies(speciesId).rarity, area })),
    );
    const result = hatchEgg(candidates, isCaught);
    if (!result || !spendCandies(EGG_COST)) return null;
    const isNew = !isCaught(result.speciesId);
    return { creature: catchCreature(result.speciesId, result.level, rollShiny()), isNew };
  };
  const badgeCount = computed(() => save.value.badges.filter((id) => getArea(id)).length);

  return {
    creatures,
    hasStarter,
    team,
    partner,
    recentAccuracy,
    unlockedAreas,
    badgeCount,
    isInTeam,
    addToTeam,
    removeFromTeam,
    replaceInTeam,
    setPartner,
    isCaught,
    isSeen,
    isShinyCaught,
    shinyCount,
    markSeen,
    catchCreature,
    releaseDuplicate,
    gainXp,
    feedCandy,
    evolveStatus,
    evolve,
    recordAnswer,
    lostWords,
    findLostWord,
    caughtInArea,
    isAreaComplete,
    hasClaimedArea,
    claimAreaReward,
    hasBadge,
    earnBadge,
    canChallengeGym,
    isAreaUnlocked,
    hatch,
  };
});
