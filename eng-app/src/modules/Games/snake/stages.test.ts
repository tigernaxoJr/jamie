import { describe, expect, it } from 'vitest';
import { BOARD_SIZE, SNAKE_STAGES, START_ROW, parseWalls, snakeStars } from './stages';

describe('snake stages', () => {
  it('每張地圖都是 12×12，只用 # 和 .', () => {
    for (const s of SNAKE_STAGES) {
      expect(s.map, s.name).toHaveLength(BOARD_SIZE);
      for (const row of s.map) expect(row, s.name).toMatch(/^[#.]{12}$/);
    }
  });

  it('出發那一列的前半段沒有牆，蛇不會一出發就撞到', () => {
    for (const s of SNAKE_STAGES) {
      expect(s.map[START_ROW]!.slice(0, 7), s.name).toBe('.......');
    }
  });

  it('解析牆壁座標', () => {
    expect(parseWalls(['#..', '..#'])).toEqual([
      { x: 0, y: 0 },
      { x: 2, y: 1 },
    ]);
  });

  it('星等看掉了幾顆愛心', () => {
    expect(snakeStars(0)).toBe(3);
    expect(snakeStars(1)).toBe(2);
    expect(snakeStars(2)).toBe(1);
  });
});
