"""
用 Blender 依照字靈的 CreatureLook 部件程序化建出 3D 模型，算圖並匯出 GLB。

用法：
  node tools/blender/export_species.mjs            # 先從 species.ts 產生 species.json
  blender --background --factory-startup --python build_creatures.py -- <species.json> <輸出資料夾> [english ...]
    [--no-render] 只匯出 GLB   [--no-shiny] 不算色違圖   [--no-glb] 只算圖

每隻字靈輸出：<name>.webp（正面圖）、<name>_shiny.webp（色違正面圖）、<name>.glb（即時 3D）。

座標換算：SVG viewBox 0 0 120 120 的 1/40 為 Blender 的 1 單位，
SVG (x, y) → Blender (X=(x-60)/40, Z=(GROUND-y)/40)，-Y 是正面。
相機正好框住 viewBox，算出來的圖可以和 SVG 的光環、星星疊在一起。

材質名稱給遊戲用：body、feet、color、belly、accent 是跟著字靈顏色走的，
色違時由 three.js 換色（ui/creature/three/tint.ts）。
"""

import bpy
import bmesh
import json
import math
import os
import sys
from mathutils import Matrix, Vector

S = 1 / 40
GROUND = 106

# 和 ui/creature/geometry.ts 的 GEOMETRY 相同
GEOMETRY = {
    'round': {'top': 38, 'cy': 70, 'face': 64, 'rx': 34, 'belly': (82, 18, 14)},
    'bean': {'top': 48, 'cy': 74, 'face': 70, 'rx': 40, 'belly': (86, 22, 11)},
    'tall': {'top': 32, 'cy': 68, 'face': 58, 'rx': 27, 'belly': (84, 15, 17)},
    'drop': {'top': 44, 'cy': 72, 'face': 68, 'rx': 32, 'belly': (86, 20, 11)},
    'blob': {'top': 50, 'cy': 74, 'face': 70, 'rx': 38, 'belly': (86, 20, 9)},
}

# 身體最高點的 SVG y（drop 的尖頂比 GEOMETRY.top 高）
BODY_TOP = {'round': 36, 'bean': 46, 'tall': 30, 'drop': 28, 'blob': 43}

INK = '#1f2937'


# ---------- 小工具 ----------

def svg(x, y):
    return (x - 60) * S, (GROUND - y) * S


def P(x, y, Y=0.0):
    X, Z = svg(x, y)
    return Vector((X, Y, Z))


