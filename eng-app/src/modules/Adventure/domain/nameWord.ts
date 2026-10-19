import type { GameWord } from 'src/modules/Games/shared';
import type { Species } from './species';

/** 捕捉最後一題考字靈名字用的單字：題庫有就用題庫的（inBank），沒有就用字靈資料組一個 */
export const nameWordOf = (species: Species, inBank: GameWord | null): GameWord =>
  inBank ?? {
    english: species.english.toLowerCase(),
    chinese: species.meaning,
    answer: species.english.toLowerCase(),
  };
