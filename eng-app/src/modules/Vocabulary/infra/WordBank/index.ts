import { QuizWord } from '../../domain';
import Cat1 from './Cat1';
import Cat2 from './Cat2';

const allNewWords = [...Cat1, ...Cat2];

export const GeQuiztWords = (categories: Set<string>): Array<QuizWord> =>
  allNewWords
    .filter((w) => w.categories.some((c) => categories.has(c)))
    .map((w, id) => new QuizWord(id, w.english, w.chinese, w.image, w.audio, w.categories));

export default {};
