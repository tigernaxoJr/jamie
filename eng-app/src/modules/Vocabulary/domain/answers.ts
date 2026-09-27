/**
 * 答案規則：題庫英文可能帶括號補充，例如
 *   'shoe(s)'           → shoe、shoes（緊貼的短字尾視為複數或變化）
 *   'airplane (plane)'  → airplane、plane（括號內是其他寫法）
 *   'be(was, were)'     → be、was、were
 * 測驗與遊戲都用這裡的規則判斷對錯、計算字母數。
 */

const PAREN = /(\s*)\(([^)]*)\)/g;

/** 最多幾個字元的緊貼括號內容視為字尾，例如 (s)、(es) */
const MAX_SUFFIX_LENGTH = 2;

/** 主要答案：去掉括號補充，例如 'have (has, had)' → 'have' */
export const baseAnswer = (english: string): string =>
  english.replace(PAREN, '').replace(/\s+/g, ' ').trim();

/** 所有可接受的寫法（原樣大小寫） */
export const acceptedAnswers = (english: string): string[] => {
  const base = baseAnswer(english);
  const answers = new Set([base]);
  for (const [, space, inner] of english.matchAll(PAREN)) {
    for (const alt of (inner ?? '').split(',').map((s) => s.trim())) {
      if (!alt) continue;
      const isSuffix = space === '' && alt.length <= MAX_SUFFIX_LENGTH;
      answers.add(isSuffix ? base + alt : alt);
    }
  }
  return [...answers];
};

/** 比對用的正規化：忽略大小寫、多餘空白、句點 */
export const normalizeAnswer = (s: string): string =>
  s.toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ').trim();

/** 玩家輸入是否為可接受的答案 */
export const isCorrectAnswer = (input: string, english: string): boolean => {
  const typed = normalizeAnswer(input);
  return typed !== '' && acceptedAnswers(english).some((a) => normalizeAnswer(a) === typed);
};

/** 主要答案的字母數（不含空白、標點） */
export const letterCount = (english: string): number =>
  baseAnswer(english).replace(/[^a-z]/gi, '').length;
