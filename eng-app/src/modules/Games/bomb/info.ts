import { type GameInfo, lettersOf } from '../shared';

export const bombInfo: GameInfo = {
  id: 'bomb',
  title: '拆炸彈',
  icon: '💣',
  description: '在引信燒完前猜出單字的字母，拆除炸彈！',
  skill: '拼字',
  color: 'red',
  minWords: 3,
  recordsProgress: true,
  wordFilter: (w) => lettersOf(w.answer).length >= 3,
  rules: [
    '看中文，一個一個猜出英文單字裡的字母',
    '猜錯一次引信會少 3 秒，猜錯 6 次炸彈就會爆炸',
    '可以花 5 秒聽發音提示',
    '炸彈爆炸 3 次遊戲結束；拆越快分數越高',
  ],
};
