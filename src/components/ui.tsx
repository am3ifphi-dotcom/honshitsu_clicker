import { useId } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { ItemDef, Rarity, UnitDef, UnitType } from '../game/types';

export const RARITY_STYLE: Record<Rarity, { text: string; border: string; bg: string; label: string; chip: string }> = {
  N: { text: 'text-slate-300', border: 'border-slate-500', bg: 'from-slate-600 to-slate-800', label: 'N', chip: 'bg-slate-600 text-slate-100' },
  R: { text: 'text-sky-300', border: 'border-sky-400', bg: 'from-sky-700 to-slate-800', label: 'R', chip: 'bg-sky-600 text-white' },
  SR: { text: 'text-violet-300', border: 'border-violet-400', bg: 'from-violet-700 to-slate-800', label: 'SR', chip: 'bg-violet-600 text-white' },
  SSR: { text: 'text-amber-300', border: 'border-amber-400', bg: 'from-amber-600 to-rose-900', label: 'SSR', chip: 'bg-gradient-to-r from-amber-400 to-orange-500 text-black' },
  UR: { text: 'text-pink-200', border: 'border-pink-300', bg: 'from-fuchsia-600 via-sky-600 to-emerald-600', label: 'UR', chip: 'bg-rainbow text-black' },
  LR: { text: 'text-red-300', border: 'border-red-500', bg: 'from-black via-red-950 to-black', label: '✝LR✝', chip: 'bg-black text-red-400 border border-red-500' },
  EX: { text: 'text-cyan-100', border: 'border-cyan-200', bg: 'from-cyan-300 via-violet-500 to-rose-400', label: 'EX', chip: 'bg-gradient-to-r from-cyan-200 via-violet-300 to-rose-200 text-slate-950' },
};

export const TYPE_STYLE: Record<UnitType, { color: string; emoji: string; hex: string }> = {
  本質: { color: 'bg-purple-600', emoji: '✝', hex: '#a855f7' },
  冷笑: { color: 'bg-sky-700', emoji: '🧊', hex: '#38bdf8' },
  面白: { color: 'bg-orange-500', emoji: '😆', hex: '#fb923c' },
  地理: { color: 'bg-emerald-600', emoji: '🗺️', hex: '#34d399' },
  恋愛: { color: 'bg-pink-500', emoji: '💘', hex: '#f472b6' },
};

export function RarityBadge({ r, className = '' }: { r: Rarity; className?: string }) {
  return <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-black leading-none ${RARITY_STYLE[r].chip} ${className}`}>{RARITY_STYLE[r].label}</span>;
}

export function TypeBadge({ t, className = '' }: { t: UnitType; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold leading-none text-white ${TYPE_STYLE[t].color} ${className}`}>
      {TYPE_STYLE[t].emoji}
      {t}
    </span>
  );
}

export function UnitIcon({ def, size = 56, dim = false, className = '' }: { def: UnitDef; size?: number; dim?: boolean; className?: string }) {
  const r = RARITY_STYLE[def.rarity];
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl border-2 ${r.border} bg-gradient-to-br ${r.bg} flex items-center justify-center ${dim ? 'opacity-40 grayscale' : ''} ${def.evolutionEffect && !dim ? `ex-living-icon ex-living-icon--${def.evolutionEffect}` : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      {def.portrait && !dim ? (
        <img src={def.portrait} alt={def.name} className="h-full w-full object-cover" draggable={false} />
      ) : (
        <span className={`unit-icon-glyph ${def.rarity === 'LR' && !dim ? 'anim-glitch text-red-300' : ''} ${def.evolutionEffect === 'phase-break' && !dim ? 'anim-glitch' : ''}`} style={{ fontSize: size * 0.86, lineHeight: 1 }}>
          {dim ? '？' : def.emoji}
        </span>
      )}
      {def.rarity === 'UR' && !dim && <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />}
      {def.evolutionEffect && !dim && <EvolutionAura effect={def.evolutionEffect} />}
    </div>
  );
}

type ExEffect = NonNullable<UnitDef['evolutionEffect']>;