def parse_color(c):
    """#rrggbb 或 rgb(r, g, b) → 線性 RGB；已經是線性 RGB 的 tuple 原樣傳回"""
    if not isinstance(c, str):
        return tuple(c)
    c = c.strip()
    if c.startswith('#'):
        rgb = [int(c[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    else:
        rgb = [float(v) / 255 for v in c[c.index('(') + 1:c.index(')')].split(',')[:3]]
    return tuple(v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in rgb)


def darken(c, amount=0.35):
    return tuple(v * (1 - amount) ** 2.2 for v in parse_color(c))


def mix(a, b, t):
    a, b = parse_color(a), parse_color(b)
    return tuple(x * (1 - t) + y * t for x, y in zip(a, b))


def smoothstep(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)


def rot_y(deg):
    """SVG 的 rotate(deg)（畫面上順時針為正）換成繞 Blender Y 軸的旋轉"""
    return Matrix.Rotation(math.radians(deg), 3, 'Y')


def link(obj):
    bpy.context.scene.collection.objects.link(obj)
    return obj


_mats = {}


def material(name, color, rough=0.5, emission=0.0, transmission=0.0, coat=0.0, vertex_color=False, surface=None):
    color = parse_color(color)
    key = (name, tuple(round(v, 4) for v in color), rough, emission, transmission, coat, vertex_color, surface)
    if key in _mats:
        return _mats[key]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Roughness'].default_value = rough
    if coat:
        bsdf.inputs['Coat Weight'].default_value = coat
    if emission:
        bsdf.inputs['Emission Color'].default_value = (*color, 1)
        bsdf.inputs['Emission Strength'].default_value = emission
    if transmission:
        bsdf.inputs['Transmission Weight'].default_value = transmission
        bsdf.inputs['IOR'].default_value = 1.15
    if vertex_color:
        attr = m.node_tree.nodes.new('ShaderNodeVertexColor')
        attr.layer_name = 'Col'
        m.node_tree.links.new(attr.outputs['Color'], bsdf.inputs['Base Color'])
    apply_surface(m, surface)
    _mats[key] = m
    return m


ASSETS = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets')

# 表面質感：貼圖來自 Poly Haven（CC0），見 assets/README.md
SURFACES = {
    'charcoal': {'tex': 'rock_surface', 'scale': (10, 2.5), 'normal': 1.2, 'rough': (0.55, 0.95)},
    'stone': {'tex': 'rock_surface', 'scale': (6, 1.5), 'normal': 1.6, 'rough': (0.6, 0.95)},
    'fleece': {'tex': 'polar_fleece', 'scale': (6, 1.5), 'normal': 2.5, 'rough': (0.75, 1.0)},
    'jelly': {},
}


def texture(nt, fname, scale):
    img = bpy.data.images.load(os.path.join(ASSETS, fname), check_existing=True)
    img.colorspace_settings.name = 'Non-Color'
    node = nt.nodes.new('ShaderNodeTexImage')
    node.image = img
    coord = nt.nodes.new('ShaderNodeTexCoord')
    mapping = nt.nodes.new('ShaderNodeMapping')
    mapping.inputs['Scale'].default_value = (*scale, 1)
    nt.links.new(coord.outputs['UV'], mapping.inputs['Vector'])
    nt.links.new(mapping.outputs['Vector'], node.inputs['Vector'])
    return node


def apply_surface(m, surface):
    """在 Principled BSDF 上加表面細節；貼圖部分會跟著 glTF 匯出，程序化部分只影響算圖"""
    if not surface:
        return
    nt = m.node_tree
    bsdf = nt.nodes['Principled BSDF']
    L = nt.links.new
    cfg = SURFACES[surface]
    if 'tex' in cfg:
        nor = texture(nt, f"{cfg['tex']}_nor_gl_1k.jpg", cfg['scale'])
        nmap = nt.nodes.new('ShaderNodeNormalMap')
        nmap.inputs['Strength'].default_value = cfg['normal']
        L(nor.outputs['Color'], nmap.inputs['Color'])
        L(nmap.outputs['Normal'], bsdf.inputs['Normal'])
        rough = texture(nt, f"{cfg['tex']}_rough_1k.jpg", cfg['scale'])
        rng = nt.nodes.new('ShaderNodeMapRange')
        rng.inputs['To Min'].default_value, rng.inputs['To Max'].default_value = cfg['rough']
        L(rough.outputs['Color'], rng.inputs['Value'])
        L(rng.outputs['Result'], bsdf.inputs['Roughness'])
        bsdf.inputs['Coat Weight'].default_value = 0
    if surface == 'charcoal':
        # 零星發紅光的裂縫
        coord = nt.nodes.new('ShaderNodeTexCoord')
        vor = nt.nodes.new('ShaderNodeTexVoronoi')
        vor.feature = 'DISTANCE_TO_EDGE'
        vor.inputs['Scale'].default_value = 4.5
        L(coord.outputs['Object'], vor.inputs['Vector'])
        edge = nt.nodes.new('ShaderNodeMapRange')
        edge.inputs['From Min'].default_value, edge.inputs['From Max'].default_value = 0.0, 0.018
        edge.inputs['To Min'].default_value, edge.inputs['To Max'].default_value = 1.0, 0.0
        L(vor.outputs['Distance'], edge.inputs['Value'])
        noise = nt.nodes.new('ShaderNodeTexNoise')
        noise.inputs['Scale'].default_value = 1.6
        L(coord.outputs['Object'], noise.inputs['Vector'])
        patch = nt.nodes.new('ShaderNodeMapRange')
        patch.inputs['From Min'].default_value, patch.inputs['From Max'].default_value = 0.56, 0.66
        L(noise.outputs['Fac'], patch.inputs['Value'])
        mul = nt.nodes.new('ShaderNodeMath')
        mul.operation = 'MULTIPLY'
        L(edge.outputs['Result'], mul.inputs[0])
        L(patch.outputs['Result'], mul.inputs[1])
        amp = nt.nodes.new('ShaderNodeMath')
        amp.operation = 'MULTIPLY'
        amp.inputs[1].default_value = 3
        L(mul.outputs[0], amp.inputs[0])
        bsdf.inputs['Emission Color'].default_value = (*parse_color('#fb923c'), 1)
        L(amp.outputs[0], bsdf.inputs['Emission Strength'])
    elif surface == 'fleece':
        bsdf.inputs['Sheen Weight'].default_value = 1.0
        bsdf.inputs['Sheen Roughness'].default_value = 0.3
        bsdf.inputs['Sheen Tint'].default_value = (1, 1, 1, 1)
    elif surface == 'jelly':
        bsdf.inputs['Roughness'].default_value = 0.08
        bsdf.inputs['Coat Weight'].default_value = 0.7
        bsdf.inputs['Coat Roughness'].default_value = 0.02
        bsdf.inputs['Subsurface Weight'].default_value = 0.45
        bsdf.inputs['Subsurface Radius'].default_value = (0.4, 0.8, 1.0)
        bsdf.inputs['Subsurface Scale'].default_value = 0.25
        # 果凍表面輕微起伏
        coord = nt.nodes.new('ShaderNodeTexCoord')
        noise = nt.nodes.new('ShaderNodeTexNoise')
        noise.inputs['Scale'].default_value = 2.5
        L(coord.outputs['Object'], noise.inputs['Vector'])
        bump = nt.nodes.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = 0.08
        L(noise.outputs['Fac'], bump.inputs['Height'])
        L(bump.outputs['Normal'], bsdf.inputs['Normal'])


def outline_material(color):
    m = bpy.data.materials.new('outline')
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    em = nt.nodes.new('ShaderNodeEmission')
    em.inputs['Color'].default_value = (*color, 1)
    # Cycles 不吃材質的背面剔除：背面與陰影光線改成透明
    geo = nt.nodes.new('ShaderNodeNewGeometry')
    lp = nt.nodes.new('ShaderNodeLightPath')
    hide = nt.nodes.new('ShaderNodeMath')
    hide.operation = 'MAXIMUM'
    nt.links.new(geo.outputs['Backfacing'], hide.inputs[0])
    nt.links.new(lp.outputs['Is Shadow Ray'], hide.inputs[1])
    clear = nt.nodes.new('ShaderNodeBsdfTransparent')
    mixer = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(hide.outputs[0], mixer.inputs['Fac'])
    nt.links.new(em.outputs[0], mixer.inputs[1])
    nt.links.new(clear.outputs[0], mixer.inputs[2])
    nt.links.new(mixer.outputs[0], out.inputs[0])
    m.use_backface_culling = True
    return m


def add_outline(obj, color, thickness=0.022):
    """反轉外殼描邊（glTF 匯出為單面材質，three.js 也能顯示）"""
    obj.data.materials.append(outline_material(parse_color(color)))
    mod = obj.modifiers.new('outline', 'SOLIDIFY')
    mod.thickness = thickness
    mod.offset = 1
    mod.use_flip_normals = True
    mod.use_rim = False
    mod.material_offset = len(obj.data.materials) - 1
    return obj


def outlined(obj, color, thickness=0.018):
    return add_outline(obj, darken(color, 0.6), thickness)


def mesh_from_bm(name, bm, mat):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.shade_smooth()
    me.materials.append(mat)
    return link(bpy.data.objects.new(name, me))


def ellipsoid(name, center, radii, mat, rot=None, segs=40):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=segs // 2, radius=1, calc_uvs=True)
    for v in bm.verts:
        v.co = Vector((v.co.x * radii[0], v.co.y * radii[1], v.co.z * radii[2]))
        if rot is not None:
            v.co = rot @ v.co
        v.co += Vector(center)
    return mesh_from_bm(name, bm, mat)


def sphere(name, center, r, mat, segs=32):
    return ellipsoid(name, center, (r, r, r), mat, segs=segs)


def lathe(name, profile, mat, center=(0, 0, 0), depth=1.0, segs=48, rot=None):
    """profile：由下到上的 (半徑, 高度)，頭尾半徑為 0"""
    bm = bmesh.new()
    rings = []
    for r, z in profile:
        if r < 1e-6:
            rings.append([bm.verts.new((0, 0, z))])
        else:
            rings.append([
                bm.verts.new((r * math.cos(a), r * math.sin(a) * depth, z))
                for a in (2 * math.pi * i / segs for i in range(segs))
            ])
    # 圓柱展開的 UV：u 繞一圈 0..1，v 依剖面弧長 0..1；不重疊才能烘焙，重複貼圖交給 Mapping 的縮放
    arc = [0.0]
    for (r0, z0), (r1, z1) in zip(profile, profile[1:]):
        arc.append(arc[-1] + math.hypot(r1 - r0, z1 - z0))
    vs = [s / arc[-1] for s in arc]
    uv = bm.loops.layers.uv.new('UVMap')
    for k, (a, b) in enumerate(zip(rings, rings[1:])):
        for i in range(segs):
            j = (i + 1) % segs
            u0, u1 = i / segs, (i + 1) / segs
            if len(a) == 1:
                f = bm.faces.new((a[0], b[i], b[j]))
                uvs = [((u0 + u1) / 2, vs[k]), (u0, vs[k + 1]), (u1, vs[k + 1])]
            elif len(b) == 1:
                f = bm.faces.new((a[i], a[j], b[0]))
                uvs = [(u0, vs[k]), (u1, vs[k]), ((u0 + u1) / 2, vs[k + 1])]
            else:
                f = bm.faces.new((a[i], a[j], b[j], b[i]))
                uvs = [(u0, vs[k]), (u1, vs[k]), (u1, vs[k + 1]), (u0, vs[k + 1])]
            for loop, c in zip(f.loops, uvs):
                loop[uv].uv = c
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for v in bm.verts:
        if rot is not None:
            v.co = rot @ v.co
        v.co += Vector(center)
    return mesh_from_bm(name, bm, mat)


def cone(name, base, tip, radius, mat):
    """圓頭的角錐，從 base 指向 tip"""
    d = Vector(tip) - Vector(base)
    h = d.length
    prof = [(0, 0), (radius, 0), (radius * 0.95, h * 0.2), (radius * 0.75, h * 0.45),
            (radius * 0.45, h * 0.7), (radius * 0.18, h * 0.9), (radius * 0.06, h * 0.98), (0, h)]
    rot = d.normalized().to_track_quat('Z', 'Y').to_matrix()
    return lathe(name, prof, mat, center=base, segs=24, rot=rot)


def tube(name, pts, radius, mat, closed=False, sides=12):
    """沿著折線掃出圓管，開放的兩端是半球"""
    pts = [Vector(p) for p in pts]
    n = len(pts)
    bm = bmesh.new()

    def tangent(i):
        if closed:
            a, b = pts[(i - 1) % n], pts[(i + 1) % n]
        else:
            a, b = pts[max(i - 1, 0)], pts[min(i + 1, n - 1)]
        return (b - a).normalized()

    t0 = tangent(0)
    ref = Vector((0, 0, 1)) if abs(t0.z) < 0.9 else Vector((1, 0, 0))
    nrm = t0.cross(ref).normalized()
    frames = []
    for i in range(n):
        t = tangent(i)
        nrm = (nrm - t * nrm.dot(t)).normalized()
        frames.append((t, nrm, t.cross(nrm)))

    def ring(c, nv, bv, r):
        return [bm.verts.new(c + r * (math.cos(a) * nv + math.sin(a) * bv))
                for a in (2 * math.pi * k / sides for k in range(sides))]

    def bridge(A, B):
        for k in range(sides):
            bm.faces.new((A[k], A[(k + 1) % sides], B[(k + 1) % sides], B[k]))

    rings = [ring(p, f[1], f[2], radius) for p, f in zip(pts, frames)]
    for i in range(n if closed else n - 1):
        bridge(rings[i], rings[(i + 1) % n])
    if not closed:
        for end, (t, nv, bv), rg, sgn in ((pts[0], frames[0], rings[0], -1), (pts[-1], frames[-1], rings[-1], 1)):
            prev = rg
            for j in (1, 2, 3):
                phi = j * math.pi / 8
                cur = ring(end + t * sgn * radius * math.sin(phi), nv, bv, radius * math.cos(phi))
                bridge(prev, cur) if sgn > 0 else bridge(cur, prev)
                prev = cur
            tip = bm.verts.new(end + t * sgn * radius)
            for k in range(sides):
                a, b = prev[k], prev[(k + 1) % sides]
                bm.faces.new((a, b, tip) if sgn > 0 else (b, a, tip))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return mesh_from_bm(name, bm, mat)


def prism(name, pts, thick, mat, loc=(0, 0, 0), rot=None, bevel=0.35, wrap=None):
    """XZ 平面上的多邊形（Blender 單位，相對 loc）沿 Y 給厚度、倒圓角。
    wrap=(R, depth)：把平面繞 Z 軸彎成半徑 R 的弧面（貼著頭的頭冠）"""
    bm = bmesh.new()
    f = bm.faces.new([bm.verts.new((x, -thick / 2, z)) for x, z in pts])
    geom = bmesh.ops.extrude_face_region(bm, geom=[f])['geom']
    bmesh.ops.translate(bm, vec=(0, thick, 0), verts=[v for v in geom if isinstance(v, bmesh.types.BMVert)])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    if wrap:
        # 先細分，彎曲時才圓滑
        bmesh.ops.subdivide_edges(bm, edges=[e for e in bm.edges if abs(e.verts[0].co.y - e.verts[1].co.y) < 1e-6],
                                  cuts=6, use_grid_fill=False)
    for v in bm.verts:
        if wrap:
            R, depth = wrap
            r = R - v.co.y
            a = v.co.x / R
            v.co = Vector((r * math.sin(a), -r * math.cos(a) * depth, v.co.z))
        if rot is not None:
            v.co = rot @ v.co
        v.co += Vector(loc)
    obj = mesh_from_bm(name, bm, mat)
    mod = obj.modifiers.new('bevel', 'BEVEL')
    mod.width = thick * bevel
    mod.segments = 3
    mod.limit_method = 'ANGLE'
    mod.harden_normals = True
    return obj


def svg_poly(pts, cx, cy):
    """SVG 多邊形換成以 (cx, cy) 為原點的 Blender XZ 座標"""
    return [((x - cx) * S, (cy - y) * S) for x, y in pts]


def star_points(r, cx=0.0, cy=0.0):
    pts = []
    for i in range(10):
        a = math.pi / 5 * i - math.pi / 2
        rr = r if i % 2 == 0 else r * 0.45
        pts.append((cx + math.cos(a) * rr, cy + math.sin(a) * rr))
    return pts


def bezier(p0, p1, p2, p3, n):
    pts = []
    for k in range(n + 1):
        t = k / n
        u = 1 - t
        pts.append(tuple(
            u ** 3 * a + 3 * u * u * t * b + 3 * u * t * t * c + t ** 3 * d
            for a, b, c, d in zip(p0, p1, p2, p3)
        ))
    return pts


def quad(p0, p1, p2, n=12):
    return [
        tuple((1 - t) ** 2 * a + 2 * (1 - t) * t * b + t * t * c for a, b, c in zip(p0, p1, p2))
        for t in (k / n for k in range(n + 1))
    ]


def arc_points(p0, p1, r, large, sweep, n=24):
    """SVG 的圓弧指令（rx = ry、不旋轉）換成點"""
    (x1, y1), (x2, y2) = p0, p1
    dx, dy = (x1 - x2) / 2, (y1 - y2) / 2
    d2 = dx * dx + dy * dy
    r = max(r, math.sqrt(d2))
    coef = math.sqrt(max(0.0, (r * r - d2) / d2))
    if large == sweep:
        coef = -coef
    cx, cy = coef * dy + (x1 + x2) / 2, -coef * dx + (y1 + y2) / 2
    a1 = math.atan2(y1 - cy, x1 - cx)
    da = math.atan2(y2 - cy, x2 - cx) - a1
    if sweep and da < 0:
        da += 2 * math.pi
    if not sweep and da > 0:
        da -= 2 * math.pi
    return [(cx + r * math.cos(a1 + da * k / n), cy + r * math.sin(a1 + da * k / n)) for k in range(n + 1)]


# ---------- 身體 ----------

BODY_SHAPE = {
    'round': (34, 34, 0.9),
    'tall': (27, 38, 0.85),
    'bean': (40, 28, 0.8),
}


def body_profile(kind):
    g = GEOMETRY[kind]
    if kind == 'drop':
        # 下半是橢圓（中心 y=78, rx 34, ry 28），上半是 SVG 的貝茲曲線收成尖頂
        prof = []
        for k in range(33):
            a = -math.pi / 2 + (math.pi / 2) * k / 32
            prof.append((34 * math.cos(a) * S, (GROUND - (78 - 28 * math.sin(a))) * S))
        for x, y in bezier((34, 78), (34, 62), (18, 48), (0, 28), 48)[1:]:
            prof.append((x * S, (GROUND - y) * S))
        prof[0] = (0, prof[0][1])
        return prof, 0.85
    rx, ry, depth = BODY_SHAPE[kind]
    cy = g['cy']
    prof = []
    for k in range(65):
        a = -math.pi / 2 + math.pi * k / 64
        prof.append((rx * math.cos(a) * S, (GROUND - cy + ry * math.sin(a)) * S))
    prof[0] = (0, prof[0][1])
    prof[-1] = (0, prof[-1][1])
    return prof, depth


# blob 是幾團橢球平滑融合的雲狀身體：(x, y, rx, ry, 前後半徑)，對照 CreatureSvg.vue 的 path
BLOB_LOBES = [
    (60, 82, 34, 14, 22),
    (27, 85, 13, 11, 13),
    (41, 63, 13, 12, 13),
    (70, 58, 16, 14, 16),
    (93, 72, 13, 12, 13),
    (88, 90, 9, 7, 10),
    (60, 70, 22, 18, 22),
]


def blob_field(p):
    """平滑聯集的距離場（Blender 單位）"""
    k = 0.18
    d = None
    for x, y, rx, ry, rz in BLOB_LOBES:
        c = P(x, y)
        q = p - c
        e = Vector((q.x / (rx * S), q.y / (rz * S), q.z / (ry * S)))
        di = (e.length - 1) * min(rx, ry, rz) * S
        if d is None:
            d = di
        else:
            h = max(k - abs(d - di), 0) / k
            d = min(d, di) - h * h * k * 0.25
    return d


def build_blob(mat):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=128, v_segments=64, radius=1, calc_uvs=True)
    center = P(60, 74)
    # 極點轉到左右兩側，避免頭頂和正面出現極點的皺褶
    turn = Matrix.Rotation(math.pi / 2, 3, 'Y')
    for v in bm.verts:
        d = (turn @ v.co).normalized()
        lo, hi = 0.0, 3.0
        for _ in range(28):
            mid = (lo + hi) / 2
            if blob_field(center + d * mid) < 0:
                lo = mid
            else:
                hi = mid
        v.co = center + d * lo
    return mesh_from_bm('body', bm, mat)


def build_body(look):
    kind = look['body']
    mat = material('body', look['color'], rough=0.55, coat=0.15, vertex_color=True, surface=look.get('surface'))
    if kind == 'blob':
        body = build_blob(mat)
    else:
        prof, depth = body_profile(kind)
        body = lathe('body', prof, mat, depth=depth, segs=128)
    paint_belly(body, look)
    return body


def paint_belly(body, look):
    """用頂點色畫肚子，邊緣柔和漸變（glTF 會匯出成 COLOR_0）"""
    cy, rx, ry = GEOMETRY[look['body']]['belly']
    base = parse_color(look['color'])
    belly = parse_color(look['belly'])
    me = body.data
    attr = me.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
    for v in me.vertices:
        sx = 60 + v.co.x / S
        sy = GROUND - v.co.z / S
        e = ((sx - 60) / rx) ** 2 + ((sy - cy) / ry) ** 2
        t = smoothstep(1.2, 0.8, e) * smoothstep(0.05, 0.45, -v.normal.y)
        attr.data[v.index].color = (*[a * (1 - t) + b * t for a, b in zip(base, belly)], 1)


# ---------- 貼在表面上的五官與花紋 ----------

class Surface:
    def __init__(self, obj):
        self.obj = obj

    def ray(self, origin, direction):
        ok, loc, normal, _ = self.obj.ray_cast(Vector(origin), Vector(direction))
        if not ok:
            return None
        return loc, normal.normalized()

    def hit(self, x, y):
        """從正面打到 SVG (x, y) 的位置"""
        X, Z = svg(x, y)
        return self.ray((X, -5, Z), (0, 1, 0))

    def around(self, angle, z):
        """從側面繞一圈打：angle 0 是右邊、-90 是正面"""
        d = Vector((math.cos(math.radians(angle)), math.sin(math.radians(angle)), 0))
        return self.ray(d * 5 + Vector((0, 0, z)), -d)

    def patch(self, name, x, y, rx, ry, thick, mat, lift=0.0, angle=0.0):
        """貼在表面、順著法線方向壓扁的橢圓片"""
        h = self.hit(x, y)
        if h is None:
            return None
        loc, n = h
        rot = n.to_track_quat('-Y', 'Z').to_matrix() @ rot_y(angle)
        return ellipsoid(name, loc + n * lift, (rx * S, thick, ry * S), mat, rot=rot, segs=32)

    def stroke(self, name, pts, width, mat, lift=0.004, closed=False):
        pos = []
        for x, y in pts:
            h = self.hit(x, y)
            if h:
                pos.append(h[0] + h[1] * lift)
        if len(pos) < 2:
            return None
        return tube(name, pos, width / 2 * S, mat, closed=closed, sides=10)

    def ring(self, name, y_at, radius, mat, lift=None):
        """繞身體一圈的帶子；y_at(s) 給 SVG y，s 是正面程度 0..1"""
        pos = []
        lift = radius * 0.6 if lift is None else lift
        for k in range(72):
            a = 360 * k / 72
            s = max(0.0, -math.sin(math.radians(a)))
            h = self.around(a, (GROUND - y_at(s)) * S)
            if h:
                pos.append(h[0] + h[1] * lift)
        return tube(name, pos, radius, mat, closed=True)


def build_face(surf, look):
    g = GEOMETRY[look['body']]
    f = g['face']
    ink = material('ink', INK, rough=0.25)
    white = material('white', '#ffffff', rough=0.3)
    for x in (48, 72):
        if look['eyes'] == 'dot':
            surf.patch('eye', x, f, 4.5, 4.5, 0.05, ink, lift=0.01)
            surf.patch('eye_hl', x + 1.5, f - 1.5, 1.4, 1.4, 0.02, white, lift=0.055)
        elif look['eyes'] == 'big':
            surf.patch('eye_white', x, f, 7.5, 7.5, 0.06, white, lift=0.0)
            surf.patch('eye_pupil', x + 1, f + 1, 4.5, 4.5, 0.03, ink, lift=0.045)
            surf.patch('eye_hl', x + 2.5, f - 1, 1.6, 1.6, 0.015, white, lift=0.075)
        elif look['eyes'] == 'sleepy':
            surf.stroke('eye', quad((x - 5, f), (x, f + 4), (x + 5, f)), 2.5, ink)
        else:
            surf.stroke('eye', quad((x - 5, f + 2), (x, f - 5), (x + 5, f + 2)), 2.5, ink)

    if look.get('cheeks'):
        cheek = material('cheek', mix(look['color'], '#fb7185', 0.6), rough=0.6)
        for x in (39, 81):
            surf.patch('cheek', x, f + 8, 5, 3, 0.02, cheek, lift=0.0)

    m = look['mouth']
    if m == 'smile':
        surf.stroke('mouth', quad((54, f + 10), (60, f + 16), (66, f + 10)), 2.5, ink)
    elif m == 'open':
        surf.patch('mouth', 60, f + 12, 5, 4.5, 0.03, material('mouth', '#7f1d1d', rough=0.4))
        surf.patch('tongue', 60, f + 14, 3, 2, 0.02, material('tongue', '#fb7185', rough=0.4), lift=0.02)
    elif m == 'cat':
        surf.stroke(
            'mouth',
            quad((53, f + 10), (56.5, f + 14), (60, f + 10), 8) + quad((60, f + 10), (63.5, f + 14), (67, f + 10), 8)[1:],
            2.2,
            ink,
        )
    else:
        surf.patch('mouth', 60, f + 11, 2, 2, 0.02, ink)


# ---------- 部件（對照 CreatureBackParts.vue、CreatureFrontParts.vue） ----------

class Ctx:
    """部件共用的資料：外觀、幾何、身體表面、常用材質"""

    def __init__(self, look, body):
        self.look = look
        self.g = GEOMETRY[look['body']]
        self.surf = Surface(body)
        self.accent_color = parse_color(look['accent']) if look.get('accent') else darken(look['color'])
        self.surface = look.get('surface')

    def accent(self, rough=0.45, emission=0.0):
        return material('accent', self.accent_color, rough=rough, coat=0.25, emission=emission)

    def color(self):
        return material('color', self.look['color'], rough=0.55, coat=0.15, surface=self.surface)

    def belly(self):
        return material('belly', self.look['belly'], rough=0.6)

    def stalk(self):
        return material('stalk', darken(self.look['color'], 0.55), rough=0.5)

    def body_radius(self, y):
        """身體在 SVG 高度 y 的左右半徑（Blender 單位）"""
        h = self.surf.around(0, (GROUND - y) * S)
        return h[0].x if h else self.g['rx'] * S


def dome(name, rim_y, apex_y, R, mat, depth=0.95):
    """帽子、頭盔：底部半徑 R、頂點在 apex_y 的半橢球"""
    zr = (GROUND - rim_y) * S
    H = (rim_y - apex_y) * S
    prof = [(0, zr - 3 * S), (R * 0.9, zr - 1.5 * S), (R, zr)]
    for k in range(1, 25):
        a = math.pi / 2 * k / 24
        prof.append((R * math.cos(a) if k < 24 else 0, zr + H * math.sin(a)))
    return lathe(name, prof, mat, depth=depth, segs=64)


def flame_profile(height, width, n=24):
    """下圓上尖的火焰剖面"""
    raw = [(math.sqrt(t) * (1 - t) ** 1.3, t) for t in (k / n for k in range(n + 1))]
    peak = max(r for r, _ in raw)
    return [(r / peak * width, t * height) for r, t in raw]


def part_flame(c):
    top = c.g['top']
    X, Z = svg(60, top + 8)
    outer = material('flame', '#f97316', rough=0.4, emission=1.2)
    inner = material('flame_core', '#fde047', rough=0.4, emission=2.0)
    o = lathe('flame', flame_profile(32 * S, 14 * S), outer, center=(X, 0, Z), depth=0.8)
    add_outline(o, darken('#f97316', 0.6))
    X2, Z2 = svg(60, top + 5)
    lathe('flame_core', flame_profile(17 * S, 6.5 * S), inner, center=(X2, -0.2, Z2), depth=0.8)


def part_bubbles(c):
    top = c.g['top']
    glass = material('bubble', '#e0f2fe', rough=0.05, transmission=0.85)
    shine = material('bubble_hl', '#ffffff', rough=0.2, emission=0.5)
    for x, y, r in ((36, top - 6, 7), (76, top - 18, 5), (90, top - 2, 3.5)):
        X, Z = svg(x, y)
        sphere('bubble', (X, 0.05, Z), r * S, glass)
        hr = r * S * 0.28
        ellipsoid('bubble_hl', (X + r * S * 0.35, 0.05 - r * S * 0.75, Z + r * S * 0.4), (hr, hr * 0.5, hr), shine, segs=12)


def part_leaf_ears(c):
    top = c.g['top']
    leaf = material('leaf', '#4ade80', rough=0.5, coat=0.2)
    vein = material('vein', '#16a34a', rough=0.5)
    for x, ang in ((46, -18), (74, 18)):
        X, Z = svg(x, top - 6)
        rot = rot_y(ang) @ Matrix.Rotation(math.radians(-12), 3, 'X')
        ear = ellipsoid('leaf_ear', (X, 0.12, Z), (7 * S, 2.5 * S, 18 * S), leaf, rot=rot)
        outlined(ear, '#4ade80')
        a = rot @ Vector((0, -2.3 * S, -12 * S)) + Vector((X, 0.12, Z))
        b = rot @ Vector((0, -2.3 * S, 14 * S)) + Vector((X, 0.12, Z))
        tube('vein', [a, (a + b) / 2, b], 0.6 * S, vein, sides=8)


def part_sprout(c):
    t = c.g['top']
    stem = material('stem', '#15803d', rough=0.5)
    leaf = material('leaf', '#4ade80', rough=0.5, coat=0.2)
    tube('stem', [P(60, t + 4), P(60, t - 4), P(60.5, t - 12)], 1.6 * S, stem)
    for x, ang in ((52, -25), (68, 25)):
        o = ellipsoid('sprout_leaf', P(x, t - 14), (9 * S, 2.2 * S, 5 * S), leaf, rot=rot_y(ang))
        outlined(o, '#4ade80', 0.014)


def part_bulb(c):
    cy = c.g['cy']
    tube('bulb_stalk', [P(x, y, 0.12) for x, y in quad((86, cy + 12), (104, cy + 8), (104, cy - 13))], 1.5 * S, c.stalk())
    o = sphere('bulb', P(104, cy - 20, 0.12), 7 * S, material('bulb', '#fde047', rough=0.3, emission=2.5))
    outlined(o, '#fde047', 0.014)


def part_cap(c):
    t = c.g['top']
    apex = min(t - 6, BODY_TOP[c.look['body']] - 4)
    cap = dome('cap', t + 18, apex, 40 * S, c.accent(rough=0.6))
    outlined(cap, c.accent_color, 0.022)
    spot = material('cap_spot', mix(c.accent_color, (1, 1, 1), 0.7), rough=0.6)
    s = Surface(cap)
    for x, y, r in ((44, t + 4, 4), (62, t - 4, 5), (78, t + 6, 3.5)):
        s.patch('cap_spot', x, y, r, r, 0.02, spot)


def part_helmet(c):
    t, rx = c.g['top'], c.g['rx']
    depth = BODY_SHAPE.get(c.look['body'], (0, 0, 0.9))[2]
    helmet = dome('helmet', t + 20, t - 4, max(rx - 1, 0) * S + 0.04, c.accent(rough=0.3), depth=depth + 0.04)
    outlined(helmet, c.accent_color, 0.022)
    Surface(helmet).stroke('visor', [(x, t + 14) for x in range(60 - rx + 9, 60 + rx - 8, 2)], 2, material('ink', INK, rough=0.25))
    plume = ellipsoid('plume', P(60, t - 12, 0.08), (3.5 * S, 11 * S, 9 * S), material('plume', '#dc2626', rough=0.6))
    outlined(plume, '#dc2626', 0.014)


def part_horns(c):
    t = c.g['top']
    for bx, tx in ((46, 44), (74, 76)):
        o = cone('horn', P(bx, t + 9, -0.02), P(tx, t - 8, 0.04), 5.5 * S, c.accent())
        outlined(o, c.accent_color, 0.014)


def part_ears(c):
    t = c.g['top']
    for x in (38, 82):
        o = ellipsoid('ear', P(x, t + 8, 0.05), (10 * S, 5 * S, 10 * S), c.color())
        outlined(o, c.look['color'])
        ellipsoid('ear_inner', P(x, t + 8, 0.05 - 4.3 * S), (5.5 * S, 1.2 * S, 5.5 * S), c.belly(), segs=24)


def part_patches(c):
    t, f = c.g['top'], c.g['face']
    for x in (38, 82):
        o = ellipsoid('patch_ear', P(x, t + 8, 0.05), (10 * S, 5 * S, 10 * S), c.accent(rough=0.8))
        outlined(o, c.accent_color)
    for x, ang in ((48, -25), (72, 25)):
        c.surf.patch('eye_patch', x, f, 8.5, 7.5, 0.03, c.accent(rough=0.8), angle=ang)


def part_shell(c):
    cy = c.g['cy']
    center = P(86, cy - 6, 0.42)
    shell = ellipsoid('shell', center, (16 * S, 19 * S, 20 * S), c.accent(rough=0.35), rot=Matrix.Rotation(math.radians(-25), 3, 'Z'))
    outlined(shell, c.accent_color)
    # 側面的螺旋紋：在 YZ 平面畫，再從右側投影到殼上
    s = Surface(shell)
    pos = []
    for k in range(40):
        u = k / 39
        r = 13 * (1 - 0.8 * u) * S
        a = math.pi + u * 3.4 * math.pi
        o = center + Vector((2, r * math.cos(a) - 0.05, r * math.sin(a)))
        h = s.ray(o, (-1, 0, 0))
        if h:
            pos.append(h[0] + h[1] * 0.006)
    if len(pos) > 1:
        tube('shell_line', pos, 1.2 * S, material('shell_line', darken(c.accent_color, 0.45), rough=0.5), sides=8)


def part_star(c):
    h = c.surf.hit(60, c.g['face'] - 16)
    if not h:
        return
    loc, n = h
    rot = n.to_track_quat('-Y', 'Z').to_matrix()
    o = prism('star', star_points(8 * S), 3 * S, c.accent(rough=0.3, emission=0.4), loc=loc + n * 0.02, rot=rot)
    outlined(o, c.accent_color, 0.012)


def part_wings(c):
    cy = c.g['cy']
    for x, a, side in ((24, -30, -1), (96, 30, 1)):
        rot = Matrix.Rotation(math.radians(side * 25), 3, 'Z') @ rot_y(a)
        o = ellipsoid('wing', P(x, cy, 0.25), (14 * S, 3 * S, 8 * S), c.accent(rough=0.35), rot=rot)
        outlined(o, c.accent_color)


def part_moss(c):
    t = c.g['top']
    moss = material('moss', '#4ade80', rough=0.9, surface='fleece')
    for x, dy, r in ((42, 8, 6), (53, 3, 7), (67, 3, 7), (78, 8, 6)):
        o = ellipsoid('moss', P(x, t + dy, -0.05), (r * S, r * S * 0.9, r * S * 0.85), moss)
        outlined(o, '#4ade80', 0.014)


def part_flower(c):
    """頭上開一朵花（花花 Bloom）：莖、5 片花瓣圍著花心，和 CreatureFrontParts 的 flower 相同位置"""
    t = c.g['top']
    stem = material('stem', '#15803d', rough=0.5)
    petal = material('petal', '#f472b6', rough=0.45, coat=0.3)
    core = material('flower_core', '#fde047', rough=0.4, emission=0.4)
    tube('flower_stem', [P(60, t + 4, -0.05), P(60, t - 3, -0.05), P(60, t - 8, -0.05)], 1.6 * S, stem)
    for i in range(5):
        a = i / 5 * math.pi * 2 - math.pi / 2
        x, y = 60 + math.cos(a) * 6.5, t - 14 + math.sin(a) * 6.5
        o = ellipsoid('petal', P(x, y, -0.05), (5.5 * S, 2.4 * S, 5.5 * S), petal)
        outlined(o, '#f472b6', 0.014)
    o = sphere('flower_core', P(60, t - 14, -0.05 - 1.6 * S), 4 * S, core)
    outlined(o, '#fde047', 0.014)


def part_antenna(c):
    t = c.g['top']
    for sx, cx, ex in ((52, 48, 42), (68, 72, 78)):
        tube('antenna', [P(x, y) for x, y in quad((sx, t + 4), (cx, t - 8), (ex, t - 14))], 1.25 * S, c.stalk(), sides=8)
        o = sphere('antenna_tip', P(ex, t - 14), 3.5 * S, c.accent(rough=0.3), segs=24)
        outlined(o, c.accent_color, 0.012)


def part_fins(c):
    cy = c.g['cy']
    for pts, side in (([(30, cy + 6), (12, cy - 4), (16, cy + 16)], -1), ([(90, cy + 6), (108, cy - 4), (104, cy + 16)], 1)):
        cx = sum(p[0] for p in pts) / 3
        cyy = sum(p[1] for p in pts) / 3
        o = prism('fin', svg_poly(pts, cx, cyy), 3 * S, c.accent(rough=0.35), loc=P(cx, cyy, 0.12),
                  rot=Matrix.Rotation(math.radians(side * 20), 3, 'Z'), bevel=0.45)
        outlined(o, c.accent_color, 0.014)


def part_crown(c):
    """身體後面一圈太陽光芒"""
    cy = c.g['cy']
    for i in range(12):
        a = i * math.pi / 6
        p0 = (60 + math.cos(a) * 40, cy + math.sin(a) * 40)
        p1 = (60 + math.cos(a) * 51, cy + math.sin(a) * 51)
        if p1[1] > GROUND - 4:
            continue
        o = cone('ray', P(*p0, 0.2), P(*p1, 0.2), 3.2 * S, c.accent(rough=0.35, emission=0.3))
        outlined(o, c.accent_color, 0.012)


def part_tail(c):
    x, cy = 60 + c.g['rx'], c.g['cy']
    pts = bezier((x - 6, cy + 16), (x + 14, cy + 18), (x + 18, cy - 4), (x + 8, cy - 12), 20)
    o = tube('tail', [P(px, py, 0.15 + 0.3 * k / 20) for k, (px, py) in enumerate(pts)], 3 * S, c.color())
    outlined(o, c.look['color'])


def part_handle(c):
    x, cy = 60 + c.g['rx'], c.g['cy']
    pts = bezier((x - 3, cy - 14), (x + 18, cy - 16), (x + 18, cy + 14), (x - 3, cy + 12), 20)
    o = tube('handle', [P(px, py) for px, py in pts], 3.5 * S, c.accent(rough=0.25))
    outlined(o, c.accent_color)


def part_clock(c):
    y = c.g['belly'][0] + 2
    c.surf.patch('clock_face', 60, y, 10, 10, 0.04, material('white', '#ffffff', rough=0.3))
    c.surf.stroke('clock_rim', [(60 + 10 * math.cos(a), y + 10 * math.sin(a))
                                for a in (2 * math.pi * k / 40 for k in range(40))], 2.5, c.accent(rough=0.3), lift=0.03, closed=True)
    ink = material('ink', INK, rough=0.25)
    c.surf.stroke('clock_hand', [(60, y), (60, y - 7)], 2.2, ink, lift=0.045)
    c.surf.stroke('clock_hand', [(60, y), (65, y)], 2.2, ink, lift=0.045)


SPOTS = [(40, 4), (82, -2), (46, 18), (78, 16), (62, 24), (58, 'top')]


def part_spots(c):
    for x, dy in SPOTS:
        y = c.g['top'] + 10 if dy == 'top' else c.g['cy'] + dy
        c.surf.patch('spot', x, y, 3.5, 3.5, 0.025, c.accent(rough=0.6))


def part_cherry(c):
    t = c.g['top']
    tube('cherry_stem', [P(x, y) for x, y in quad((60, t - 4), (62, t - 16), (70, t - 20))], 1.25 * S,
         material('stem', '#15803d', rough=0.5), sides=8)
    o = sphere('cherry', P(60, t - 2), 7 * S, material('cherry', '#ef4444', rough=0.2, coat=0.6))
    outlined(o, '#ef4444', 0.014)


def part_brows(c):
    f = c.g['face']
    ink = material('ink', INK, rough=0.25)
    c.surf.stroke('brow', [(42, f - 11), (48, f - 9), (54, f - 7)], 3, ink, lift=0.01)
    c.surf.stroke('brow', [(78, f - 11), (72, f - 9), (66, f - 7)], 3, ink, lift=0.01)


def part_tiara(c):
    t = c.g['top']
    pts = [(44, t + 6), (44, t - 10), (52, t - 1), (60, t - 14), (68, t - 1), (76, t - 10), (76, t + 6)]
    depth = BODY_SHAPE.get(c.look['body'], (0, 0, 0.9))[2]
    R = c.body_radius(t + 6) * 0.95
    o = prism('tiara', svg_poly(pts, 60, t + 6), 3 * S, c.accent(rough=0.25), loc=(0, 0, (GROUND - t - 6) * S),
              wrap=(R, depth), bevel=0.3)
    outlined(o, c.accent_color, 0.012)
    sphere('tiara_gem', (0, -R * depth - 2 * S, (GROUND - t - 1) * S), 2.8 * S, material('gem', '#ffffff', rough=0.1, coat=1.0), segs=20)


def part_bow(c):
    t = c.g['top']
    for x, ang in ((50, -20), (70, 20)):
        o = ellipsoid('bow', P(x, t - 2, -0.05), (10 * S, 4 * S, 6 * S), c.accent(rough=0.4), rot=rot_y(ang))
        outlined(o, c.accent_color, 0.014)
    o = sphere('bow_knot', P(60, t - 1, -0.08), 4.5 * S, c.accent(rough=0.4), segs=24)
    outlined(o, c.accent_color, 0.014)


def part_cloud(c):
    t = c.g['top']
    cloud = material('cloud', '#f8fafc', rough=0.9, surface='fleece')
    for x, dy, r in ((48, -6, 9), (60, -12, 11), (72, -6, 9)):
        o = sphere('cloud', P(x, t + dy, 0.02), r * S, cloud)
        outlined(o, '#94a3b8', 0.016)


def part_spikes(c):
    t = c.g['top']
    for x, tip in ((38, -4), (52, -12), (68, -12), (82, -4)):
        X, _ = svg(x, 0)
        h = c.surf.ray((X, 0.22, 10), (0, 0, -1))
        if not h:
            continue
        base = h[0] - h[1] * 0.04
        length = (12 - tip) * S
        o = cone('spike', base, base + Vector((X * 0.25, 0.1, length)), 6 * S, c.accent(rough=0.4))
        outlined(o, c.accent_color, 0.014)


def part_swirl(c):
    cy, rx = c.g['cy'], c.g['rx']
    acc = c.accent(rough=0.35)
    for x0, y, ln in ((60 - rx - 16, cy - 4, 11), (60 - rx - 20, cy + 6, 14)):
        tube('wind', [P(x0, y, -0.1), P(x0 + ln, y, -0.1)], 1.5 * S, acc, sides=8)
    pts = []
    for k in range(30):
        u = k / 29
        r = 6 * (1 - 0.6 * u)
        a = math.pi + u * 3.2 * math.pi
        pts.append((80 + r * math.cos(a), cy + 10 + r * math.sin(a)))
    c.surf.stroke('swirl', pts, 3, acc)


def part_snowflake(c):
    t = c.g['top']
    ice = material('ice', '#38bdf8', rough=0.2, emission=0.3, coat=0.5)
    center = P(60, t - 12)
    for a in (0, 60, 120):
        d = Vector((math.cos(math.radians(a)), 0, math.sin(math.radians(a)))) * 9 * S
        tube('snowflake', [center - d, center, center + d], 1.25 * S, ice, sides=8)


def part_scarf(c):
    f = c.g['face']
    acc = c.accent(rough=0.8)
    o = c.surf.ring('scarf', lambda s: f + 20 + 4 * s, 3.5 * S, acc)
    if o:
        outlined(o, c.accent_color, 0.014)
    h = c.surf.hit(75, f + 30)
    if h:
        loc, n = h
        pts = [(70, f + 24), (74, f + 38), (81, f + 36), (78, f + 23)]
        o = prism('scarf_end', svg_poly(pts, 75, f + 30), 3 * S, acc, loc=loc + n * 0.08,
                  rot=n.to_track_quat('-Y', 'Z').to_matrix(), bevel=0.4)
        outlined(o, c.accent_color, 0.012)


def part_headband(c):
    t, rx = c.g['top'], c.g['rx']
    acc = c.accent(rough=0.7)
    o = c.surf.ring('headband', lambda s: t + 12 - 5 * s, 3 * S, acc)
    if o:
        outlined(o, c.accent_color, 0.014)
    start = P(60 + rx - 4, t + 12, 0.2)
    for d in (Vector((8 * S, 0.12, 6 * S)), Vector((9 * S, 0.18, -3 * S))):
        o = tube('headband_tail', [start, start + d * 0.5 + Vector((0, 0, 1 * S)), start + d], 2.6 * S, acc, sides=10)
        outlined(o, c.accent_color, 0.012)


def part_cape(c):
    cy, rx = c.g['cy'], c.g['rx']
    depth = BODY_SHAPE.get(c.look['body'], (0, 0, 0.85))[2]
    bm = bmesh.new()
    nu, nv = 24, 16
    grid = []
    for j in range(nv + 1):
        v = j / nv
        row = []
        for i in range(nu + 1):
            u = i / nu
            tx = (60 - rx + 6) + u * (2 * rx - 12)
            bx = (60 - rx - 10) + u * (2 * rx + 20)
            by = min(104 + 16 * u * (1 - u), GROUND - 1)
            x = tx + (bx - tx) * v
            y = (cy - 16) + (by - cy + 16) * v
            w = rx + 12 * v + 2
            dx = (x - 60) / w
            Y = 0.06 + depth * (rx + 4) * S * math.sqrt(max(0.0, 1 - dx * dx)) + 0.12 * v
            X, Z = svg(x, y)
            row.append(bm.verts.new((X, Y, Z)))
        grid.append(row)
    for j in range(nv):
        for i in range(nu):
            bm.faces.new((grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    o = mesh_from_bm('cape', bm, c.accent(rough=0.7))
    sol = o.modifiers.new('thick', 'SOLIDIFY')
    sol.thickness = 2 * S
    sol.offset = 0
    outlined(o, c.accent_color, 0.016)


RAINBOW = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6']


def part_rainbow(c):
    cy = c.g['cy']
    for i, col in enumerate(RAINBOW):
        r = 50 - i * 6
        pts = [P(60 + r * math.cos(a), cy - r * math.sin(a), 0.35) for a in (math.pi * k / 40 for k in range(41))]
        tube('rainbow', pts, 3 * S, material('rainbow', col, rough=0.4, emission=0.15))


def part_stripes(c):
    cy = c.g['cy']
    acc = c.accent(rough=0.6)
    for k in (-10, 2, 14):
        for side in (-1, 1):
            pts = []
            for j in range(13):
                u = j / 12
                y = (1 - u) ** 2 * (cy + k) + 2 * (1 - u) * u * (cy + k + 3) + u * u * (cy + k - 2)
                # 左邊從側後方繞到側前方；右邊鏡像
                a = (195 + u * 35) if side < 0 else (-15 - u * 35)
                h = c.surf.around(a, (GROUND - y) * S)
                if h:
                    pts.append(h[0] + h[1] * 0.004)
            if len(pts) > 1:
                tube('stripe', pts, 1.75 * S, acc, sides=10)


def part_halo(c):
    t = c.g['top']
    center = P(60, t - 18, 0.02)
    tilt = Matrix.Rotation(math.radians(12), 3, 'X')
    pts = [center + tilt @ Vector((15 * S * math.cos(a), 15 * S * math.sin(a) * 0.9, 0))
           for a in (2 * math.pi * k / 48 for k in range(48))]
    tube('halo', pts, 1.9 * S, c.accent(rough=0.2, emission=1.5), closed=True)


def part_crescent(c):
    t = c.g['top']
    a, b = (44, t - 20), (53, t - 6)
    outer = arc_points(a, b, 10, 1, 0)
    inner = arc_points(b, a, 8, 1, 1)
    pts = outer + inner[1:-1]
    o = prism('crescent', svg_poly(pts, 47, t - 13), 3 * S, c.accent(rough=0.3, emission=0.6), loc=P(47, t - 13), bevel=0.4)
    outlined(o, c.accent_color, 0.012)


PARTS = {
    'flame': part_flame,
    'sprout': part_sprout,
    'bubbles': part_bubbles,
    'bulb': part_bulb,
    'cap': part_cap,
    'horns': part_horns,
    'ears': part_ears,
    'shell': part_shell,
    'star': part_star,
    'wings': part_wings,
    'moss': part_moss,
    'leafEars': part_leaf_ears,
    'antenna': part_antenna,
    'fins': part_fins,
    'crown': part_crown,
    'tail': part_tail,
    'handle': part_handle,
    'clock': part_clock,
    'spots': part_spots,
    'cherry': part_cherry,
    'brows': part_brows,
    'tiara': part_tiara,
    'cloud': part_cloud,
    'spikes': part_spikes,
    'swirl': part_swirl,
    'snowflake': part_snowflake,
    'scarf': part_scarf,
    'rainbow': part_rainbow,
    'stripes': part_stripes,
    'headband': part_headband,
    'cape': part_cape,
    'patches': part_patches,
    'helmet': part_helmet,
    'crescent': part_crescent,
    'bow': part_bow,
    'halo': part_halo,
    'flower': part_flower,
}


def build_feet(look):
    if look['body'] in ('drop', 'blob'):
        return
    mat = material('feet', darken(look['color'], 0.25), rough=0.6, surface=look.get('surface'))
    for x in (46, 74):
        X, Z = svg(x, 102)
        foot = ellipsoid('foot', (X, -0.2, Z + 0.03), (9 * S, 0.3, 5 * S), mat)
        add_outline(foot, darken(look['color'], 0.65))


def build_creature(look):
    body = build_body(look)
    ctx = Ctx(look, body)
    build_feet(look)
    for p in look['parts']:
        fn = PARTS.get(p)
        if fn:
            fn(ctx)
        else:
            print(f'[warn] 尚未實作部件 {p}')
    build_face(ctx.surf, look)
    add_outline(body, darken(look['color'], 0.6))


# ---------- 場景、算圖、匯出 ----------

def setup_scene(size):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _mats.clear()
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    try:
        prefs = bpy.context.preferences.addons['cycles'].preferences
        prefs.compute_device_type = 'CUDA'
        prefs.get_devices()
        for d in prefs.devices:
            d.use = True
        sc.cycles.device = 'GPU'
    except Exception as e:  # 沒有 GPU 時用 CPU
        print('[info] GPU 不可用：', e)
    sc.cycles.samples = 96
    sc.cycles.use_denoising = True
    sc.render.film_transparent = True
    sc.cycles.film_transparent_glass = True
    sc.render.resolution_x = sc.render.resolution_y = size
    sc.view_settings.view_transform = 'Standard'
    img = sc.render.image_settings
    img.file_format = 'WEBP'
    img.color_mode = 'RGBA'
    img.quality = 90

    world = bpy.data.worlds.new('world')
    world.use_nodes = True
    bg = world.node_tree.nodes['Background']
    hdri = os.path.join(ASSETS, 'studio_small_09_1k.hdr')
    if os.path.exists(hdri):
        env = world.node_tree.nodes.new('ShaderNodeTexEnvironment')
        env.image = bpy.data.images.load(hdri)
        world.node_tree.links.new(env.outputs['Color'], bg.inputs['Color'])
        bg.inputs['Strength'].default_value = 0.7
    else:
        bg.inputs['Color'].default_value = (0.75, 0.82, 0.9, 1)
        bg.inputs['Strength'].default_value = 0.55
    sc.world = world

    def area(name, loc, power, size, color=(1, 1, 1)):
        ld = bpy.data.lights.new(name, 'AREA')
        ld.energy = power
        ld.size = size
        ld.color = color
        ob = link(bpy.data.objects.new(name, ld))
        ob.location = loc
        ob.rotation_euler = (Vector((0, 0, 1.1)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()

    area('key', (-3, -4, 4.5), 320, 3, (1, 0.97, 0.92))
    area('fill', (4, -3, 2), 90, 4, (0.9, 0.95, 1))
    area('rim', (1.5, 4, 3.5), 300, 2)

    me = bpy.data.meshes.new('ground')
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=6)
    bm.to_mesh(me)
    bm.free()
    ground = link(bpy.data.objects.new('ground', me))
    ground.is_shadow_catcher = True
    return sc


def fade_ground_shadow(path):
    """陰影捕捉器會接到身體擋住環境光的大片淡影，橫跨整張圖；只留下腳下一圈，往外淡掉"""
    import numpy as np
    img = bpy.data.images.load(path)
    w, h = img.size
    px = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)  # 由下往上
    ys, xs = np.mgrid[0:h, 0:w]
    gy = h * (0.5 - (GROUND - 60) / 120)  # 地面在圖上的列（由下往上數）
    d = np.sqrt(((xs - w / 2) / (0.36 * w)) ** 2 + ((ys - gy) / (0.07 * h)) ** 2)
    keep = np.clip((1.25 - d) / 0.5, 0, 1)
    keep = keep * keep * (3 - 2 * keep)
    a = px[..., 3]
    near_ground = ys < gy + 0.35 * h
    shadow = (a < 0.6) & near_ground
    px[..., 3] = np.where(shadow, a * keep, a)
    img.pixels[:] = px.ravel()
    img.file_format = 'WEBP'
    img.filepath_raw = path
    img.save()
    bpy.data.images.remove(img)


def set_camera(sc, azimuth, elevation=8):
    """正交相機剛好框住 SVG 的 viewBox（120 × 120，中心 (60, 60)）"""
    cam = sc.camera
    if cam is None:
        cd = bpy.data.cameras.new('cam')
        cd.type = 'ORTHO'
        cd.ortho_scale = 120 * S
        cam = link(bpy.data.objects.new('cam', cd))
        sc.camera = cam
    target = P(60, 60)
    az, el = math.radians(azimuth), math.radians(elevation)
    cam.location = target + 12 * Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el)))
    cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler()


def bake_emission(obj, image_path, size=1024):
    """把身體的程序化發光烘焙成貼圖，接回 Emission Color，glTF 才能匯出成 emissiveTexture"""
    m = obj.data.materials[0]
    nt = m.node_tree
    bsdf = nt.nodes['Principled BSDF']
    sock = bsdf.inputs['Emission Strength']
    if not sock.is_linked:
        return
    # 強度先調成 1 烘焙出 0..1 的遮罩顏色，貼回去後再用強度乘回來（PNG 存不了大於 1 的值）
    amp = sock.links[0].from_node
    strength = amp.inputs[1].default_value
    amp.inputs[1].default_value = 1

    img = bpy.data.images.new(obj.name + '_emit', size, size)
    tex = nt.nodes.new('ShaderNodeTexImage')
    tex.image = img
    nt.nodes.active = tex
    outline = obj.modifiers.get('outline')
    if outline:
        outline.show_render = False
    for other in obj.data.materials[1:]:  # 每個材質槽都要有作用中的圖片節點，烘焙才不會報錯
        n = other.node_tree.nodes.new('ShaderNodeTexImage')
        n.image = img
        other.node_tree.nodes.active = n

    sc = bpy.context.scene
    samples = sc.cycles.samples
    sc.cycles.samples = 16
    sc.render.bake.margin = 8
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.bake(type='EMIT')
    sc.cycles.samples = samples
    img.filepath_raw = image_path
    img.file_format = 'PNG'
    img.save()

    for other in obj.data.materials[1:]:
        other.node_tree.nodes.remove(other.node_tree.nodes.active)
    if outline:
        outline.show_render = True
    amp.inputs[1].default_value = strength
    for ln in list(sock.links):
        nt.links.remove(ln)
    nt.links.new(tex.outputs['Color'], bsdf.inputs['Emission Color'])
    sock.default_value = strength


def export_glb(path, tmp_dir):
    body = bpy.data.objects.get('body')
    if body:
        bake_emission(body, os.path.join(tmp_dir, os.path.basename(os.path.splitext(path)[0]) + '_emit.png'))
    # 其餘程序化發光（例如腳）glTF 表達不了，會變成整片發光；匯出前先拿掉
    for m in bpy.data.materials:
        bsdf = m.node_tree.nodes.get('Principled BSDF') if m.node_tree else None
        if bsdf and bsdf.inputs['Emission Strength'].is_linked:
            for ln in list(bsdf.inputs['Emission Strength'].links):
                m.node_tree.links.remove(ln)
            bsdf.inputs['Emission Strength'].default_value = 0
    bpy.ops.object.select_all(action='DESELECT')
    for ob in bpy.context.scene.objects:
        if ob.type == 'MESH' and ob.name != 'ground':
            ob.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_image_format='WEBP',
    )


