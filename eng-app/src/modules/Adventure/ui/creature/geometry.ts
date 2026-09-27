/**
 * 字靈 SVG 共用的幾何資料與小工具（viewBox 0 0 120 120）。
 */

/** 各種身體的位置：頭頂、身體中心、臉、身體半寬、肚子 [cy, rx, ry] */
export const GEOMETRY = {
  round: { top: 38, cy: 70, face: 64, rx: 34, belly: [82, 18, 14] },
  bean: { top: 48, cy: 74, face: 70, rx: 40, belly: [86, 22, 11] },
  tall: { top: 32, cy: 68, face: 58, rx: 27, belly: [84, 15, 17] },
  drop: { top: 44, cy: 72, face: 68, rx: 32, belly: [86, 20, 11] },
  blob: { top: 50, cy: 74, face: 70, rx: 38, belly: [86, 20, 9] },
} as const;

export type Geometry = (typeof GEOMETRY)[keyof typeof GEOMETRY];

/** 外框線顏色 */
export const LINE = 'rgba(0, 0, 0, 0.28)';

/** 把 #rrggbb 調暗 */
export const darken = (hex: string, amount = 0.35) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (shift: number) => Math.round(((n >> shift) & 255) * (1 - amount));
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
};

/** 五角星路徑 */
export const starPath = (cx: number, cy: number, r: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    pts.push(`${(cx + Math.cos(rad) * rr).toFixed(1)} ${(cy + Math.sin(rad) * rr).toFixed(1)}`);
  }
  return `M${pts.join(' L')} Z`;
};
