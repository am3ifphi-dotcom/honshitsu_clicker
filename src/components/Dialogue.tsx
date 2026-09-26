import { useState } from 'react';
import type { Line } from '../game/types';
import { SPEAKERS } from '../game/data/chatter';
import { UNIT_MAP } from '../game/data/units';
import bg from '../assets/img/title.jpg';

export default function Dialogue({ title, lines, onDone, doneLabel = '次へ' }: { title: string; lines: Line[]; onDone: () => void; doneLabel?: string }) {
  const [i, setI] = useState(0);
  const [s, t] = lines[Math.min(i, lines.length - 1)];
  const sp = SPEAKERS[s] || SPEAKERS.narr;
  const unit = sp.unit ? UNIT_MAP[sp.unit] : undefined;
  const isNarr = s === 'narr' || s === 'sys';
  const last = i >= lines.length - 1;
  const next = () => {
    if (last) onDone();
    else setI(i + 1);
  };

  return (
    <div className="relative flex min-h-[480px] flex-col overflow-hidden rounded-2xl border border-white/10">
      <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" draggable={false} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/80" />
      <div className="relative flex items-center justify-between gap-2 p-3">
        <div className="min-w-0 truncate font-display text-sm text-purple-100 sm:text-base">{title}</div>
        <button onClick={onDone} className="shrink-0 rounded-lg border border-white/20 bg-black/40 px-3 py-1 text-xs hover:bg-black/60">
          スキップ ⏭
        </button>
      </div>
      <div className="tap-none relative flex flex-1 cursor-pointer items-end justify-center px-4" onClick={next}>
        {!isNarr && (
          <div key={i} className="anim-fadein mb-2">
            {unit?.portrait ? (
              <img src={unit.portrait} alt={sp.name} className="h-44 w-44 rounded-2xl border-2 border-white/30 object-cover shadow-2xl sm:h-56 sm:w-56" />
            ) : (
              <div className="flex h-36 w-36 items-center justify-center rounded-full border-2 border-white/30 bg-black/50 text-7xl shadow-2xl">{sp.emoji}</div>
            )}
          </div>
        )}
      </div>
      <div className="tap-none relative m-3 min-h-[120px] cursor-pointer rounded-xl border border-white/15 bg-black/75 p-4" onClick={next}>
        {!isNarr && (
          <div className="mb-1 text-sm font-bold" style={{ color: sp.color }}>
            {sp.emoji} {sp.name}
          </div>
        )}
        <p key={i} className={`anim-fadein ${isNarr ? 'text-center italic text-slate-200' : 'text-base text-white sm:text-lg'}`}>
          {t}
        </p>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            {i + 1}/{lines.length}
          </span>
          <span className="font-bold text-purple-200">{last ? `▶ ${doneLabel}` : '▼ タップで次へ'}</span>
        </div>
      </div>
    </div>
  );
}
