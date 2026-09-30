/* ────────────────────────────────────────────────────────────────────────────
   EXアイコン／進化カットシーン共通のFXエンジン

   設計方針（商業品質を目指すための規則）
   1. 全キャンバスで一つの requestAnimationFrame ループを共有する（N個のアイコン
      ＝ スケジューラ1個）。フレーム費用が閾値を超えたら自動的に 45fps / 30fps へ
      落とす。同時実行数にも上限を設け、超えた分は静止画になる。
   2. 視界外・非表示タブ・reduce-motion では完全に停止する。
   3. 粒子は正規化座標で保持し、グローバルな時刻 t から位相を導出する。保存状態を
      持たないので、どのキャンバスでも同じ動きになり、復帰時のジャンプも起きない。
   4. 絵は「意味のある造形」だけで組む。装飾のための波線・斜めストライプ・既定の
      キラキラは入れない（違和感と小ぢんまり感の原因になる）。
   ──────────────────────────────────────────────────────────────────────────── */

import type { EvolutionEffect } from './types';

export type ExEffect = EvolutionEffect;

export interface FxView {
  ctx: CanvasRenderingContext2D;
  /** CSSピクセル幅 */
  w: number;
  /** CSSピクセル高さ */
  h: number;
  /** 全キャンバス共通の経過秒 */
  t: number;
  /** 前フレームからの経過秒 */
  dt: number;
  /** 0..1 の強度（アイコン=1、カットシーンは拍に連動） */
  power: number;
}

type Renderer = (v: FxView) => void;

/* ── 決定論的ノイズ ─────────────────────────────────────────────────────── */

