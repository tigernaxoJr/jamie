import { type GameInfo, starsProgress } from '../shared';
import { MEMORY_STAGES } from './stages';

export const memoryInfo: GameInfo = {
  id: 'memory',
  title: '翻牌配對',
  icon: '🃏',
  description: '先偷看、再配對！聽聲音牌，闖過 8 個關卡',
  skill: '記憶・聽力',
  color: 'teal',
  minWords: 4,
  stageBased: true,
  progress: starsProgress('memory-stages', MEMORY_STAGES.length),
  // 翻牌還是有運氣成分，不寫入單字測驗記錄
  recordsProgress: false,
  rules: [
    '開局會先偷看所有牌幾秒，記住位置後牌會蓋起來',
    '每次翻開兩張牌，意思一樣就配對成功；🔊 聲音牌翻開只會唸出單字，要用聽的',
    '後面的關卡有時間限制，還有翻錯太多次會把牌吹亂的旋風',
    '卡住時可以用一次 🔦 手電筒讓牌亮一下；翻錯越少星星越多',
  ],
};
