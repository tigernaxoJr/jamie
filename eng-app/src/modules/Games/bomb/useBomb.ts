import { computed, reactive, ref } from 'vue';
import { WordPronunciation } from 'src/modules/Vocabulary';
import {
  type GameSession,
  type GameWord,
  type StageSelection,
  WordDeck,
  isLetter,
  lettersOf,
  randomInt,
  sfx,
  useGameLoop,
  useStageProgress,
  useTimers,
} from '../shared';
import {
  type BombType,
  CHAIN_LENGTH,
  FUSE_FACTOR,
  ROOMS,
  ROOM_LIVES,
  bombPlan,
  roomStars,
} from './rooms';

export const MAX_WRONG = 6;
const MAX_LIVES = 3;
const BASE_TIME = 40;
const MIN_TIME = 20;
const WRONG_PENALTY = 3;
const HINT_COST = 5;

export type RoundStatus = 'playing' | 'defused' | 'exploded';

export function useBomb(session: GameSession) {
  const timers = useTimers();
  const { stars, totalStars, recordStars } = useStageProgress('bomb-rooms');
  const mode = ref<StageSelection>({ kind: 'stage', index: 0 });
  const room = computed(() => (mode.value.kind === 'stage' ? ROOMS[mode.value.index] : undefined));

  let deck = new WordDeck([]);
  let plan: BombType[] = [];
  const missed = new Map<string, GameWord>();

  const state = reactive({
    word: null as GameWord | null,
    guessed: new Set<string>(),
    wrong: [] as string[],
    timeLeft: BASE_TIME,
    fuse: BASE_TIME,
    lives: MAX_LIVES,
    maxLives: MAX_LIVES,
    score: 0,
    defused: 0,
    explosions: 0,
    /** 這個單字用過提示或放大鏡（不算完全答對） */
    hintUsed: false,
    /** 神秘炸彈：花時間看了中文 */
    meaningShown: false,
    magnifiers: 0,
    bombType: 'normal' as BombType,
    /** 連環炸彈拆到第幾個單字（從 0 開始） */
    chainStep: 0,
    /** 連環炸彈拆完一個字，下一個字馬上來 */
    chainNext: false,
    status: 'playing' as RoundStatus,
  });

  const targetLetters = computed(() => new Set(state.word ? lettersOf(state.word.answer) : ''));
  /** 神秘炸彈沒看中文前，中文要藏起來 */
  const hideMeaning = computed(
    () => state.bombType === 'mystery' && !state.meaningShown && state.status === 'playing',
  );
  /** 房間模式下，這顆是第幾顆（從 1 開始） */
  const bombNumber = computed(() => state.defused + state.explosions + 1);

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

  /** 換下一個單字（連環炸彈的第二個字也走這裡，引信不重設） */
  const loadWord = () => {
    state.word = deck.draw();
    state.guessed = new Set();
    state.wrong = [];
    state.hintUsed = false;
    state.meaningShown = false;
    state.chainNext = false;
    state.status = 'playing';
    if (state.bombType === 'mystery') WordPronunciation(state.word.answer);
  };

  const nextBomb = () => {
    const r = room.value;
    if (r) {
      state.bombType = plan[state.defused + state.explosions] ?? 'normal';
      state.fuse = Math.round(r.fuse * FUSE_FACTOR[state.bombType]);
    } else {
      state.bombType = 'normal';
      state.fuse = Math.max(MIN_TIME, BASE_TIME - state.defused * 2);
    }
    state.chainStep = 0;
    state.timeLeft = state.fuse;
    loadWord();
  };

  const start = (words: GameWord[]) => {
    timers.clearAll();
    deck = new WordDeck(words);
    missed.clear();
    const r = room.value;
    plan = r ? bombPlan(r) : [];
    const lives = r ? ROOM_LIVES : MAX_LIVES;
    Object.assign(state, {
      lives,
      maxLives: lives,
      score: 0,
      defused: 0,
      explosions: 0,
      magnifiers: r?.magnifiers ?? 0,
    });
    nextBomb();
    loop.stop();
    loop.start();
  };

  const end = (won: boolean, headline: string) => {
    loop.stop();
    timers.clearAll();
    const r = room.value;
    let result: number | undefined;
    if (r && won && mode.value.kind === 'stage') {
      result = roomStars(state.explosions);
      recordStars(mode.value.index, result);
      state.score += state.lives * 50;
    }
    const success = r ? won : state.defused > 0;
    if (success) sfx.win();
    else sfx.lose();
    session.finish({
      won: success,
      headline,
      score: state.score,
      ...(result === undefined ? {} : { stars: result }),
      stats: [
        { label: '成功拆除', value: r ? `${state.defused} / ${r.bombs}` : state.defused },
        { label: '爆炸', value: state.explosions },
      ],
      missed: [...missed.values()],
    });
  };

  const afterBomb = () => {
    const r = room.value;
    if (state.lives <= 0) {
      return end(
        false,
        r ? `${r.name}的門沒打開……再試一次吧！` : `拆除了 ${state.defused} 顆炸彈！`,
      );
    }
    if (r && state.defused >= r.bombs) return end(true, `逃出${r.name}了！`);
    // 房間模式炸彈數用完（有爆炸的）但還沒拆夠：補一顆一般炸彈
    if (r && bombNumber.value > plan.length) plan.push('normal');
    nextBomb();
  };

  const solveWord = () => {
    const word = state.word!;
    session.record(word, state.wrong.length <= 2 && !state.hintUsed && !state.meaningShown);
    WordPronunciation(word.answer);
    const letterScore = targetLetters.value.size * 5;

    // 連環炸彈：還有下一個字，同一條引信繼續燒
    if (state.bombType === 'chain' && state.chainStep < CHAIN_LENGTH - 1) {
      state.score += letterScore;
      state.chainStep++;
      sfx.correct();
      state.chainNext = true;
      state.status = 'defused';
      timers.later(loadWord, 900);
      return;
    }

    state.status = 'defused';
    state.defused++;
    const bonus = state.bombType === 'fast' ? 1.5 : 1;
    state.score += Math.round((Math.ceil(state.timeLeft) * 2 + letterScore) * bonus);
    sfx.correct();
    timers.later(afterBomb, 1500);
  };

  function explode() {
    const word = state.word!;
    state.status = 'exploded';
    state.lives--;
    state.explosions++;
    missed.set(word.answer, word);
    session.record(word, false);
    sfx.explode();
    timers.later(afterBomb, 2200);
  }

  const guess = (letter: string) => {
    const ch = letter.toLowerCase();
    if (state.status !== 'playing' || !isLetter(ch) || state.guessed.has(ch)) return;
    state.guessed.add(ch);

    if (targetLetters.value.has(ch)) {
      sfx.click();
      const allFound = [...targetLetters.value].every((c) => state.guessed.has(c));
      if (allFound) solveWord();
      return;
    }

    state.wrong.push(ch);
    state.timeLeft = Math.max(0, state.timeLeft - WRONG_PENALTY);
    sfx.wrong();
    if (state.wrong.length >= MAX_WRONG || state.timeLeft === 0) explode();
  };

  /** 提示：一般炸彈是聽發音，神秘炸彈是看中文；都要花時間 */
  const hint = () => {
    if (state.status !== 'playing' || !state.word) return;
    state.timeLeft = Math.max(1, state.timeLeft - HINT_COST);
    if (state.bombType === 'mystery') {
      state.meaningShown = true;
    } else {
      state.hintUsed = true;
      WordPronunciation(state.word.answer);
    }
  };

  /** 神秘炸彈可以免費重聽 */
  const replay = () => {
    if (state.word) WordPronunciation(state.word.answer);
  };

  /** 放大鏡：揭開一個還沒猜到的字母 */
  const magnify = () => {
    if (state.status !== 'playing' || state.magnifiers <= 0) return;
    const hidden = [...targetLetters.value].filter((c) => !state.guessed.has(c));
    const ch = hidden[randomInt(hidden.length)];
    if (!ch) return;
    state.magnifiers--;
    state.hintUsed = true;
    guess(ch);
  };

  /** 鍵盤上每個字母的狀態 */
  const letterStatus = (ch: string): '' | 'hit' | 'miss' => {
    if (!state.guessed.has(ch)) return '';
    return targetLetters.value.has(ch) ? 'hit' : 'miss';
  };

  const quit = () => end(false, '提早結束了，下次再挑戰！');

  return {
    state,
    mode,
    room,
    stars,
    totalStars,
    display,
    hideMeaning,
    bombNumber,
    loop,
    start,
    guess,
    hint,
    replay,
    magnify,
    letterStatus,
    quit,
    hintCost: HINT_COST,
  };
}
