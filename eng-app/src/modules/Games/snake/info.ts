import { type GameInfo, lettersOf } from '../shared';

export const snakeInfo: GameInfo = {
  id: 'snake',
  title: '字母貪食蛇',
  icon: '🐍',
  description: '照順序吃字母，拼出正確的英文單字！',
  skill: '拼字',
  color: 'green',
  minWords: 3,
  recordsProgress: true,
  // 只挑 3～8 個字母、沒有空格符號的單字，蛇比較好拼
  wordFilter: (w) => /^[a-z]{3,8}$/i.test(w.answer) && lettersOf(w.answer).length >= 3,
  rules: [
    '看中文，控制蛇依照順序吃掉英文字母',
    '吃錯字母或撞到牆壁、自己，會失去一顆愛心',
    '每拼完一個單字，蛇會變得更快',
    '電腦用方向鍵或 WASD，手機用滑動或下方按鈕',
  ],
};
