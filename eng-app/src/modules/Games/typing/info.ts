import { type GameInfo, lettersOf } from '../shared';

export const typingInfo: GameInfo = {
  id: 'typing',
  title: '打字雨',
  icon: '⌨️',
  description: '字母和單字從天而降，闖過 8 關練出打字速度！',
  skill: '打字・拼字',
  color: 'blue-grey',
  desktopOnly: true,
  minWords: 5,
  recordsProgress: true,
  // 只用字母和空白組成、不太長的字，比較好打
  wordFilter: (w) => /^[a-z ]+$/i.test(w.answer) && lettersOf(w.answer).length <= 10,
  rules: [
    '前 4 關練字母：基準鍵、上排、下排、全部字母；之後打題庫單字',
    '打單字時按第一個字母鎖定它，接著把它打完；打錯想換一個按 Backspace',
    '有 ❄️ 冰凍、💖 補血、💣 清場的字打完可以拿到道具',
    '字母或單字掉到底會少一顆愛心；愛心沒掉可以拿 3 顆星，結算會顯示打字速度',
  ],
};
