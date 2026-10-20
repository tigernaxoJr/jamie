<template>
  <!--
    地區場景：疊在地區漸層（天空）上面的遠景、中景、地面和會動的小東西。
    viewBox 400×200、對齊底部裁切：寬螢幕裁掉上面，窄螢幕裁掉左右，重要的東西放在 x 50～350、y 60 以下。
  -->
  <svg
    class="area-scene"
    :class="{ 'area-scene--still': still }"
    viewBox="0 0 400 200"
    preserveAspectRatio="xMidYMax slice"
    aria-hidden="true"
  >
    <!-- 微風草原：太陽、雲、山丘、小花、飄落的花瓣 -->
    <g v-if="scene === 'meadow'">
      <circle cx="330" cy="100" r="12" fill="#fde047" class="pulse" />
      <g class="drift" style="--dur: 38s">
        <ellipse cx="90" cy="84" rx="24" ry="8" fill="#fff" opacity="0.85" />
        <ellipse cx="104" cy="78" rx="14" ry="8" fill="#fff" opacity="0.85" />
      </g>
      <path d="M0 138 Q60 108 130 132 T260 126 T400 122 V200 H0Z" fill="#a7f3d0" />
      <path d="M0 160 Q100 146 200 158 T400 154 V200 H0Z" fill="#4ade80" />
      <g v-for="([x, y, c], i) in MEADOW_FLOWERS" :key="i">
        <line :x1="x" :y1="y" :x2="x" :y2="y + 8" stroke="#15803d" stroke-width="1.5" />
        <circle
          v-for="a in [0, 72, 144, 216, 288]"
          :key="a"
          :cx="x + 3.5 * Math.cos((a * Math.PI) / 180)"
          :cy="y + 3.5 * Math.sin((a * Math.PI) / 180)"
          r="2.6"
          :fill="c"
        />
        <circle :cx="x" :cy="y" r="2" fill="#facc15" />
      </g>
      <ellipse
        v-for="(p, i) in PARTICLES"
        :key="`p${i}`"
        :cx="p.x"
        cy="40"
        rx="2.4"
        ry="1.4"
        fill="#f9a8d4"
        class="fall"
        :style="p.style"
      />
    </g>

    <!-- 螢光森林：遠方的樹、兩側大樹、發光蘑菇、螢火蟲 -->
    <g v-else-if="scene === 'forest'">
      <path
        v-for="x in [20, 70, 120, 170, 230, 280, 330, 380]"
        :key="x"
        :d="`M${x - 26} 150 L${x} ${92 + (x % 3) * 10} L${x + 26} 150Z`"
        fill="#0b3b1e"
        opacity="0.8"
      />
      <rect x="22" y="40" width="16" height="130" fill="#3f2d1d" />
      <circle cx="30" cy="50" r="44" fill="#166534" />
      <rect x="362" y="40" width="16" height="130" fill="#3f2d1d" />
      <circle cx="370" cy="46" r="46" fill="#166534" />
      <path d="M0 162 Q120 150 200 160 T400 158 V200 H0Z" fill="#365314" />
      <g
        v-for="([x, y], i) in FOREST_MUSHROOMS"
        :key="i"
        class="pulse"
        :style="{ animationDelay: `${i * 0.7}s` }"
      >
        <rect :x="x - 2" :y="y" width="4" height="9" fill="#ecfccb" />
        <ellipse :cx="x" :cy="y" rx="8" ry="5" fill="#a3e635" />
      </g>
      <circle
        v-for="(p, i) in PARTICLES"
        :key="`p${i}`"
        :cx="p.x"
        :cy="p.y"
        r="1.8"
        fill="#fef08a"
        class="firefly"
        :style="p.style"
      />
    </g>

    <!-- 星星海灘：海、浪、沙灘、椰子樹、海星 -->
    <g v-else-if="scene === 'beach'">
      <rect x="0" y="118" width="400" height="36" fill="#38bdf8" />
      <rect x="0" y="118" width="400" height="4" fill="#7dd3fc" />
      <path
        v-for="(y, i) in [128, 138, 147]"
        :key="y"
        class="wave"
        :style="{ animationDelay: `${-i * 1.2}s` }"
        :d="`M-40 ${y} q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0`"
        fill="none"
        stroke="#fff"
        stroke-width="1.5"
        opacity="0.7"
      />
      <path d="M0 154 Q100 146 200 152 T400 150 V200 H0Z" fill="#fde68a" />
      <path
        d="M30 178 q20 -4 40 0 M260 186 q24 -5 48 0"
        stroke="#fbbf24"
        stroke-width="1.5"
        fill="none"
      />
      <path
        d="M352 168 Q346 130 334 98"
        stroke="#a16207"
        stroke-width="6"
        fill="none"
        stroke-linecap="round"
      />
      <g class="sway" style="transform-origin: 334px 98px">
        <path v-for="d in PALM_LEAVES" :key="d" :d="d" fill="#16a34a" />
      </g>
      <circle cx="330" cy="102" r="3.5" fill="#78350f" />
      <circle cx="338" cy="103" r="3.5" fill="#78350f" />
      <path d="M70 172 l3 6 7 1 -5 4 1 7 -6 -3 -6 3 1 -7 -5 -4 7 -1Z" fill="#fb923c" />
      <path d="M300 178 a6 6 0 0 1 12 0 Z" fill="#fecdd3" />
      <path
        v-for="(p, i) in PARTICLES.slice(0, 6)"
        :key="`p${i}`"
        :d="`M${p.x} ${124 + (i % 3) * 9} l2 -3 2 3 -2 3Z`"
        fill="#fff"
        class="twinkle"
        :style="p.style"
      />
    </g>

    <!-- 熱鬧小鎮：一排房子、鐘塔、石板路、煙囪冒煙 -->
    <g v-else-if="scene === 'town'">
      <g v-for="h in TOWN_HOUSES" :key="h.x">
        <rect :x="h.x" :y="h.y" :width="h.w" :height="160 - h.y" :fill="h.c" />
        <path
          :d="`M${h.x - 4} ${h.y} L${h.x + h.w / 2} ${h.y - 18} L${h.x + h.w + 4} ${h.y}Z`"
          :fill="h.roof"
        />
        <rect
          v-for="k in 2"
          :key="k"
          :x="h.x + (k === 1 ? 6 : h.w - 16)"
          :y="h.y + 10"
          width="10"
          height="10"
          fill="#fef9c3"
        />
      </g>
      <rect x="112" y="80" width="28" height="80" fill="#d6d3d1" />
      <path d="M108 80 L126 58 L144 80Z" fill="#78716c" />
      <circle cx="126" cy="96" r="9" fill="#fff" stroke="#57534e" stroke-width="2" />
      <path d="M126 96 V90 M126 96 H131" stroke="#57534e" stroke-width="1.5" class="tick" />
      <rect x="296" y="72" width="8" height="18" fill="#7f1d1d" />
      <circle
        v-for="(p, i) in PARTICLES.slice(0, 4)"
        :key="`p${i}`"
        cx="300"
        cy="68"
        r="5"
        fill="#fff"
        opacity="0.8"
        class="smoke"
        :style="{ animationDelay: `${i * 0.9}s` }"
      />
      <rect x="0" y="160" width="400" height="40" fill="#e7e5e4" />
      <path
        v-for="y in [170, 182, 194]"
        :key="y"
        :d="`M0 ${y} H400`"
        stroke="#d6d3d1"
        stroke-width="1"
      />
      <path
        v-for="x in TOWN_STONES"
        :key="`s${x}`"
        :d="`M${x} 160 v40`"
        stroke="#d6d3d1"
        stroke-width="1"
      />
    </g>

    <!-- 甜點工坊：條紋牆、架上的蛋糕、櫃台、格子地板、閃亮亮 -->
    <g v-else-if="scene === 'bakery'">
      <rect
        v-for="x in BAKERY_STRIPES"
        :key="x"
        :x="x"
        y="0"
        width="16"
        height="160"
        fill="#fff"
        opacity="0.3"
      />
      <rect x="40" y="110" width="320" height="6" rx="2" fill="#b45309" />
      <g v-for="(c, i) in BAKERY_CUPCAKES" :key="i">
        <path :d="`M${c.x - 9} 98 h18 l-3 12 h-12Z`" fill="#fbbf24" />
        <circle :cx="c.x" :cy="94" r="9" :fill="c.c" />
        <circle :cx="c.x" :cy="85" r="2.5" fill="#dc2626" />
      </g>
      <rect x="170" y="88" width="60" height="22" rx="3" fill="#fff" />
      <rect x="180" y="74" width="40" height="16" rx="3" fill="#fbcfe8" />
      <path
        d="M170 96 q7.5 6 15 0 t15 0 t15 0 t15 0"
        fill="none"
        stroke="#f472b6"
        stroke-width="3"
      />
      <rect x="0" y="136" width="400" height="24" fill="#fff1f2" />
      <rect x="0" y="136" width="400" height="4" fill="#f9a8d4" />
      <rect
        v-for="t in BAKERY_TILES"
        :key="`${t.x}-${t.y}`"
        :x="t.x"
        :y="t.y"
        width="20"
        height="20"
        :fill="t.dark ? '#f9a8d4' : '#fff'"
      />
      <path
        v-for="(p, i) in PARTICLES.slice(0, 7)"
        :key="`p${i}`"
        :d="`M${p.x} ${50 + (i % 4) * 18} l1.5 -4 1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5Z`"
        fill="#fff"
        class="twinkle"
        :style="p.style"
      />
    </g>

    <!-- 風雨山谷：彩虹、山、烏雲、雨絲 -->
    <g v-else-if="scene === 'valley'">
      <path
        v-for="(c, i) in RAINBOW"
        :key="c"
        :d="`M${110 + i * 6} 140 a${90 - i * 6} ${90 - i * 6} 0 0 1 ${180 - i * 12} 0`"
        fill="none"
        :stroke="c"
        stroke-width="6"
        opacity="0.45"
      />
      <path d="M-20 150 L70 70 L150 150Z" fill="#64748b" />
      <path d="M52 86 L70 70 L88 86 L78 82 L70 88 L62 82Z" fill="#fff" />
      <path d="M240 150 L330 60 L430 150Z" fill="#475569" />
      <path d="M312 78 L330 60 L348 78 L338 74 L330 80 L322 74Z" fill="#fff" />
      <g class="drift" style="--dur: 50s">
        <ellipse cx="160" cy="82" rx="30" ry="10" fill="#64748b" opacity="0.7" />
        <ellipse cx="178" cy="76" rx="18" ry="10" fill="#64748b" opacity="0.7" />
      </g>
      <path d="M0 156 Q100 146 200 154 T400 152 V200 H0Z" fill="#5f9e86" />
      <line
        v-for="(p, i) in PARTICLES"
        :key="`p${i}`"
        :x1="p.x"
        y1="40"
        :x2="p.x - 4"
        y2="52"
        stroke="#e0f2fe"
        stroke-width="1.5"
        opacity="0.8"
        class="rain"
        :style="p.style"
      />
    </g>

    <!-- 運動公園：樹、白色圍欄、球門、跑道線、雲 -->
    <g v-else-if="scene === 'park'">
      <g class="drift" style="--dur: 42s">
        <ellipse cx="260" cy="80" rx="24" ry="8" fill="#fff" opacity="0.9" />
        <ellipse cx="274" cy="74" rx="14" ry="8" fill="#fff" opacity="0.9" />
      </g>
      <g v-for="x in [30, 380]" :key="x">
        <rect :x="x - 4" y="104" width="8" height="46" fill="#92400e" />
        <circle :cx="x" cy="96" r="26" fill="#16a34a" />
      </g>
      <rect x="0" y="132" width="400" height="3" fill="#fff" />
      <rect v-for="x in PARK_FENCE" :key="x" :x="x" y="126" width="4" height="22" fill="#fff" />
      <path d="M0 148 H400 V200 H0Z" fill="#4ade80" />
      <path
        d="M-20 196 Q200 150 420 196 M-20 186 Q200 140 420 186"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        opacity="0.8"
      />
      <g transform="translate(300 118)">
        <path d="M0 40 V0 H56 V40" fill="none" stroke="#fff" stroke-width="3" />
        <path
          v-for="k in 6"
          :key="k"
          :d="`M${k * 8} 2 V40 M2 ${k * 6} H54`"
          stroke="#fff"
          stroke-width="0.6"
          opacity="0.7"
        />
      </g>
    </g>

    <!-- 叢林探險：茂密的葉子、垂下來的藤蔓、大葉子、飄落的葉子 -->
    <g v-else-if="scene === 'jungle'">
      <ellipse
        v-for="b in JUNGLE_BUSHES"
        :key="b[0]"
        :cx="b[0]"
        :cy="b[1]"
        :rx="b[2]"
        :ry="b[2] * 0.6"
        fill="#064e3b"
        opacity="0.85"
      />
      <g
        v-for="(v, i) in JUNGLE_VINES"
        :key="v"
        class="sway"
        :style="{ transformOrigin: `${v}px 0px`, animationDelay: `${-i}s` }"
      >
        <path :d="`M${v} 0 q6 30 0 60 t0 50`" fill="none" stroke="#15803d" stroke-width="2" />
        <ellipse
          v-for="k in 4"
          :key="k"
          :cx="v + (k % 2 ? 4 : -4)"
          :cy="k * 24"
          rx="5"
          ry="2.5"
          fill="#22c55e"
        />
      </g>
      <path d="M0 160 Q120 150 200 158 T400 156 V200 H0Z" fill="#3f6212" />
      <path
        d="M-10 200 Q20 140 70 130 Q40 160 30 200Z M410 200 Q380 140 330 128 Q360 160 370 200Z"
        fill="#15803d"
      />
      <path
        v-for="(p, i) in PARTICLES.slice(0, 6)"
        :key="`p${i}`"
        :d="`M${p.x} 40 q4 -4 8 0 q-4 4 -8 0Z`"
        fill="#4ade80"
        class="fall"
        :style="p.style"
      />
    </g>

    <!-- 星空城堡：星星、月亮、城堡剪影、亮著的窗戶 -->
    <g v-else-if="scene === 'castle'">
      <circle
        v-for="(p, i) in PARTICLES"
        :key="`p${i}`"
        :cx="p.x"
        :cy="58 + ((i * 37) % 70)"
        r="1.3"
        fill="#fff"
        class="twinkle"
        :style="p.style"
      />
      <circle cx="320" cy="92" r="11" fill="#fef3c7" />
      <circle cx="325" cy="88" r="9" fill="#1e3a8a" />
      <!-- 以地面中央為基準縮小，屋頂才不會被裁掉 -->
      <g transform="translate(40 31.2) scale(0.8)">
        <g fill="#1e293b">
          <rect x="150" y="96" width="100" height="60" />
          <rect
            v-for="x in [150, 168, 186, 204, 222, 240]"
            :key="x"
            :x="x"
            y="90"
            width="10"
            height="8"
          />
          <rect x="130" y="78" width="26" height="78" />
          <rect x="244" y="78" width="26" height="78" />
          <rect x="186" y="58" width="28" height="40" />
          <path d="M126 78 L143 50 L160 78Z M240 78 L257 50 L274 78Z M182 58 L200 28 L218 58Z" />
        </g>
        <rect
          v-for="(w, i) in CASTLE_WINDOWS"
          :key="i"
          :x="w[0]"
          :y="w[1]"
          width="6"
          height="9"
          rx="3"
          fill="#fde047"
          class="twinkle"
          :style="{ animationDelay: `${i * 0.8}s`, animationDuration: '4s' }"
        />
      </g>
      <path d="M0 156 Q100 146 200 154 T400 152 V200 H0Z" fill="#334155" />
      <path d="M150 200 L180 156 H220 L250 200Z" fill="#475569" />
    </g>

    <!-- 節慶王國：一串燈籠、攤位帳篷、煙火 -->
    <g v-else-if="scene === 'festival'">
      <g
        v-for="(f, i) in FIREWORKS"
        :key="i"
        class="firework"
        :style="{ animationDelay: `${i * 1.1}s` }"
        :transform-origin="`${f.x} ${f.y}`"
      >
        <circle
          v-for="a in 8"
          :key="a"
          :cx="f.x + 14 * Math.cos((a * Math.PI) / 4)"
          :cy="f.y + 14 * Math.sin((a * Math.PI) / 4)"
          r="2"
          :fill="f.c"
        />
      </g>
      <path :d="LANTERN_STRING" fill="none" stroke="#451a03" stroke-width="1" />
      <g
        v-for="(l, i) in LANTERNS"
        :key="i"
        class="sway"
        :style="{ transformOrigin: `${l.x}px ${l.y - 6}px`, animationDelay: `${-i * 0.5}s` }"
      >
        <line :x1="l.x" :y1="l.y - 6" :x2="l.x" :y2="l.y" stroke="#451a03" />
        <ellipse :cx="l.x" :cy="l.y + 7" rx="6" ry="8" :fill="l.c" />
        <rect :x="l.x - 3" :y="l.y + 14" width="6" height="2" fill="#facc15" />
      </g>
      <g v-for="t in TENTS" :key="t.x">
        <rect :x="t.x" y="120" width="56" height="36" fill="#fff7ed" />
        <path :d="`M${t.x - 6} 122 L${t.x + 28} 96 L${t.x + 62} 122Z`" :fill="t.c" />
        <path :d="`M${t.x + 10} 122 L${t.x + 28} 96 L${t.x + 46} 122Z`" fill="#fff" opacity="0.5" />
      </g>
      <path d="M0 156 Q100 148 200 154 T400 152 V200 H0Z" fill="#9a3412" />
    </g>
  </svg>
