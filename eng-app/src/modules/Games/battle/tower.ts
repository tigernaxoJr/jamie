/** 單字爬塔的樓層、怪物與增益卡（純資料與規則，不含畫面） */

export interface Monster {
  name: string;
  emoji: string;
  hp: number;
  /** 答錯時扣幾顆愛心 */
  attack: number;
  boss: boolean;
}

/** 每幾層一個魔王 */
export const BOSS_EVERY = 5;

const NORMALS: readonly Omit<Monster, 'hp' | 'attack' | 'boss'>[] = [
  { name: '史萊姆', emoji: '🟢' },
  { name: '蝙蝠', emoji: '🦇' },
  { name: '野狼', emoji: '🐺' },
  { name: '大蜘蛛', emoji: '🕷️' },
  { name: '骷髏兵', emoji: '💀' },
  { name: '幽靈', emoji: '👻' },
  { name: '機器人', emoji: '🤖' },
  { name: '外星人', emoji: '👽' },
  { name: '章魚怪', emoji: '🐙' },
  { name: '暴龍', emoji: '🦖' },
];

const BOSSES: readonly Omit<Monster, 'hp' | 'attack' | 'boss'>[] = [
  { name: '鬼王', emoji: '👹' },
  { name: '惡龍魔王', emoji: '🐉' },
  { name: '石巨人', emoji: '🗿' },
  { name: '暗黑巫師', emoji: '🧙' },
  { name: '宇宙大魔王', emoji: '🪐' },
];

export const isBossFloor = (floor: number) => floor % BOSS_EVERY === 0;

/**
 * 第 floor 層（從 1 開始）的怪物。越高層怪物越強；
 * pick 用來在同一區的幾種怪物裡挑一隻（0～1 的亂數）。
 */
export const monsterFor = (floor: number, pick = Math.random()): Monster => {
  const zone = Math.floor((floor - 1) / BOSS_EVERY);
  if (isBossFloor(floor)) {
    const b = BOSSES[Math.min(zone, BOSSES.length - 1)]!;
    const lap = Math.floor(zone / BOSSES.length);
    return {
      name: lap > 0 ? `超級${b.name}` : b.name,
      emoji: b.emoji,
      hp: 8 + floor,
      attack: floor >= 10 ? 2 : 1,
      boss: true,
    };
  }
  // 每一區有 3 種怪物，往上一區就換更強的
  const first = Math.min(zone * 2, NORMALS.length - 3);
  const n = NORMALS[first + Math.min(2, Math.floor(pick * 3))]!;
  return { ...n, hp: 3 + Math.floor(floor / 2), attack: 1, boss: false };
};

// ---------- 增益卡 ----------

export type PerkId = 'heal' | 'maxhp' | 'power' | 'crit' | 'shield' | 'vamp' | 'eye' | 'lucky';

export interface Perk {
  id: PerkId;
  icon: string;
  name: string;
  desc: string;
  /** 最多可以拿幾次；undefined 表示不限 */
  max?: number;
}

export const PERKS: Record<PerkId, Perk> = {
  heal: { id: 'heal', icon: '🍎', name: '回復藥水', desc: '回復 2 顆愛心' },
  maxhp: { id: 'maxhp', icon: '💖', name: '生命之心', desc: '愛心上限 +1，並回復 1 顆', max: 3 },
  power: { id: 'power', icon: '🗡️', name: '鋒利寶劍', desc: '每次攻擊傷害 +1', max: 3 },
  crit: {
    id: 'crit',
    icon: '🔥',
    name: '連擊大師',
    desc: '連續答對 2 題就爆擊（原本 3 題）',
    max: 1,
  },
  shield: { id: 'shield', icon: '🛡️', name: '守護盾', desc: '接下來 2 次答錯不會扣愛心' },
  vamp: { id: 'vamp', icon: '🧛', name: '吸血牙', desc: '爆擊時回復 1 顆愛心', max: 1 },
  eye: { id: 'eye', icon: '👀', name: '鷹眼', desc: '選項從 4 個變成 3 個', max: 1 },
  lucky: { id: 'lucky', icon: '🍀', name: '幸運草', desc: '之後得到的分數 +50%', max: 1 },
};

export type OwnedPerks = Partial<Record<PerkId, number>>;

/** 可以出現在選單裡的增益卡：拿滿的不再出現，愛心全滿時不出現回復藥水 */
export const availablePerks = (owned: OwnedPerks, hp: number, maxHp: number): Perk[] =>
  Object.values(PERKS).filter((p) => {
    if (p.id === 'heal' && hp >= maxHp) return false;
    return p.max === undefined || (owned[p.id] ?? 0) < p.max;
  });

/** 抽出 n 張不重複的增益卡 */
export const rollPerks = (
  owned: OwnedPerks,
  hp: number,
  maxHp: number,
  n = 3,
  rng = Math.random,
): Perk[] => {
  const pool = availablePerks(owned, hp, maxHp);
  const picked: Perk[] = [];
  while (picked.length < n && pool.length > 0) {
    picked.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]!);
  }
  return picked;
};

export const BASE_HP = 5;
export const BASE_CRIT_EVERY = 3;

/** 一次攻擊的傷害 */
export const attackDamage = (owned: OwnedPerks, crit: boolean) =>
  (1 + (owned.power ?? 0)) * (crit ? 2 : 1);

export const critEvery = (owned: OwnedPerks) => (owned.crit ? 2 : BASE_CRIT_EVERY);

/** 可以從哪些樓層出發：第 1 層，以及打倒過的魔王的下一層 */
export const checkpoints = (highestBossBeaten: number): number[] => {
  const floors = [1];
  for (let f = BOSS_EVERY; f <= highestBossBeaten; f += BOSS_EVERY) floors.push(f + 1);
  return floors;
};

/** 從高樓層出發時，每跳過一個魔王可以先挑一張增益卡 */
export const startingPerkPicks = (startFloor: number) => Math.floor((startFloor - 1) / BOSS_EVERY);
