import { type Ref, computed, reactive } from 'vue';
import { WordPronunciation } from 'src/modules/Vocabulary';
import {
  type GameSession,
  type GameWord,
  WordDeck,
  lettersOf,
  randomInt,
  sfx,
  useGameLoop,
} from '../shared';

export const BOARD_SIZE = 12;
const MAX_LIVES = 3;
const DECOYS = 3;

export type SnakeSpeed = 'slow' | 'normal' | 'fast';

/** 每一步的秒數：開局、最快、每拼完一個字加快多少 */
export const SNAKE_SPEEDS: Record<
  SnakeSpeed,
  { label: string; start: number; min: number; step: number }
> = {
  slow: { label: '🐢 慢', start: 0.5, min: 0.28, step: 0.015 },
  normal: { label: '🐇 中', start: 0.38, min: 0.2, step: 0.012 },
  fast: { label: '🚀 快', start: 0.28, min: 0.14, step: 0.012 },
};

export interface Point {
  x: number;
  y: number;
}
export interface BoardLetter extends Point {
  ch: string;
}
export type Direction = 'up' | 'down' | 'left' | 'right';

const VECTORS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y;

const startingSnake = (): Point[] => {
  const y = Math.floor(BOARD_SIZE / 2);
  return [
    { x: 3, y },
    { x: 2, y },
    { x: 1, y },
  ];
};

export function useSnake(session: GameSession, speed: Ref<SnakeSpeed>) {
  const pace = () => SNAKE_SPEEDS[speed.value];
  let deck = new WordDeck([]);
  let dirQueue: Direction[] = [];
  let acc = 0;
  let wordHadMistake = false;
  const missed = new Map<string, GameWord>();

  const state = reactive({
    snake: startingSnake(),
    dir: 'right' as Direction,
    letters: [] as BoardLetter[],
    word: null as GameWord | null,
    progress: 0,
    lives: MAX_LIVES,
    score: 0,
    completed: 0,
    interval: SNAKE_SPEEDS.normal.start,
    /** 撞到或吃錯時短暫閃爍 */
    flash: false,
  });

  const target = computed(() => (state.word ? lettersOf(state.word.answer) : ''));
  const needed = computed(() => target.value[state.progress] ?? '');

  const isFree = (p: Point) =>
    !state.snake.some((s) => same(s, p)) && !state.letters.some((l) => same(l, p));

  const randomFreeCell = (): Point => {
    const head = state.snake[0]!;
    for (let i = 0; i < 200; i++) {
      const p = { x: randomInt(BOARD_SIZE), y: randomInt(BOARD_SIZE) };
      // 不要生在蛇頭正前方附近
      const near = Math.abs(p.x - head.x) + Math.abs(p.y - head.y) < 3;
      if (!near && isFree(p)) return p;
    }
    return { x: 0, y: 0 };
  };

  const placeLetters = () => {
    state.letters = [];
    const want = needed.value;
    const decoys = [...ALPHABET].filter((c) => c !== want);
    const chars = [want];
    while (chars.length < DECOYS + 1) {
      const c = decoys.splice(randomInt(decoys.length), 1)[0]!;
      chars.push(c);
    }
    for (const ch of chars) state.letters.push({ ...randomFreeCell(), ch });
  };

  const nextWord = () => {
    state.word = deck.draw();
    state.progress = 0;
    wordHadMistake = false;
    placeLetters();
  };

  const loop = useGameLoop((dt) => {
    acc += dt;
    if (acc < state.interval) return;
    acc = 0;
    step();
  });

  const start = (words: GameWord[]) => {
    deck = new WordDeck(words);
    missed.clear();
    dirQueue = [];
    acc = -1; // 開局給 1 秒準備
    Object.assign(state, {
      snake: startingSnake(),
      dir: 'right',
      lives: MAX_LIVES,
      score: 0,
      completed: 0,
      interval: pace().start,
      flash: false,
    });
    nextWord();
    loop.stop();
    loop.start();
  };

  const end = (reason: string) => {
    loop.stop();
    sfx.lose();
    session.finish({
      won: state.completed > 0,
      headline: `${reason}你拼出了 ${state.completed} 個單字`,
      score: state.score,
      stats: [
        { label: '拼完單字', value: state.completed },
        { label: '蛇的長度', value: state.snake.length },
      ],
      missed: [...missed.values()],
    });
  };

  const loseLife = () => {
    state.lives--;
    state.flash = true;
    setTimeout(() => (state.flash = false), 300);
    if (state.word) {
      wordHadMistake = true;
      missed.set(state.word.answer, state.word);
    }
    if (state.lives <= 0) end('愛心用完了！');
  };

  const crash = () => {
    sfx.explode();
    loseLife();
    if (state.lives > 0) {
      state.snake = startingSnake();
      state.dir = 'right';
      dirQueue = [];
      acc = -0.8;
      placeLetters();
    }
  };

  const step = () => {
    const nextDir = dirQueue.shift();
    if (nextDir) state.dir = nextDir;
    const v = VECTORS[state.dir];
    const head = state.snake[0]!;
    const newHead = { x: head.x + v.x, y: head.y + v.y };

    const outOfBounds =
      newHead.x < 0 || newHead.y < 0 || newHead.x >= BOARD_SIZE || newHead.y >= BOARD_SIZE;
    // 尾巴這一格會移走，所以不算撞到
    const hitSelf = state.snake.slice(0, -1).some((s) => same(s, newHead));
    if (outOfBounds || hitSelf) return crash();

    state.snake.unshift(newHead);
    const eaten = state.letters.find((l) => same(l, newHead));
    if (!eaten) {
      state.snake.pop();
      return;
    }

    if (eaten.ch !== needed.value) {
      state.snake.pop();
      sfx.wrong();
      loseLife();
      if (state.lives > 0) placeLetters();
      return;
    }

    // 吃對：蛇變長
    state.progress++;
    if (state.progress < target.value.length) {
      sfx.click();
      placeLetters();
      return;
    }

    // 拼完整個單字
    const word = state.word!;
    session.record(word, !wordHadMistake);
    state.completed++;
    state.score += target.value.length * 10 + (wordHadMistake ? 0 : 20);
    state.interval = Math.max(pace().min, state.interval - pace().step);
    sfx.correct();
    WordPronunciation(word.answer);
    nextWord();
  };

  const turn = (d: Direction) => {
    const last = dirQueue[dirQueue.length - 1] ?? state.dir;
    if (d === last || d === OPPOSITE[last] || dirQueue.length >= 2) return;
    dirQueue.push(d);
  };

  const quit = () => end('遊戲結束，');

  return { state, needed, loop, start, turn, quit };
}