</template>

<script setup lang="ts">
/** 地區 id（`areas.ts`）；沒有對應的場景就不畫，只剩漸層 */
defineProps<{
  scene: string;
  /** 不要動畫（地圖上的小卡片） */
  still?: boolean;
}>();

/** 粒子（花瓣、雨、星星…）的位置與動畫節奏，固定值，畫面不會每次都不一樣 */
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  x: 20 + ((i * 97) % 360),
  y: 90 + ((i * 53) % 70),
  style: { animationDelay: `${-((i * 1.7) % 6)}s`, animationDuration: `${4 + (i % 4)}s` },
}));

const MEADOW_FLOWERS: [number, number, string][] = [
  [40, 172, '#f472b6'],
  [78, 186, '#fff'],
  [118, 168, '#facc15'],
  [292, 174, '#fff'],
  [330, 188, '#f472b6'],
  [366, 168, '#c084fc'],
];

const FOREST_MUSHROOMS: [number, number][] = [
  [66, 176],
  [86, 184],
  [322, 180],
];

const PALM_LEAVES = [
  'M334 98 Q310 88 292 104 Q312 94 334 100Z',
  'M334 98 Q356 84 378 98 Q356 92 334 100Z',
  'M334 98 Q320 74 300 70 Q322 80 334 98Z',
  'M334 98 Q346 72 368 70 Q348 80 334 98Z',
];

