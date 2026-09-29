import { useEffect, useRef, useState } from 'react';
import { useGame } from '../game/store';
import { SPEAKERS } from '../game/data/chatter';
import { getUnitForm, UNIT_MAP } from '../game/data/units';
import type { ChatMsg } from '../game/types';

function Msg({ m, evolvedUnits }: { m: ChatMsg; evolvedUnits: Record<string, boolean> }) {
  const sp = SPEAKERS[m.s] || SPEAKERS.sys;
  if (m.s === 'sys' || m.s === 'narr') {
    return <div className="anim-fadein mx-auto max-w-[92%] rounded-full bg-white/5 px-3 py-1 text-center text-[11px] text-slate-400">{m.t}</div>;
  }
  const mine = m.s === 'you';
  const unit = sp.unit ? getUnitForm(sp.unit, !!evolvedUnits?.[sp.unit]) : undefined;
  return (
    <div className={`anim-fadein flex items-start gap-1.5 ${mine ? 'flex-row-reverse' : ''}`}>
      {unit?.portrait ? (
        <img src={unit.portrait} alt={sp.name} className="h-8 w-8 shrink-0 rounded-full border border-white/20 object-cover" />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm">{sp.emoji}</div>
      )}
      <div className={`flex max-w-[80%] flex-col ${mine ? 'items-end' : 'items-start'}`}>
        {!mine && (
          <div className="text-[10px] font-bold" style={{ color: sp.color }}>
            {sp.name}
          </div>
        )}
        <div className={`break-words rounded-2xl px-2.5 py-1.5 text-[13px] leading-snug ${mine ? 'rounded-tr-sm bg-emerald-400 text-black' : 'rounded-tl-sm bg-white/10 text-slate-100'}`}>{m.t}</div>
      </div>
    </div>
  );
}

export default function ChatPanel({ onClose }: { onClose?: () => void }) {
  const chat = useGame((s) => s.chat);
  const units = useGame((s) => s.units);
  const evolvedUnits = useGame((s) => s.evolvedUnits);
  const boxRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState('');
  const members = Object.keys(units).filter((id) => UNIT_MAP[id]?.speaker).length + 1;

  useEffect(() => {
    const el = boxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat.length]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    useGame.getState().userSay(t);
    setText('');
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f0b22]/95">
      <div className="flex items-center justify-between border-b border-white/10 bg-emerald-900/30 px-3 py-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-bold">💬 理数科B組（✝）</div>
          <div className="text-[10px] text-slate-400">メンバー {members}人 ／ 三重の「は？」は通知オフ不可</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="px-2 text-xl text-white/60 hover:text-white" aria-label="閉じる">
            ✕
          </button>
        )}
      </div>
      <div ref={boxRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
        {chat.map((m) => (
          <Msg key={m.id} m={m} evolvedUnits={evolvedUnits} />
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-1 border-t border-white/10 p-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="発言する（例：これまじ✝本質✝）"
          maxLength={80}
          className="min-w-0 flex-1 rounded-lg bg-white/10 px-2 py-1.5 text-sm text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-400"
        />
        <button type="submit" className="rounded-lg bg-emerald-500 px-3 text-sm font-bold text-black hover:bg-emerald-400">
          送信
        </button>
      </form>
    </div>
  );
}
