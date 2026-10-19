/**
 * 字靈的顯示方式（存在 localStorage，所有畫面共用）：
 * - svg：原本的平面插畫
 * - image：Blender 預先算好的立體圖（tools/blender）
 * - 3d：即時 3D；小尺寸（清單、隊伍格子）仍用立體圖，避免同時開太多 3D 畫面
 */
import { ref, watch } from 'vue';
import { readJson, writeJson } from 'src/utils/storage';

export type CreatureStyle = 'svg' | 'image' | '3d';

export const CREATURE_STYLES: { value: CreatureStyle; label: string }[] = [
  { value: 'svg', label: '插畫' },
  { value: 'image', label: '立體' },
  { value: '3d', label: '3D' },
];

const KEY = 'adventure-creature-style';

/** 尺寸至少這麼大才用即時 3D */
export const MIN_3D_SIZE = 110;

const isStyle = (v: unknown): v is CreatureStyle => v === 'svg' || v === 'image' || v === '3d';

const saved = readJson<unknown>(KEY);
export const creatureStyle = ref<CreatureStyle>(isStyle(saved) ? saved : '3d');
watch(creatureStyle, (v) => writeJson(KEY, v));

/** 立體圖與 3D 模型的網址（public/creatures） */
export const creatureAsset = (english: string, ext: 'webp' | 'glb', shiny = false) =>
  `${import.meta.env.BASE_URL}creatures/${english.toLowerCase()}${shiny ? '_shiny' : ''}.${ext}`;

let webgl: boolean | null = null;
/** 這台裝置能不能用 WebGL（不能就退回立體圖） */
export const supportsWebgl = () => {
  if (webgl === null) {
    try {
      webgl = !!document.createElement('canvas').getContext('webgl2');
    } catch {
      webgl = false;
    }
  }
  return webgl;
};
