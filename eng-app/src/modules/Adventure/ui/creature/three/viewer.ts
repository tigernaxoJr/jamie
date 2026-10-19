/**
 * 字靈的即時 3D：整個 App 共用一個 WebGL renderer（瀏覽器能同時開的 WebGL context 有限），
 * 每個畫面各自有一張 2D canvas，輪流算圖後把結果複製過去。
 * 這個檔案只在選了 3D 顯示時才動態載入，three.js 不會進主程式。
 */
import type { MeshStandardMaterial } from 'three';
import {
  Clock,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  ShadowMaterial,
  SRGBColorSpace,
  WebGLRenderer,
  type Material,
  type Object3D,
} from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { tintShiny } from './tint';

export interface ViewOptions {
  url: string;
  shiny: boolean;
  animated: boolean;
  /** 對戰時我方字靈（插畫是左右翻轉，3D 是轉向右邊的對手） */
  flip: boolean;
}

export interface CreatureView {
  update(opts: Partial<ViewOptions>): void;
  dispose(): void;
}

/** 共用 renderer 的畫布大小上限（每個畫面依自己的像素大小只用左下角一塊） */
const MAX = 512;
/** 框住和 SVG viewBox 一樣的範圍：120 × 120，對應 Blender 的 3 × 3 單位，中心高度 1.15 */
const FRAME = 3;
const CENTER_Y = 1.15;
const FOV = 30;
const ELEVATION = (8 * Math.PI) / 180;

let shared: ReturnType<typeof createShared> | null = null;

function createShared() {
  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: false,
  });
  renderer.setSize(MAX, MAX, false);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const pm = new PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  const key = new DirectionalLight(0xfff6eb, 2.2);
  key.position.set(-3, 4.5, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 6;
  Object.assign(key.shadow.camera, { left: -2, right: 2, top: 3, bottom: -1 });
  scene.add(key, new HemisphereLight(0xe0f2fe, 0x94a3b8, 0.8));
  const ground = new Mesh(new PlaneGeometry(8, 8), new ShadowMaterial({ opacity: 0.18 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const dist = FRAME / 2 / Math.tan(((FOV / 2) * Math.PI) / 180);
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 50);
  camera.position.set(0, CENTER_Y + dist * Math.sin(ELEVATION), dist * Math.cos(ELEVATION));
  camera.lookAt(0, CENTER_Y, 0);

  const draco = new DRACOLoader();
  draco.setDecoderPath(`${import.meta.env.BASE_URL}draco/`);
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);
  const models = new Map<string, Promise<GLTF>>();
  const load = (url: string) => {
    let p = models.get(url);
    if (!p) {
      p = loader.loadAsync(url);
      p.catch(() => models.delete(url));
      models.set(url, p);
    }
    return p;
  };

  return { renderer, scene, camera, load, views: new Set<View>(), clock: new Clock() };
}

/** Blender 的反轉外殼描邊：換成同一物件主材質加深的單色，背面剔除 */
const prepare = (root: Object3D) => {
  root.traverse((o) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    // clone(true) 會共用材質，先複製一份再調整，才不會每多一個實例就再調暗一次
    const mat = (mesh.material as MeshStandardMaterial).clone();
    mesh.material = mat;
    if (mat.emissiveIntensity > 0) mat.emissiveIntensity *= mat.emissiveMap ? 0.8 : 0.35;
    if (mat.name.startsWith('outline')) {
      const sib = mesh.parent?.children.find(
        (c) => (c as Mesh).isMesh && !((c as Mesh).material as Material).name.startsWith('outline'),
      ) as Mesh | undefined;
      const base = sib
        ? ((sib.material as MeshStandardMaterial).color?.clone() ?? new Color(0x222222))
        : new Color(0x222222);
      mesh.material = new MeshBasicMaterial({ color: base.multiplyScalar(0.35) });
      mesh.castShadow = false;
    }
  });
};

