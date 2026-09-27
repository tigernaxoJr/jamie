import { describe, expect, it } from 'vitest';
import { acceptedAnswers, baseAnswer, isCorrectAnswer, letterCount } from './answers';

describe('baseAnswer', () => {
  it('去掉括號補充', () => {
    expect(baseAnswer('shoe(s)')).toBe('shoe');
    expect(baseAnswer('have (has, had)')).toBe('have');
    expect(baseAnswer('post office')).toBe('post office');
  });
});

describe('acceptedAnswers', () => {
  it('緊貼的短字尾視為變化形', () => {
    expect(acceptedAnswers('shoe(s)')).toEqual(['shoe', 'shoes']);
  });

  it('括號內的其他寫法都接受', () => {
    expect(acceptedAnswers('airplane (plane)')).toEqual(['airplane', 'plane']);
    expect(acceptedAnswers('be(was, were)')).toEqual(['be', 'was', 'were']);
    expect(acceptedAnswers('television (TV)')).toEqual(['television', 'TV']);
  });
});

describe('isCorrectAnswer', () => {
  it('忽略大小寫、多餘空白與句點', () => {
    expect(isCorrectAnswer('Apple', 'apple')).toBe(true);
    expect(isCorrectAnswer(' post   office ', 'post office')).toBe(true);
    expect(isCorrectAnswer('mr', 'Mr.')).toBe(true);
    expect(isCorrectAnswer('tv', 'television (TV)')).toBe(true);
    expect(isCorrectAnswer('shoes', 'shoe(s)')).toBe(true);
  });

  it('答錯或空白都是錯', () => {
    expect(isCorrectAnswer('aple', 'apple')).toBe(false);
    expect(isCorrectAnswer('   ', 'apple')).toBe(false);
    expect(isCorrectAnswer('shoe(s)x', 'shoe(s)')).toBe(false);
  });
});

describe('letterCount', () => {
  it('只算主要答案的字母', () => {
    expect(letterCount('shoe(s)')).toBe(4);
    expect(letterCount('post office')).toBe(10);
    expect(letterCount('Mr.')).toBe(2);
  });
});
