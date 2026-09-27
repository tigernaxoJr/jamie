import { describe, expect, it } from 'vitest';
import { ROOMS, bombPlan, roomStars } from './rooms';

describe('escape rooms', () => {
  it('炸彈順序：數量正確，每一種都會出現，第一顆是一般炸彈', () => {
    for (const room of ROOMS) {
      for (let n = 0; n < 20; n++) {
        const plan = bombPlan(room);
        expect(plan, room.name).toHaveLength(room.bombs);
        for (const t of room.types) expect(plan, room.name).toContain(t);
        if (room.types.includes('normal')) expect(plan[0]).toBe('normal');
      }
    }
  });

  it('房間越後面炸彈越多', () => {
    for (let i = 1; i < ROOMS.length; i++) {
      expect(ROOMS[i]!.bombs).toBeGreaterThanOrEqual(ROOMS[i - 1]!.bombs);
      expect(ROOMS[i]!.types.length).toBeLessThanOrEqual(ROOMS[i]!.bombs);
    }
  });

  it('星等看爆炸幾次', () => {
    expect(roomStars(0)).toBe(3);
    expect(roomStars(1)).toBe(2);
    expect(roomStars(2)).toBe(1);
  });
});
