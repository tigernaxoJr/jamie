import { type Ref, computed, reactive, ref } from 'vue';
import { WordPronunciation } from 'src/modules/Vocabulary';
import {
  type GameSession,
  type GameWord,
  type StageSelection,
  WordDeck,
  lettersOf,
  randomInt,
  sfx,
  useGameLoop,
  useStageProgress,
} from '../shared';
import { BOARD_SIZE, type Point, SNAKE_STAGES, START_ROW, parseWalls, snakeStars } from './stages';

export { BOARD_SIZE, type Point } from './stages';

const MAX_LIVES = 3;
const DECOYS = 3;
/** 會移動的錯誤字母每走幾步移動一格 */
const DECOY_MOVE_EVERY = 3;

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

export interface BoardLetter extends Point {
  id: number;
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
const key = (p: Point) => `${p.x},${p.y}`;
const inBounds = (p: Point) => p.x >= 0 && p.y >= 0 && p.x < BOARD_SIZE && p.y < BOARD_SIZE;

const startingSnake = (): Point[] => [
  { x: 3, y: START_ROW },
  { x: 2, y: START_ROW },
  { x: 1, y: START_ROW },
];

export function useSnake(session: GameSession, speed: Ref<SnakeSpeed>) {
  const pace = () => SNAKE_SPEEDS[speed.value];
  const { stars, totalStars, recordStars } = useStageProgress('snake-stages');
  const mode = ref<StageSelection>({ kind: 'stage', index: 0 });
  const stage = computed(() =>
    mode.value.kind === 'stage' ? SNAKE_STAGES[mode.value.index] : undefined,
  );

  let deck = new WordDeck([]);
  let dirQueue: Direction[] = [];
  let acc = 0;
  let steps = 0;
  let nextLetterId = 1;
  let wordHadMistake = false;
  let wallSet = new Set<string>();
  const missed = new Map<string, GameWord>();

  const state = reactive({
    snake: startingSnake(),
    dir: 'right' as Direction,
    walls: [] as Point[],
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

  const isWall = (p: Point) => wallSet.has(key(p));
  const isFree = (p: Point) =>
    !isWall(p) && !state.snake.some((s) => same(s, p)) && !state.letters.some((l) => same(l, p));

  const randomFreeCell = (): Point => {
    const head = state.snake[0]!;
    for (let i = 0; i < 300; i++) {
      const p = { x: randomInt(BOARD_SIZE), y: randomInt(BOARD_SIZE) };
      // 不要生在蛇頭正前方附近
      const near = Math.abs(p.x - head.x) + Math.abs(p.y - head.y) < 3;
      if (!near && isFree(p)) return p;
    }
    return { x: BOARD_SIZE - 1, y: 0 };
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
    for (const ch of chars) state.letters.push({ id: nextLetterId++, ...randomFreeCell(), ch });
  };

  /** 錯誤字母隨機往旁邊走一格（正確字母不動，才不會追不到） */
  const moveDecoys = () => {
    const head = state.snake[0]!;
    for (const l of state.letters) {
      if (l.ch === needed.value) continue;
      const options = Object.values(VECTORS)
        .map((v) => ({ x: l.x + v.x, y: l.y + v.y }))
        .filter((p) => inBounds(p) && isFree(p) && !same(p, head));
      const to = options[randomInt(options.length)];
      if (to) Object.assign(l, to);
    }
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
    steps = 0;
    const walls = stage.value ? parseWalls(stage.value.map) : [];
    wallSet = new Set(walls.map(key));
    Object.assign(state, {
      snake: startingSnake(),
      dir: 'right',
      walls,
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

  const end = (won: boolean, headline: string) => {
    loop.stop();
    const s = stage.value;
    let result: number | undefined;
    if (won && s && mode.value.kind === 'stage') {
      result = snakeStars(MAX_LIVES - state.lives);
      recordStars(mode.value.index, result);
      state.score += state.lives * 30;
      sfx.win();
    } else {
      sfx.lose();
    }
    session.finish({
      won: s ? won : state.completed > 0,
      ranked: mode.value.kind === 'endless',
      headline,
      score: state.score,
      ...(result === undefined ? {} : { stars: result }),
      stats: [
        { label: '拼完單字', value: s ? `${state.completed} / ${s.goal}` : state.completed },
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
    if (state.lives <= 0) {
      end(
        false,
        stage.value
          ? `愛心用完了！再試一次${stage.value.name}吧`
          : `愛心用完了！你拼出了 ${state.completed} 個單字`,
      );
    }
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
    let newHead = { x: head.x + v.x, y: head.y + v.y };

    if (!inBounds(newHead)) {
      if (!stage.value?.wrap) return crash();
      // 穿越邊界，從另一邊回來
      newHead = {
        x: (newHead.x + BOARD_SIZE) % BOARD_SIZE,
        y: (newHead.y + BOARD_SIZE) % BOARD_SIZE,
      };
    }
    // 尾巴這一格會移走，所以不算撞到
    const hitSelf = state.snake.slice(0, -1).some((s) => same(s, newHead));
    if (hitSelf || isWall(newHead)) return crash();

    state.snake.unshift(newHead);
    const eaten = state.letters.find((l) => same(l, newHead));
    if (!eaten) {
      state.snake.pop();
      steps++;
      if (stage.value?.movingDecoys && steps % DECOY_MOVE_EVERY === 0) moveDecoys();
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
    const s = stage.value;
    if (s && state.completed >= s.goal) return end(true, `${s.name}過關！`);
    nextWord();
  };

  const turn = (d: Direction) => {
    const last = dirQueue[dirQueue.length - 1] ?? state.dir;
    if (d === last || d === OPPOSITE[last] || dirQueue.length >= 2) return;
    dirQueue.push(d);
  };

  const quit = () =>
    end(
      false,
      stage.value ? '提早結束了，下次再挑戰！' : `遊戲結束，你拼出了 ${state.completed} 個單字`,
    );

  return { state, needed, mode, stage, stars, totalStars, loop, start, turn, quit };
}