const TOWN_HOUSES = [
  { x: 10, y: 104, w: 48, c: '#fca5a5', roof: '#b91c1c' },
  { x: 62, y: 116, w: 40, c: '#93c5fd', roof: '#1d4ed8' },
  { x: 150, y: 110, w: 52, c: '#fde68a', roof: '#b45309' },
  { x: 210, y: 120, w: 40, c: '#c4b5fd', roof: '#6d28d9' },
  { x: 258, y: 100, w: 54, c: '#86efac', roof: '#15803d' },
  { x: 320, y: 114, w: 44, c: '#fdba74', roof: '#c2410c' },
  { x: 368, y: 108, w: 40, c: '#f9a8d4', roof: '#be185d' },
];
const TOWN_STONES = Array.from({ length: 20 }, (_, i) => i * 20 + (i % 2) * 10);

const BAKERY_STRIPES = Array.from({ length: 13 }, (_, i) => i * 32);
const BAKERY_CUPCAKES = [
  { x: 60, c: '#f9a8d4' },
  { x: 90, c: '#fff' },
  { x: 120, c: '#c4b5fd' },
  { x: 280, c: '#fde68a' },
  { x: 310, c: '#f9a8d4' },
  { x: 340, c: '#fff' },
];
const BAKERY_TILES = Array.from({ length: 40 }, (_, i) => ({
  x: (i % 20) * 20,
  y: 160 + Math.floor(i / 20) * 20,
  dark: (i + Math.floor(i / 20)) % 2 === 0,
}));

