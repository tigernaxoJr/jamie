import { Color, type BufferGeometry, type Material, type Mesh, type Object3D } from 'three';
import { shinyColor } from '../../../domain/shiny';

/** Blender 匯出的材質中，跟著字靈顏色走的（見 tools/blender/build_creatures.py） */
const TINTED = ['body', 'feet', 'color', 'belly', 'accent'];

const isTinted = (m: Material) => TINTED.some((n) => m.name === n || m.name.startsWith(`${n}.`));

const shift = (c: Color) => c.set(shinyColor(`#${c.getHexString()}`));

/** 把模型換成色違的顏色：材質與身體的頂點色都會複製一份再改，不影響其他實例 */
export const tintShiny = (root: Object3D) => {
  const tmp = new Color();
  root.traverse((o) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material as Material & { color?: Color };
    if (!isTinted(mat)) return;
    const copy = mat.clone() as Material & { color?: Color };
    if (copy.color && mat.name !== 'body') shift(copy.color);
    mesh.material = copy;
    const colors = mesh.geometry.getAttribute('color');
    if (!colors) return;
    const geo: BufferGeometry = mesh.geometry.clone();
    const attr = geo.getAttribute('color');
    for (let i = 0; i < attr.count; i++) {
      tmp.setRGB(attr.getX(i), attr.getY(i), attr.getZ(i));
      shift(tmp);
      attr.setXYZ(i, tmp.r, tmp.g, tmp.b);
    }
    attr.needsUpdate = true;
    mesh.geometry = geo;
  });
};
