import type { Element } from './elements';

export type Rarity = 'common' | 'uncommon' | 'rare';

export const RARITY_NAME: Record<Rarity, string> = {
  common: '常見',
  uncommon: '少見',
  rare: '稀有',
};

/** 用來組合 SVG 外觀的部件（見 ui/CreatureSvg.vue） */
export interface CreatureLook {
  body: 'round' | 'bean' | 'tall' | 'drop' | 'blob';
  color: string;
  belly: string;
  eyes: 'dot' | 'big' | 'sleepy' | 'happy';
  mouth: 'smile' | 'open' | 'cat' | 'tiny';
  parts: CreaturePart[];
  /** 配件顏色（帽子、殼、角等），未指定時用身體顏色加深 */
  accent?: string;
  cheeks?: boolean;
}

export type CreaturePart =
  | 'flame'
  | 'sprout'
  | 'bubbles'
  | 'bulb'
  | 'cap'
  | 'horns'
  | 'ears'
  | 'shell'
  | 'star'
  | 'wings'
  | 'moss'
  | 'leafEars'
  | 'antenna'
  | 'fins'
  | 'crown';

export interface Species {
  /** 圖鑑編號 */
  id: number;
  name: string;
  /** 英文名字，本身就是一個單字 */
  english: string;
  /** 英文名字的中文意思 */
  meaning: string;
  element: Element;
  rarity: Rarity;
  description: string;
  baseHp: number;
  baseAtk: number;
  look: CreatureLook;
}