/** Asymmetric, tapered flame ribbons; varied shoulders keep the fire from reading as a row of identical spikes. */
const flameTongue = (cx: number, h: number, hw: number, lean: number) =>
  `M${cx - hw} 108 C ${cx - hw * 1.18} ${108 - h * .26} ${cx - hw * .34} ${108 - h * .43} ${cx + lean - hw * .12} ${108 - h * .72} C ${cx + lean + hw * .08} ${108 - h * .89} ${cx + lean + hw * .18} ${108 - h * .96} ${cx + lean + hw * .38} ${108 - h} C ${cx + lean + hw * .45} ${108 - h * .73} ${cx + hw * .54} ${108 - h * .64} ${cx + hw * .72} ${108 - h * .46} C ${cx + hw * 1.08} ${108 - h * .27} ${cx + hw * 1.04} ${108 - h * .12} ${cx + hw} 108 Z`;

function InfernoScene({ uid }: { uid: string }) {
  const back: [number, number, number, number][] = [[3, 63, 13, 7], [17, 49, 13, -4], [32, 68, 14, 5], [49, 52, 14, -4], [66, 70, 14, -5], [83, 51, 13, 4], [98, 64, 13, -6]];
  const front: [number, number, number, number][] = [[10, 35, 10, -4], [29, 43, 11, 4], [50, 37, 12, -3], [72, 46, 11, 5], [91, 34, 10, -4]];
  return (
    <>
      <defs>
        <linearGradient id={`${uid}fO`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#6e100c" />
          <stop offset=".28" stopColor="#e33113" />
          <stop offset=".62" stopColor="#ff7623" />
          <stop offset=".86" stopColor="#ffc34d" />
          <stop offset="1" stopColor="#fff4c2" />
        </linearGradient>
        <linearGradient id={`${uid}fI`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ed4a13" />
          <stop offset=".52" stopColor="#ff9b28" />
          <stop offset=".84" stopColor="#ffe078" />
          <stop offset="1" stopColor="#fffef1" />
        </linearGradient>
        <radialGradient id={`${uid}coal`} cx=".5" cy="1" r=".95">
          <stop offset="0" stopColor="#fff2b4" stopOpacity=".95" />
          <stop offset=".3" stopColor="#ff9c32" stopOpacity=".82" />
          <stop offset=".72" stopColor="#ee3413" stopOpacity=".38" />
          <stop offset="1" stopColor="#ff5a00" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}heat`} cx=".5" cy="1" r=".9">
          <stop offset="0" stopColor="#fff0b0" stopOpacity=".9" />
          <stop offset=".32" stopColor="#ff7b22" stopOpacity=".58" />
          <stop offset="1" stopColor="#ff3510" stopOpacity="0" />
        </radialGradient>
        <filter id={`${uid}glow`} x="-35%" y="-35%" width="170%" height="180%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>
      <ellipse className="ex-heat-haze" cx="50" cy="94" rx="70" ry="60" fill={`url(#${uid}heat)`} filter={`url(#${uid}glow)`} />
      <ellipse className="ex-coals" cx="50" cy="106" rx="62" ry="24" fill={`url(#${uid}coal)`} />
      <g className="ex-flames ex-flames--back">
        {back.map(([x, h, hw, lean], i) => (
          <path key={i} className="ex-flame ex-flame--back" style={{ '--n': i } as CSSProperties} d={flameTongue(x, h, hw, lean)} fill={`url(#${uid}fO)`} />
        ))}
      </g>
      <g className="ex-flames ex-flames--front">
        {front.map(([x, h, hw, lean], i) => (
          <path key={i} className="ex-flame ex-flame--front" style={{ '--n': i } as CSSProperties} d={flameTongue(x, h, hw, lean)} fill={`url(#${uid}fI)`} />
        ))}
      </g>
    </>
  );
}

/** 数理零：夕陽の黒板に数式が刻まれていく。巨大なΣを残照に、チョークの式が明滅する。 */
function AfterglowScene() {
  const formulas: [number, number, string][] = [
    [46, 18, '∫ f(x)dx'],
    [7, 32, 'lim ε→0'],
    [62, 81, 'Σ xᵢ²'],
    [10, 76, 'dy/dt'],
    [84, 47, '∞'],
  ];
  return (
    <>
      <path className="ex-axes" d="M13 89 H93 M13 89 V11" />
      <text className="ex-axiom" x="50" y="74" textAnchor="middle">∑</text>
      <path className="ex-plot ex-plot--para" pathLength={240} d="M21 14 Q50 86 79 14" />
      <path className="ex-plot ex-plot--sine" pathLength={240} d="M9 56 Q22 39 35 56 T61 56 T87 56" />
      <g className="ex-formulas">
        {formulas.map(([x, y, t], i) => (
          <text key={i} x={x} y={y} style={{ '--n': i } as CSSProperties}>{t}</text>
        ))}
      </g>
    </>
  );
}

function StarfallScene({ uid }: { uid: string }) {
  const points: [number, number, number][] = [[20, 26, 1], [41, 47, 0.72], [32, 76, 0.84], [61, 59, 1.2], [80, 83, 0.7], [72, 37, 0.95]];
  return (
    <>
      <defs>
        <linearGradient id={`${uid}cmA`} gradientUnits="userSpaceOnUse" x1="124" y1="-10" x2="-24" y2="96">
          <stop offset="0" stopColor="#cfe6ff" stopOpacity="0" />
          <stop offset=".65" stopColor="#cfe6ff" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id={`${uid}cmB`} gradientUnits="userSpaceOnUse" x1="-16" y1="14" x2="84" y2="126">
          <stop offset="0" stopColor="#c5ddff" stopOpacity="0" />
          <stop offset=".65" stopColor="#c5ddff" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <ellipse className="ex-starmap" cx="50" cy="50" rx="64" ry="20" transform="rotate(-24 50 50)" />
      <path className="ex-web" pathLength={200} d="M20 26 L41 47 M41 47 L32 76 M41 47 L61 59 M61 59 L80 83 M61 59 L72 37" />
      {points.map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <path className="ex-starpt" style={{ '--n': i } as CSSProperties} d="M0 -5.5 L1.4 -1.4 L5.5 0 L1.4 1.4 L0 5.5 L-1.4 1.4 L-5.5 0 L-1.4 -1.4 Z" />
        </g>
      ))}
      <path className="ex-comet" pathLength={260} d="M124 -10 L-24 96" stroke={`url(#${uid}cmA)`} />
      <path className="ex-comet ex-comet--b" pathLength={260} d="M-16 14 L84 126" stroke={`url(#${uid}cmB)`} />
    </>
  );
}

