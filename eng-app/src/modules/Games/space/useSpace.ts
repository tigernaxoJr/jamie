import { computed, reactive, ref } from 'vue';
import {
  type GameSession,
  type GameWord,
  type StageSelection,
  WordDeck,
  randomInt,
  sfx,
  shuffle,
  useGameLoop,
  useStageProgress,
  useTimers,
} from '../shared';
import { BOSS_DAMAGE, STAGES, type ShipStats, shipStats, starsFor } from './campaign';

const HITS_PER_WAVE = 8;
const EFFECT_MS = 350;
/** 魔王被打中時往上退多少 % */
const BOSS_KNOCKBACK = 12;

export interface Meteor {
  id: number;
  word: GameWord;
  /** 水平位置 (%) */
  x: number;
  /** 垂直位置 (%)，到 100 代表撞到地面 */
  y: number;
  /** 每秒下降的 % */
  speed: number;
  /** 魔王隕石：要連續打中 hp 個單字 */
  boss?: { hp: number; maxHp: number };
}

export interface Effect {
  id: number;
  x: number;
  y: number;
  kind: 'laser' | 'boom' | 'bigboom';
}

export function useSpace(session: GameSession) {
  const timers = useTimers();
  const { stars, totalStars, recordStars } = useStageProgress('space-campaign');

  const mode = ref<StageSelection>({ kind: 'stage', index: 0 });
  const stage = computed(() =>
    mode.value.kind === 'stage' ? STAGES[mode.value.index] : undefined,
  );

  let words: GameWord[] = [];
  let deck = new WordDeck([]);
  let nextId = 1;
  let spawnIn = 0;
  let ship: ShipStats = shipStats(0);
  const missed = new Map<string, GameWord>();

  const state = reactive({
    meteors: [] as Meteor[],
    options: [] as GameWord[],
    effects: [] as Effect[],
    shields: 3,
    maxShields: 3,
    bombs: 0,
    score: 0,
    hits: 0,
    combo: 0,
    misfires: 0,
    shieldsLost: 0,
    bossSpawned: false,
    cooldown: false,
    damaged: false,
  });

  const wave = computed(() => Math.floor(state.hits / HITS_PER_WAVE) + 1);
  const boss = computed(() => state.meteors.find((m) => m.boss));

  const maxMeteors = computed(() =>
    stage.value ? stage.value.maxMeteors : Math.min(4, 1 + Math.ceil(wave.value / 2)),
  );
  const spawnInterval = computed(() =>
    stage.value ? stage.value.spawnInterval : Math.max(1.6, 4 - wave.value * 0.3),
  );
  const baseSpeed = () => (stage.value ? stage.value.speed : 5 + wave.value * 0.9);

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
    timers.later(
      () => {
        state.effects = state.effects.filter((e) => e.id !== id);
      },
      kind === 'bigboom' ? EFFECT_MS * 3 : EFFECT_MS,
    );
  };

  const onScreenAnswers = () => new Set(state.meteors.map((m) => m.word.answer));

  const spawn = () => {
    const onScreen = onScreenAnswers();
    const word = deck.draw(onScreen);
    if (onScreen.has(word.answer)) return;
    // 找一個跟其他隕石不太重疊的位置
    let x = 15 + randomInt(70);
    for (let i = 0; i < 10 && state.meteors.some((m) => m.y < 30 && Math.abs(m.x - x) < 22); i++) {
      x = 15 + randomInt(70);
    }
    const speed = (baseSpeed() + Math.random() * 2) * ship.speedFactor;
    state.meteors.push({ id: nextId++, word, x, y: 0, speed });
    refreshOptions();
  };

  const spawnBoss = () => {
    if (!stage.value) return;
    state.bossSpawned = true;
    const hp = stage.value.bossHp;
    state.meteors.push({
      id: nextId++,
      word: deck.draw(onScreenAnswers()),
      x: 50,
      y: 0,
      speed: stage.value.speed * 0.45 * ship.speedFactor,
      boss: { hp, maxHp: hp },
    });
    sfx.lose();
    refreshOptions();
  };

  const finish = (won: boolean, headline: string) => {
    loop.stop();
    timers.clearAll();
    const s = stage.value;
    if (!s) {
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
      return;
    }

    let stars: number | undefined;
    if (won && mode.value.kind === 'stage') {
      stars = starsFor(state.shieldsLost, state.misfires);
      recordStars(mode.value.index, stars);
      state.score += state.shields * 50;
      sfx.win();
    } else {
      sfx.lose();
    }
    session.finish({
      won,
      headline,
      score: state.score,
      ...(stars === undefined ? {} : { stars }),
      stats: [
        { label: '擊落隕石', value: state.hits },
        { label: '按錯', value: state.misfires },
        { label: '護盾損壞', value: state.shieldsLost },
      ],
      missed: [...missed.values()],
    });
  };

  const damage = (n: number) => {
    const lost = Math.min(n, state.shields);
    state.shields -= lost;
    state.shieldsLost += lost;
    state.combo = 0;
    state.damaged = true;
    timers.later(() => (state.damaged = false), 300);
  };

  const loop = useGameLoop((dt) => {
    const s = stage.value;
    const needMore = !s || state.hits < s.goal;
    spawnIn -= dt;
    if (needMore && spawnIn <= 0 && state.meteors.length < maxMeteors.value) {
      spawn();
      spawnIn = spawnInterval.value;
    }
    // 關卡目標達成、小隕石都清掉之後，魔王登場
    if (s && !needMore && !state.bossSpawned && state.meteors.length === 0) spawnBoss();

    let landed = false;
    for (const m of state.meteors) {
      m.y += m.speed * dt;
      if (m.y < 100) continue;
      landed = true;
      missed.set(m.word.answer, m.word);
      session.record(m.word, false);
      addEffect(m.x, 100, m.boss ? 'bigboom' : 'boom');
      if (m.boss) {
        // 魔王撞到地面：打壞兩面護盾，換一個字從上面重新落下
        damage(BOSS_DAMAGE);
        m.y = 0;
        m.word = deck.draw(onScreenAnswers());
      } else {
        damage(1);
      }
    }
    if (!landed) return;

    state.meteors = state.meteors.filter((m) => m.y < 100);
    refreshOptions();
    sfx.explode();
    if (state.shields <= 0) {
      finish(
        false,
        s ? '基地被攻破了！升級飛船再來挑戰' : `基地被攻破了！你擊落了 ${state.hits} 顆隕石`,
      );
    }
  });

  const start = (list: GameWord[]) => {
    timers.clearAll();
    words = list;
    deck = new WordDeck(list);
    missed.clear();
    ship = shipStats(totalStars.value);
    spawnIn = 0.5;
    Object.assign(state, {
      meteors: [],
      effects: [],
      shields: ship.shields,
      maxShields: ship.shields,
      bombs: ship.bombs,
      score: 0,
      hits: 0,
      combo: 0,
      misfires: 0,
      shieldsLost: 0,
      bossSpawned: false,
      cooldown: false,
      damaged: false,
    });
    refreshOptions();
    loop.stop();
    loop.start();
  };

  const hitBoss = (m: Meteor, b: NonNullable<Meteor['boss']>) => {
    b.hp--;
    state.score += 30;
    addEffect(m.x, m.y, 'laser');
    if (b.hp > 0) {
      addEffect(m.x, m.y, 'boom');
      sfx.hit();
      m.y = Math.max(0, m.y - BOSS_KNOCKBACK);
      m.word = deck.draw(onScreenAnswers());
      refreshOptions();
      return;
    }
    // 魔王倒下：停住畫面，爆炸動畫播完再結算
    loop.stop();
    state.meteors = state.meteors.filter((x) => x.id !== m.id);
    addEffect(m.x, m.y, 'bigboom');
    sfx.explode();
    refreshOptions();
    timers.later(() => finish(true, `${stage.value?.name ?? ''}過關！打倒了魔王隕石`), 700);
  };

  const fire = (option: GameWord) => {
    if (state.cooldown || loop.paused.value || !loop.running.value) return;
    // 同一個答案若有多顆，先打最接近地面的
    const target = state.meteors
      .filter((m) => m.word.answer === option.answer)
      .sort((a, b) => b.y - a.y)[0];

    if (!target) {
      state.combo = 0;
      state.misfires++;
      state.score = Math.max(0, state.score - 5);
      state.cooldown = true;
      sfx.wrong();
      timers.later(() => (state.cooldown = false), ship.misfireCooldown);
      return;
    }

    state.hits++;
    state.combo++;
    state.score += 10 + Math.min(state.combo, 10) * 2;
    session.record(target.word, true);
    if (target.boss) return hitBoss(target, target.boss);

    state.meteors = state.meteors.filter((m) => m.id !== target.id);
    addEffect(target.x, target.y, 'laser');
    addEffect(target.x, target.y, 'boom');
    sfx.hit();
    refreshOptions();
    // 畫面清空時馬上補一顆，節奏不會斷
    if (state.meteors.length === 0) spawnIn = Math.min(spawnIn, 0.6);
  };

  /** 清場炸彈：炸掉所有小隕石（不算擊落，也不算答題） */
  const bomb = () => {
    if (state.bombs <= 0 || loop.paused.value || !loop.running.value) return;
    const small = state.meteors.filter((m) => !m.boss);
    if (small.length === 0) return;
    state.bombs--;
    for (const m of small) addEffect(m.x, m.y, 'boom');
    state.meteors = state.meteors.filter((m) => m.boss);
    spawnIn = Math.max(spawnIn, 1.5);
    sfx.explode();
    refreshOptions();
  };

  const quit = () => finish(false, '提早結束了，下次再挑戰！');

  return {
    state,
    mode,
    stage,
    wave,
    boss,
    stars,
    totalStars,
    loop,
    start,
    fire,
    bomb,
    quit,
  };
}
