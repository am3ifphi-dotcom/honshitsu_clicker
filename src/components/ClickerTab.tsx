import { useEffect, useRef, useState } from 'react';
import { useGame } from '../game/store';
import { derive, bulkCost, maxAffordable, milestoneMult, nextMilestone } from '../game/formulas';
import { FACILITIES } from '../game/data/facilities';
import { TICKER } from '../game/data/chatter';
import { fmt, pct } from '../game/format';
import { Panel, Chip } from './ui';
import { sfx } from '../utils/sfx';

interface Floater {
  id: number;
  x: number;
  y: number;
  text: string;
  crit: boolean;
  word: string;
}

let fid = 0;
const WORDS = ['✝本質✝', 'まじ✝本質✝', 'は？', '面白い', '見てない', '自己対話', 'うるさい', 'まあ', '草', '✝', '四百二十一回目です'];
const QUOTES = [
  '本質を追えば追うほど、本質は遠くなる。',
  '良い山に登った日の夜は、必ず福来る。',
  '動物に好かれた者だけが、本質の入口に立つことができる。',
  '夜道に出ろ。昼には見えなかった本質が、そこにある。',
  '正しいことより、本当のことの方が大事だ。',
  '笑われた数だけ、本質に近づく。',
  'コーンスープは、あるときより、ないときの方が本質である。',
  '雨の前の匂いを知っている人間は、すでに本質の入口に立っている。',
  '本質は、黙っているときに来る。',
  '電柱の影を踏んで歩いたことがある人間は、少しだけ本質に近い。',
  '本質とは何か、という問いに答えが出た瞬間、それはもう本質ではない。',
  '地面は忘れない。',
];

