import { useGame } from '../game/store';

const CLS = {
  info: 'border-white/20 bg-slate-800/95 text-slate-100',
  good: 'border-emerald-300/50 bg-emerald-900/95 text-emerald-50',
  rare: 'border-amber-300/60 bg-gradient-to-r from-amber-700/95 to-rose-800/95 text-amber-50',
  bad: 'border-rose-300/50 bg-rose-950/95 text-rose-100',
};

export default function Toasts() {
  const toasts = useGame((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed left-1/2 top-24 z-[70] flex w-[min(92vw,440px)] -translate-x-1/2 flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className={`anim-pop rounded-xl border px-3 py-2 text-sm font-bold shadow-xl ${CLS[t.kind]}`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}
