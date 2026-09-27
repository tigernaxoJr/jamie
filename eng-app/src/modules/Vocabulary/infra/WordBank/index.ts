import { QuizWord } from '../../domain';
import { WordMetaStorage } from '../WordMetaStorage';
import Cat1 from './Cat1';
import Cat2 from './Cat2';
import Cat3 from './Cat3';
import Cat4 from './Cat4';
import Cat5 from './Cat5';
import Cat6 from './Cat6';
import Cat7 from './Cat7';
import Cat8 from './Cat8';
import Cat9 from './Cat9';
import Cat10 from './Cat10';

const allNewWords = [
  ...Cat1,
  ...Cat2,
  ...Cat3,
  ...Cat4,
  ...Cat5,
  ...Cat6,
  ...Cat7,
  ...Cat8,
  ...Cat9,
  ...Cat10,
];

/**
 * 載入指定類別的單字，並帶入長期記憶中的答題記錄。
 * id 是單字在整個題庫中的位置，換類別也不會變，「最近出過」的紀錄才能正確對應。
 */
export const loadQuizWords = (categories: ReadonlySet<string>): QuizWord[] => {
  const savedMeta = WordMetaStorage.loadAll();

  return allNewWords.flatMap((w, id) => {
    if (!w.categories.some((c) => categories.has(c))) return [];
    const meta = savedMeta[w.english.toLowerCase()];
    return [
      new QuizWord(
        id,
        w.english,
        w.chinese,
        w.image,
        w.audio,
        w.categories,
        meta && { ...meta.errorRec },
        meta && { ...meta.correctRec },
      ),
    ];
  });
};
