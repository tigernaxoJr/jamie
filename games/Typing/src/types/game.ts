export type GameState = 'START' | 'PLAYING' | 'LEVEL_UP' | 'GAME_OVER';

export interface Letter {
  id: string;
  char: string;
  x: number;
  y: number;
  speed: number;
  isSpecial?: boolean; // 用於左右晃動等特殊效果
  isObscured?: boolean; // 用於視覺模糊效果
}

export interface LevelConfig {
  level: number;
  name: string;
  targetScore: number;
  baseSpeed: number; // 掉落速度 (px/frame)
  spawnRate: number; // 生成頻率 (ms)
  allowedChars: string; // 該關卡允許出現的字母
  charSubsetRange?: [number, number]; // [min, max] 啟動時從 allowedChars 中挑選數個字母使用
  wobble?: boolean; // 是否左右晃動
  obscured?: boolean; // 是否啟用視覺模糊效果
}
