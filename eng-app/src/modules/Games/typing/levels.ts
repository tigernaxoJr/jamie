export interface TypingLevel {
  name: string;
  /** letters：掉字母；words：掉單字 */
  kind: 'letters' | 'words';
  /** 字母關卡可以出現的字母 */
  chars?: string;
  /** 單字關卡的字母數上限 */
  maxLetters?: number;
  /** 只顯示中文，英文要自己拼（打對的字母才顯示） */
  hideEnglish?: boolean;
  /** 過關分數（累計） */
  target: number;
  /** 每秒下降多少 %（畫面高度） */
  speed: number;
  /** 幾秒掉一個 */
  spawnEvery: number;
  /** 畫面上最多幾個 */
  maxItems: number;
}

/** 依序進行的關卡：先練字母，再打題庫單字，最後只看中文拼字 */
export const TYPING_LEVELS: readonly TypingLevel[] = [
  {
    name: '基準鍵',
    kind: 'letters',
    chars: 'asdfghjkl',
    target: 300,
    speed: 9,
    spawnEvery: 1.4,
    maxItems: 5,
  },
  {
    name: '全部字母',
    kind: 'letters',
    chars: 'abcdefghijklmnopqrstuvwxyz',
    target: 800,
    speed: 11,
    spawnEvery: 1.1,
    maxItems: 6,
  },
  {
    name: '短單字',
    kind: 'words',
    maxLetters: 4,
    target: 1400,
    speed: 6,
    spawnEvery: 2.6,
    maxItems: 4,
  },
  { name: '單字', kind: 'words', target: 2200, speed: 6.5, spawnEvery: 2.4, maxItems: 4 },
  {
    name: '中文挑戰',
    kind: 'words',
    hideEnglish: true,
    target: 3200,
    speed: 5,
    spawnEvery: 3,
    maxItems: 3,
  },
];
