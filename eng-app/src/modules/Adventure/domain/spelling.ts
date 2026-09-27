import { shuffle } from 'src/modules/Games/shared/deck';

/**
 * 拼字題的提示，依單字熟練度逐步減少：
 * tiles：把打散的字母排回正確順序
 * first：給第一個字母與底線
 * none：只有底線（字母數）
 */
export type SpellHint = 'tiles' | 'first' | 'none';

/** 連續答對幾次就不給提示；與單字「熟練」的標準（Vocabulary 的 MASTERED_STREAK）一致 */
export const NO_HINT_STREAK = 3;

/** 依連續答對次數決定提示：沒答對過用字母方塊，還沒熟練給第一個字母，熟練了就不給 */
export const spellHintFor = (streak: number): SpellHint =>
  streak <= 0 ? 'tiles' : streak < NO_HINT_STREAK ? 'first' : 'none';

/** 字母方塊：答案裡的字母打散；避免剛好排成正確答案 */
export const letterTiles = (answer: string): string[] => {
  const letters = [...answer].filter((ch) => /[a-z]/i.test(ch));
  if (new Set(letters.map((ch) => ch.toLowerCase())).size < 2) return letters;
  let tiles = shuffle(letters);
  while (tiles.join('').toLowerCase() === letters.join('').toLowerCase()) tiles = shuffle(letters);
  return tiles;
};
