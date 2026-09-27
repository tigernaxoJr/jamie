import { computed, reactive } from 'vue';
import { WordPronunciation } from 'src/modules/Vocabulary';
import {
  type GameSession,
  type GameWord,
  WordDeck,
  lettersOf,
  randomInt,
  sfx,
  useGameLoop,
  useTimers,
} from '../shared';
import { TYPING_LEVELS, type TypingLevel } from './levels';

const MAX_HP = 5;
const LEVEL_BREAK_MS = 1800;

export interface FallingItem {
  id: number;
  /** 要打的內容（小寫，單字可能含空白） */
  text: string;
  /** 單字關卡才有 */
  word?: GameWord;
  /** 已經打到第幾個字元 */
  typed: number;
  /** 水平位置 %、垂直位置 %（到 100 代表掉到底） */
  x: number;
  y: number;
  speed: number;
}

export function useTyping(session: GameSession) {
  const timers = useTimers();
  let words: GameWord[] = [];
  let deck = new WordDeck([]);
  let nextId = 1;
  let spawnIn = 0;
  const missed = new Map<string, GameWord>();

  const state = reactive({
    level: 0,
    items: [] as FallingItem[],
    lockedId: null as number | null,
    hp: MAX_HP,
    score: 0,
    combo: 0,
    maxCombo: 0,
    lettersHit: 0,
    wordsDone: 0,
    /** 關卡之間的休息畫面 */
    levelBreak: false,
    /** 最近一次按錯，畫面閃一下 */
    misKey: 0,
  });

  const level = computed<TypingLevel>(() => TYPING_LEVELS[state.level]!);
  const levelStart = computed(() =>
    state.level === 0 ? 0 : TYPING_LEVELS[state.level - 1]!.target,
  );
  const levelProgress = computed(() =>
    Math.min(1, (state.score - levelStart.value) / (level.value.target - levelStart.value)),
  );

  /** 挑一個 x 位置，盡量不要跟上面的東西重疊 */
  const pickX = (width: number) => {
    let x = width + randomInt(100 - width * 2);
    for (
      let i = 0;
      i < 8 && state.items.some((it) => it.y < 25 && Math.abs(it.x - x) < width * 1.6);
      i++
    ) {
      x = width + randomInt(100 - width * 2);
    }
    return x;
  };

  const spawn = () => {
    const lv = level.value;
    const speed = lv.speed * (0.85 + Math.random() * 0.3);
    if (lv.kind === 'letters') {
      const chars = lv.chars ?? 'abcdefghijklmnopqrstuvwxyz';
      const text = chars[randomInt(chars.length)]!;
      state.items.push({ id: nextId++, text, typed: 0, x: pickX(6), y: 0, speed });
      return;
    }
    // 單字：避開畫面上已有的字，也盡量避開相同開頭（按第一個字母時才不會搞混）
    const onScreen = new Set(state.items.map((it) => it.word?.answer ?? ''));
    const firstLetters = new Set(state.items.map((it) => it.text[0]));
    const pool = lv.maxLetters
      ? words.filter((w) => lettersOf(w.answer).length <= lv.maxLetters!)
      : words;
    const localDeck = pool.length >= 3 ? new WordDeck(pool) : deck;
    let word = localDeck.draw(onScreen);
    for (let i = 0; i < 6 && firstLetters.has(word.answer[0]!.toLowerCase()); i++) {
      word = localDeck.draw(onScreen);
    }
    state.items.push({
      id: nextId++,
      text: word.answer.toLowerCase(),
      word,
      typed: 0,
      x: pickX(14),
      y: 0,
      speed,
    });
  };

  const end = (won: boolean) => {
    loop.stop();
    timers.clearAll();
    if (won) sfx.win();
    else sfx.lose();
    session.finish({
      won,
      headline: won ? '五關全部過關，打字高手！' : `打到第 ${state.level + 1} 關，下次再挑戰！`,
      score: state.score,
      stats: [
        { label: '到達關卡', value: `${state.level + 1} / ${TYPING_LEVELS.length}` },
        { label: '打對字母', value: state.lettersHit },
        { label: '完成單字', value: state.wordsDone },
        { label: '最高連擊', value: state.maxCombo },
      ],
      missed: [...missed.values()],
    });
  };

  const loop = useGameLoop((dt) => {
    if (state.levelBreak) return;
    spawnIn -= dt;
    if (spawnIn <= 0 && state.items.length < level.value.maxItems) {
      spawn();
      spawnIn = level.value.spawnEvery;
    }

    let fell = false;
    for (const it of state.items) {
      it.y += it.speed * dt;
      if (it.y < 100) continue;
      fell = true;
      state.hp--;
      state.combo = 0;
      if (it.word) {
        missed.set(it.word.answer, it.word);
        session.record(it.word, false);
      }
      if (state.lockedId === it.id) state.lockedId = null;
    }
    if (!fell) return;
    state.items = state.items.filter((it) => it.y < 100);
    sfx.explode();
    if (state.hp <= 0) end(false);
  });

  const addScore = (points: number) => {
    state.combo++;
    state.maxCombo = Math.max(state.maxCombo, state.combo);
    state.score += points + Math.min(state.combo, 10) * 2;
    if (state.score < level.value.target) return;
    // 過關
    if (state.level + 1 >= TYPING_LEVELS.length) return end(true);
    state.levelBreak = true;
    state.items = [];
    state.lockedId = null;
    sfx.win();
    timers.later(() => {
      state.level++;
      state.levelBreak = false;
      spawnIn = 0.6;
    }, LEVEL_BREAK_MS);
  };

  const miss = () => {
    state.combo = 0;
    state.misKey++;
    sfx.wrong();
  };

  /** 處理一個按鍵（小寫字母或空白） */
  const press = (key: string) => {
    if (state.levelBreak || loop.paused.value) return;

    if (level.value.kind === 'letters') {
      const target = state.items.filter((it) => it.text === key).sort((a, b) => b.y - a.y)[0];
      if (!target) return miss();
      state.items = state.items.filter((it) => it.id !== target.id);
      state.lettersHit++;
      sfx.click();
      return addScore(10);
    }

    let target = state.items.find((it) => it.id === state.lockedId);
    if (!target) {
      // 還沒鎖定：找最下面、開頭符合的單字
      target = state.items.filter((it) => it.text[0] === key).sort((a, b) => b.y - a.y)[0];
      if (!target) return miss();
      state.lockedId = target.id;
    } else if (target.text[target.typed] !== key) {
      return miss();
    }

    target.typed++;
    if (target.typed < target.text.length) {
      sfx.click();
      return;
    }
    // 打完一個單字
    const word = target.word!;
    state.items = state.items.filter((it) => it.id !== target.id);
    state.lockedId = null;
    state.wordsDone++;
    session.record(word, true);
    sfx.correct();
    WordPronunciation(word.answer);
    addScore(lettersOf(word.answer).length * 10);
  };

  /** 放棄目前鎖定的單字，改打別的 */
  const unlock = () => {
    const target = state.items.find((it) => it.id === state.lockedId);
    if (target) target.typed = 0;
    state.lockedId = null;
  };

  const start = (list: GameWord[]) => {
    timers.clearAll();
    words = list;
    deck = new WordDeck(list);
    missed.clear();
    Object.assign(state, {
      level: 0,
      items: [],
      lockedId: null,
      hp: MAX_HP,
      score: 0,
      combo: 0,
      maxCombo: 0,
      lettersHit: 0,
      wordsDone: 0,
      levelBreak: false,
    });
    spawnIn = 0.5;
    loop.stop();
    loop.start();
  };

  const quit = () => end(false);

  return { state, level, levelProgress, loop, maxHp: MAX_HP, start, press, unlock, quit };
}