function ContourScene() {
  return (
    <>
      <g className="ex-ridge">
        <path className="ex-ridge__line" style={{ '--n': 0 } as CSSProperties} d="M22 82 C 8 70 10 48 24 37 C 39 25 60 29 67 44 C 74 59 66 76 51 82 C 39 87 30 89 22 82 Z" />
        <path className="ex-ridge__line" style={{ '--n': 1 } as CSSProperties} d="M30 75 C 21 67 22 52 31 45 C 41 37 55 40 60 50 C 65 60 60 71 50 75 C 42 79 36 80 30 75 Z" />
        <path className="ex-ridge__line ex-ridge__core" style={{ '--n': 2 } as CSSProperties} d="M38 68 C 32 63 33 54 39 50 C 45 46 53 48 56 54 C 59 60 55 67 49 69 C 45 71 41 71 38 68 Z" />
        <path className="ex-ridge__line" style={{ '--n': 1 } as CSSProperties} d="M64 34 C 62 26 68 19 76 18 C 84 17 91 23 91 30 C 91 36 84 41 76 41 C 70 41 66 39 64 34 Z" />
        <path className="ex-ridge__line ex-ridge__core" style={{ '--n': 2 } as CSSProperties} d="M72 33 C 71 29 74 25 78 25 C 82 25 85 28 85 31 C 85 34 81 37 77 36 C 74 36 73 35 72 33 Z" />
        <path className="ex-ridge__sweep" pathLength={240} d="M22 82 C 8 70 10 48 24 37 C 39 25 60 29 67 44 C 74 59 66 76 51 82 C 39 87 30 89 22 82 Z" />
      </g>
      <path className="ex-seismo" pathLength={240} d="M0 92 H22 L30 82 L38 99 L45 86 L51 92 H100" />
      <path className="ex-summit" d="M78 10.5 l4.5 7.5 h-9 Z" />
      <text className="ex-summit-label" x="67" y="9">1620</text>
    </>
  );
}

