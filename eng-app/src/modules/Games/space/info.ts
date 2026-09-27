import { type GameInfo, starsProgress } from '../shared';
import { STAGES } from './campaign';

export const spaceInfo: GameInfo = {
  id: 'space',
  title: '太空防衛',
  icon: '🚀',
  description: '闖過 8 個星系，擊落中文隕石和魔王，升級你的飛船！',
  skill: '認字・反應',
  color: 'blue-9',
  minWords: 6,
  stageBased: true,
  progress: starsProgress('space-campaign', STAGES.length),
  recordsProgress: true,
  rules: [
    '隕石上寫著中文，點下方正確的英文按鈕把它擊落（電腦可以按 1～6）',
    '擊落足夠的隕石後魔王隕石登場，要連續打中好幾個單字才能打倒它',
    '隕石掉到地面會打壞護盾，魔王會打壞 2 面；護盾全壞就失敗',
    '護盾沒壞又很少按錯可以拿 3 顆星，星星越多飛船升級越多（💣 炸彈按 B）',
  ],
};
