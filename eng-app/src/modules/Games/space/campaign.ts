/** 太空防衛的關卡、星等與飛船升級（純資料與規則，不含畫面） */

export interface Stage {
  name: string;
  emoji: string;
  /** 擊落幾顆小隕石後魔王出現 */
  goal: number;
  /** 畫面上最多幾顆小隕石 */
  maxMeteors: number;
  /** 隕石出現間隔（秒） */
  spawnInterval: number;
  /** 小隕石基本下降速度（%/秒） */
  speed: number;
  /** 魔王要連續打中幾個單字 */
  bossHp: number;
}

export const STAGES: Stage[] = [
  {
    name: '月球基地',
    emoji: '🌙',
    goal: 8,
    maxMeteors: 2,
    spawnInterval: 3.2,
    speed: 5,
    bossHp: 2,
  },
  {
    name: '紅色火星',
    emoji: '🔴',
    goal: 10,
    maxMeteors: 2,
    spawnInterval: 3,
    speed: 5.8,
    bossHp: 3,
  },
  {
    name: '小行星帶',
    emoji: '🌑',
    goal: 12,
    maxMeteors: 3,
    spawnInterval: 2.8,
    speed: 6.5,
    bossHp: 3,
  },
  {
    name: '木星風暴',
    emoji: '🟠',
    goal: 14,
    maxMeteors: 3,
    spawnInterval: 2.5,
    speed: 7.2,
    bossHp: 4,
  },
  {
    name: '土星光環',
    emoji: '🪐',
    goal: 15,
    maxMeteors: 3,
    spawnInterval: 2.3,
    speed: 8,
    bossHp: 4,
  },
  {
    name: '冰凍星球',
    emoji: '🧊',
    goal: 16,
    maxMeteors: 4,
    spawnInterval: 2.1,
    speed: 8.8,
    bossHp: 5,
  },
  {
    name: '彩色星雲',
    emoji: '🌌',
    goal: 18,
    maxMeteors: 4,
    spawnInterval: 1.9,
    speed: 9.6,
    bossHp: 5,
  },
  {
    name: '黑洞深處',
    emoji: '🕳️',
    goal: 20,
    maxMeteors: 4,
    spawnInterval: 1.7,
    speed: 10.5,
    bossHp: 6,
  },
];

/** 魔王撞到地面會打壞幾面護盾 */
export const BOSS_DAMAGE = 2;

/**
 * 過關星等：
 * 3 星：護盾一面都沒壞，而且按錯不超過 2 次；2 星：最多壞 1 面；其他 1 星。
 */
export const starsFor = (shieldsLost: number, misfires: number): number => {
  if (shieldsLost === 0 && misfires <= 2) return 3;
  if (shieldsLost <= 1) return 2;
  return 1;
};

export interface Upgrade {
  id: 'shield' | 'reload' | 'bomb' | 'slow' | 'bomb2';
  icon: string;
  name: string;
  desc: string;
  /** 全部關卡的星星總數達到多少解鎖 */
  needStars: number;
}

export const UPGRADES: Upgrade[] = [
  { id: 'shield', icon: '🛡️', name: '強化護盾', desc: '護盾變成 4 面', needStars: 3 },
  { id: 'reload', icon: '⚡', name: '快速裝填', desc: '按錯後等待時間減半', needStars: 7 },
  {
    id: 'bomb',
    icon: '💣',
    name: '清場炸彈',
    desc: '每場可以炸掉畫面上的小隕石 1 次',
    needStars: 12,
  },
  { id: 'slow', icon: '🐢', name: '減速力場', desc: '隕石掉落速度變慢', needStars: 17 },
  { id: 'bomb2', icon: '💥', name: '雙倍炸彈', desc: '炸彈變成 2 顆', needStars: 22 },
];

export interface ShipStats {
  shields: number;
  misfireCooldown: number;
  bombs: number;
  speedFactor: number;
}

/** 依星星總數算出飛船能力 */
export const shipStats = (totalStars: number): ShipStats => {
  const has = (id: Upgrade['id']) => UPGRADES.some((u) => u.id === id && totalStars >= u.needStars);
  return {
    shields: has('shield') ? 4 : 3,
    misfireCooldown: has('reload') ? 350 : 700,
    bombs: has('bomb2') ? 2 : has('bomb') ? 1 : 0,
    speedFactor: has('slow') ? 0.85 : 1,
  };
};
