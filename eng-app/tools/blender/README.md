# 字靈 3D（Blender）

依 `src/modules/Adventure/domain/species.ts` 的外觀部件，用 Blender 程序化建出每隻字靈的 3D 模型，
輸出到 `public/creatures/`：

- `<english>.webp`：正面立體圖（512×512，框住和 SVG viewBox 一樣的範圍）
- `<english>_shiny.webp`：色違的正面立體圖
- `<english>.glb`：即時 3D 用的模型（Draco 壓縮）；色違由遊戲裡的 three.js 換色

## 重新產生

需要 Blender 5.2 以上（有 NVIDIA 顯示卡時用 CUDA 算圖，53 隻約 50 分鐘）。

```bash
node tools/blender/export_species.mjs
"/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" --background --factory-startup --python tools/blender/build_creatures.py -- tools/blender/species.json public/creatures
```

只重算某幾隻：在最後加上英文名字，例如 `Ember Bubble`。其他選項：`--no-shiny`、`--no-glb`、`--no-render`。

## 檔案

- `export_species.mjs`：把 species.ts 轉成 `species.json`（含色違外觀與表面質感 `surface`）；
  有專屬進化（`evolution`）的字靈多輸出一筆進化後的樣子（例如 `blaze.webp`），質感沿用原本的。需要 Node 22.6 以上
- `build_creatures.py`：建模、算圖、匯出；每個部件對照 `ui/creature/CreatureBackParts.vue`、`CreatureFrontParts.vue`
- `assets/`：Poly Haven 的 CC0 貼圖與 HDRI（見 `assets/README.md`）
- `out/`：中間檔（烘焙貼圖、紀錄），不進版控
