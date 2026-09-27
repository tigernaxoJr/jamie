import type { GameWord } from './types';

export const randomInt = (maxExclusive: number): number => Math.floor(Math.random() * maxExclusive);

export const shuffle = <T>(items: readonly T[]): T[] => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j] as T, arr[i] as T];
  }
  return arr;
};

/** 最後一個符合條件的位置（不用 Array.findLastIndex，舊平板也能跑） */
const lastIndexOf = <T>(arr: readonly T[], ok: (x: T) => boolean): number => {
  for (let i = arr.length - 1; i >= 0; i--) if (ok(arr[i]!)) return i;
  return -1;
};

/**
 * 抽牌堆：依權重放進牌堆後洗牌、依序抽出，抽完自動重洗，且不會連續抽到同一個字。
 * 權重 3 的字在一輪裡會出現 3 次，越不熟的字越常練到。
 */
export class WordDeck {
  private pile: GameWord[] = [];
  private last: GameWord | undefined;

  constructor(private readonly words: readonly GameWord[]) {}

  private refill() {
    this.pile = shuffle(this.words.flatMap((w) => Array<GameWord>(w.weight ?? 1).fill(w)));
  }

  draw(exclude: ReadonlySet<string> = new Set()): GameWord {
    const allowed = (w: GameWord) =>
      !exclude.has(w.answer) && !(w === this.last && this.words.length > 1);
    // 從牌堆最上面找第一張可以出的；找不到就重洗一輪再找
    let i = lastIndexOf(this.pile, allowed);
    if (i < 0) {
      this.refill();
      i = lastIndexOf(this.pile, allowed);
    }
    if (i >= 0) {
      this.last = this.pile.splice(i, 1)[0]!;
      return this.last;
    }
    // 所有字都被排除時，退而求其次
    const rest = this.words.filter(allowed);
    const from = rest.length > 0 ? rest : this.words;
    this.last = from[randomInt(from.length)] as GameWord;
    return this.last;
  }
}
