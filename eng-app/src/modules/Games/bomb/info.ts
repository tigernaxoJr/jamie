import { type GameInfo, lettersOf, starsProgress } from '../shared';
import { ROOMS } from './rooms';

export const bombInfo: GameInfo = {
  id: 'bomb',
  title: '拆炸彈',
  icon: '💣',
  description: '猜出單字拆除炸彈，逃出 8 間密室！',
  skill: '拼字',
  color: 'blue-grey-9',
  minWords: 3,
  stageBased: true,
  progress: starsProgress('bomb-rooms', ROOMS.length),
  recordsProgress: true,
  wordFilter: (w) => lettersOf(w.answer).length >= 3,
  rules: [
    '看中文，一個一個猜出英文單字裡的字母；拆完房間裡的炸彈就能開門逃出去',
    '猜錯一次引信會少 3 秒，猜錯 6 次或時間到炸彈就會爆炸，扣一顆愛心',
    '後面的房間有快速引信 🔥、只能聽發音的神秘炸彈 ❓、要連拆兩個字的連環炸彈 ⛓️',
    '卡住時可以花 5 秒聽提示，或用 🔍 放大鏡揭開一個字母；沒爆炸就能拿 3 顆星',
  ],
};