class View implements CreatureView {
  private opts: ViewOptions;
  private root: Group | null = null;
  private yaw = 0;
  private drag: { x: number; yaw: number } | null = null;
  private visible = true;
  private dirty = true;
  private disposed = false;
  private observer: IntersectionObserver;
  private ctx: CanvasRenderingContext2D;
  private loadId = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    opts: ViewOptions,
    private onError: (e: unknown) => void,
  ) {
    this.opts = opts;
    this.ctx = canvas.getContext('2d')!;
    this.observer = new IntersectionObserver(([e]) => {
      this.visible = !!e?.isIntersecting;
      this.dirty = true;
    });
    this.observer.observe(canvas);
    canvas.addEventListener('pointerdown', this.onDown);
    void this.load();
  }

  private async load() {
    const id = ++this.loadId;
    try {
      const gltf = await shared!.load(this.opts.url);
      if (this.disposed || id !== this.loadId) return;
      const model = gltf.scene.clone(true);
      if (this.opts.shiny) tintShiny(model);
      prepare(model);
      const g = new Group();
      g.add(model);
      this.root = g;
      this.dirty = true;
    } catch (e) {
      if (!this.disposed) this.onError(e);
    }
  }

  update(next: Partial<ViewOptions>) {
    const reload =
      (next.url && next.url !== this.opts.url) ||
      (next.shiny !== undefined && next.shiny !== this.opts.shiny);
    this.opts = { ...this.opts, ...next };
    this.dirty = true;
    if (reload) void this.load();
  }

  private onDown = (e: PointerEvent) => {
    this.drag = { x: e.clientX, yaw: this.yaw };
    this.canvas.setPointerCapture(e.pointerId);
    this.canvas.addEventListener('pointermove', this.onMove);
    this.canvas.addEventListener('pointerup', this.onUp);
    this.canvas.addEventListener('pointercancel', this.onUp);
  };

  private onMove = (e: PointerEvent) => {
    if (!this.drag) return;
    this.yaw =
      this.drag.yaw + ((e.clientX - this.drag.x) / this.canvas.clientWidth) * Math.PI * 1.5;
    this.dirty = true;
  };

  private onUp = () => {
    this.drag = null;
    this.canvas.removeEventListener('pointermove', this.onMove);
    this.canvas.removeEventListener('pointerup', this.onUp);
    this.canvas.removeEventListener('pointercancel', this.onUp);
  };

  /** 輪到這個畫面時算一張圖並複製到自己的 canvas */
  draw(t: number) {
    if (!this.root || !this.visible) return;
    const animate = this.opts.animated;
    if (!animate && !this.dirty) return;
    // 放開後慢慢轉回正面
    if (!this.drag && Math.abs(this.yaw) > 0.001) {
      this.yaw *= 0.94;
      this.dirty = true;
    } else if (!animate) {
      this.dirty = false;
    }
    const w = Math.min(MAX, Math.round(this.canvas.clientWidth * Math.min(devicePixelRatio, 2)));
    if (!w) return;
    if (this.canvas.width !== w) this.canvas.width = this.canvas.height = w;

    // 我方字靈（flip）站在左邊，轉向右邊的對手
    const base = this.opts.flip ? 0.5 : 0;
    const s = animate ? (Math.sin(t * 2.6) + 1) / 2 : 0;
    const sway = animate ? Math.sin(t * 0.9) * 0.25 : 0;
    this.root.rotation.y = base + sway + this.yaw;
    this.root.position.y = s * 0.08;
    this.root.scale.set(1 - s * 0.015, 1 + s * 0.025, 1 - s * 0.015);

    const { renderer, scene, camera } = shared!;
    scene.add(this.root);
    renderer.setViewport(0, 0, w, w);
    renderer.setScissor(0, 0, w, w);
    renderer.setScissorTest(true);
    renderer.clear();
    renderer.render(scene, camera);
    scene.remove(this.root);
    this.ctx.clearRect(0, 0, w, w);
    this.ctx.drawImage(renderer.domElement, 0, MAX - w, w, w, 0, 0, w, w);
  }

  dispose() {
    this.disposed = true;
    this.observer.disconnect();
    this.onUp();
    this.canvas.removeEventListener('pointerdown', this.onDown);
    shared?.views.delete(this);
  }
}

let running = false;
function loop() {
  if (!shared || shared.views.size === 0) {
    running = false;
    return;
  }
  if (!document.hidden) {
    const t = shared.clock.getElapsedTime();
    for (const v of shared.views) v.draw(t);
  }
  requestAnimationFrame(loop);
}

export function createView(
  canvas: HTMLCanvasElement,
  opts: ViewOptions,
  onError: (e: unknown) => void,
): CreatureView {
  shared ??= createShared();
  const view = new View(canvas, opts, onError);
  shared.views.add(view);
  if (!running) {
    running = true;
    requestAnimationFrame(loop);
  }
  return view;
}