def main():
    argv = sys.argv[sys.argv.index('--') + 1:]
    species_path, out_dir = argv[0], os.path.abspath(argv[1])
    only = {a for a in argv[2:] if not a.startswith('--')}
    flags = {a for a in argv[2:] if a.startswith('--')}
    os.makedirs(out_dir, exist_ok=True)
    # 烘焙用的中間檔放在輸出資料夾外，不會跟著發佈
    tmp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out', 'bake')
    os.makedirs(tmp_dir, exist_ok=True)
    with open(species_path, encoding='utf-8') as f:
        species = json.load(f)
    for sp in species:
        if only and sp['english'] not in only:
            continue
        name = sp['english'].lower()
        variants = [('', sp['look'])]
        if '--no-shiny' not in flags:
            variants.append(('_shiny', sp['shiny']))
        for suffix, look in variants:
            sc = setup_scene(512)
            build_creature(look)
            if '--no-render' not in flags:
                set_camera(sc, 0)
                sc.render.filepath = os.path.join(out_dir, f'{name}{suffix}.webp')
                bpy.ops.render.render(write_still=True)
                fade_ground_shadow(sc.render.filepath)
            if not suffix and '--no-glb' not in flags:
                export_glb(os.path.join(out_dir, f'{name}.glb'), tmp_dir)
        print(f'[done] {name}')


main()
