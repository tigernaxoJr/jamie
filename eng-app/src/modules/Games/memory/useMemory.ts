import { computed, reactive } from 'vue';
import { WordPronunciation } from 'src/modules/Vocabulary';
import { type GameSession, type GameWord, sfx, shuffle, useGameLoop, useTimers } from '../shared';

/** 每一關的配對數 */
export const ROUNDS = [4, 6, 8] as const;
const FLIP_BACK_MS = 900;

export interface Card {
  id: number;
  word: GameWord;
  face: 'en' | 'zh';
  flipped: boolean;
  matched: boolean;
}

/** 挑出中文和英文都不重複的單字，避免同義字造成混淆 */
const pickDistinct = (words: GameWord[], count: number): GameWord[] => {
  const chinese = new Set<string>();
  const picked: GameWord[] = [];
  for (const w of shuffle(words)) {
    if (chinese.has(w.chinese)) continue;
    chinese.add(w.chinese);
    picked.push(w);
    if (picked.length === count) break;
  }
  return picked;
};

export function useMemory(session: GameSession) {
  const timers = useTimers();
  let words: GameWord[] = [];
  const mistakes = new Map<string, number>();

  const state = reactive({
    round: 0,
    cards: [] as Card[],
    moves: 0,
    misses: 0,
    seconds: 0,
    score: 0,
    totalMisses: 0,
    roundCleared: false,
    busy: false,
  });

  const pairs = computed(() => state.cards.length / 2);

  const loop = useGameLoop((dt) => {
    if (!state.roundCleared) state.seconds += dt;
  });

  const dealRound = () => {
    const chosen = pickDistinct(words, ROUNDS[state.round] ?? 4);
    let id = 0;
    state.cards = shuffle(
      chosen.flatMap((word) => [
        { id: id++, word, face: 'en' as const, flipped: false, matched: false },
        { id: id++, word, face: 'zh' as const, flipped: false, matched: false },
      ]),
    );
    Object.assign(state, { moves: 0, misses: 0, seconds: 0, roundCleared: false, busy: false });
  };

  const start = (list: GameWord[]) => {
    timers.clearAll();
    words = list;
    mistakes.clear();
    Object.assign(state, { round: 0, score: 0, totalMisses: 0 });
    dealRound();
    loop.stop();
    loop.start();
  };

  const end = (won: boolean, headline: string) => {
    loop.stop();
    timers.clearAll();
    if (won) sfx.win();
    session.finish({
      won,
      headline,
      score: state.score,
      stats: [
        { label: '完成關卡', value: `${state.round + (won ? 1 : 0)} / ${ROUNDS.length}` },
        { label: '翻錯次數', value: state.totalMisses },
      ],
      // 翻錯兩次以上的單字列為需要練習
      missed: [...mistakes.entries()]
        .filter(([, n]) => n >= 2)
        .map(([answer]) => words.find((w) => w.answer === answer))
        .filter((w): w is GameWord => !!w),
    });
  };

  const clearRound = () => {
    state.roundCleared = true;
    const p = pairs.value;
    const accuracy = Math.max(0, p * 2 - state.misses) * 10;
    const speed = Math.max(0, Math.round(p * 8 - state.seconds)) * 2;
    state.score += p * 20 + accuracy + speed;
    sfx.win();
    timers.later(() => {
      if (state.round + 1 >= ROUNDS.length) return end(true, '全部配對完成，記憶力超強！');
      state.round++;
      dealRound();
    }, 1800);
  };

  const flip = (card: Card) => {
    if (state.busy || state.roundCleared || card.flipped || card.matched || loop.paused.value)
      return;
    card.flipped = true;
    if (card.face === 'en') WordPronunciation(card.word.answer);
    else sfx.click();

    const open = state.cards.filter((c) => c.flipped && !c.matched);
    if (open.length < 2) return;

    state.moves++;
    const [a, b] = open as [Card, Card];
    if (a.word.answer === b.word.answer) {
      a.matched = b.matched = true;
      sfx.correct();
      if (state.cards.every((c) => c.matched)) clearRound();
      return;
    }

    state.misses++;
    state.totalMisses++;
    for (const c of [a, b]) mistakes.set(c.word.answer, (mistakes.get(c.word.answer) ?? 0) + 1);
    state.busy = true;
    timers.later(() => {
      a.flipped = b.flipped = false;
      state.busy = false;
    }, FLIP_BACK_MS);
  };

  const quit = () => end(false, '提早結束了，下次再挑戰！');

  return { state, pairs, loop, start, flip, quit };
}
