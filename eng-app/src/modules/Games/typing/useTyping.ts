import { computed, reactive, ref } from 'vue';
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
  useTimers,
} from '../shared';
import {
  ALL_LETTERS,
  FREEZE_SECONDS,
  POWER_UP_CHANCE,
  type PowerUp,
  TYPING_LEVELS,
  type TypingLevel,
  endlessLevel,
  lettersPerMinute,
  rollPowerUp,
  typingStars,
} from './levels';

const MAX_HP = 5;

export interface FallingItem {
  id: number;
  /** 要打的內容（小寫，單字可能含空白） */
  text: string;
  /** 單字才有 */
  word?: GameWord;
  /** 道具 */
  power?: PowerUp;
  /** 已經打到第幾個字元 */
  typed: number;
  /** 水平位置 %、垂直位置 %（到 100 代表掉到底） */
  x: number;
  y: number;
  speed: number;
}

export function useTyping(session: GameSession) {
  const timers = useTimers();
  const { stars, totalStars, recordStars } = useStageProgress('typing-stages');
  const mode = ref<StageSelection>({ kind: 'stage', index: 0 });

  let words: GameWord[] = [];
  let deck = new WordDeck([]);
  let nextId = 1;
  let spawnIn = 0;
  const missed = new Map<string, GameWord>();

  const state = reactive({
    items: [] as FallingItem[],
    lockedId: null as number | null,
    hp: MAX_HP,
    score: 0,
    combo: 0,
    maxCombo: 0,
    /** 打對的按鍵數（算打字速度） */
    keysHit: 0,
    wordsDone: 0,
    seconds: 0,
    /** 冰凍剩下的秒數 */
    frozen: 0,
    /** 剛拿到的道具（畫面提示用） */
    lastPower: null as PowerUp | null,
    /** 最近一次按錯，畫面閃一下 */
    misKey: 0,
  });

  const level = computed<TypingLevel>(() =>
    mode.value.kind === 'stage' ? TYPING_LEVELS[mode.value.index]! : endlessLevel(state.score),
  );
  const levelProgress = computed(() =>
    mode.value.kind === 'stage' ? Math.min(1, state.score / level.value.target) : 0,
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

  const pickWord = (lv: TypingLevel): GameWord => {
    // 避開畫面上已有的字，也盡量避開相同開頭（按第一個字母時才不會搞混）
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
    return word;
  };

  const pickLetter = (lv: TypingLevel): string => {
    const chars = lv.chars ?? ALL_LETTERS;
    // 盡量不要跟畫面上的字母或單字開頭重複
    const used = new Set(state.items.map((it) => it.text[0]));
    const free = [...chars].filter((c) => !used.has(c));
    const from = free.length > 0 ? free : [...chars];
    return from[randomInt(from.length)]!;
  };

  const spawn = () => {
    const lv = level.value;
    const speed = lv.speed * (0.85 + Math.random() * 0.3);
    const asLetter = lv.kind === 'letters' || (lv.kind === 'mixed' && Math.random() < 0.5);
    const power =
      lv.powerUps && Math.random() < POWER_UP_CHANCE ? rollPowerUp(state.hp >= MAX_HP) : undefined;
    if (asLetter) {
      state.items.push({
        id: nextId++,
        text: pickLetter(lv),
        ...(power ? { power } : {}),
        typed: 0,
        x: pickX(6),
        y: 0,
        speed,
      });
      return;
    }
    const word = pickWord(lv);
    state.items.push({
      id: nextId++,
      text: word.answer.toLowerCase(),
      word,
      ...(power ? { power } : {}),
      typed: 0,
      x: pickX(14),
      y: 0,
      speed,
    });
  };

  const end = (won: boolean, headline: string) => {
    loop.stop();
    timers.clearAll();
    let result: number | undefined;
    if (won && mode.value.kind === 'stage') {
      result = typingStars(MAX_HP - state.hp);
      recordStars(mode.value.index, result);
      state.score += state.hp * 20;
    }
    const success = mode.value.kind === 'stage' ? won : state.wordsDone > 0;
    if (success) sfx.win();
    else sfx.lose();
    session.finish({
      won: success,
      headline,
      score: state.score,
      ...(result === undefined ? {} : { stars: result }),
      stats: [
        { label: '打字速度', value: `${lettersPerMinute(state.keysHit, state.seconds)} 字母/分` },
        { label: '完成單字', value: state.wordsDone },
        { label: '最高連擊', value: state.maxCombo },
      ],
      missed: [...missed.values()],
    });
  };

  const loop = useGameLoop((dt) => {
    state.seconds += dt;
    if (state.frozen > 0) {
      state.frozen = Math.max(0, state.frozen - dt);
      return;
    }
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
      // 沒接到的道具不扣血
      if (it.power) continue;
      state.hp--;
      state.combo = 0;
      if (it.word) {
        missed.set(it.word.answer, it.word);
        session.record(it.word, false);
      }
    }
    if (!fell) return;
    state.items = state.items.filter((it) => it.y < 100);
    if (!state.items.some((it) => it.id === state.lockedId)) state.lockedId = null;
    sfx.explode();
    if (state.hp <= 0) {
      end(
        false,
        mode.value.kind === 'stage'
          ? `愛心用完了！再挑戰一次${level.value.name}吧`
          : `無盡模式打了 ${state.score} 分！`,
      );
    }
  });

  const applyPower = (p: PowerUp) => {
    state.lastPower = p;
    timers.later(() => (state.lastPower = null), 1200);
    if (p === 'freeze') state.frozen = FREEZE_SECONDS;
    if (p === 'heal') state.hp = Math.min(MAX_HP, state.hp + 1);
    if (p === 'bomb') {
      state.items = [];
      state.lockedId = null;
      spawnIn = Math.max(spawnIn, 1);
      sfx.explode();
    }
  };

  const addScore = (points: number) => {
    state.combo++;
    state.maxCombo = Math.max(state.maxCombo, state.combo);
    state.score += points + Math.min(state.combo, 10) * 2;
    if (mode.value.kind === 'stage' && state.score >= level.value.target) {
      end(true, `${level.value.name}過關！`);
    }
  };

  const miss = () => {
    state.combo = 0;
    state.misKey++;
    sfx.wrong();
  };

  /** 打完一個字母或單字 */
  const complete = (it: FallingItem) => {
    state.items = state.items.filter((x) => x.id !== it.id);
    state.lockedId = null;
    if (it.word) {
      state.wordsDone++;
      session.record(it.word, true);
      sfx.correct();
      WordPronunciation(it.word.answer);
    } else {
      sfx.click();
    }
    if (it.power) applyPower(it.power);
    addScore(it.word ? lettersOf(it.word.answer).length * 10 : 10);
  };

  /** 處理一個按鍵（小寫字母或空白） */
  const press = (key: string) => {
    if (!loop.running.value || loop.paused.value) return;

    let target = state.items.find((it) => it.id === state.lockedId);
    if (!target) {
      // 還沒鎖定：找最下面、開頭符合的字母或單字
      target = state.items.filter((it) => it.text[0] === key).sort((a, b) => b.y - a.y)[0];
      if (!target) return miss();
      state.lockedId = target.id;
    } else if (target.text[target.typed] !== key) {
      return miss();
    }

    target.typed++;
    state.keysHit++;
    if (target.typed >= target.text.length) return complete(target);
    sfx.click();
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
      items: [],
      lockedId: null,
      hp: MAX_HP,
      score: 0,
      combo: 0,
      maxCombo: 0,
      keysHit: 0,
      wordsDone: 0,
      seconds: 0,
      frozen: 0,
      lastPower: null,
    });
    spawnIn = 0.5;
    loop.stop();
    loop.start();
  };

  const quit = () =>
    end(
      false,
      mode.value.kind === 'stage' ? '提早結束了，下次再挑戰！' : `無盡模式打了 ${state.score} 分！`,
    );

  return {
    state,
    mode,
    stars,
    totalStars,
    level,
    levelProgress,
    loop,
    maxHp: MAX_HP,
    start,
    press,
    unlock,
    quit,
  };
}
