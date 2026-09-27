import type { GameInfo } from '../shared';

export const battleInfo: GameInfo = {
  id: 'battle',
  title: '單字打怪',
  icon: '⚔️',
  description: '答對單字攻擊怪物，一路打到惡龍魔王！',
  skill: '認字・聽力',
  color: 'deep-orange',
  minWords: 4,
  recordsProgress: true,
  rules: [
    '看中文選英文、看英文選中文，或聽發音選單字',
    '答對就攻擊怪物，連續答對 3 題會爆擊造成雙倍傷害',
    '答錯會被怪物打，失去一顆愛心；打倒怪物會回復一顆',
    '打倒全部 8 隻怪物就勝利！（電腦可以按 1～4 作答）',
  ],
};