/** 所有字靈；新增字靈只要在這裡加一筆並放進 areas.ts 的棲息地 */
export const SPECIES: readonly Species[] = [
  {
    id: 1,
    name: '炭炭',
    english: 'Ember',
    meaning: '餘燼',
    element: 'fire',
    rarity: 'rare',
    description: '一顆會冒火星的小煤炭。開心的時候頭上的火會變成愛心形狀。',
    baseHp: 30,
    baseAtk: 11,
    look: {
      body: 'round',
      color: '#44403c',
      belly: '#78716c',
      eyes: 'big',
      mouth: 'open',
      parts: ['flame'],
      cheeks: true,
    },
  },
  {
    id: 2,
    name: '啵啵',
    english: 'Bubble',
    meaning: '泡泡',
    element: 'water',
    rarity: 'rare',
    description: '頭上一直冒泡泡的小水母。泡泡破掉時會發出「啵」的聲音。',
    baseHp: 33,
    baseAtk: 10,
    look: {
      body: 'drop',
      color: '#38bdf8',
      belly: '#bae6fd',
      eyes: 'big',
      mouth: 'smile',
      parts: ['bubbles'],
      cheeks: true,
    },
  },
  {
    id: 3,
    name: '苔苔',
    english: 'Moss',
    meaning: '青苔',
    element: 'grass',
    rarity: 'rare',
    description: '背上長滿青苔的圓滾滾小熊。下雨天會特別有精神。',
    baseHp: 36,
    baseAtk: 9,
    look: {
      body: 'round',
      color: '#a16207',
      belly: '#fde68a',
      eyes: 'dot',
      mouth: 'cat',
      parts: ['ears', 'moss'],
      cheeks: true,
    },
  },
  {
    id: 4,
    name: '石帽',
    english: 'Pebble',
    meaning: '小石頭',
    element: 'earth',
    rarity: 'common',
    description: '戴著石頭帽子的蘑菇。害羞的時候會把整個身體縮進帽子裡。',
    baseHp: 30,
    baseAtk: 8,
    look: {
      body: 'bean',
      color: '#fef3c7',
      belly: '#fffbeb',
      eyes: 'sleepy',
      mouth: 'tiny',
      accent: '#78716c',
      parts: ['cap'],
    },
  },
  {
    id: 5,
    name: '豆芽',
    english: 'Seed',
    meaning: '種子',
    element: 'grass',
    rarity: 'common',
    description: '頭上冒出一片小嫩芽的豆子。曬太陽的時候嫩芽會慢慢長高。',
    baseHp: 26,
    baseAtk: 8,
    look: {
      body: 'bean',
      color: '#86efac',
      belly: '#dcfce7',
      eyes: 'happy',
      mouth: 'smile',
      parts: ['sprout'],
      cheeks: true,
    },
  },
  {
    id: 6,
    name: '閃閃',
    english: 'Spark',
    meaning: '火花',
    element: 'thunder',
    rarity: 'uncommon',
    description: '尾巴是一顆燈泡的小鳥。晚上會幫迷路的旅人照亮道路。',
    baseHp: 25,
    baseAtk: 11,
    look: {
      body: 'round',
      color: '#fde047',
      belly: '#fef9c3',
      eyes: 'big',
      mouth: 'open',
      accent: '#f59e0b',
      parts: ['wings', 'bulb'],
    },
  },
  {
    id: 7,
    name: '鈕鈕',
    english: 'Button',
    meaning: '鈕扣',
    element: 'earth',
    rarity: 'common',
    description: '背殼像鈕扣一樣圓的小甲蟲。常常被誤認成掉在地上的鈕扣。',
    baseHp: 28,
    baseAtk: 9,
    look: {
      body: 'bean',
      color: '#dc2626',
      belly: '#fecaca',
      eyes: 'dot',
      mouth: 'tiny',
      accent: '#111827',
      parts: ['antenna', 'shell'],
    },
  },
  {
    id: 8,
    name: '暖陽',
    english: 'Sun',
    meaning: '太陽',
    element: 'light',
    rarity: 'rare',
    description: '只在晴天出現的小太陽。靠近牠會覺得全身暖呼呼的。',
    baseHp: 30,
    baseAtk: 12,
    look: {
      body: 'round',
      color: '#fbbf24',
      belly: '#fef3c7',
      eyes: 'happy',
      mouth: 'smile',
      accent: '#f59e0b',
      parts: ['crown'],
      cheeks: true,
    },
  },
  {
    id: 9,
    name: '葉葉',
    english: 'Leaf',
    meaning: '葉子',
    element: 'grass',
    rarity: 'common',
    description: '耳朵是兩片葉子的小兔子。風一吹耳朵就會沙沙作響。',
    baseHp: 28,
    baseAtk: 9,
    look: {
      body: 'tall',
      color: '#bbf7d0',
      belly: '#f0fdf4',
      eyes: 'dot',
      mouth: 'cat',
      parts: ['leafEars'],
      cheeks: true,
    },
  },
  {
    id: 10,
    name: '橡橡',
    english: 'Acorn',
    meaning: '橡實',
    element: 'earth',
    rarity: 'common',
    description: '住在大樹下的橡實精靈。最喜歡把自己埋進落葉堆裡。',
    baseHp: 32,
    baseAtk: 8,
    look: {
      body: 'drop',
      color: '#b45309',
      belly: '#fcd34d',
      eyes: 'big',
      mouth: 'tiny',
      accent: '#78350f',
      parts: ['cap'],
    },
  },
  {
    id: 11,
    name: '螢螢',
    english: 'Glow',
    meaning: '發光',
    element: 'light',
    rarity: 'uncommon',
    description: '會發光的小精靈。森林的夜晚都靠牠們點亮。',
    baseHp: 24,
    baseAtk: 12,
    look: {
      body: 'round',
      color: '#a7f3d0',
      belly: '#ecfdf5',
      eyes: 'happy',
      mouth: 'smile',
      accent: '#34d399',
      parts: ['antenna', 'wings', 'bulb'],
    },
  },
  {
    id: 12,
    name: '燭燭',
    english: 'Candle',
    meaning: '蠟燭',
    element: 'fire',
    rarity: 'uncommon',
    description: '頭頂一小撮火苗的蠟燭精靈。跑太快的話火會熄掉，所以總是慢慢走。',
    baseHp: 26,
    baseAtk: 12,
    look: {
      body: 'tall',
      color: '#fef2f2',
      belly: '#fee2e2',
      eyes: 'sleepy',
      mouth: 'tiny',
      accent: '#fb923c',
      parts: ['flame'],
    },
  },
  {
    id: 13,
    name: '雲雲',
    english: 'Cloud',
    meaning: '雲',
    element: 'thunder',
    rarity: 'rare',
    description: '軟綿綿的雲朵。生氣的時候會變成灰色，還會打雷。',
    baseHp: 30,
    baseAtk: 13,
    look: {
      body: 'blob',
      color: '#e2e8f0',
      belly: '#f8fafc',
      eyes: 'dot',
      mouth: 'open',
      accent: '#facc15',
      parts: ['horns'],
      cheeks: true,
    },
  },
  {
    id: 14,
    name: '貝貝',
    english: 'Shell',
    meaning: '貝殼',
    element: 'water',
    rarity: 'common',
    description: '背著漂亮貝殼的小寄居蟹。會一直找更大的貝殼來換。',
    baseHp: 32,
    baseAtk: 8,
    look: {
      body: 'bean',
      color: '#fb923c',
      belly: '#ffedd5',
      eyes: 'big',
      mouth: 'tiny',
      accent: '#fde68a',
      parts: ['shell', 'antenna'],
    },
  },
  {
    id: 15,
    name: '珊珊',
    english: 'Coral',
    meaning: '珊瑚',
    element: 'water',
    rarity: 'common',
    description: '頭上長著珊瑚角的小魚。游泳的時候會留下一串彩色泡泡。',
    baseHp: 27,
    baseAtk: 10,
    look: {
      body: 'drop',
      color: '#f9a8d4',
      belly: '#fce7f3',
      eyes: 'dot',
      mouth: 'smile',
      accent: '#f472b6',
      parts: ['horns', 'fins'],
    },
  },
  {
    id: 16,
    name: '沙沙',
    english: 'Sand',
    meaning: '沙子',
    element: 'earth',
    rarity: 'common',
    description: '用沙子堆成的小怪物。浪打過來的時候會趕快逃跑。',
    baseHp: 30,
    baseAtk: 9,
    look: {
      body: 'blob',
      color: '#fde68a',
      belly: '#fef9c3',
      eyes: 'sleepy',
      mouth: 'cat',
      parts: ['ears'],
    },
  },
  {
    id: 17,
    name: '風箏',
    english: 'Kite',
    meaning: '風箏',
    element: 'thunder',
    rarity: 'uncommon',
    description: '像風箏一樣在海風裡飛的小鳥。翅膀上的電可以讓牠飛很久。',
    baseHp: 24,
    baseAtk: 12,
    look: {
      body: 'round',
      color: '#60a5fa',
      belly: '#dbeafe',
      eyes: 'big',
      mouth: 'open',
      accent: '#1d4ed8',
      parts: ['wings', 'antenna'],
    },
  },
  {
    id: 18,
    name: '星咩',
    english: 'Star',
    meaning: '星星',
    element: 'light',
    rarity: 'rare',
    description: '毛是星星形狀的小羊。晚上在海邊數星星的時候最容易遇到。',
    baseHp: 32,
    baseAtk: 12,
    look: {
      body: 'blob',
      color: '#fefce8',
      belly: '#ffffff',
      eyes: 'happy',
      mouth: 'cat',
      accent: '#facc15',
      parts: ['horns', 'star'],
      cheeks: true,
    },
  },
];

/** 一開始可以選的夥伴 */
export const STARTER_IDS = [1, 2, 3] as const;

export const getSpecies = (id: number): Species => {
  const s = SPECIES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown species ${id}`);
  return s;
};
