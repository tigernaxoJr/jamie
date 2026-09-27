import { type GameInfo, lettersOf } from '../shared';

export const typingInfo: GameInfo = {
  id: 'typing',
  title: '打字雨',
  icon: '⌨️',
  description: '字母和單字從天而降，在掉到底之前打出來！',
  skill: '打字・拼字',
  color: 'blue-grey',
  desktopOnly: true,
  minWords: 5,
  recordsProgress: true,
  // 只用字母和空白組成、不太長的字，比較好打
  wordFilter: (w) => /^[a-z ]+$/i.test(w.answer) && lettersOf(w.answer).length <= 10,
  rules: [
    '第 1、2 關打字母：先練基準鍵，再練全部字母',
    '第 3、4 關打單字：按第一個字母鎖定單字，接著把它打完',
    '第 5 關只看中文拼出英文，打對的字母才會出現',
    '字母或單字掉到底會少一顆愛心，愛心用完就結束',
  ],
};
