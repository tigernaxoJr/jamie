import { describe, expect, it } from 'vitest';
import { type AnswerRecord, QuizWord, applyAnswer } from './QuizWord';
import { WordQuizService } from './WordQuizService';

const rec = (count: number, lastTime: number, consecutive: number): AnswerRecord => ({
  count,
  lastTime,
  consecutive,
});

const word = (id: number, errorRec?: AnswerRecord, correctRec?: AnswerRecord) =>
  new QuizWord(id, `word${id}`, `字${id}`, '', '', [], errorRec, correctRec);

/** 固定的隨機來源：一律回傳 0（洗牌結果可預期） */
const fixedRandom = () => 0;

describe('applyAnswer', () => {
  it('答對會累加答對、重置連續答錯', () => {
    const w = word(1, rec(2, 100, 2), rec(0, 0, 0));
    applyAnswer(w, true, 500);
    expect(w.correctRec).toEqual({ count: 1, lastTime: 500, consecutive: 1 });
    expect(w.errorRec.consecutive).toBe(0);
    expect(w.errorRec.count).toBe(2);
  });

  it('答錯會累加答錯、重置連續答對', () => {
    const w = word(1, rec(0, 0, 0), rec(3, 100, 3));
    applyAnswer(w, false, 500);
    expect(w.errorRec).toEqual({ count: 1, lastTime: 500, consecutive: 1 });
    expect(w.correctRec.consecutive).toBe(0);
  });
});

describe('WordQuizService', () => {
  const service = new WordQuizService(fixedRandom);

  it('沒有單字時回傳 undefined', () => {
    expect(service.getNextQuizWord([])).toBeUndefined();
  });

  it('連續答錯次數多的優先', () => {
    const words = [word(1, rec(1, 100, 1)), word(2, rec(3, 50, 3)), word(3)];
    expect(service.getNextQuizWord(words)?.id).toBe(2);
  });

  it('連續答錯相同時，答錯率高的優先', () => {
    const words = [
      word(1, rec(1, 100, 1), rec(4, 50, 0)), // 1/4
      word(2, rec(3, 100, 1), rec(1, 50, 0)), // 3/1
    ];
    expect(service.getNextQuizWord(words)?.id).toBe(2);
  });

  it('答錯的字比還沒考過的字優先', () => {
    const words = [word(1), word(2, rec(1, 100, 1))];
    expect(service.getNextQuizWord(words)?.id).toBe(2);
  });

  it('還沒考過的字比答對的字優先', () => {
    const words = [word(1, rec(0, 0, 0), rec(1, 100, 1)), word(2)];
    expect(service.getNextQuizWord(words)?.id).toBe(2);
  });

  it('都答對過時，連續答對次數少的優先', () => {
    const words = [word(1, undefined, rec(3, 100, 3)), word(2, undefined, rec(1, 100, 1))];
    expect(service.getNextQuizWord(words)?.id).toBe(2);
  });

  it('最近出過的 5 個字暫時不出', () => {
    const words = [1, 2, 3, 4, 5, 6].map((id) => word(id));
    expect(service.getNextQuizWord(words, [1, 2, 3, 4, 5])?.id).toBe(6);
  });

  it('還沒考過的字會隨機出題', () => {
    const words = [1, 2, 3, 4, 5, 6, 7, 8].map((id) => word(id));
    const picked = new Set<number>();
    for (let i = 0; i < 200; i++) {
      picked.add(new WordQuizService().getNextQuizWord(words)?.id ?? -1);
    }
    expect(picked.size).toBeGreaterThan(1);
  });

  it('單字都剛出過時，選最久沒出現的字（跳過的字不會馬上重出）', () => {
    const words = [1, 2, 3].map((id) => word(id));
    // 出題順序 1 → 2 → 3，3 是剛跳過的字（答題時間沒有更新）
    expect(service.getNextQuizWord(words, [1, 2, 3])?.id).toBe(1);
    expect(service.getNextQuizWord(words, [2, 3, 1])?.id).toBe(2);
  });
});
