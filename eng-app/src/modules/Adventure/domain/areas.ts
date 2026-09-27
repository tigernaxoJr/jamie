export interface Area {
  id: string;
  name: string;
  emoji: string;
  description: string;
  /** 題庫級別（Category 的 parent id），出題會用這個級別底下的所有主題 */
  wordLevel: string;
  /** 野生字靈的等級範圍 */
  levels: [number, number];
  /** 會出現的字靈編號 */
  species: number[];
  /** 背景漸層 */
  background: string;
  /** 解鎖條件：前一區至少捕捉幾種 */
  unlockAfter?: { area: string; caught: number };
}

export const AREAS: readonly Area[] = [
  {
    id: 'meadow',
    name: '微風草原',
    emoji: '🌼',
    description: '綠油油的草地，最適合新手探險。',
    wordLevel: '1',
    levels: [1, 3],
    species: [4, 5, 6, 7, 8, 3],
    background: 'linear-gradient(180deg, #bae6fd 0%, #dcfce7 55%, #86efac 100%)',
  },
  {
    id: 'forest',
    name: '螢光森林',
    emoji: '🌲',
    description: '大樹遮住了陽光，聽說晚上會有會發光的字靈。',
    wordLevel: '2',
    levels: [3, 5],
    species: [9, 10, 11, 12, 13, 1],
    background: 'linear-gradient(180deg, #14532d 0%, #166534 50%, #4d7c0f 100%)',
    unlockAfter: { area: 'meadow', caught: 3 },
  },
  {
    id: 'beach',
    name: '星星海灘',
    emoji: '🏖️',
    description: '沙灘上有好多貝殼，海浪裡好像藏著什麼。',
    wordLevel: '3',
    levels: [5, 7],
    species: [14, 15, 16, 17, 18, 2],
    background: 'linear-gradient(180deg, #7dd3fc 0%, #bae6fd 45%, #fde68a 100%)',
    unlockAfter: { area: 'forest', caught: 3 },
  },
];

export const getArea = (id: string): Area | undefined => AREAS.find((a) => a.id === id);

/** 某隻字靈的棲息地名稱 */
export const habitatsOf = (speciesId: number): string[] =>
  AREAS.filter((a) => a.species.includes(speciesId)).map((a) => a.name);
