import type { LevelConfig } from '../types/game';

export const LEVEL_CONFIG: LevelConfig[] = [
  {
    level: 1,
    name: '新手',
    targetScore: 500,
    baseSpeed: 1.5,
    spawnRate: 1500,
    allowedChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    charSubsetRange: [5, 7],
    wobble: false,
    obscured: false,
  },
  {
    level: 2,
    name: '進階',
    targetScore: 1200,
    baseSpeed: 2.5,
    spawnRate: 1000,
    allowedChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    wobble: true,
    obscured: false,
  },
  {
    level: 3,
    name: '混亂',
    targetScore: 2500,
    baseSpeed: 3.5,
    spawnRate: 800,
    allowedChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    wobble: true,
    obscured: true,
  }
];
