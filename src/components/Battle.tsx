import { useEffect, useReducer, useRef, useState } from 'react';
import { useGame } from '../game/store';
import { createBattle, stepBattle, tap, useSkill as castSkill, applyItem } from '../game/battle';
import type { BState, Fighter } from '../game/battle';
import { derive, judge } from '../game/formulas';
import { BATTLE_ITEMS } from '../game/data/items';
import { UNIT_MAP } from '../game/data/units';
import type { EnemyDef } from '../game/types';
import { fmt } from '../game/format';
import { Bar, UnitIcon } from './ui';
import battleBg from '../assets/img/battle.jpg';

interface Props {
  title: string;
  rec: number;
  enemies: EnemyDef[];
  onEnd: (win: boolean) => void;
  onRetreat: () => void;
}

export default function Battle({ title, rec, enemies, onEnd, onRetreat }: Props) {
  const ref = useRef<BState | null>(null);
  if (!ref.current) ref.current = createBattle(useGame.getState(), rec, enemies);
  const b = ref.current;
  const [, force] = useReducer((x: number) => x + 1, 0);
  const [speed, setSpeed] = useState(1);
  const [auto, setAuto] = useState(true);
  const speedRef = useRef(1);
  const autoRef = useRef(true);
  const onEndRef = useRef(onEnd);
  const ended = useRef(false);
  const items = useGame((s) => s.items);
  const [myDev] = useState(() => derive(useGame.getState()).battleDev);
  const jd = judge(myDev, rec);

  useEffect(() => {
    speedRef.current = speed;
    autoRef.current = auto;
    onEndRef.current = onEnd;
  });

  useEffect(() => {
    let last = performance.now();
    const id = window.setInterval(() => {
      const t = performance.now();
      const dt = Math.min(0.25, (t - last) / 1000);
      last = t;
      const st = ref.current;
      if (!st) return;
      st.autoSkill = autoRef.current;
      stepBattle(st, dt * speedRef.current);
      force();
      if (st.over && !ended.current) {
        ended.current = true;
        window.setTimeout(() => onEndRef.current(st.over === 'win'), 1400);
      }
    }, 50);
    return () => window.clearInterval(id);
  }, []);

  const nowT = performance.now();
  const floatsFor = (uid: string) =>
    b.floats
      .filter((x) => x.uid === uid)
      .map((x) => (
        <span
          key={x.id}
          className="anim-dmg pointer-events-none absolute left-1/2 top-6 z-10 whitespace-nowrap font-display [text-shadow:0_2px_4px_#000]"
          style={{ color: x.color, fontSize: x.big ? 22 : 15, marginLeft: x.dx }}
        >
          {x.text}
        </span>
      ));

  const enemyCard = (f: Fighter) => (
    <div
      key={f.uid}
      data-uid={f.uid}
      className={`relative flex flex-col items-center rounded-xl border-2 bg-black/55 p-2 backdrop-blur-sm transition ${f.boss ? 'border-rose-500/80' : 'border-white/15'} ${!f.alive ? 'opacity-25 grayscale' : 'cursor-crosshair'} ${b.target === f.uid && f.alive ? 'ring-2 ring-yellow-300' : ''}`}
    >
      {f.boss && <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-rose-600 px-1.5 text-[9px] font-bold">BOSS</span>}
      <div className={`text-4xl leading-none sm:text-5xl ${nowT - f.hitAt < 200 ? 'anim-shake' : ''}`}>{f.emoji}</div>
      <div className="mt-1 w-full truncate text-center text-[10px] font-bold sm:text-[11px]">{f.name}</div>
      <Bar value={f.hp / f.maxHp} color="bg-gradient-to-r from-rose-500 to-red-400" h={7} className="mt-1" />
      <div className="text-[9px] tabular-nums text-slate-300">{fmt(Math.max(0, f.hp))}</div>
      {f.skill && f.alive && <Bar value={f.gauge / f.gaugeMax} color="bg-orange-400" h={3} className="mt-0.5" />}
      {f.stun > 0 && f.alive && <span className="absolute right-1 top-1 text-sm">💫</span>}
      {floatsFor(f.uid)}
    </div>
  );

  const allyCard = (f: Fighter) => {
    const def = f.unitId ? UNIT_MAP[f.unitId] : undefined;
    const ready = !!(f.alive && f.skill && f.gauge >= f.gaugeMax && f.stun <= 0 && !b.over);
    return (
      <button
        key={f.uid}
        onClick={() => {
          if (castSkill(b, f)) force();
        }}
        disabled={!ready}
        className={`tap-none relative flex flex-col items-center rounded-xl border-2 bg-black/60 p-1.5 backdrop-blur-sm disabled:cursor-default ${ready ? 'anim-ready border-yellow-300' : 'border-white/15'} ${!f.alive ? 'opacity-30 grayscale' : ''}`}
      >
        {def && <UnitIcon def={def} size={52} className={nowT - f.hitAt < 200 ? 'anim-shake' : ''} />}
        <div className="mt-1 w-full truncate text-center text-[10px] font-bold">{f.name}</div>
        <div className="relative mt-0.5 w-full">
          <Bar value={f.hp / f.maxHp} color="bg-gradient-to-r from-emerald-500 to-lime-400" h={7} />
          {f.shield > 0 && <div className="absolute inset-0 rounded-full border-2 border-cyan-300/90" />}
        </div>
        <Bar value={f.gauge / f.gaugeMax} color={ready ? 'bg-yellow-300' : 'bg-purple-400'} h={4} className="mt-0.5" />
        <div className="w-full truncate text-center text-[9px] text-slate-300">{ready ? <span className="font-bold text-yellow-300">タップでスキル！</span> : f.skill?.name}</div>
        {f.stun > 0 && f.alive && <span className="absolute right-1 top-1 text-sm">💫</span>}
        {floatsFor(f.uid)}
      </button>
    );
  };

  const cut = b.cutin;
  const cutDef = cut?.unitId ? UNIT_MAP[cut.unitId] : undefined;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10">
      <img src={battleBg} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/75" />
      <div className="relative flex min-h-[590px] flex-col gap-3 p-2 sm:p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-sm text-white sm:text-base">{title}</div>
            <div className="text-[11px] text-slate-300">
              推奨偏差値 {rec} ／ あなた {myDev.toFixed(1)}{' '}
              <span className="font-bold" style={{ color: jd.color }}>
                {jd.grade}判定
              </span>
            </div>
          </div>
          <div className={`rounded-lg px-2 py-1 font-mono text-sm font-bold ${b.limit - b.time < 15 ? 'bg-rose-600/80 text-white' : 'bg-black/50 text-slate-100'}`}>🔔 {Math.max(0, Math.ceil(b.limit - b.time))}s</div>
          <div className="flex overflow-hidden rounded-lg border border-white/20">
            {[1, 2, 3].map((v) => (
              <button key={v} onClick={() => setSpeed(v)} className={`px-2 py-1 text-xs font-bold ${speed === v ? 'bg-purple-600 text-white' : 'bg-black/40 text-slate-300'}`}>
                ×{v}
              </button>
            ))}
          </div>
          <button onClick={() => setAuto((a) => !a)} className={`rounded-lg border px-2 py-1 text-xs font-bold ${auto ? 'border-emerald-300 bg-emerald-600/80' : 'border-white/20 bg-black/40 text-slate-300'}`}>
            オートスキル{auto ? 'ON' : 'OFF'}
          </button>
          <button onClick={onRetreat} className="rounded-lg border border-white/20 bg-black/40 px-2 py-1 text-xs text-slate-300 hover:bg-black/60">
            早退する
          </button>
        </div>

        <div
          className="tap-none grid flex-1 content-center gap-2"
          style={{ gridTemplateColumns: `repeat(${Math.min(5, b.enemies.length)}, minmax(0, 1fr))` }}
          onPointerDown={(e) => {
            const el = (e.target as HTMLElement).closest('[data-uid]') as HTMLElement | null;
            tap(b, el?.dataset.uid);
            force();
          }}
        >
          {b.enemies.map(enemyCard)}
        </div>
        <div className="text-center text-[11px] text-purple-200/80">▲ 敵をタップ（連打）で✝本質✝ダメージ＆味方のスキルゲージUP ▲</div>

        <div className="rounded-lg bg-black/55 px-3 py-1.5 text-xs">
          <div className="font-bold text-white">{b.log[0]}</div>
          {b.log.slice(1, 3).map((l, i) => (
            <div key={i} className="truncate text-slate-400">
              {l}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2">{b.allies.map(allyCard)}</div>

        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {BATTLE_ITEMS.map((it) => {
            const cnt = items[it.id] || 0;
            return (
              <button
                key={it.id}
                disabled={cnt <= 0 || !!b.over}
                onClick={() => {
                  if (it.effect && useGame.getState().consumeItem(it.id)) {
                    applyItem(b, it.effect);
                    force();
                  }
                }}
                title={it.desc}
                className="tap-none flex shrink-0 items-center gap-1 rounded-lg border border-white/15 bg-black/55 px-2 py-1 text-xs hover:bg-black/70 disabled:opacity-35"
              >
                <span className="text-base">{it.emoji}</span>
                <span className="max-w-[6rem] truncate">{it.name}</span>
                <span className="font-bold text-amber-200">×{cnt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {cut && (
        <div key={cut.until} className="pointer-events-none absolute inset-x-0 top-[38%] z-20">
          <div className={`anim-cutin flex items-center gap-3 px-6 py-3 shadow-2xl ${cut.side === 'ally' ? 'bg-gradient-to-r from-purple-800/95 via-fuchsia-600/95 to-purple-800/95' : 'bg-gradient-to-r from-rose-950/95 via-red-700/95 to-rose-950/95'}`}>
            <div style={{ transform: 'skewX(12deg)' }} className="flex items-center gap-3">
              {cutDef ? <UnitIcon def={cutDef} size={60} /> : <span className="text-5xl">{cut.emoji}</span>}
              <div className="min-w-0">
                <div className="text-[11px] text-white/80">{cut.name}</div>
                <div className="font-display text-lg leading-tight text-white sm:text-2xl">「{cut.line}」</div>
                <div className="text-xs font-bold text-amber-200">{cut.skill}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {b.over && (
        <div className="anim-fadein absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 text-center">
          <div className={`anim-pop font-display text-6xl ${b.over === 'win' ? 'text-amber-300' : 'text-slate-300'}`}>{b.over === 'win' ? '勝利！' : '敗北…'}</div>
          <div className="mt-2 px-4 text-sm text-white">{b.overReason}</div>
          <div className="mt-1 text-xs text-slate-400">タップ回数 {b.taps}回</div>
        </div>
      )}
    </div>
  );
}
