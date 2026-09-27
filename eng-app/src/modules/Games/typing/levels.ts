/** 打字雨的關卡與道具（純資料與規則，不含畫面） */

export interface TypingLevel {
  name: string;
  emoji: string;
  /** letters：掉字母；words：掉單字；mixed：字母和單字一起掉 */
  kind: 'letters' | 'words' | 'mixed';
  /** 會出現的字母 */
  chars?: string;
  /** 單字的字母數上限 */
  maxLetters?: number;
  /** 只顯示中文，英文要自己拼（打對的字母才顯示） */
  hideEnglish?: boolean;
  /** 過關分數 */
  target: number;
  /** 每秒下降多少 %（畫面高度） */
  speed: number;
  /** 幾秒掉一個 */
  spawnEvery: number;
  /** 畫面上最多幾個 */
  maxItems: number;
  /** 會不會掉道具 */
  powerUps: boolean;
}

export const ALL_LETTERS = 'abcdefghijklmnopqrstuvwxyz';

export const TYPING_LEVELS: readonly TypingLevel[] = [
  {
    name: '基準鍵',
    emoji: '🏠',
    kind: 'letters',
    chars: 'asdfghjkl',
    target: 300,
    speed: 9,
    spawnEvery: 1.4,
    maxItems: 5,
    powerUps: false,
  },
  {
    name: '上排鍵',
    emoji: '⬆️',
    kind: 'letters',
    chars: 'qwertyuiop',
    target: 350,
    speed: 9,
    spawnEvery: 1.4,
    maxItems: 5,
    powerUps: true,
  },
  {
    name: '下排鍵',
    emoji: '⬇️',
    kind: 'letters',
    chars: 'zxcvbnm',
    target: 350,
    speed: 9,
    spawnEvery: 1.4,
    maxItems: 5,
    powerUps: true,
  },
  {
    name: '全部字母',
    emoji: '🔤',
    kind: 'letters',
    chars: ALL_LETTERS,
    target: 500,
    speed: 11,
    spawnEvery: 1.1,
    maxItems: 6,
    powerUps: true,
  },
  {
    name: '短單字',
    emoji: '✏️',
    kind: 'words',
    maxLetters: 4,
    target: 600,
    speed: 6,
    spawnEvery: 2.6,
    maxItems: 4,
    powerUps: true,
  },
  {
    name: '單字',
    emoji: '📝',
    kind: 'words',
    target: 800,
    speed: 6.5,
    spawnEvery: 2.4,
    maxItems: 4,
    powerUps: true,
  },
  {
    name: '大混戰',
    emoji: '🌪️',
    kind: 'mixed',
    chars: ALL_LETTERS,
    target: 900,
    speed: 7.5,
    spawnEvery: 1.6,
    maxItems: 6,
    powerUps: true,
  },
  {
    name: '中文挑戰',
    emoji: '🀄',
    kind: 'words',
    hideEnglish: true,
    target: 1000,
    speed: 5,
    spawnEvery: 3,
    maxItems: 3,
    powerUps: true,
  },
];

/** 無盡模式：一直掉單字，分數越高越快 */
export const endlessLevel = (score: number): TypingLevel => ({
  name: '無盡模式',
  emoji: '♾️',
  kind: 'words',
  target: Infinity,
  speed: Math.min(12, 5.5 + score / 500),
  spawnEvery: Math.max(1.3, 2.6 - score / 2500),
  maxItems: Math.min(6, 3 + Math.floor(score / 1500)),
  powerUps: true,
});

// ---------- 道具 ----------

export type PowerUp = 'freeze' | 'heal' | 'bomb';

export const POWER_UPS: Record<PowerUp, { icon: string; name: string }> = {
  freeze: { icon: '❄️', name: '冰凍：全部停住 3 秒' },
  heal: { icon: '💖', name: '補血：愛心 +1' },
  bomb: { icon: '💣', name: '清場：炸掉全部' },
};

/** 掉下來的東西有多少機率是道具 */
export const POWER_UP_CHANCE = 0.1;
export const FREEZE_SECONDS = 3;

/** 隨機挑一個道具；愛心全滿時不出補血 */
export const rollPowerUp = (hpFull: boolean, rng = Math.random): PowerUp => {
  const pool: PowerUp[] = hpFull ? ['freeze', 'bomb'] : ['freeze', 'heal', 'bomb'];
  return pool[Math.floor(rng() * pool.length)]!;
};

/** 過關星等：愛心沒掉 3 星、掉 1～2 顆 2 星，其他 1 星 */
export const typingStars = (hpLost: number): number => (hpLost === 0 ? 3 : hpLost <= 2 ? 2 : 1);

/** 每分鐘打對幾個字母 */
export const lettersPerMinute = (keys: number, seconds: number): number =>
  seconds <= 0 ? 0 : Math.round((keys * 60) / seconds);
