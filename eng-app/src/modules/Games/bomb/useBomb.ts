import { computed, reactive } from 'vue';
import { WordPronunciation } from 'src/modules/Vocabulary';
import {
  type GameSession,
  type GameWord,
  WordDeck,
  isLetter,
  lettersOf,
  sfx,
  useGameLoop,
  useTimers,
} from '../shared';

export const MAX_WRONG = 6;
const MAX_LIVES = 3;
const BASE_TIME = 40;
const MIN_TIME = 20;
const WRONG_PENALTY = 3;
const HINT_COST = 5;

export type RoundStatus = 'playing' | 'defused' | 'exploded';

export function useBomb(session: GameSession) {
  const timers = useTimers();
  let deck = new WordDeck([]);
  const missed = new Map<string, GameWord>();

  const state = reactive({
    word: null as GameWord | null,
    guessed: new Set<string>(),
    wrong: [] as string[],
    timeLeft: BASE_TIME,
    fuse: BASE_TIME,
    lives: MAX_LIVES,
    score: 0,
    defused: 0,
    hintUsed: false,
    status: 'playing' as RoundStatus,
  });

  const targetLetters = computed(() => new Set(state.word ? lettersOf(state.word.answer) : ''));

  /** 顯示用：每個字元與是否已揭開 */
  const display = computed(() =>
    [...(state.word?.answer ?? '')].map((ch) => ({
      ch,
      shown: !isLetter(ch) || state.guessed.has(ch.toLowerCase()) || state.status !== 'playing',
    })),
  );

  const loop = useGameLoop((dt) => {
    if (state.status !== 'playing') return;
    state.timeLeft = Math.max(0, state.timeLeft - dt);
    if (state.timeLeft === 0) explode();
  });

  const nextBomb = () => {
    state.word = deck.draw();
    state.guessed = new Set();
    state.wrong = [];
    state.hintUsed = false;
    state.fuse = Math.max(MIN_TIME, BASE_TIME - state.defused * 2);
    state.timeLeft = state.fuse;
    state.status = 'playing';
  };

  const start = (words: GameWord[]) => {
    timers.clearAll();
    deck = new WordDeck(words);
    missed.clear();
    Object.assign(state, { lives: MAX_LIVES, score: 0, defused: 0 });
    nextBomb();
    loop.stop();
    loop.start();
  };

  const end = (headline: string) => {
    loop.stop();
    timers.clearAll();
    if (state.defused > 0) sfx.win();
    else sfx.lose();
    session.finish({
      won: state.defused > 0,
      headline,
      score: state.score,
      stats: [
        { label: '成功拆除', value: state.defused },
        { label: '爆炸', value: MAX_LIVES - state.lives },
      ],
      missed: [...missed.values()],
    });
  };

  const defuse = () => {
    const word = state.word!;
    state.status = 'defused';
    state.defused++;
    state.score += Math.ceil(state.timeLeft) * 2 + targetLetters.value.size * 5;
    session.record(word, state.wrong.length <= 2 && !state.hintUsed);
    sfx.correct();
    WordPronunciation(word.answer);
    timers.later(nextBomb, 1500);
  };

  function explode() {
    const word = state.word!;
    state.status = 'exploded';
    state.lives--;
    missed.set(word.answer, word);
    session.record(word, false);
    sfx.explode();
    timers.later(() => {
      if (state.lives <= 0) end(`拆除了 ${state.defused} 顆炸彈！`);
      else nextBomb();
    }, 2200);
  }

  const guess = (letter: string) => {
    const ch = letter.toLowerCase();
    if (state.status !== 'playing' || !isLetter(ch) || state.guessed.has(ch)) return;
    state.guessed.add(ch);

    if (targetLetters.value.has(ch)) {
      sfx.click();
      const allFound = [...targetLetters.value].every((c) => state.guessed.has(c));
      if (allFound) defuse();
      return;
    }

    state.wrong.push(ch);
    state.timeLeft = Math.max(0, state.timeLeft - WRONG_PENALTY);
    sfx.wrong();
    if (state.wrong.length >= MAX_WRONG || state.timeLeft === 0) explode();
  };

  const hint = () => {
    if (state.status !== 'playing' || !state.word) return;
    state.hintUsed = true;
    state.timeLeft = Math.max(1, state.timeLeft - HINT_COST);
    WordPronunciation(state.word.answer);
  };

  /** 鍵盤上每個字母的狀態 */
  const letterStatus = (ch: string): '' | 'hit' | 'miss' => {
    if (!state.guessed.has(ch)) return '';
    return targetLetters.value.has(ch) ? 'hit' : 'miss';
  };

  const quit = () => end('提早結束了，下次再挑戰！');

  return { state, display, loop, start, guess, hint, letterStatus, quit, hintCost: HINT_COST };
}