const hash2 = (x: number, y: number) => {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const fade = (t: number) => t * t * (3 - 2 * t);
const noise2 = (x: number, y: number) => {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = fade(x - xi), yf = fade(y - yi);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return (a + (b - a) * xf) * (1 - yf) + (c + (d - c) * xf) * yf;
};
const fbm2 = (x: number, y: number, octaves = 3) => {
  let sum = 0, amp = 0.5, f = 1;
  for (let i = 0; i < octaves; i++) { sum += noise2(x * f, y * f) * amp; amp *= 0.5; f *= 2; }
  return sum;
};

/* ── 色 ─────────────────────────────────────────────────────────────────── */

type Stop = [number, number, number, number, number]; // pos, r, g, b, a

function ramp(stops: Stop[], v: number): Stop {
  const x = v < 0 ? 0 : v > 1 ? 1 : v;
  for (let i = 1; i < stops.length; i++) {
    if (x <= stops[i][0] || i === stops.length - 1) {
      const a = stops[i - 1], b = stops[i];
      const k = (x - a[0]) / Math.max(1e-6, b[0] - a[0]);
      return [x, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, a[3] + (b[3] - a[3]) * k, a[4] + (b[4] - a[4]) * k];
    }
  }
  return stops[stops.length - 1];
}

/** 加算合成用のグロースプライト（毎フレーム gradient を作らないためのキャッシュ） */
const sprites = new Map<string, HTMLCanvasElement>();
function glowSprite(rgb: string, core = 0.35) {
  let s = sprites.get(rgb + core);
  if (s) return s;
  const size = 48;
  s = document.createElement('canvas');
  s.width = size; s.height = size;
  const c = s.getContext('2d');
  if (c) {
    const g = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, `rgba(${rgb},1)`);
    g.addColorStop(core, `rgba(${rgb},0.5)`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    c.fillStyle = g;
    c.fillRect(0, 0, size, size);
  }
  sprites.set(rgb + core, s);
  return s;
}
const blob = (ctx: CanvasRenderingContext2D, rgb: string, x: number, y: number, r: number, alpha: number, core = 0.35) => {
  if (r <= 0 || alpha <= 0) return;
  ctx.globalAlpha = alpha > 1 ? 1 : alpha;
  ctx.drawImage(glowSprite(rgb, core), x - r, y - r, r * 2, r * 2);
};
/** 芯だけの鋭い光点（火の子の中心核） */
const spark = (ctx: CanvasRenderingContext2D, color: string, x: number, y: number, r: number, alpha: number) => {
  if (r <= 0.2 || alpha <= 0) return;
  ctx.globalAlpha = alpha > 1 ? 1 : alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};

/* ── スクラッチキャンバス（炎の低解像度バッファ用） ─────────────────────── */

const scratch = new Map<string, { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D }>();
function getScratch(w: number, h: number, variant = 'a') {
  const key = `${variant}:${w}x${h}`;
  let s = scratch.get(key);
  if (!s) {
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    s = { canvas, ctx };
    scratch.set(key, s);
  }
  return s;
}

/* ── 1. 両馬二郎 / inferno ─ 北極ラーメンの炉 ─────────────────────────── */

const FIRE_STOPS: Stop[] = [
  [0.00, 0, 0, 0, 0],
  [0.10, 90, 12, 0, 0.26],
  [0.26, 188, 38, 0, 0.60],
  [0.44, 250, 96, 6, 0.86],
  [0.62, 255, 158, 26, 0.95],
  [0.80, 255, 212, 96, 1],
  [1.00, 255, 252, 232, 1],
];
/** 外炎は白熱させない。橙〜赤で厚みだけ担当する */
const HALO_STOPS: Stop[] = [
  [0.00, 0, 0, 0, 0],
  [0.14, 108, 20, 0, 0.20],
  [0.36, 202, 52, 0, 0.40],
  [0.62, 252, 116, 10, 0.48],
  [1.00, 255, 178, 54, 0.52],
];
const EMBER_STOPS: Stop[] = [
  [0.00, 190, 44, 8, 0.9],
  [0.35, 255, 150, 34, 1],
  [0.70, 255, 220, 130, 1],
  [1.00, 255, 255, 240, 1],
];

const fireBufs = new Map<string, Float32Array>();
const fireStamp = new Map<string, number>();

function stepFire(buf: Float32Array, gw: number, gh: number, t: number) {
  // 炉床を連続的に点火
  for (let x = 0; x < gw; x++) {
    buf[(gh - 1) * gw + x] = 0.48 + fbm2(x * 0.44 + t * 2.7, t * 1.9, 2) * 0.4;
  }
  for (let y = gh - 2; y >= 0; y--) {
    const src = (y + 1) * gw, dst = y * gw;
    for (let x = 0; x < gw; x++) {
      const shift = Math.round((noise2(y * 0.34 + 3.1, t * 2.3) - 0.5) * 3);
      const xa = x + shift < 0 ? 0 : x + shift >= gw ? gw - 1 : x + shift;
      const lean = noise2(x * 0.21, t * 3.1) > 0.5 ? 1 : -1;
      const xb = xa + lean < 0 ? 0 : xa + lean >= gw ? gw - 1 : xa + lean;
      const best = Math.max(buf[src + xa], buf[src + xb]);
      // 列ごとに冷却速度を変えて、炎の「舌」の本数を増やす
      const cool = 0.023 + noise2(x * 1.15, y * 0.16 + t * 0.55) * 0.034;
      buf[dst + x] = best - cool > 0 ? best - cool : 0;
    }
  }
}

/** 正規化座標で持つ火の子。global t から位相を導出するので状態を持たない。 */
const EMBERS = Array.from({ length: 44 }, (_, i) => ({
  x: hash2(i * 7 + 1, 3),
  phase: hash2(i * 13 + 5, 9),
  speed: 0.10 + hash2(i * 17 + 2, 11) * 0.20,
  sway: 0.005 + hash2(i * 19 + 4, 13) * 0.017,
  size: 0.006 + hash2(i * 23 + 6, 15) * 0.013,
  drift: (hash2(i * 29 + 8, 17) - 0.5) * 0.14,
}));

/** アイコンが小さいほど粒子を間引く（描画コストと「見える数」の両方を最適化） */
const density = (unit: number, base: number, full = 80) =>
  Math.max(5, Math.round(base * Math.min(1, unit / full)));

function drawInferno(v: FxView) {
  const { ctx, w, h, t, power } = v;
  const unit = Math.min(w, h);
  const gw = unit < 70 ? 18 : unit < 240 ? 26 : 50;
  const gh = unit < 70 ? 22 : unit < 240 ? 32 : 60;
  const key = `${gw}x${gh}`;
  let buf = fireBufs.get(key);
  if (!buf) { buf = new Float32Array(gw * gh); fireBufs.set(key, buf); }
  if (fireStamp.get(key) !== t) { stepFire(buf, gw, gh, t); fireStamp.set(key, t); }

  const halo = getScratch(gw, gh, 'halo');
  const core = getScratch(gw, gh, 'core');
  if (!halo || !core) return;
  const imgH = halo.ctx.createImageData(gw, gh), dataH = imgH.data;
  const imgC = core.ctx.createImageData(gw, gh), dataC = imgC.data;
  for (let y = 0; y < gh; y++) {
    // 行ごとの横揺れ＝熱で揺らぐ炎。上へいくら大きく振幅を取る
    const wob = (Math.sin(y * 0.26 + t * 3.4) * 1.9 + (noise2(y * 0.42, t * 2.2) - 0.5) * 2.8) * (0.45 + y / gh);
    for (let x = 0; x < gw; x++) {
      const sx = x + wob < 0 ? 0 : x + wob >= gw ? gw - 1 : Math.round(x + wob);
      const heat = buf[y * gw + sx];
      const a = ramp(HALO_STOPS, heat), b = ramp(FIRE_STOPS, heat * (0.8 + power * 0.28));
      const i = (y * gw + x) * 4;
      dataH[i] = a[1]; dataH[i + 1] = a[2]; dataH[i + 2] = a[3]; dataH[i + 3] = a[4] * 255;
      dataC[i] = b[1]; dataC[i + 1] = b[2]; dataC[i + 2] = b[3]; dataC[i + 3] = b[4] * 255;
    }
  }
  halo.ctx.putImageData(imgH, 0, 0);
  core.ctx.putImageData(imgC, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.imageSmoothingEnabled = true;
  const bedH = h * (0.5 + power * 0.16);
  // 外炎：一回り大きく、厚みと滲みを作る
  ctx.globalAlpha = 0.4;
  ctx.drawImage(halo.canvas, -w * 0.07, h - bedH * 1.16, w * 1.14, bedH * 1.16);
  // 核：白熱する火炎
  ctx.globalAlpha = 0.56;
  ctx.drawImage(core.canvas, 0, h - bedH, w, bedH);

  // 炉床の赤熱
  const emberBed = 0.5 + Math.sin(t * 2.3) * 0.1 + power * 0.18;
  const coal = ctx.createRadialGradient(w * 0.5, h * 1.03, 0, w * 0.5, h * 1.03, w * 0.78);
  coal.addColorStop(0, `rgba(255,224,158,${0.2 * emberBed})`);
  coal.addColorStop(0.3, `rgba(255,126,18,${0.13 * emberBed})`);
  coal.addColorStop(1, 'rgba(180,30,0,0)');
  ctx.globalAlpha = 1;
  ctx.fillStyle = coal;
  ctx.fillRect(0, h * 0.52, w, h * 0.48);

  // 中心の上昇気流（熱柱）
  const column = ctx.createLinearGradient(w * 0.5, h, w * 0.5, h * 0.42);
  column.addColorStop(0, `rgba(255,168,64,${0.1 * power})`);
  column.addColorStop(1, 'rgba(255,140,40,0)');
  ctx.fillStyle = column;
  ctx.fillRect(w * 0.22, h * 0.42, w * 0.56, h * 0.58);

  // 舞い上がる火の子（昇程で白→黄→橙→赤に冷却）
  const n = density(unit, EMBERS.length);
  for (let i = 0; i < n; i++) {
    const e = EMBERS[i];
    const life = (t * e.speed + e.phase) % 1;
    if (life <= 0.002) continue;
    const x = (e.x + Math.sin(t * 1.9 + e.phase * 9.2) * e.sway + e.drift * life) * w;
    const y = (1 - life) * h;
    const rise = Math.min(1, life * 8) * (1 - Math.max(0, (life - 0.52) / 0.48));
    const c = ramp(EMBER_STOPS, 1 - life);
    const rgb = `${c[1] | 0},${c[2] | 0},${c[3] | 0}`;
    const r = e.size * (1 - life * 0.35) * unit * 1.5;
    blob(ctx, rgb, x, y, r, rise * 0.55, 0.2);
    if (life < 0.62) spark(ctx, '#fff6d8', x, y, Math.max(0.35, r * 0.17), rise * 0.95);
  }

  // 外周の熱リム（アイコンを大きく見せる）
  const rim = ctx.createLinearGradient(0, h, 0, h * 0.58);
  rim.addColorStop(0, `rgba(255,146,46,${0.12 * power})`);
  rim.addColorStop(1, 'rgba(255,120,30,0)');
  ctx.fillStyle = rim;
  ctx.fillRect(0, h * 0.58, w, h * 0.42);
  ctx.restore();
}

/* ── 2. 数理零 / afterglow ─ 夕暮れの黒板に式が自己記述される ─────────── */

const CHALK: number[] = (() => {
  const pts = [[0.08, 0.80], [0.28, 0.24], [0.5, 0.72], [0.72, 0.26], [0.93, 0.64]];
  const out: number[] = [];
  const N = 96;
  for (let i = 0; i < N; i++) {
    const u = (i / (N - 1)) * (pts.length - 1);
    const seg = Math.min(pts.length - 2, Math.floor(u));
    const f = u - seg;
    const p0 = pts[Math.max(0, seg - 1)], p1 = pts[seg], p2 = pts[seg + 1], p3 = pts[Math.min(pts.length - 1, seg + 2)];
    for (let k = 0; k < 2; k++) {
      const a = p0[k], b = p1[k], c = p2[k], d = p3[k];
      out.push(0.5 * (2 * b + (-a + c) * f + (2 * a - 5 * b + 4 * c - d) * f * f + (-a + 3 * b - 3 * c + d) * f * f * f));
    }
  }
  return out;
})();

const DUST = Array.from({ length: 22 }, (_, i) => ({
  x: hash2(i * 3 + 1, 5),
  y: hash2(i * 5 + 2, 11),
  speed: 0.014 + hash2(i * 7 + 3, 13) * 0.03,
  phase: hash2(i * 11 + 4, 17) * 6.28,
  size: 0.006 + hash2(i * 13 + 5, 19) * 0.012,
}));

function drawAfterglow(v: FxView) {
  const { ctx, w, h, t, power } = v;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // 低い位置の夕陽
  const pulse = 0.8 + Math.sin(t * 0.5) * 0.1 + power * 0.25;
  const sun = ctx.createRadialGradient(w * 0.24, h * 1.04, 0, w * 0.24, h * 1.04, Math.max(w, h) * 0.95);
  sun.addColorStop(0, `rgba(255,214,150,${0.5 * pulse})`);
  sun.addColorStop(0.34, `rgba(255,166,86,${0.24 * pulse})`);
  sun.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, w, h);

  // ゆるやかに揺れる光帯
  for (let i = 0; i < 2; i++) {
    const ph = t * 0.12 + i * 1.9;
    ctx.save();
    ctx.translate(w * (0.32 + i * 0.4), h * 0.5);
    ctx.rotate(-0.52 + Math.sin(ph) * 0.07);
    const sw = w * (0.46 + i * 0.2);
    const lg = ctx.createLinearGradient(-sw / 2, 0, sw / 2, 0);
    lg.addColorStop(0, 'rgba(255,224,168,0)');
    lg.addColorStop(0.5, `rgba(255,233,188,${0.075 + 0.045 * Math.sin(ph * 1.4)})`);
    lg.addColorStop(1, 'rgba(255,224,168,0)');
    ctx.fillStyle = lg;
    ctx.fillRect(-sw / 2, -h, sw, h * 2);
    ctx.restore();
  }

  // 巨大なΣの残響
  const axiom = 0.5 + 0.5 * Math.sin(t * 0.42);
  ctx.globalAlpha = (0.07 + axiom * 0.06) * (0.6 + power * 0.6);
  ctx.fillStyle = '#ffe6bb';
  ctx.font = `700 ${Math.round(h * 0.62)}px Georgia, "Times New Roman", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('∑', w * 0.5, h * 0.46);
  ctx.restore();

  // 黒板の軸（カーブを「グラフ」として読ませる）
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `rgba(255,232,190,${0.16 * power})`;
  ctx.lineWidth = Math.max(0.6, Math.min(w, h) * 0.006);
  ctx.setLineDash([Math.min(w, h) * 0.022, Math.min(w, h) * 0.03]);
  ctx.beginPath();
  ctx.moveTo(w * 0.1, h * 0.88); ctx.lineTo(w * 0.94, h * 0.88);
  ctx.moveTo(w * 0.1, h * 0.88); ctx.lineTo(w * 0.1, h * 0.1);
  ctx.stroke();
  ctx.restore();

  // 黒板に式が書かれていく
  const cycle = (t * 0.14) % 1;
  const drawEnd = 0.52, hold = 0.78;
  if (cycle < hold) {
    const p = Math.min(1, cycle / drawEnd);
    const n = Math.max(2, Math.floor(p * (CHALK.length / 2)));
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let pass = 0; pass < 2; pass++) {
      ctx.beginPath();
      for (let i = 0; i < n; i++) ctx.lineTo(CHALK[i * 2] * w, CHALK[i * 2 + 1] * h);
      ctx.strokeStyle = pass === 0 ? `rgba(255,206,138,${0.55 * power})` : 'rgba(255,248,228,0.95)';
      ctx.lineWidth = (pass === 0 ? 3.4 : 1.3) * Math.max(0.6, Math.min(w, h) / 90);
      ctx.stroke();
    }
    // チョークの先端
    const tipX = CHALK[(n - 1) * 2] * w, tipY = CHALK[(n - 1) * 2 + 1] * h;
    blob(ctx, '255,244,214', tipX, tipY, Math.min(w, h) * 0.045, 0.85);
    // 削り滓
    for (let i = 0; i < 5; i++) {
      const a = hash2(n * 3 + i, 7) * 6.28;
      const d = hash2(n * 5 + i, 11) * Math.min(w, h) * 0.05;
      blob(ctx, '255,232,190', tipX + Math.cos(a) * d, tipY + Math.sin(a) * d, Math.min(w, h) * 0.012, 0.5);
    }
    ctx.restore();
  }

  // 夕闇に舞うチョークの粉
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const unit = Math.min(w, h);
  for (const d of DUST) {
    const y = (d.y - ((t * d.speed + d.phase) % 1) + 1) % 1;
    const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 1.6 + d.phase * 3.1));
    blob(ctx, '255,240,206', (d.x + Math.sin(t * 0.5 + d.phase) * 0.02) * w, y * h, d.size * unit, tw * 0.55);
  }
  ctx.restore();
}

/* ── 3. 寺地星 / starfall ─ 星座が結ばれ、流星が駆ける ─────────────────── */

const STARS = Array.from({ length: 54 }, (_, i) => ({
  x: hash2(i * 3 + 1, 7),
  y: hash2(i * 5 + 2, 11),
  r: 0.005 + hash2(i * 7 + 3, 13) * 0.013,
  tw: 0.6 + hash2(i * 11 + 4, 17) * 2.4,
  ph: hash2(i * 13 + 5, 19) * 6.28,
  par: (i % 3) * 0.012,
}));

const CONSTELLATION: [number, number][] = [
  [0.16, 0.22], [0.36, 0.42], [0.27, 0.66], [0.55, 0.58], [0.79, 0.32], [0.64, 0.82],
];
const CONST_EDGES: [number, number][] = [[0, 1], [1, 2], [1, 3], [3, 4], [3, 5]];

function drawStarfall(v: FxView) {
  const { ctx, w, h, t, power } = v;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // 地平の青い光
  const night = ctx.createRadialGradient(w * 0.5, h * 1.1, 0, w * 0.5, h * 1.1, Math.max(w, h) * 0.9);
  night.addColorStop(0, `rgba(96,150,255,${0.3 * power})`);
  night.addColorStop(0.4, 'rgba(70,110,220,0.1)');
  night.addColorStop(1, 'rgba(40,60,160,0)');
  ctx.fillStyle = night;
  ctx.fillRect(0, 0, w, h);

  // 星域（視差する3層）
  const unit = Math.min(w, h);
  for (const s of STARS) {
    const drift = (t * 0.006 * (s.par + 1)) % 1;
    const y = (s.y + drift) % 1;
    const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.tw + s.ph));
    blob(ctx, '226,238,255', s.x * w, y * h, s.r * unit * (1.6 + s.par), tw * 0.75);
  }

  // 星座がつながる
  const cCycle = (t * 0.1) % 1;
  const link = cCycle < 0.5 ? cCycle / 0.5 : cCycle < 0.82 ? 1 : 1 - (cCycle - 0.82) / 0.18;
  if (link > 0.01) {
    ctx.lineCap = 'round';
    const total = CONST_EDGES.length;
    for (let e = 0; e < total; e++) {
      const segStart = e / total, segEnd = (e + 1) / total;
      const p = Math.max(0, Math.min(1, (link - segStart) / (segEnd - segStart)));
      if (p <= 0) continue;
      const a = CONSTELLATION[CONST_EDGES[e][0]], b = CONSTELLATION[CONST_EDGES[e][1]];
      const mx = a[0] + (b[0] - a[0]) * p, my = a[1] + (b[1] - a[1]) * p;
      ctx.beginPath();
      ctx.moveTo(a[0] * w, a[1] * h);
      ctx.lineTo(mx * w, my * h);
      ctx.strokeStyle = `rgba(198,220,255,${0.62 * link * power})`;
      ctx.lineWidth = Math.max(0.7, unit * 0.008);
      ctx.stroke();
      if (p >= 1) blob(ctx, '214,232,255', b[0] * w, b[1] * h, unit * 0.03, 0.6 * link);
    }
    blob(ctx, '236,246,255', CONSTELLATION[0][0] * w, CONSTELLATION[0][1] * h, unit * 0.035, 0.7 * link);
  }

  // 流星
  const period = 3.1, flight = 0.55;
  const mp = (t % period) / period;
  if (mp < flight) {
    const f = mp / flight;
    const x0 = 1.2, y0 = -0.12, x1 = -0.2, y1 = 0.62;
    const hx = x0 + (x1 - x0) * f, hy = y0 + (y1 - y0) * f;
    const dx = x1 - x0, dy = y1 - y0;
    const len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len;
    const tail = 0.3;
    for (let i = 0; i < 12; i++) {
      const k = i / 11;
      const tx = (hx - ux * tail * k) * w, ty = (hy - uy * tail * k) * h;
      blob(ctx, i < 3 ? '255,255,255' : '198,224,255', tx, ty, unit * (0.05 - k * 0.038) * (1 - k * 0.4), (1 - k) * 0.75);
    }
    blob(ctx, '255,255,255', hx * w, hy * h, unit * 0.075, 0.95);
  }
  ctx.restore();
}

/* ── 4. 塀勝也 / contour ─ 生きた地形図 ───────────────────────────────── */

function contourRadius(angle: number, level: number, t: number) {
  const cx = Math.cos(angle), cy = Math.sin(angle);
  const n = fbm2(cx * 1.7 + level * 0.8, cy * 1.7 + t * 0.05, 3) - 0.45;
  const n2 = fbm2(cx * 3.6 - level * 0.4, cy * 3.6 + 11.3, 2) - 0.5;
  return 0.34 + level * 0.082 + n * 0.17 + n2 * 0.055;
}

function drawContour(v: FxView) {
  const { ctx, w, h, t, power } = v;
  const unit = Math.min(w, h);
  const cx = w * 0.5, cy = h * 0.55;
  const LEVELS = 7;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  // 山塊の温かい陰影
  const mass = ctx.createRadialGradient(cx, cy, 0, cx, cy, unit * 0.7);
  mass.addColorStop(0, `rgba(255,206,130,${0.2 * power})`);
  mass.addColorStop(1, 'rgba(255,170,60,0)');
  ctx.fillStyle = mass;
  ctx.fillRect(0, 0, w, h);

  ctx.lineJoin = 'round';
  for (let lv = LEVELS - 1; lv >= 0; lv--) {
    const depth = 1 - lv / LEVELS;
    // 内側の2層は塗って山体として見せる
    if (lv <= 1) {
      ctx.beginPath();
      for (let i = 0; i <= 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        const r = contourRadius(a, lv, t) * unit;
        const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.globalAlpha = 0.16 + depth * 0.1;
      ctx.fillStyle = lv === 0 ? '#ffe6ae' : '#ffcf82';
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.beginPath();
    for (let i = 0; i <= 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const r = contourRadius(a, lv, t) * unit;
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = lv === 0 ? 'rgba(255,244,214,0.95)' : `rgba(255,214,138,${0.3 + depth * 0.5})`;
    ctx.lineWidth = Math.max(0.6, unit * (0.006 + depth * 0.008));
    ctx.stroke();
    // 主峰の測線
    if (lv === 0) {
      ctx.strokeStyle = `rgba(255,250,232,${0.5 + 0.4 * Math.sin(t * 1.1)})`;
      ctx.lineWidth = Math.max(0.8, unit * 0.009);
      ctx.setLineDash([unit * 0.05, unit * 0.045]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // 山頂標
  const topY = cy - contourRadius(-Math.PI / 2, 0, t) * unit - unit * 0.045;
  const blink = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 1.7));
  ctx.globalAlpha = 0.55 + blink * 0.45;
  ctx.fillStyle = '#fff3d2';
  ctx.beginPath();
  ctx.moveTo(cx, topY - unit * 0.055);
  ctx.lineTo(cx + unit * 0.038, topY + unit * 0.012);
  ctx.lineTo(cx - unit * 0.038, topY + unit * 0.012);
  ctx.closePath();
  ctx.fill();
  ctx.font = `700 ${Math.max(5, Math.round(unit * 0.055))}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.globalAlpha = 0.4 + blink * 0.45;
  ctx.fillText('1620', cx, topY - unit * 0.05);
  ctx.restore();
}

/* ── 5. 三重県臣 / court-pass ─ 理屈じゃない一投 ───────────────────────── */

function drawCourtPass(v: FxView) {
  const { ctx, w, h, t, power } = v;
  const unit = Math.min(w, h);
  const period = 2.5;
  const p = (t % period) / period;
  const fly = Math.min(1, p / 0.6);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // コートのパースペクティブ
  const vx = w * 0.6, vy = h * 0.26;
  ctx.lineWidth = Math.max(0.6, unit * 0.006);
  for (let i = 0; i < 4; i++) {
    const bx = (-0.3 + i * 0.55) * w;
    ctx.beginPath();
    ctx.moveTo(bx, h * 1.02);
    ctx.lineTo(vx, vy);
    ctx.strokeStyle = `rgba(150,214,255,${0.1 + 0.05 * Math.sin(t * 0.9 + i)})`;
    ctx.stroke();
  }
  const floor = ctx.createRadialGradient(vx, vy, 0, vx, vy, unit * 1.1);
  floor.addColorStop(0, `rgba(140,208,255,${0.16 * power})`);
  floor.addColorStop(1, 'rgba(120,190,255,0)');
  ctx.fillStyle = floor;
  ctx.fillRect(0, 0, w, h);

  // 軌道
  const x0 = -0.14, y0 = 0.96, cxp = 0.46, cyp = -0.06, x1 = 0.9, y1 = 0.16;
  const bez = (f: number) => {
    const g = 1 - f;
    return [g * g * x0 + 2 * g * f * cxp + f * f * x1, g * g * y0 + 2 * g * f * cyp + f * f * y1];
  };

  if (fly < 1) {
    // 尾を引く軌道
    for ( let i = 11; i >= 0; i--) {
      const k = i / 11;
      const f = Math.max(0, fly - k * 0.22);
      const [bx, by] = bez(f);
      blob(ctx, i < 2 ? '255,255,255' : '168,226,255', bx * w, by * h, unit * (0.05 - k * 0.036) * (1 - k * 0.35), (1 - k) * 0.62 * power);
    }
    const [hx, hy] = bez(fly);
    blob(ctx, '255,255,255', hx * w, hy * h, unit * 0.06, 0.95);
    ctx.beginPath();
    ctx.arc(hx * w, hy * h, unit * 0.032, 0, Math.PI * 2);
    ctx.fillStyle = '#fffdf0';
    ctx.fill();
    // 速度線
    const ang = Math.atan2(cyp * 2 * (1 - fly) + y1 * 2 * fly - (y0 * 2 * (1 - fly) + cyp * 2 * fly), 0);
    for (let i = 0; i < 3; i++) {
      const off = (i - 1) * unit * 0.075;
      const sx = hx * w - Math.cos(ang) * unit * 0.16 - Math.sin(ang) * off;
      const sy = hy * h - Math.sin(ang) * unit * 0.16 + Math.cos(ang) * off;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx - Math.cos(ang) * unit * 0.14, sy - Math.sin(ang) * unit * 0.14);
      ctx.strokeStyle = `rgba(226,248,255,${0.5 * (1 - fly)})`;
      ctx.lineWidth = Math.max(0.7, unit * 0.009);
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  } else {
    // 受け手の闪光
    const k = Math.min(1, (p - 0.6) / 0.16);
    const [cx2, cy2] = bez(1);
    blob(ctx, '255,255,255', cx2 * w, cy2 * h, unit * (0.05 + k * 0.3), (1 - k) * 0.9);
    ctx.beginPath();
    ctx.arc(cx2 * w, cy2 * h, unit * (0.05 + k * 0.55), 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(190,236,255,${(1 - k) * 0.7})`;
    ctx.lineWidth = Math.max(0.8, unit * 0.012 * (1 - k));
    ctx.stroke();
  }
  ctx.restore();
}

/* ── 6. 前-原 / phase-break ─ 観測の枠が裂ける ────────────────────────── */

const RIFT: number[] = (() => {
  const out: number[] = [];
  const N = 16;
  for (let i = 0; i <= N; i++) {
    const y = i / N;
    const x = 0.5 + (hash2(i * 5 + 1, 3) - 0.5) * 0.36 + Math.sin(i * 1.27) * 0.055;
    out.push(x, y);
  }
  return out;
})();

function drawPhaseBreak(v: FxView) {
  const { ctx, w, h, t, power } = v;
  const unit = Math.min(w, h);
  const riftPath = () => {
    ctx.beginPath();
    for (let i = 0; i < RIFT.length; i += 2) ctx.lineTo(RIFT[i] * w, RIFT[i + 1] * h);
  };

  ctx.save();
  // 1) 裂け目の向こうの虚空（暗い帯）
  ctx.globalCompositeOperation = 'source-over';
  riftPath();
  ctx.strokeStyle = 'rgba(5,5,14,0.62)';
  ctx.lineWidth = Math.max(1.2, unit * 0.026);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  ctx.globalCompositeOperation = 'lighter';
  // 2) RGB分解した縁
  const edges: [number, string, number][] = [
    [-Math.max(1, unit * 0.014), 'rgba(255,46,100,0.85)', Math.max(1, unit * 0.012)],
    [0, 'rgba(255,255,255,0.95)', Math.max(0.8, unit * 0.007)],
    [Math.max(1, unit * 0.014), 'rgba(96,228,255,0.85)', Math.max(1, unit * 0.012)],
  ];
  for (const [dx, color, lw] of edges) {
    ctx.save();
    ctx.translate(dx, 0);
    riftPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.stroke();
    ctx.restore();
  }
  // 3) 裂け目から漏れる光
  for (let i = 0; i < RIFT.length; i += 2) {
    const fl = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 4.2 + i));
    blob(ctx, i % 2 ? '104,232,255' : '255,255,255', RIFT[i] * w, RIFT[i + 1] * h, unit * 0.055, fl * 0.55 * power, 0.2);
  }

  // 4) 崩壊片（時間を刻んでランダムに散る）
  const q = Math.floor(t * 13);
  for (let i = 0; i < 11; i++) {
    const x = hash2(i * 7 + 1, q) * 0.9;
    const y = hash2(i * 11 + 3, q + 91) * 0.94;
    const bw = 0.05 + hash2(i * 13 + 5, q + 47) * 0.32;
    const bh = 0.014 + hash2(i * 17 + 7, q + 23) * 0.08;
    const m = i % 3;
    const col = m === 0 ? '255,46,100' : m === 1 ? '96,228,255' : '255,255,255';
    ctx.globalAlpha = 0.1 + hash2(i * 19 + 9, q + 61) * 0.2;
    ctx.fillStyle = `rgb(${col})`;
    ctx.fillRect(x * w, y * h, bw * w, bh * h);
    // 色ズレの残像
    ctx.globalAlpha *= 0.5;
    ctx.fillRect(x * w + unit * 0.012, y * h, bw * w, bh * h);
    ctx.fillRect(x * w - unit * 0.012, y * h, bw * w, bh * h);
  }
  ctx.globalAlpha = 1;

  // 5) 横にずれたティア（世界が割れている感触）
  for (let i = 0; i < 3; i++) {
    const band = hash2(i * 3 + 1, Math.floor(t * 2.2));
    const y0 = band * h;
    const bh2 = unit * (0.02 + hash2(i * 5 + 2, Math.floor(t * 2.2) + 7) * 0.05);
    const off = (hash2(i * 7 + 3, Math.floor(t * 2.2) + 13) - 0.5) * unit * 0.09;
    const g = ctx.createLinearGradient(0, y0, 0, y0 + bh2);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.5, `rgba(220,246,255,${0.12 * power})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(off, y0, w, bh2);
  }

  // 6) 走査線
  const sy = ((t * 0.42) % 1.2 - 0.1) * h;
  const scan = ctx.createLinearGradient(0, sy - unit * 0.09, 0, sy + unit * 0.09);
  scan.addColorStop(0, 'rgba(255,255,255,0)');
  scan.addColorStop(0.5, `rgba(220,250,255,${0.14 * power})`);
  scan.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = scan;
  ctx.fillRect(0, sy - unit * 0.09, w, unit * 0.18);
  ctx.restore();
}

/* ── 7. 地面 / strata-memory ─ 堆積層と記憶の脈流 ─────────────────────── */

const BANDS = 9;
const VEINS = Array.from({ length: 6 }, (_, i) => ({
  x: 0.08 + hash2(i * 5 + 1, 3) * 0.84,
  speed: 0.16 + hash2(i * 7 + 2, 5) * 0.3,
  phase: hash2(i * 11 + 3, 7),
  w: 0.004 + hash2(i * 13 + 4, 9) * 0.008,
}));

function drawStrataMemory(v: FxView) {
  const { ctx, w, h, t, power } = v;
  const unit = Math.min(w, h);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  // 地下からのマグマ
  const magma = 0.6 + 0.4 * Math.sin(t * 0.9) + power * 0.3;
  const mg = ctx.createRadialGradient(w * 0.5, h * 1.06, 0, w * 0.5, h * 1.06, w * 0.85);
  mg.addColorStop(0, `rgba(255,206,120,${0.55 * magma})`);
  mg.addColorStop(0.3, `rgba(226,132,44,${0.3 * magma})`);
  mg.addColorStop(1, 'rgba(150,60,10,0)');
  ctx.fillStyle = mg;
  ctx.fillRect(0, h * 0.45, w, h * 0.55);

  // 記憶の脈流（上へ昇る光の筋）
  for (const vein of VEINS) {
    const y = 1 - ((t * vein.speed + vein.phase) % 1);
    const grad = ctx.createLinearGradient(0, (y + 0.16) * h, 0, y * h);
    grad.addColorStop(0, 'rgba(255,214,110,0)');
    grad.addColorStop(1, `rgba(255,226,150,${0.55 * power})`);
    ctx.fillStyle = grad;
    ctx.fillRect(vein.x * w - vein.w * w / 2, y * h, vein.w * w, 0.16 * h);
    blob(ctx, '255,232,168', vein.x * w, y * h, unit * 0.022, 0.7);
  }
  ctx.restore();

  // 堆積層（境目がなめらかにうねる地層）
  // 明暗を交互に振って地層らしいコントラストを作る
  const tone = ['#5b3a20', '#8a5c30', '#6b4425', '#a4763c', '#7a502d', '#bd8c4a', '#8b5e32', '#dcb06d', '#a9763e'];
  ctx.save();
  for (let b = 0; b < BANDS; b++) {
    const base = 0.24 + b * 0.082;
    ctx.beginPath();
    ctx.moveTo(-2, h + 2);
    const steps = 26;
    for (let i = 0; i <= steps; i++) {
      const x = i / steps;
      const n = fbm2(x * 2.4, t * 0.07 + b * 3.7, 3) - 0.5;
      const y = (base + n * 0.055) * h;
      ctx.lineTo(x * w, y);
    }
    ctx.lineTo(w + 2, h + 2);
    ctx.closePath();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = tone[b];
    ctx.fill();
    // 層の鏡面
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const x = i / steps;
      const n = fbm2(x * 2.4, t * 0.07 + b * 3.7, 3) - 0.5;
      const y = (base + n * 0.055) * h;
      if (i === 0) ctx.moveTo(x * w, y); else ctx.lineTo(x * w, y);
    }
    ctx.globalAlpha = 0.34;
    ctx.strokeStyle = '#ffdca6';
    ctx.lineWidth = Math.max(0.6, unit * 0.007);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // 地表の鏡面（日の光を反射する一番上の層）
  ctx.beginPath();
  for (let i = 0; i <= 26; i++) {
    const x = i / 26;
    const n = fbm2(x * 2.4, t * 0.07 + 0 * 3.7, 3) - 0.5;
    const y = (0.3 + n * 0.055) * h;
    if (i === 0) ctx.moveTo(x * w, y); else ctx.lineTo(x * w, y);
  }
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = '#ffe9c4';
  ctx.lineWidth = Math.max(0.8, unit * 0.011);
  ctx.stroke();
  // 層の上部をポートレートへ溶け込ませる
  const feather = ctx.createLinearGradient(0, h * 0.24, 0, h * 0.56);
  feather.addColorStop(0, 'rgba(0,0,0,0.85)');
  feather.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = feather;
  ctx.fillRect(0, h * 0.24, w, h * 0.32);
  ctx.restore();

  // 地上側に漂う記憶の光
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const motes = density(unit, 14, 90);
  for (let i = 0; i < motes; i++) {
    const ph = hash2(i * 5 + 1, 3), sp = 0.02 + hash2(i * 7 + 2, 5) * 0.035;
    const y = (0.3 - ((t * sp + ph) % 0.3) + 0.3) % 0.3;
    const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.4 + ph * 6.2));
    blob(ctx, '255,226,170', (hash2(i * 11 + 3, 7) * 0.9 + 0.05) * w, y * h, unit * 0.014, tw * 0.5);
  }
  ctx.restore();

  // 化石（アンモナイト）がゆっくり回る
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.translate(w * 0.68, h * 0.68);
  ctx.rotate(t * 0.05);
  ctx.globalAlpha = 0.3 + 0.12 * Math.sin(t * 0.8);
  ctx.strokeStyle = '#ffe0ac';
  ctx.lineWidth = Math.max(0.6, unit * 0.008);
  ctx.beginPath();
  for (let i = 0; i <= 120; i++) {
    const a = i / 120 * Math.PI * 5.4;
    const r = unit * (0.012 + a * 0.017);
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

/* ── レンダラ登録 ─────────────────────────────────────────────────────── */

export const FX_RENDERERS: Record<ExEffect, Renderer> = {
  'inferno': drawInferno,
  'afterglow': drawAfterglow,
  'starfall': drawStarfall,
  'contour': drawContour,
  'court-pass': drawCourtPass,
  'phase-break': drawPhaseBreak,
  'strata-memory': drawStrataMemory,
};

/** 一度だけ任意のキャンバスに描く（reduce-motion・静止画表示用） */
export function renderFxFrame(
  effect: ExEffect, ctx: CanvasRenderingContext2D, w: number, h: number, t: number, power = 1,
) {
  if (w < 1 || h < 1) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
  FX_RENDERERS[effect]({ ctx, w, h, t, dt: 0, power });
}

/* ── 共有スケジューラ ─────────────────────────────────────────────────── */

interface Entry { draw: (t: number, dt: number) => void; live: boolean }
const entries = new Set<Entry>();
const queue: Entry[] = [];
const MAX_LIVE = 28;

let raf = 0;
let lastFrame = 0;
let interval = 1000 / 60;
let costAvg = 8;
let paused = false;

function promote() {
  while (queue.length && countLive() < MAX_LIVE) {
    const next = queue.shift();
    if (next && entries.has(next)) { next.live = true; next.draw(performance.now() / 1000, 0); }
  }
}
function countLive() {
  let n = 0;
  for (const e of entries) if (e.live) n++;
  return n;
}

function loop(now: number) {
  raf = requestAnimationFrame(loop);
  if (paused || entries.size === 0) { lastFrame = now; return; }
  if (now - lastFrame < interval - 1) return;
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  const t = now / 1000;
  const t0 = performance.now();
  for (const e of entries) if (e.live) e.draw(t, dt);
  const cost = performance.now() - t0;
  costAvg = costAvg * 0.88 + cost * 0.12;
  interval = costAvg > 11 ? 1000 / 30 : costAvg > 5.5 ? 1000 / 45 : 1000 / 60;
  promote();
}

function ensureLoop() {
  if (raf) return;
  lastFrame = performance.now();
  raf = requestAnimationFrame(loop);
}

function setPaused(next: boolean) {
  if (paused === next) return;
  paused = next;
  if (!paused) { lastFrame = performance.now(); }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => setPaused(document.hidden));
}

/** キャンバスを共有ループに載せる。戻り値で解除する。 */
export function registerFx(draw: (t: number, dt: number) => void) {
  const entry: Entry = { draw, live: countLive() < MAX_LIVE };
  entries.add(entry);
  if (entry.live) ensureLoop();
  else queue.push(entry);
  draw(performance.now() / 1000, 0);
  return () => {
    entries.delete(entry);
    const at = queue.indexOf(entry);
    if (at >= 0) queue.splice(at, 1);
    if (entry.live) promote();
    if (entries.size === 0 && raf) { cancelAnimationFrame(raf); raf = 0; }
  };
}

export function prefersReducedMotion() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}
