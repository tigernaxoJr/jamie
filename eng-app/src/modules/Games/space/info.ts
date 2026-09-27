import type { GameInfo } from '../shared';

export const spaceInfo: GameInfo = {
  id: 'space',
  title: '太空防衛',
  icon: '🚀',
  description: '中文隕石從天而降，發射正確的英文飛彈擊落它們！',
  skill: '認字・反應',
  color: 'indigo',
  minWords: 6,
  recordsProgress: true,
  rules: [
    '隕石上寫著中文，點下方正確的英文按鈕把它擊落',
    '按錯按鈕會扣分，並且要等一下才能再發射',
    '隕石掉到地面會打壞一面護盾，3 面護盾都壞掉就結束',
    '擊落越多，隕石會越來越快越多！（電腦可以按 1～6）',
  ],
};
