export interface QuizMeta {
  count: number; // 單字總數
  e1: number; // 連續錯1次的單字數量
  e2: number; // 連續錯2次的單字數量
  e3: number; // 連續錯3次的單字數量
  c1: number; // 連續對1次的單字數量
  c2: number; // 連續對2次的單字數量
  c3: number; // 連續對3次的單字數量
}
