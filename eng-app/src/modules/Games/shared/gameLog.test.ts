import { describe, expect, it } from 'vitest';
import { type GameLogData, gameReport, localDay, logGame } from './gameLog';

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date(2026, 8, 27, 15).getTime();

describe('game log', () => {
  it('統計最近 7 天的局數、過關、星星', () => {
    const data: GameLogData = { days: {} };
    logGame(data, { gameId: 'space', cleared: true, stars: 3, now: NOW });
    logGame(data, { gameId: 'space', cleared: false, stars: 0, now: NOW - DAY });
    logGame(data, { gameId: 'snake', cleared: true, stars: 2, now: NOW - 2 * DAY });
    const r = gameReport(data, NOW);
    expect(r.plays).toEqual([
      ['space', 2],
      ['snake', 1],
    ]);
    expect(r.totalPlays).toBe(3);
    expect(r.cleared).toBe(2);
    expect(r.stars).toBe(5);
  });

  it('打字速度分成這週和上週的最快紀錄', () => {
    const data: GameLogData = { days: {} };
    logGame(data, {
      gameId: 'typing',
      cleared: false,
      stars: 0,
      lettersPerMinute: 60,
      now: NOW - 9 * DAY,
    });
    logGame(data, { gameId: 'typing', cleared: false, stars: 0, lettersPerMinute: 80, now: NOW });
    logGame(data, { gameId: 'typing', cleared: false, stars: 0, lettersPerMinute: 70, now: NOW });
    const r = gameReport(data, NOW);
    expect(r.typingBest).toBe(80);
    expect(r.typingPrevBest).toBe(60);
    expect(r.plays).toEqual([['typing', 2]]);
  });

  it('只保留最近 60 天', () => {
    const data: GameLogData = { days: {} };
    logGame(data, { gameId: 'space', cleared: false, stars: 0, now: NOW - 70 * DAY });
    logGame(data, { gameId: 'space', cleared: false, stars: 0, now: NOW });
    expect(Object.keys(data.days)).toEqual([localDay(NOW)]);
  });
});
