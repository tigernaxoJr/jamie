import { computed, reactive, ref, shallowRef } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { WordPronunciation } from 'src/modules/Vocabulary';
import {
  type GameSession,
  type GameWord,
  WordDeck,
  makeChoices,
  randomInt,
  sfx,
  useTimers,
} from '../shared';
import {
  BASE_HP,
  type Monster,
  type OwnedPerks,
  type Perk,
  attackDamage,
  checkpoints,
  critEvery,
  monsterFor,
  rollPerks,
  startingPerkPicks,
} from './tower';

/** meaning: 看中文選英文；reverse: 看英文選中文；listen: 聽發音選英文 */
export type QuestionType = 'meaning' | 'reverse' | 'listen';

export interface Question {
  type: QuestionType;
  word: GameWord;
  choices: GameWord[];
}

interface TowerSave {
  /** 爬到過的最高樓層 */
  bestFloor: number;
  /** 打倒過的最高魔王樓層（決定可以從哪裡出發） */
  highestBoss: number;
}

export function useBattle(session: GameSession) {
  const timers = useTimers();
  const save = useLocalStorage<TowerSave>(
    'battle-tower',
    { bestFloor: 0, highestBoss: 0 },
    { mergeDefaults: true },
  );
  const startPoints = computed(() => checkpoints(save.value.highestBoss));
  /** 這次從第幾層出發（標題畫面選） */
  const startFloor = ref(1);

  let words: GameWord[] = [];
  let deck = new WordDeck([]);
  const missed = new Map<string, GameWord>();
  /** 還沒挑的增益卡次數（從高樓層出發時會先挑幾張） */
  let pendingPicks = 0;

  const monster = shallowRef<Monster>(monsterFor(1));

  const state = reactive({
    floor: 1,
    /** fight：答題打怪；perk：挑增益卡 */
    mode: 'fight' as 'fight' | 'perk',
    monsterHp: 0,
    playerHp: BASE_HP,
    maxHp: BASE_HP,
    shield: 0,
    perks: {} as OwnedPerks,
    perkChoices: [] as Perk[],
    combo: 0,
    maxCombo: 0,
    score: 0,
    correct: 0,
    answered: 0,
    bossesBeaten: 0,
    question: null as Question | null,
    /** 玩家選的答案，null 表示還沒作答 */
    chosen: null as GameWord | null,
    /** 動畫狀態 */
    effect: '' as '' | 'hit' | 'crit' | 'hurt' | 'blocked' | 'defeated',
  });

  const locked = computed(
    () => state.mode !== 'fight' || state.chosen !== null || state.effect === 'defeated',
  );

  const addScore = (n: number) => {
    state.score += Math.round(n * (state.perks.lucky ? 1.5 : 1));
  };

  const pickType = (): QuestionType => {
    // 前兩層只考看字，之後加入聽力
    const types: QuestionType[] =
      state.floor <= 2 ? ['meaning', 'reverse'] : ['meaning', 'reverse', 'listen'];
    return types[randomInt(types.length)]!;
  };

  const nextQuestion = () => {
    const word = deck.draw();
    const type = pickType();
    state.chosen = null;
    state.effect = '';
    const count = state.perks.eye ? 3 : 4;
    state.question = { type, word, choices: makeChoices(word, words, count) };
    if (type !== 'meaning') WordPronunciation(word.answer);
  };

  const spawnMonster = () => {
    monster.value = monsterFor(state.floor);
    state.monsterHp = monster.value.hp;
    state.mode = 'fight';
    if (monster.value.boss) sfx.lose();
    nextQuestion();
  };

  const offerPerks = () => {
    state.perkChoices = rollPerks(state.perks, state.playerHp, state.maxHp);
    state.question = null;
    state.mode = 'perk';
  };

  const start = (list: GameWord[]) => {
    timers.clearAll();
    words = list;
    deck = new WordDeck(list);
    missed.clear();
    const floor = startPoints.value.includes(startFloor.value) ? startFloor.value : 1;
    Object.assign(state, {
      floor,
      playerHp: BASE_HP,
      maxHp: BASE_HP,
      shield: 0,
      perks: {},
      combo: 0,
      maxCombo: 0,
      score: 0,
      correct: 0,
      answered: 0,
      bossesBeaten: 0,
      chosen: null,
      effect: '',
    });
    pendingPicks = startingPerkPicks(floor);
    if (pendingPicks > 0) offerPerks();
    else spawnMonster();
  };

  const end = (headline?: string) => {
    timers.clearAll();
    // 爬塔一定會結束在被打倒或離開；這次有打倒魔王就算勝利
    const won = state.bossesBeaten > 0;
    if (won) sfx.win();
    else sfx.lose();
    const reached = state.floor;
    const isRecord = reached > save.value.bestFloor;
    if (isRecord) save.value.bestFloor = reached;
    session.finish({
      won,
      headline:
        headline ??
        (isRecord
          ? `新紀錄！爬到了第 ${reached} 層`
          : `在第 ${reached} 層被${monster.value.name}打倒了，再接再厲！`),
      score: state.score,
      stats: [
        { label: '到達樓層', value: reached },
        { label: '打倒魔王', value: state.bossesBeaten },
        { label: '答對', value: `${state.correct} / ${state.answered}` },
        { label: '最高連擊', value: state.maxCombo },
      ],
      missed: [...missed.values()],
    });
  };

  const answer = (choice: GameWord) => {
    const q = state.question;
    if (!q || locked.value) return;
    const correct = choice.answer === q.word.answer;
    state.chosen = choice;
    state.answered++;
    session.record(q.word, correct);

    if (correct) {
      state.correct++;
      state.combo++;
      state.maxCombo = Math.max(state.maxCombo, state.combo);
      const crit = state.combo % critEvery(state.perks) === 0;
      const damage = attackDamage(state.perks, crit);
      state.monsterHp = Math.max(0, state.monsterHp - damage);
      addScore(damage * 10 + state.floor * 2);
      if (crit && state.perks.vamp) state.playerHp = Math.min(state.maxHp, state.playerHp + 1);
      state.effect = crit ? 'crit' : 'hit';
      sfx.hit();
    } else {
      state.combo = 0;
      missed.set(q.word.answer, q.word);
      if (state.shield > 0) {
        state.shield--;
        state.effect = 'blocked';
      } else {
        state.playerHp = Math.max(0, state.playerHp - monster.value.attack);
        state.effect = 'hurt';
      }
      sfx.wrong();
    }

    // 答錯時停久一點，讓玩家看清楚正確答案
    timers.later(afterAnswer, correct ? 800 : 1800);
  };

  const afterAnswer = () => {
    if (state.playerHp <= 0) return end();
    if (state.monsterHp > 0) return nextQuestion();

    state.effect = 'defeated';
    const boss = monster.value.boss;
    addScore(boss ? 150 : 50);
    if (boss) {
      state.bossesBeaten++;
      save.value.highestBoss = Math.max(save.value.highestBoss, state.floor);
    }
    sfx.correct();
    timers.later(() => {
      state.floor++;
      if (state.floor > save.value.bestFloor) save.value.bestFloor = state.floor;
      offerPerks();
    }, 1200);
  };

  const choosePerk = (perk: Perk) => {
    if (state.mode !== 'perk') return;
    const p = state.perks;
    p[perk.id] = (p[perk.id] ?? 0) + 1;
    if (perk.id === 'heal') state.playerHp = Math.min(state.maxHp, state.playerHp + 2);
    if (perk.id === 'maxhp') {
      state.maxHp++;
      state.playerHp = Math.min(state.maxHp, state.playerHp + 1);
    }
    if (perk.id === 'shield') state.shield += 2;
    sfx.correct();
    if (pendingPicks > 0) pendingPicks--;
    if (pendingPicks > 0) offerPerks();
    else spawnMonster();
  };

  const quit = () => end('提早結束了，下次再挑戰！');

  return {
    state,
    monster,
    locked,
    save,
    startPoints,
    startFloor,
    start,
    answer,
    choosePerk,
    quit,
  };
}
