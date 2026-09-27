import { type GameInfo, lettersOf, starsProgress } from '../shared';
import { SNAKE_STAGES } from './stages';

export const snakeInfo: GameInfo = {
  id: 'snake',
  title: '字母貪食蛇',
  icon: '🐍',
  description: '照順序吃字母拼出單字，闖過 8 張地圖！',
  skill: '拼字',
  color: 'green',
  minWords: 3,
  stageBased: true,
  progress: starsProgress('snake-stages', SNAKE_STAGES.length),
  recordsProgress: true,
  // 只挑 3～8 個字母、沒有空格符號的單字，蛇比較好拼
  wordFilter: (w) => /^[a-z]{3,8}$/i.test(w.answer) && lettersOf(w.answer).length >= 3,
  rules: [
    '看中文，控制蛇依照順序吃掉英文字母，拼完指定數量的單字就過關',
    '吃錯字母、撞到牆壁或自己，會失去一顆愛心；愛心沒掉可以拿 3 顆星',
    '後面的地圖有石牆、可以穿越的邊界（虛線框），還有會亂跑的錯誤字母',
    '電腦用方向鍵或 WASD，手機用滑動或下方按鈕；開始前可以選速度',
  ],
};
