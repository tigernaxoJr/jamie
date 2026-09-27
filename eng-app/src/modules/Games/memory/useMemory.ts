import { computed, reactive, ref } from 'vue';
import { WordPronunciation } from 'src/modules/Vocabulary';
import {
  type GameSession,
  type GameWord,
  type StageSelection,
  randomInt,
  sfx,
  shuffle,
  useGameLoop,
  useStageProgress,
  useTimers,
} from '../shared';
import {
  type CardFace,
  FLASHLIGHTS,
  MEMORY_STAGES,
  endlessRound,
  memoryStars,
} from './stages';

const FLIP_BACK_MS = 900;
const FLASH_MS = 1200;

export interface Card {
  id: number;
  word: GameWord;
  face: CardFace;
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
  const { stars, totalStars, recordStars } = useStageProgress('memory-stages');
  const mode = ref<StageSelection>({ kind: 'stage', index: 0 });
  const isEndless = computed(() => mode.value.kind === 'endless');

  let words: GameWord[] = [];
  let nextId = 0;
  const mistakes = new Map<string, number>();

  const state = reactive({
    /** 無盡模式的第幾輪（關卡模式固定 0） */
    round: 0,
    board: MEMORY_STAGES[0]!,
    cards: [] as Card[],
    moves: 0,
    misses: 0,
    combo: 0,
    seconds: 0,
    score: 0,
    totalMisses: 0,
    flashlights: FLASHLIGHTS,
    /** 開局偷看中 */
    peeking: false,
    /** 旋風把牌吹亂時的動畫 */
    windy: false,
    roundCleared: false,
    busy: false,
  });

  const timeLeft = computed(() =>
    state.board.timeLimit === undefined
      ? undefined
      : Math.max(0, state.board.timeLimit - state.seconds),
  );

  const loop = useGameLoop((dt) => {
    if (state.roundCleared || state.peeking) return;
    state.seconds += dt;
    if (timeLeft.value === 0) timeUp();
  });

  const dealRound = () => {
    const board =
      mode.value.kind === 'stage' ? MEMORY_STAGES[mode.value.index]! : endlessRound(state.round);
    state.board = board;
    const chosen = pickDistinct(words, board.pairs);
    state.cards = shuffle(
      chosen.flatMap((word) => {
        const [a, b] = board.kinds[randomInt(board.kinds.length)]!;
        return [a, b].map((face) => ({ id: nextId++, word, face, flipped: true, matched: false }));
      }),
    );
    Object.assign(state, {
      moves: 0,
      misses: 0,
      combo: 0,
      seconds: 0,
      flashlights: FLASHLIGHTS,
      roundCleared: false,
      busy: true,
      peeking: true,
    });
    // 先偷看，時間到蓋回去才開始計時
    timers.later(() => {
      for (const c of state.cards) c.flipped = false;
      state.peeking = false;
      state.busy = false;
    }, board.peek * 1000);
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
    let result: number | undefined;
    if (won && mode.value.kind === 'stage') {
      result = memoryStars(state.misses, state.board.pairs);
      recordStars(mode.value.index, result);
    }
    const success = isEndless.value ? state.round > 0 : won;
    if (success) sfx.win();
    else sfx.lose();
    session.finish({
      won: success,
      headline,
      score: Math.round(state.score),
      ...(result === undefined ? {} : { stars: result }),
      stats: isEndless.value
        ? [
            { label: '完成輪數', value: state.round },
            { label: '翻錯次數', value: state.totalMisses },
          ]
        : [
            { label: '翻錯次數', value: state.misses },
            { label: '花費時間', value: `${Math.floor(state.seconds)} 秒` },
          ],
      // 翻錯兩次以上的單字列為需要練習
      missed: [...mistakes.entries()]
        .filter(([, n]) => n >= 2)
        .map(([answer]) => words.find((w) => w.answer === answer))
        .filter((w): w is GameWord => !!w),
    });
  };

  function timeUp() {
    end(
      false,
      isEndless.value
        ? `時間到！你完成了 ${state.round} 輪`
        : `時間到！再挑戰一次${state.board.name}吧`,
    );
  }

  const clearRound = () => {
    state.roundCleared = true;
    const p = state.board.pairs;
    const accuracy = Math.max(0, p * 2 - state.misses) * 10;
    const limit = state.board.timeLimit ?? p * 8;
    const speed = Math.max(0, Math.round(limit - state.seconds)) * 2;
    state.score += p * 20 + accuracy + speed;
    sfx.win();
    timers.later(() => {
      if (!isEndless.value) return end(true, `${state.board.name}完成！`);
      state.round++;
      dealRound();
    }, 1800);
  };

  /** 旋風：把還沒配對的牌打亂位置 */
  const blowCards = () => {
    const slots = state.cards.map((c, i) => (c.matched ? -1 : i)).filter((i) => i >= 0);
    const moved = shuffle(slots.map((i) => state.cards[i]!));
    const next = [...state.cards];
    slots.forEach((slot, k) => (next[slot] = moved[k]!));
    state.cards = next;
    state.windy = true;
    timers.later(() => (state.windy = false), 700);
  };

  const flip = (card: Card) => {
    if (state.busy || state.roundCleared || card.flipped || card.matched || loop.paused.value)
      return;
    card.flipped = true;
    if (card.face !== 'zh') WordPronunciation(card.word.answer);
    else sfx.click();

    const open = state.cards.filter((c) => c.flipped && !c.matched);
    if (open.length < 2) return;

    state.moves++;
    const [a, b] = open as [Card, Card];
    if (a.word.answer === b.word.answer) {
      a.matched = b.matched = true;
      state.combo++;
      state.score += Math.min(state.combo, 5) * 5;
      // recordsProgress 為 false，只會算進糖果，不寫入測驗記錄
      session.record(a.word, true);
      sfx.correct();
      if (state.cards.every((c) => c.matched)) clearRound();
      return;
    }

    state.misses++;
    state.totalMisses++;
    state.combo = 0;
    for (const c of [a, b]) mistakes.set(c.word.answer, (mistakes.get(c.word.answer) ?? 0) + 1);
    state.busy = true;
    timers.later(() => {
      a.flipped = b.flipped = false;
      state.busy = false;
      const every = state.board.shuffleEvery;
      if (every && state.misses % every === 0) blowCards();
    }, FLIP_BACK_MS);
  };

  /** 手電筒：所有還沒配對的牌亮一下 */
  const flashlight = () => {
    if (state.busy || state.roundCleared || state.flashlights <= 0 || loop.paused.value) return;
    state.flashlights--;
    state.busy = true;
    const hidden = state.cards.filter((c) => !c.matched && !c.flipped);
    for (const c of hidden) c.flipped = true;
    timers.later(() => {
      for (const c of hidden) c.flipped = false;
      state.busy = false;
    }, FLASH_MS);
  };

  const quit = () =>
    end(
      false,
      isEndless.value ? `遊戲結束，你完成了 ${state.round} 輪` : '提早結束了，下次再挑戰！',
    );

  return {
    state,
    mode,
    isEndless,
    stars,
    totalStars,
    timeLeft,
    loop,
    start,
    flip,
    flashlight,
    quit,
  };
}
