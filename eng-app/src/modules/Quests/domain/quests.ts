/** 每日任務：任務清單、每天挑哪幾個、進度怎麼算（純資料與規則） */

export type QuestId = 'goal' | 'quiz' | 'play' | 'stage' | 'stars' | 'review' | 'catch' | 'feed';

export interface Quest {
  id: QuestId;
  icon: string;
  text: string;
  target: number;
  /** 完成可以領幾顆字靈糖果 */
  reward: number;
}

export const QUESTS: Record<QuestId, Quest> = {
  goal: { id: 'goal', icon: '🎯', text: '達成今天的每日目標', target: 1, reward: 3 },
  quiz: { id: 'quiz', icon: '📝', text: '在單字測驗答 10 題', target: 10, reward: 3 },
  play: { id: 'play', icon: '🎮', text: '玩 2 個不同的小遊戲', target: 2, reward: 3 },
  stage: { id: 'stage', icon: '🚩', text: '在任一遊戲過 1 個關卡', target: 1, reward: 3 },
  stars: { id: 'stars', icon: '⭐', text: '在任一遊戲拿到 3 顆星', target: 1, reward: 4 },
  review: { id: 'review', icon: '🔁', text: '用「只練答錯的字」玩一局', target: 1, reward: 3 },
  catch: { id: 'catch', icon: '🧭', text: '在字靈探險收服 1 隻字靈', target: 1, reward: 3 },
  feed: { id: 'feed', icon: '🍬', text: '餵字靈 3 顆糖果', target: 3, reward: 2 },
};

/** 3 個任務都完成的額外獎勵 */
export const ALL_DONE_BONUS = 5;

/** 第一個任務一定是背單字，後兩個從玩的任務裡挑 */
const LEARN: QuestId[] = ['goal', 'quiz'];
const PLAY: QuestId[] = ['play', 'stage', 'stars', 'review', 'catch', 'feed'];

/** 由日期字串產生固定的亂數種子（同一天每次打開都是同樣的任務） */
const seedOf = (day: string) => [...day].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** 簡單的可重現亂數 */
const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 2 ** 32;
};

/** 某一天的 3 個任務 */
export const questsForDay = (day: string): Quest[] => {
  const next = rng(seedOf(day));
  const first = LEARN[Math.floor(next() * LEARN.length)]!;
  const pool = [...PLAY];
  const picked: QuestId[] = [first];
  while (picked.length < 3) picked.push(pool.splice(Math.floor(next() * pool.length), 1)[0]!);
  return picked.map((id) => QUESTS[id]);
};

/** 當天累積的任務進度 */
export interface QuestCounts {
  /** 今天玩過（結算過）的小遊戲 id */
  games: string[];
  stage: number;
  stars: number;
  review: number;
  catch: number;
  feed: number;
}

export const emptyCounts = (): QuestCounts => ({
  games: [],
  stage: 0,
  stars: 0,
  review: 0,
  catch: 0,
  feed: 0,
});

/** 從學習日誌即時算出來的進度 */
export interface LiveProgress {
  goalDone: boolean;
  quizAnswers: number;
}

/** 任務目前進度（不超過目標） */
export const questProgress = (q: Quest, counts: QuestCounts, live: LiveProgress): number => {
  const raw: Record<QuestId, number> = {
    goal: live.goalDone ? 1 : 0,
    quiz: live.quizAnswers,
    play: counts.games.length,
    stage: counts.stage,
    stars: counts.stars,
    review: counts.review,
    catch: counts.catch,
    feed: counts.feed,
  };
  return Math.min(q.target, raw[q.id]);
};
