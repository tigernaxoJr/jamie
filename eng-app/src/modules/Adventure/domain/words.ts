import { Categories } from 'src/modules/Vocabulary';
import { type GameWord, loadGameWords } from 'src/modules/Games/shared';
import type { Area } from './areas';

/** 地區出題用的單字：該級別底下所有主題 */
export const wordsForArea = (area: Area): GameWord[] =>
  loadGameWords(Categories.filter((c) => c.parentId === area.wordLevel).map((c) => c.id));
