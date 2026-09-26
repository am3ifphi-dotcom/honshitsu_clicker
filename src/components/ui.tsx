import type { ReactNode } from 'react';
import type { ItemDef, Rarity, UnitDef, UnitType } from '../game/types';

export const RARITY_STYLE: Record<Rarity, { text: string; border: string; bg: string; label: string; chip: string }> = {
  N: { text: 'text-slate-300', border: 'border-slate-500', bg: 'from-slate-600 to-slate-800', label: 'N', chip: 'bg-slate-600 text-slate-100' },
  R: { text: 'text-sky-300', border: 'border-sky-400', bg: 'from-sky-700 to-slate-800', label: 'R', chip: 'bg-sky-600 text-white' },
  SR: { text: 'text-violet-300', border: 'border-violet-400', bg: 'from-violet-700 to-slate-800', label: 'SR', chip: 'bg-violet-600 text-white' },
  SSR: { text: 'text-amber-300', border: 'border-amber-400', bg: 'from-amber-600 to-rose-900', label: 'SSR', chip: 'bg-gradient-to-r from-amber-400 to-orange-500 text-black' },
  UR: { text: 'text-pink-200', border: 'border-pink-300', bg: 'from-fuchsia-600 via-sky-600 to-emerald-600', label: 'UR', chip: 'bg-rainbow text-black' },
  LR: { text: 'text-red-300', border: 'border-red-500', bg: 'from-black via-red-950 to-black', label: '✝LR✝', chip: 'bg-black text-red-400 border border-red-500' },
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
      className={`relative shrink-0 overflow-hidden rounded-xl border-2 ${r.border} bg-gradient-to-br ${r.bg} flex items-center justify-center ${dim ? 'opacity-40 grayscale' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      {def.portrait && !dim ? (
        <img src={def.portrait} alt={def.name} className="h-full w-full object-cover" draggable={false} />
      ) : (
        <span className={def.rarity === 'LR' && !dim ? 'anim-glitch font-display text-red-400' : ''} style={{ fontSize: size * 0.5, lineHeight: 1 }}>
          {dim ? '？' : def.emoji}
        </span>
      )}
      {def.rarity === 'UR' && !dim && <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />}
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