const RAINBOW = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7'];

const PARK_FENCE = Array.from({ length: 20 }, (_, i) => i * 21 + 4);

const JUNGLE_BUSHES: [number, number, number][] = [
  [20, 130, 50],
  [100, 140, 40],
  [190, 128, 46],
  [280, 138, 44],
  [370, 126, 50],
];
const JUNGLE_VINES = [60, 130, 270, 340];

const CASTLE_WINDOWS: [number, number][] = [
  [140, 96],
  [254, 96],
  [197, 72],
  [180, 118],
  [214, 118],
];

const FIREWORKS = [
  { x: 120, y: 132, c: '#fde047' },
  { x: 282, y: 128, c: '#f472b6' },
  { x: 200, y: 112, c: '#a5f3fc' },
];
const LANTERNS = [
  { x: 96, y: 100, c: '#ef4444' },
  { x: 150, y: 101, c: '#facc15' },
  { x: 250, y: 92, c: '#ef4444' },
  { x: 304, y: 88, c: '#facc15' },
];
/** 掛燈籠的繩子，經過每個燈籠的頂端 */
const LANTERN_STRING = `M0 84 ${LANTERNS.map((l) => `L${l.x} ${l.y - 6}`).join(' ')} L400 76`;
const TENTS = [
  { x: 20, c: '#ef4444' },
  { x: 324, c: '#2563eb' },
];
</script>