export default function ClickerTab() {
  const s = useGame();
  const d = derive(s);
  const [floats, setFloats] = useState<Floater[]>([]);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [pressKey, setPressKey] = useState(0);
  const [mode, setMode] = useState<1 | 10 | 'max'>(1);
  const [quote, setQuote] = useState(0);
  const [tick, setTick] = useState(0);
  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setQuote((q) => (q + 1) % QUOTES.length), 9000);
    const t2 = setInterval(() => setTick((q) => (q + 1) % TICKER.length), 30000);
    return () => {
      clearInterval(t);
      clearInterval(t2);
    };
  }, []);

  const doClick = (clientX: number, clientY: number) => {
    const el = areaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const r = useGame.getState().click();
    if (r.crit) sfx.crit();
    else sfx.tap();
    const id = ++fid;
    const word = r.crit ? 'まじ✝本質✝！' : Math.random() < 0.15 ? WORDS[Math.floor(Math.random() * WORDS.length)] : '';
    setFloats((f) => [...f.slice(-24), { id, x, y, text: '+' + fmt(r.amount), crit: r.crit, word }]);
    setRipples((rr) => [...rr.slice(-6), { id, x, y }]);
    setPressKey((k) => k + 1);
    setTimeout(() => {
      setFloats((f) => f.filter((z) => z.id !== id));
      setRipples((rr) => rr.filter((z) => z.id !== id));
    }, 1000);
  };

  const revealed = (idx: number) => idx === 0 || (s.facilities[FACILITIES[idx - 1].id] || 0) > 0 || (s.facilities[FACILITIES[idx].id] || 0) > 0;
  const firstLocked = FACILITIES.findIndex((_, i) => !revealed(i));

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(320px,430px)]">
      <div className="space-y-3">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
          <div key={tick} className="anim-marquee inline-block whitespace-nowrap py-1 pl-[100%] text-xs text-amber-200/90">
            📰 {TICKER[tick]}
          </div>
        </div>

        <Guide />

        <div
          ref={areaRef}
          className="chalkboard tap-none relative h-[380px] overflow-hidden rounded-2xl border-4 border-amber-900/70 shadow-inner sm:h-[440px]"
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest('[data-golden]')) return;
            doClick(e.clientX, e.clientY);
          }}
        >
          <div className="pointer-events-none absolute left-3 top-2 text-[11px] text-white/60">北棟2階 理数科B組 ／ 本日の日直：両馬</div>
          <div className="pointer-events-none absolute right-3 top-2 text-right text-[11px] text-white/60">
            今日の✝本質✝
            <div key={quote} className="anim-fadein max-w-[14rem] font-bold text-white/85">「{QUOTES[quote]}」</div>
          </div>
          <div className="pointer-events-none absolute bottom-2 left-3 text-[11px] text-white/50">✎ 等高線の間隔が狭い＝傾斜が急</div>
          <div className="pointer-events-none absolute bottom-2 right-3 text-[11px] text-white/50">倉石の記録：✝クリック {s.clicks.toLocaleString()}回目です</div>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="pointer-events-none absolute h-72 w-72 rounded-full border border-purple-300/20 anim-spin-slow" style={{ borderStyle: 'dashed' }} />
            <div key={pressKey} className={`cross-glow ${pressKey ? 'anim-press' : ''}`}>
              <svg viewBox="0 0 100 140" className="h-52 w-40 sm:h-60 sm:w-44 drop-shadow-xl">
                <defs>
                  <linearGradient id="crossG" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f5d0fe" />
                    <stop offset="45%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#6d28d9" />
                  </linearGradient>
                </defs>
                <path d="M40 4 h20 v36 h36 v20 h-36 v76 h-20 v-76 h-36 v-20 h36 z" fill="url(#crossG)" stroke="#faf5ff" strokeWidth="3" strokeLinejoin="round" />
                <path d="M44 10 h6 v34 h-6 z" fill="white" opacity="0.35" />
              </svg>
            </div>
            <div className="mt-2 rounded-full bg-black/40 px-3 py-1 text-center text-xs font-bold text-purple-100">
              ✝をクリック（連打OK）→ +{fmt(d.clickPower)} ✝本質✝
            </div>
          </div>

          {ripples.map((r) => (
            <span key={r.id} className="anim-ripple pointer-events-none absolute h-24 w-24 rounded-full border-2 border-purple-200/70" style={{ left: r.x, top: r.y }} />
          ))}
          {floats.map((f) => (
            <div key={f.id} className="anim-float pointer-events-none absolute whitespace-nowrap text-center font-display" style={{ left: f.x, top: f.y - 20 }}>
              <div className={f.crit ? 'text-2xl text-amber-300 drop-shadow' : 'text-lg text-white drop-shadow'}>{f.text}</div>
              {f.word && <div className={`text-xs ${f.crit ? 'text-amber-200' : 'text-purple-200'}`}>{f.word}</div>}
            </div>
          ))}

          {s.golden && (
            <button
              data-golden
              onPointerDown={(e) => {
                e.stopPropagation();
                useGame.getState().clickGolden();
              }}
              className="anim-golden absolute z-10 text-5xl"
              style={{ left: `${s.golden.x}%`, top: `${s.golden.y}%` }}
              title="黄金の✝"
            >
              <span className="font-display text-amber-300 [text-shadow:0_0_12px_#fde047]">✝</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <Stat label="クリック力" value={fmt(d.clickPower)} />
          <Stat label="会心（まじ✝本質✝）" value={`${pct(d.m.critChance, 1)} ×${d.m.critMult.toFixed(1)}`} />
          <Stat label="毎秒✝本質✝" value={fmt(d.perSec)} />
          <Stat label="全体倍率" value={`×${fmt(d.globalMult)}`} />
        </div>
        {d.m.autoClick > 0 && <div className="text-center text-xs text-emerald-300">✋ 三年目の挙手：毎秒{d.m.autoClick}回オートクリック中</div>}
      </div>

      <Panel
        title="本質発生源"
        right={
          <div className="flex gap-1">
            {([1, 10, 'max'] as const).map((m) => (
              <Chip key={String(m)} active={mode === m} onClick={() => setMode(m)}>
                {m === 'max' ? 'MAX' : `×${m}`}
              </Chip>
            ))}
          </div>
        }
        className="lg:max-h-[calc(100vh-150px)] lg:overflow-y-auto"
      >
        <div className="space-y-2">
          {FACILITIES.map((f, idx) => {
            const owned = s.facilities[f.id] || 0;
            if (!revealed(idx)) {
              if (idx !== firstLocked) return null;
              return (
                <div key={f.id} className="flex items-center gap-3 rounded-xl border border-dashed border-white/15 bg-black/20 p-2 opacity-70">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 text-xl">？</div>
                  <div className="flex-1 text-xs text-slate-400">
                    ？？？（前の発生源を買うと判明）
                    <div className="text-slate-500">必要：✝{fmt(f.baseCost)}</div>
                  </div>
                </div>
              );
            }
            const base = f.baseCost * Math.max(0.2, 1 - d.m.costReduce);
            const aff = maxAffordable(base, owned, s.honshitsu);
            const n = mode === 'max' ? Math.max(1, aff) : mode;
            const cost = bulkCost(base, owned, n);
            const can = s.honshitsu >= cost * (1 - 1e-9);
            const per = f.baseProd * milestoneMult(owned) * d.globalMult;
            const nm = nextMilestone(owned);
            return (
              <button
                key={f.id}
                onClick={() => useGame.getState().buyFacility(f.id, mode)}
                disabled={!can}
                className={`tap-none flex w-full items-center gap-3 rounded-xl border p-2 text-left transition active:scale-[0.99] ${can ? 'border-purple-400/40 bg-purple-500/10 hover:bg-purple-500/20' : 'border-white/10 bg-black/20 opacity-70'}`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 text-2xl">{f.emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-bold">{f.name}</span>
                    <span className="font-display text-lg text-purple-200">{owned}</span>
                  </div>
                  <div className="truncate text-[11px] text-slate-400">{owned > 0 ? `「${f.flavor}」` : f.desc}</div>
                  <div className="mt-0.5 flex flex-wrap items-center justify-between gap-x-2 text-[11px]">
                    <span className="text-emerald-300">
                      +{fmt(per)}/秒{owned > 0 && <span className="text-slate-400">（計 {fmt(per * owned)}）</span>}
                    </span>
                    <span className={can ? 'font-bold text-amber-200' : 'text-rose-300'}>
                      {mode !== 1 && `×${n} `}✝{fmt(cost)}
                    </span>
                  </div>
                  {nm && owned > 0 && <div className="text-[10px] text-slate-500">{nm}個で生産×2（あと{nm - owned}）</div>}
                </div>
              </button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function Guide() {
  const s = useGame();
  const [hidden, setHidden] = useState(false);
  const steps: [string, boolean][] = [
    ['中央の✝を30回クリック（連打OK）', s.allClicks >= 30],
    ['右の「本質発生源」を買う（放置で✝本質✝が増える）', Object.keys(s.facilities).length > 0],
    ['🥫召喚タブで部員を召喚する（最初の10連は無料分あり）', s.pulls > 0],
    ['📖ストーリーの「序」をクリアする', !!s.story['y1-0']],
    ['👥部員タブで部員をLv5以上にする（戦闘偏差値UP）', Object.values(s.units).some((u) => u.level >= 5)],
    ['🌳スキルタブでスキルポイントを振る', Object.keys(s.skills).length > 0],
    ['総合偏差値60で🎓卒業（転生）する', s.rebirths > 0],
  ];
  const done = steps.filter((x) => x[1]).length;
  if (hidden || s.rebirths > 0 || done === steps.length) return null;
  return (
    <div className="rounded-2xl border border-amber-300/30 bg-amber-500/10 p-3">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-sm font-bold text-amber-100">
          🔰 はじめての✝本質✝（{done}/{steps.length}）
        </div>
        <button onClick={() => setHidden(true)} className="text-xs text-slate-400 hover:text-white">
          閉じる
        </button>
      </div>
      <ul className="grid gap-x-4 gap-y-0.5 text-xs sm:grid-cols-2">
        {steps.map(([t, ok]) => (
          <li key={t} className={ok ? 'text-emerald-300 line-through decoration-emerald-300/50' : 'text-slate-200'}>
            {ok ? '✅' : '⬜'} {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-[10px] text-slate-400">{label}</div>
      <div className="font-bold text-purple-100">{value}</div>
    </div>
  );
}
