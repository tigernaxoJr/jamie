import { computed, reactive } from 'vue';
import {
  type GameSession,
  type GameWord,
  WordDeck,
  randomInt,
  sfx,
  shuffle,
  useGameLoop,
  useTimers,
} from '../shared';

const MAX_SHIELDS = 3;
const HITS_PER_WAVE = 8;
const MISFIRE_COOLDOWN = 700;
const EFFECT_MS = 350;

export interface Meteor {
  id: number;
  word: GameWord;
  /** 水平位置 (%) */
  x: number;
  /** 垂直位置 (%)，到 100 代表撞到地面 */
  y: number;
  /** 每秒下降的 % */
  speed: number;
}

export interface Effect {
  id: number;
  x: number;
  y: number;
  kind: 'laser' | 'boom';
}

export function useSpace(session: GameSession) {
  const timers = useTimers();
  let words: GameWord[] = [];
  let deck = new WordDeck([]);
  let nextId = 1;
  let spawnIn = 0;
  const missed = new Map<string, GameWord>();

  const state = reactive({
    meteors: [] as Meteor[],
    options: [] as GameWord[],
    effects: [] as Effect[],
    shields: MAX_SHIELDS,
    score: 0,
    hits: 0,
    combo: 0,
    cooldown: false,
    damaged: false,
  });

  const wave = computed(() => Math.floor(state.hits / HITS_PER_WAVE) + 1);
  const maxMeteors = computed(() => Math.min(4, 1 + Math.ceil(wave.value / 2)));
  const spawnInterval = computed(() => Math.max(1.6, 4 - wave.value * 0.3));

  /** 選項 = 畫面上所有隕石的答案 + 干擾選項，依字母排序讓按鈕位置穩定 */
  const refreshOptions = () => {
    const active = state.meteors.map((m) => m.word);
    const activeAnswers = new Set(active.map((w) => w.answer));
    const total = Math.min(6, Math.max(4, active.length + 2));
    const decoys = shuffle(words.filter((w) => !activeAnswers.has(w.answer))).slice(
      0,
      total - active.length,
    );
    state.options = [...active, ...decoys].sort((a, b) => a.answer.localeCompare(b.answer));
  };

  const addEffect = (x: number, y: number, kind: Effect['kind']) => {
    const id = nextId++;
    state.effects.push({ id, x, y, kind });
    timers.later(() => {
      state.effects = state.effects.filter((e) => e.id !== id);
    }, EFFECT_MS);
  };

  const spawn = () => {
    const onScreen = new Set(state.meteors.map((m) => m.word.answer));
    const word = deck.draw(onScreen);
    if (onScreen.has(word.answer)) return;
    // 找一個跟其他隕石不太重疊的位置
    let x = 15 + randomInt(70);
    for (let i = 0; i < 10 && state.meteors.some((m) => m.y < 30 && Math.abs(m.x - x) < 22); i++) {
      x = 15 + randomInt(70);
    }
    const speed = 5 + wave.value * 0.9 + Math.random() * 2;
    state.meteors.push({ id: nextId++, word, x, y: 0, speed });
    refreshOptions();
  };

  const end = (headline: string) => {
    loop.stop();
    timers.clearAll();
    sfx.lose();
    session.finish({
      won: state.hits > 0,
      headline,
      score: state.score,
      stats: [
        { label: '擊落隕石', value: state.hits },
        { label: '到達波次', value: wave.value },
      ],
      missed: [...missed.values()],
    });
  };

  const loop = useGameLoop((dt) => {
    spawnIn -= dt;
    if (spawnIn <= 0 && state.meteors.length < maxMeteors.value) {
      spawn();
      spawnIn = spawnInterval.value;
    }

    let landed = false;
    for (const m of state.meteors) {
      m.y += m.speed * dt;
      if (m.y < 100) continue;
      landed = true;
      state.shields--;
      state.combo = 0;
      missed.set(m.word.answer, m.word);
      session.record(m.word, false);
      addEffect(m.x, 100, 'boom');
    }
    if (!landed) return;

    state.meteors = state.meteors.filter((m) => m.y < 100);
    refreshOptions();
    sfx.explode();
    state.damaged = true;
    timers.later(() => (state.damaged = false), 300);
    if (state.shields <= 0) end(`基地被攻破了！你擊落了 ${state.hits} 顆隕石`);
  });

  const start = (list: GameWord[]) => {
    timers.clearAll();
    words = list;
    deck = new WordDeck(list);
    missed.clear();
    spawnIn = 0.5;
    Object.assign(state, {
      meteors: [],
      effects: [],
      shields: MAX_SHIELDS,
      score: 0,
      hits: 0,
      combo: 0,
      cooldown: false,
      damaged: false,
    });
    refreshOptions();
    loop.stop();
    loop.start();
  };

  const fire = (option: GameWord) => {
    if (state.cooldown || loop.paused.value) return;
    // 同一個答案若有多顆，先打最接近地面的
    const target = state.meteors
      .filter((m) => m.word.answer === option.answer)
      .sort((a, b) => b.y - a.y)[0];

    if (!target) {
      state.combo = 0;
      state.score = Math.max(0, state.score - 5);
      state.cooldown = true;
      sfx.wrong();
      timers.later(() => (state.cooldown = false), MISFIRE_COOLDOWN);
      return;
    }

    state.meteors = state.meteors.filter((m) => m.id !== target.id);
    state.hits++;
    state.combo++;
    state.score += 10 + Math.min(state.combo, 10) * 2;
    session.record(target.word, true);
    addEffect(target.x, target.y, 'laser');
    addEffect(target.x, target.y, 'boom');
    sfx.hit();
    refreshOptions();
    // 畫面清空時馬上補一顆，節奏不會斷
    if (state.meteors.length === 0) spawnIn = Math.min(spawnIn, 0.6);
  };

  const quit = () => end('提早結束了，下次再挑戰！');

  return { state, wave, loop, start, fire, quit, maxShields: MAX_SHIELDS };
}