<style scoped lang="scss">
.area-scene {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.area-scene * {
  transform-box: fill-box;
}
.drift {
  animation: drift var(--dur, 40s) linear infinite;
}
.pulse {
  transform-origin: center;
  animation: pulse 3s ease-in-out infinite;
}
.fall {
  animation: fall 6s linear infinite;
}
.firefly {
  animation: firefly 5s ease-in-out infinite;
}
.twinkle {
  animation: twinkle 3s ease-in-out infinite;
}
.wave {
  animation: wave 4s linear infinite;
}
.sway {
  transform-box: view-box;
  animation: sway 4s ease-in-out infinite;
}
.smoke {
  animation: smoke 3.6s ease-out infinite;
}
.rain {
  animation: rain 0.9s linear infinite;
}
.firework {
  transform-box: view-box;
  animation: firework 3.3s ease-out infinite;
}
.tick {
  transform-box: view-box;
  transform-origin: 126px 96px;
  animation: spin 12s steps(12) infinite;
}

@keyframes drift {
  from {
    transform: translateX(-160px);
  }
  to {
    transform: translateX(460px);
  }
}
@keyframes pulse {
  50% {
    opacity: 0.6;
  }
}
@keyframes fall {
  from {
    transform: translate(0, 0) rotate(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  to {
    transform: translate(-40px, 150px) rotate(360deg);
    opacity: 0;
  }
}
@keyframes firefly {
  0%,
  100% {
    transform: translate(0, 0);
    opacity: 0.2;
  }
  50% {
    transform: translate(10px, -14px);
    opacity: 1;
  }
}
@keyframes twinkle {
  0%,
  100% {
    opacity: 0.25;
  }
  50% {
    opacity: 1;
  }
}
@keyframes wave {
  to {
    transform: translateX(40px);
  }
}
@keyframes sway {
  0%,
  100% {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(3deg);
  }
}
@keyframes smoke {
  from {
    transform: translate(0, 0) scale(0.6);
    opacity: 0.8;
  }
  to {
    transform: translate(12px, -40px) scale(1.6);
    opacity: 0;
  }
}
@keyframes rain {
  from {
    transform: translate(0, 0);
  }
  to {
    transform: translate(-20px, 130px);
  }
}
@keyframes firework {
  0% {
    transform: scale(0.1);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
  60%,
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.area-scene--still * {
  animation: none !important;
}
@media (prefers-reduced-motion: reduce) {
  .area-scene * {
    animation: none !important;
  }
}
</style>
