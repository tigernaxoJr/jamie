import { type GameInfo, readSaved } from '../shared';

export const battleInfo: GameInfo = {
  id: 'battle',
  title: '單字爬塔',
  icon: '🏰',
  description: '一層一層往上打怪，挑選增益卡，看你能爬多高！',
  skill: '認字・聽力',
  color: 'deep-orange',
  minWords: 4,
  progress: () => {
    const floor = readSaved<{ bestFloor?: number }>('battle-tower')?.bestFloor ?? 0;
    return floor > 0 ? `🏰 最高第 ${floor} 層` : null;
  },
  recordsProgress: true,
  rules: [
    '看中文選英文、看英文選中文，或聽發音選單字，答對就攻擊怪物（電腦可以按 1～4）',
    '連續答對 3 題會爆擊，造成雙倍傷害；答錯會被怪物打，失去愛心',
    '每打倒一隻怪物，從 3 張增益卡挑 1 張：寶劍、守護盾、回復藥水……',
    '每 5 層有一隻魔王；打倒魔王後，下次可以直接從下一層出發',
  ],
};
