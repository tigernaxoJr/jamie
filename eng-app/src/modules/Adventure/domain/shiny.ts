import type { CreatureLook } from './species';

// ---------- 色違字靈：很少見的變色版本，收集用，能力值和一般的一樣 ----------

/** 遇到（或孵出）色違字靈的機率 */
export const SHINY_CHANCE = 1 / 50;

export const rollShiny = (rng = Math.random) => rng() < SHINY_CHANCE;

/** 色相要轉幾度 */
const HUE_SHIFT = 150;
/** 顏色太灰時，轉色相看不出差別，改成金色 */
const GREY_SATURATION = 0.2;
const GOLD_HUE = 45;

const hexToHsl = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
};

const hslToHex = (h: number, s: number, l: number): string => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  // 色相每 60 度一段，各段 r、g、b 的分配不同
  const sectors: [number, number, number][] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ];
  const [r, g, b] = sectors[Math.floor(h / 60) % 6]!;
  const ch = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${ch(r)}${ch(g)}${ch(b)}`;
};

/** 把一個顏色換成色違版本 */
export const shinyColor = (hex: string): string => {
  const [h, s, l] = hexToHsl(hex);
  if (s < GREY_SATURATION) return hslToHex(GOLD_HUE, 0.75, Math.min(Math.max(l, 0.45), 0.8));
  return hslToHex((h + HUE_SHIFT) % 360, s, l);
};

/** 色違字靈的外觀：身體、肚子、配件換色，其他部件不變 */
export const shinyLook = (look: CreatureLook): CreatureLook => ({
  ...look,
  color: shinyColor(look.color),
  belly: shinyColor(look.belly),
  ...(look.accent ? { accent: shinyColor(look.accent) } : {}),
});