function CourtPassScene() {
  return (
    <>
      <g className="ex-courtlines">
        <path d="M-6 60 L106 32" />
        <path d="M-6 78 L106 50" />
        <path d="M-6 42 L106 14" />
      </g>
      <path className="ex-trajectory" d="M-14 86 Q40 42 116 10" />
      <path className="ex-trajectory ex-trajectory--pulse" pathLength={240} d="M-14 86 Q40 42 116 10" />
      <path className="ex-speedline" d="M6 58 h24 M32 70 h16" />
      <g transform="translate(-14 86)">
        <g className="ex-ballsquad">
          <circle className="ex-ballglow" r="11" />
          <circle className="ex-ball" r="6.5" />
          <path className="ex-ballseam" d="M-5 -2 Q 0 1.5 5 -1 M-4 3.5 Q 0 5.5 4 3.5" />
        </g>
      </g>
    </>
  );
}

function PhaseBreakScene() {
  const shards: [number, number, number, number][] = [[-16, 13, 74, 6], [42, 33, 78, 3], [-34, 54, 92, 7], [26, 79, 66, 4]];
  return (
    <>
      <g className="ex-shards">
        {shards.map(([x, y, w, h], i) => (
          <rect key={i} className={`ex-shard ${i % 2 ? 'ex-shard--cyan' : ''}`} style={{ '--n': i } as CSSProperties} x={x} y={y} width={w} height={h} />
        ))}
      </g>
      <path className="ex-rift" d="M-6 40 H58 L46 62 H108" />
      <path className="ex-rift ex-rift--echo" d="M-6 40 H58 L46 62 H108" />
      <rect className="ex-scanband" x="0" y="-24" width="100" height="12" />
      <g className="ex-corners">
        <path d="M10 16 V10 H16" />
        <path d="M90 84 V90 H84" />
      </g>
    </>
  );
}

function StrataScene({ uid }: { uid: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${uid}mag`} cx=".5" cy="1" r=".9">
          <stop offset="0" stopColor="#ffcf7d" stopOpacity=".9" />
          <stop offset=".5" stopColor="#c97f3d" stopOpacity=".45" />
          <stop offset="1" stopColor="#c97f3d" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse className="ex-magma" cx="50" cy="116" rx="60" ry="30" fill={`url(#${uid}mag)`} />
      <g className="ex-bands">
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} className={`ex-band ${i % 2 ? 'ex-band--dark' : ''}`} style={{ '--n': i } as CSSProperties}
            d={`M-40 ${56 + i * 11} C 0 ${50 + i * 11} 30 ${63 + i * 11} 62 ${57 + i * 11} C 90 ${52 + i * 11} 118 ${61 + i * 11} 150 ${56 + i * 11}`} />
        ))}
      </g>
      <path className="ex-fossil" d="M51 22 C 60 23 66 32 63 41 C 60 50 48 53 41 47 C 35 41 36 31 43 28 C 49 25 56 28 57 35 C 58 41 53 45 48 43 C 45 41 44 37 47 34" />
      <path className="ex-veinflow" pathLength={240} d="M4 99 L27 77 L42 83 L59 59 L73 64 L106 30" />
    </>
  );
}

