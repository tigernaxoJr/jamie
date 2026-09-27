import type { GameInfo } from '../shared';

export const memoryInfo: GameInfo = {
  id: 'memory',
  title: '翻牌配對',
  icon: '🃏',
  description: '翻開卡片，把英文和中文配成一對！',
  skill: '記憶・認字',
  color: 'teal',
  minWords: 4,
  // 翻牌靠運氣成分較高，不寫入單字測驗記錄
  recordsProgress: false,
  rules: [
    '每次翻開兩張牌，英文和中文意思一樣就配對成功',
    '翻到英文牌會唸出發音，仔細聽！',
    '共 3 關，卡片會越來越多',
    '翻錯次數越少、速度越快，分數越高',
  ],
};
