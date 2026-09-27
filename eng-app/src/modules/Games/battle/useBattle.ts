import { computed, reactive } from 'vue';
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
import { monsters } from './monsters';

/** meaning: 看中文選英文；reverse: 看英文選中文；listen: 聽發音選英文 */
export type QuestionType = 'meaning' | 'reverse' | 'listen';

export interface Question {
  type: QuestionType;
  word: GameWord;
  choices: GameWord[];
}

const MAX_HP = 5;
const CRIT_EVERY = 3;

export function useBattle(session: GameSession) {
  const timers = useTimers();
  let words: GameWord[] = [];
  let deck = new WordDeck([]);
  const missed = new Map<string, GameWord>();

  const state = reactive({
    stage: 0,
    monsterHp: 0,
    playerHp: MAX_HP,
    combo: 0,
    maxCombo: 0,
    score: 0,
    correct: 0,
    answered: 0,
    question: null as Question | null,
    /** 玩家選的答案，null 表示還沒作答 */
    chosen: null as GameWord | null,
    /** 動畫狀態 */
    effect: '' as '' | 'hit' | 'crit' | 'hurt' | 'defeated',
  });

  const monster = computed(() => monsters[Math.min(state.stage, monsters.length - 1)]!);
  const locked = computed(() => state.chosen !== null || state.effect === 'defeated');

  const pickType = (): QuestionType => {
    // 前兩關只考看字，之後加入聽力
    const types: QuestionType[] =
      state.stage < 2 ? ['meaning', 'reverse'] : ['meaning', 'reverse', 'listen'];
    return types[randomInt(types.length)]!;
  };

  const nextQuestion = () => {
    const word = deck.draw();
    const type = pickType();
    state.chosen = null;
    state.effect = '';
    state.question = { type, word, choices: makeChoices(word, words, 4) };
    if (type !== 'meaning') WordPronunciation(word.answer);
  };

  const spawnMonster = () => {
    state.monsterHp = monster.value.hp;
    nextQuestion();
  };

  const start = (list: GameWord[]) => {
    timers.clearAll();
    words = list;
    deck = new WordDeck(list);
    missed.clear();
    Object.assign(state, {
      stage: 0,
      playerHp: MAX_HP,
      combo: 0,
      maxCombo: 0,
      score: 0,
      correct: 0,
      answered: 0,
    });
    spawnMonster();
  };

  const end = (won: boolean, headline?: string) => {
    timers.clearAll();
    if (won) sfx.win();
    else sfx.lose();
    const bonus = won ? state.playerHp * 20 : 0;
    session.finish({
      won,
      headline:
        headline ?? (won ? '你打倒了惡龍魔王！' : `被${monster.value.name}打敗了，再接再厲！`),
      score: state.score + bonus,
      stats: [
        { label: '打倒怪物', value: `${state.stage} / ${monsters.length}` },
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
      const crit = state.combo % CRIT_EVERY === 0;
      const damage = crit ? 2 : 1;
      state.monsterHp = Math.max(0, state.monsterHp - damage);
      state.score += damage * 10 + state.stage * 2;
      state.effect = crit ? 'crit' : 'hit';
      sfx.hit();
    } else {
      state.combo = 0;
      state.playerHp--;
      state.effect = 'hurt';
      missed.set(q.word.answer, q.word);
      sfx.wrong();
    }

    // 答錯時停久一點，讓玩家看清楚正確答案
    timers.later(afterAnswer, correct ? 800 : 1800);
  };

  const afterAnswer = () => {
    if (state.playerHp <= 0) return end(false);
    if (state.monsterHp > 0) return nextQuestion();

    state.effect = 'defeated';
    state.score += 50;
    sfx.correct();
    timers.later(() => {
      state.stage++;
      if (state.stage >= monsters.length) return end(true);
      state.playerHp = Math.min(MAX_HP, state.playerHp + 1);
      spawnMonster();
    }, 1200);
  };

  const quit = () => end(false, '提早結束了，下次再挑戰！');

  return { state, monster, locked, maxHp: MAX_HP, start, answer, quit };
}
