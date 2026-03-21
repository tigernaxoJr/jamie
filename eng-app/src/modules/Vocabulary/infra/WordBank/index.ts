import { QuizWord } from '../../domain';
import { WordMetaStorage } from '../WordMetaStorage';
import Cat1 from './Cat1';
import Cat2 from './Cat2';

const allNewWords = [...Cat1, ...Cat2];

export const GeQuiztWords = (categories: Set<string>): Array<QuizWord> => {
  const savedMeta = WordMetaStorage.loadAll();

  return allNewWords
    .filter((w) => w.categories.some((c) => categories.has(c)))
    .map((w, id) => {
      const meta = savedMeta[w.english.toLowerCase()];
      return new QuizWord(
        id,
        w.english,
        w.chinese,
        w.image,
        w.audio,
        w.categories,
        meta?.errorRec,
        meta?.correctRec,
      );
    });
};

export default {};
