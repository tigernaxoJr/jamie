import { Categories } from 'src/modules/Vocabulary';
import { type GameWord, loadGameWords } from 'src/modules/Games/shared';
import type { Area } from './areas';

/** 地區出題用的單字：該級別底下所有主題 */
export const wordsForArea = (area: Area): GameWord[] =>
  loadGameWords(Categories.filter((c) => c.parentId === area.wordLevel).map((c) => c.id));

/** 題庫所有單字（以答案查詢），第一次用到時才載入 */
let bank: Map<string, GameWord> | null = null;

/** 字靈英文名字在題庫裡的單字；題庫沒有這個字時回傳 null */
export const bankWordFor = (english: string): GameWord | null => {
  bank ??= new Map(
    loadGameWords(Categories.map((c) => c.id)).map((w) => [w.answer.toLowerCase(), w]),
  );
  return bank.get(english.toLowerCase()) ?? null;
};
