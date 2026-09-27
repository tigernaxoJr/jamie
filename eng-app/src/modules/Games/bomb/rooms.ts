/** 拆炸彈・密室逃脫的房間與炸彈種類（純資料與規則，不含畫面） */

/**
 * normal：一般炸彈（看中文拼英文）
 * fast：快速引信，時間比較短、分數比較高
 * mystery：神秘炸彈，只聽發音拼單字（看中文要花時間）
 * chain：連環炸彈，同一條引信要連續拆兩個單字
 */
export type BombType = 'normal' | 'fast' | 'mystery' | 'chain';

export const BOMB_TYPES: Record<BombType, { icon: string; name: string; desc: string }> = {
  normal: { icon: '💣', name: '一般炸彈', desc: '看中文拼出英文' },
  fast: { icon: '🔥', name: '快速引信', desc: '引信燒比較快，分數多一半' },
  mystery: { icon: '❓', name: '神秘炸彈', desc: '只聽發音拼出單字' },
  chain: { icon: '⛓️', name: '連環炸彈', desc: '同一條引信要拆兩個單字' },
};

/** 引信長度的倍率 */
export const FUSE_FACTOR: Record<BombType, number> = {
  normal: 1,
  fast: 0.6,
  mystery: 1.15,
  chain: 1.6,
};

/** 連環炸彈有幾個單字 */
export const CHAIN_LENGTH = 2;

export interface Room {
  name: string;
  emoji: string;
  /** 要拆幾顆炸彈才能開門 */
  bombs: number;
  /** 這個房間會出現的炸彈 */
  types: readonly BombType[];
  /** 一般炸彈的引信秒數 */
  fuse: number;
  /** 放大鏡數量（揭開一個字母） */
  magnifiers: number;
}

export const ROOMS: readonly Room[] = [
  { name: '客廳', emoji: '🛋️', bombs: 3, types: ['normal'], fuse: 45, magnifiers: 2 },
  { name: '廚房', emoji: '🍳', bombs: 3, types: ['normal'], fuse: 40, magnifiers: 2 },
  { name: '書房', emoji: '📚', bombs: 4, types: ['normal', 'fast'], fuse: 40, magnifiers: 2 },
  { name: '地下室', emoji: '🕯️', bombs: 4, types: ['normal', 'mystery'], fuse: 42, magnifiers: 2 },
  {
    name: '實驗室',
    emoji: '🧪',
    bombs: 4,
    types: ['normal', 'fast', 'mystery'],
    fuse: 40,
    magnifiers: 2,
  },
  { name: '金庫', emoji: '💰', bombs: 5, types: ['normal', 'chain'], fuse: 40, magnifiers: 1 },
  {
    name: '鐘樓',
    emoji: '🕰️',
    bombs: 5,
    types: ['fast', 'mystery', 'chain'],
    fuse: 38,
    magnifiers: 1,
  },
  {
    name: '魔王城堡',
    emoji: '🏯',
    bombs: 6,
    types: ['normal', 'fast', 'mystery', 'chain'],
    fuse: 35,
    magnifiers: 1,
  },
];

/** 每個房間的愛心數（炸彈爆炸扣一顆） */
export const ROOM_LIVES = 3;

/**
 * 房間裡炸彈出現的順序：每一種都至少出現一次，第一顆盡量是一般炸彈（讓玩家暖身），
 * 其他隨機排列。
 */
export const bombPlan = (room: Room, rng = Math.random): BombType[] => {
  const plan: BombType[] = [...room.types];
  while (plan.length < room.bombs) plan.push(room.types[Math.floor(rng() * room.types.length)]!);
  for (let i = plan.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [plan[i], plan[j]] = [plan[j]!, plan[i]!];
  }
  const firstNormal = plan.indexOf('normal');
  if (firstNormal > 0) [plan[0], plan[firstNormal]] = [plan[firstNormal]!, plan[0]!];
  return plan.slice(0, room.bombs);
};

/** 過關星等：沒有炸彈爆炸 3 星、爆炸 1 次 2 星，其他 1 星 */
export const roomStars = (explosions: number): number =>
  explosions === 0 ? 3 : explosions === 1 ? 2 : 1;
