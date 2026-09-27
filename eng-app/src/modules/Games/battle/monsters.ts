export interface Monster {
  name: string;
  emoji: string;
  hp: number;
}

/** 依序出場的怪物，最後一隻是魔王 */
export const monsters: readonly Monster[] = [
  { name: '史萊姆', emoji: '🟢', hp: 3 },
  { name: '蝙蝠', emoji: '🦇', hp: 4 },
  { name: '野狼', emoji: '🐺', hp: 4 },
  { name: '骷髏兵', emoji: '💀', hp: 5 },
  { name: '幽靈', emoji: '👻', hp: 5 },
  { name: '鬼王', emoji: '👹', hp: 6 },
  { name: '機器人', emoji: '🤖', hp: 6 },
  { name: '惡龍魔王', emoji: '🐉', hp: 8 },
];