export function EvolutionAura({ effect, active = true }: { effect: ExEffect; active?: boolean }) {
  const uid = useId();
  return (
    <div className={`unit-evo-fx unit-evo-fx--${effect} ${active ? 'is-active' : ''}`} aria-hidden="true">
      <span className="unit-evo-fx__wash" />
      <span className="unit-evo-fx__depth" />
      <svg className="unit-evo-fx__scene" viewBox="0 0 100 100" fill="none">
        {effect === 'inferno' && <InfernoScene uid={uid} />}
        {effect === 'afterglow' && <AfterglowScene />}
        {effect === 'starfall' && <StarfallScene uid={uid} />}
        {effect === 'contour' && <ContourScene />}
        {effect === 'court-pass' && <CourtPassScene />}
        {effect === 'phase-break' && <PhaseBreakScene />}
        {effect === 'strata-memory' && <StrataScene uid={uid} />}
      </svg>
      <span className="unit-evo-fx__corona" />
      <span className="unit-evo-fx__glint" />
      {Array.from({ length: effect === 'inferno' ? 9 : 6 }, (_, i) => <i key={i} className="unit-evo-fx__mote" style={{ '--n': i } as CSSProperties} />)}
    </div>
  );
}

export function ItemIcon({ item, size = 44 }: { item: ItemDef; size?: number }) {
  const r = RARITY_STYLE[item.rarity];
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-lg border-2 ${r.border} bg-gradient-to-br ${r.bg}`} style={{ width: size, height: size }}>
      <span style={{ fontSize: size * 0.52, lineHeight: 1 }}>{item.emoji}</span>
    </div>
  );
}

export function Bar({ value, color = 'bg-emerald-500', h = 6, className = '' }: { value: number; color?: string; h?: number; className?: string }) {
  const v = Math.max(0, Math.min(1, isFinite(value) ? value : 0));
  return (
    <div className={`w-full overflow-hidden rounded-full bg-black/50 ${className}`} style={{ height: h }}>
      <div className={`h-full rounded-full ${color} transition-[width] duration-150`} style={{ width: `${v * 100}%` }} />
    </div>
  );
}

export function Stars({ n, max = 5 }: { n: number; max?: number }) {
  if (n > 5) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/20 px-1 py-0.2 text-[10px] font-bold text-amber-300">
        <span>★</span>
        <span>{n}</span>
      </span>
    );
  }
  return (
    <span className="text-[11px] leading-none tracking-tighter">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < n ? 'text-amber-300' : 'text-white/20'}>
          ★
        </span>
      ))}
    </span>
  );
}

export function Modal({ open, onClose, title, children, wide = false }: { open: boolean; onClose?: () => void; title?: ReactNode; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`anim-pop relative max-h-[92vh] w-full overflow-y-auto rounded-2xl border border-white/15 bg-[#151030] p-4 shadow-2xl shadow-purple-900/50 ${wide ? 'max-w-3xl' : 'max-w-md'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {onClose && (
          <button onClick={onClose} className="absolute right-3 top-2 text-xl text-white/60 hover:text-white" aria-label="閉じる">
            ✕
          </button>
        )}
        {title && <h3 className="mb-3 pr-6 font-display text-lg text-purple-200">{title}</h3>}
        {children}
      </div>
    </div>
  );
}

type Variant = 'primary' | 'gold' | 'ghost' | 'danger' | 'green';
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 text-white border-purple-300/40',
  gold: 'bg-gradient-to-b from-amber-400 to-orange-600 hover:from-amber-300 hover:to-orange-500 text-black border-amber-200/60',
  ghost: 'bg-white/5 hover:bg-white/10 text-slate-100 border-white/15',
  danger: 'bg-gradient-to-b from-rose-500 to-rose-700 hover:from-rose-400 text-white border-rose-300/40',
  green: 'bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 text-white border-emerald-300/40',
};

export function Btn({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  small = false,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: Variant;
  className?: string;
  small?: boolean;
  title?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`tap-none rounded-xl border font-bold shadow-sm transition active:scale-95 disabled:opacity-40 disabled:saturate-0 disabled:active:scale-100 ${small ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm'} ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Panel({ title, right, children, className = '' }: { title?: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:p-4 ${className}`}>
      {(title || right) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="font-display text-base text-purple-100 sm:text-lg">{title}</h2>}
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`tap-none rounded-full border px-3 py-1 text-xs font-bold transition ${active ? 'border-purple-300 bg-purple-600 text-white' : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'}`}
    >
      {children}
    </button>
  );
}
