// 把 species.ts 的字靈外觀轉成 Blender 腳本讀的 JSON（含色違版本）。
// 用法：node tools/blender/export_species.mjs [輸出檔，預設 tools/blender/species.json]
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const { SPECIES } = await import('../../src/modules/Adventure/domain/species.ts');
const { shinyLook } = await import('../../src/modules/Adventure/domain/shiny.ts');

/** 表面質感（見 build_creatures.py 的 SURFACES）；沒列出的用一般的光滑材質 */
const SURFACE = {
  Ember: 'charcoal',
  Bubble: 'jelly',
  Jelly: 'jelly',
  Rain: 'jelly',
  Coral: 'jelly',
  Leaf: 'fleece',
  Moss: 'fleece',
  Monkey: 'fleece',
  Panda: 'fleece',
  Tiger: 'fleece',
  Pillow: 'fleece',
  Cloud: 'fleece',
  Snow: 'fleece',
  Sand: 'fleece',
  Rock: 'stone',
  Pebble: 'stone',
};

const out = process.argv[2] ?? fileURLToPath(new URL('./species.json', import.meta.url));
const data = SPECIES.map((s) => {
  const surface = SURFACE[s.english];
  const withSurface = (look) => (surface ? { ...look, surface } : look);
  return {
    id: s.id,
    english: s.english,
    look: withSurface(s.look),
    shiny: withSurface(shinyLook(s.look)),
  };
});
writeFileSync(out, JSON.stringify(data, null, 2) + '\n');
console.log(`${data.length} 隻字靈 → ${out}`);
