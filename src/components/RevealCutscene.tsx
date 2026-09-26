import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { PullResult, Rarity, UnitDef } from '../game/types';
import { UNIT_MAP } from '../game/data/units';
import { rarityRank } from '../game/formulas';
import { RarityBadge, TypeBadge } from './ui';
import { sfx } from '../utils/sfx';

// ───────── タイミング（ms） ─────────
const T_SQUARE = 820; // 正方形の画像が叩き込まれる
const T_IDENT = 1480; // 名前・称号が飛び出す
const T_READY = 3150; // ステータス表示・タップ待機
const T_AUTO = 8800; // 自動で次へ

// ───────── レアリティ別テーマ ─────────
interface Theme {
  bg: string;
  halo: string; // conic-gradient
  glow: string; // box-shadow
  ring: string; // 衝撃波リングの色
  sigil: string;
  vignette: string;
  heavy: boolean; // UR以上
}

function themeOf(r: Rarity): Theme {
  if (r === 'LR')
    return {
      bg: 'radial-gradient(circle at 50% 32%, rgba(220,38,38,0.34), rgba(8,2,2,0.97) 62%)',
      halo: 'conic-gradient(#000 0deg, #ef4444 40deg, #7f1d1d 90deg, #fff 130deg, #ef4444 180deg, #000 230deg, #b91c1c 300deg, #000 360deg)',
      glow: '0 0 60px rgba(239,68,68,0.85), 0 0 160px rgba(239,68,68,0.45)',
      ring: 'rgba(239,68,68,0.9)',
      sigil: '☨',
      vignette: 'radial-gradient(circle at 50% 45%, transparent 42%, rgba(127,29,29,0.5) 78%, rgba(0,0,0,0.92) 100%)',
      heavy: true,
    };
  if (r === 'UR')
    return {
      bg: 'radial-gradient(circle at 50% 32%, rgba(168,85,247,0.36), rgba(10,6,26,0.97) 62%)',
      halo: 'conic-gradient(#f472b6, #facc15, #4ade80, #38bdf8, #a78bfa, #f472b6)',
      glow: '0 0 55px rgba(232,121,249,0.8), 0 0 150px rgba(56,189,248,0.45)',
      ring: 'rgba(232,121,249,0.9)',
      sigil: '✝',
      vignette: 'radial-gradient(circle at 50% 45%, transparent 42%, rgba(88,28,135,0.45) 78%, rgba(6,2,18,0.92) 100%)',
      heavy: true,
    };
  return {
    bg: 'radial-gradient(circle at 50% 32%, rgba(245,158,11,0.32), rgba(22,12,3,0.97) 62%)',
    halo: 'conic-gradient(#b45309, #fbbf24, #fde68a, #f59e0b, #b45309)',
    glow: '0 0 48px rgba(251,191,36,0.75), 0 0 130px rgba(245,158,11,0.4)',
    ring: 'rgba(251,191,36,0.85)',
    sigil: '✝',
    vignette: 'radial-gradient(circle at 50% 45%, transparent 42%, rgba(120,53,15,0.42) 78%, rgba(8,4,1,0.9) 100%)',
    heavy: false,
  };
}

// ───────── キャラ別フレーバー（gensaku.txtより） ─────────
type LayerKind = 'cross' | 'contour' | 'glitch' | 'glint' | 'none';

const FLAVOR: Record<string, { words: string[]; layer: LayerKind }> = {
  ryoma: { words: ['これまじ✝本質✝', 'まじ✝本質✝', '✝', '自演じゃない'], layer: 'cross' },
  mie: { words: ['は？', 'まあ', 'やめろ'], layer: 'none' },
  terachi: { words: ['紙に書いて読みます', '（固まった）', 'ペットボトルくらいの存在です'], layer: 'none' },
  sato: { words: ['見てない', 'うるさい', '用は済んだ'], layer: 'none' },
  itoshizu: { words: ['東と西で石が違う', '地質境界線', '諸説ある'], layer: 'contour' },
  rei: { words: ['面白い', '家が近いから', '偏差値85'], layer: 'none' },
  heikatsu: { words: ['……（口が動く）', '地面は忘れない', '等高線の向こう側'], layer: 'contour' },
  feikatsu: { words: ['受験生よ、来い。✝', 'フェイカツは概念だ', '✝本質✝祈願'], layer: 'glitch' },
  pregen: { words: ['存在しないが、ある', '…………', '☨'], layer: 'glitch' },
  jimen: { words: ['地面は忘れない', '全部記録している', '地図は人間が作る'], layer: 'contour' },
};

const SCRAMBLE_CHARS = '✝☨※混沌本質笑壊空□△／＼';

// ───────── 装飾レイヤー ─────────

function ShockRings({ color, n = 3 }: { color: string; n?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: n }, (_, i) => (
        <div
          key={i}
          className="rc-ring absolute left-1/2 top-1/2 h-[90vmin] w-[90vmin] rounded-full"
          style={{ border: `2px solid ${color}`, animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </div>
  );
}

function Rays({ heavy }: { heavy: boolean }) {
  return (
    <>
      <div
        className="rc-rays pointer-events-none absolute left-1/2 top-1/2 h-[190vmax] w-[190vmax] opacity-40"
        style={{
          background: `repeating-conic-gradient(from 0deg, ${heavy ? 'rgba(255,255,255,0.16)' : 'rgba(255,214,120,0.16)'} 0deg 7deg, transparent 7deg 17deg)`,
          maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 12%, transparent 62%)',
          WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 12%, transparent 62%)',
        }}
      />
      <div
        className="rc-rays pointer-events-none absolute left-1/2 top-1/2 h-[190vmax] w-[190vmax] opacity-25"
        style={{
          background: `repeating-conic-gradient(from 20deg, ${heavy ? 'rgba(255,255,255,0.12)' : 'rgba(255,190,80,0.12)'} 0deg 3deg, transparent 3deg 24deg)`,
          animationDirection: 'reverse',
          animationDuration: '72s',
          maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 18%, transparent 58%)',
          WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 18%, transparent 58%)',
        }}
      />
    </>
  );
}

function FloatingGlyphs({ words, symbol, color }: { words: string[]; symbol: string; color: string }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: (i * 6.4 + Math.random() * 5) % 96,
        delay: Math.random() * 5,
        dur: 7 + Math.random() * 6,
        text: i % 3 === 0 ? symbol : words[i % words.length] ?? symbol,
        size: i % 3 === 0 ? 18 + Math.random() * 22 : 11 + Math.random() * 13,
        op: 0.35 + Math.random() * 0.55,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [words.join('|'), symbol],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="rc-glyph absolute bottom-0 whitespace-nowrap font-display leading-none"
          style={{
            left: `${p.left}%`,
            color,
            fontSize: p.size,
            opacity: p.op,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            textShadow: `0 0 12px ${color}`,
          }}
        >
          {p.text}
        </span>
      ))}
    </div>
  );
}

function Confetti({ colors }: { colors: string[] }) {
  const colorKey = colors.join(',');
  const pieces = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        dur: 5 + Math.random() * 5,
        w: 5 + Math.random() * 8,
        h: 10 + Math.random() * 14,
        color: colors[i % colors.length],
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [colorKey],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="rc-confetti absolute top-0 rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.w,
            height: p.h,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  );
}

function ContourLayer() {
  return (
    <div
      className="rc-contour pointer-events-none absolute inset-[-12%] opacity-70"
      style={{
        background:
          'repeating-radial-gradient(circle at 28% 36%, transparent 0 26px, rgba(255,255,255,0.07) 26px 28px), repeating-radial-gradient(circle at 78% 72%, transparent 0 34px, rgba(255,255,255,0.06) 34px 36px), repeating-radial-gradient(circle at 55% 15%, transparent 0 44px, rgba(255,255,255,0.05) 44px 46px)',
      }}
    />
  );
}

function GlitchSlices({ art, delayBase = 0 }: { art: (cls: string, style?: CSSProperties) => ReactNode; delayBase?: number }) {
  return (
    <>
      <div className="rc-glitch-a pointer-events-none absolute inset-0" style={{ animationDelay: `${delayBase}s` }}>
        {art('absolute inset-0 h-full w-full object-cover', { filter: 'hue-rotate(60deg) saturate(2)' })}
      </div>
      <div className="rc-glitch-b pointer-events-none absolute inset-0" style={{ animationDelay: `${delayBase + 0.4}s` }}>
        {art('absolute inset-0 h-full w-full object-cover', { filter: 'hue-rotate(-70deg) saturate(2.2)' })}
      </div>
      <div className="rc-invert pointer-events-none absolute inset-0 bg-white mix-blend-overlay" />
    </>
  );
}

function Scanlines({ opacity = 0.16 }: { opacity?: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ opacity, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0 2px, transparent 2px 5px)' }}
    >
      <div className="rc-scan absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
    </div>
  );
}

function NewBurst() {
  return (
    <div className="pointer-events-none absolute right-1 top-1 z-20">
      <div className="rc-newpulse relative flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
        <div
          className="rc-newspin absolute inset-0 rounded-full opacity-90"
          style={{
            background: 'conic-gradient(#fde68a 0deg 12deg, transparent 12deg 26deg, #fbbf24 26deg 38deg, transparent 38deg 52deg, #fde68a 52deg 64deg, transparent 64deg 78deg, #fbbf24 78deg 90deg, transparent 90deg 104deg, #fde68a 104deg 116deg, transparent 116deg 130deg, #fbbf24 130deg 142deg, transparent 142deg 156deg, #fde68a 156deg 168deg, transparent 168deg 182deg, #fbbf24 182deg 194deg, transparent 194deg 208deg, #fde68a 208deg 220deg, transparent 220deg 234deg, #fbbf24 234deg 246deg, transparent 246deg 260deg, #fde68a 260deg 272deg, transparent 272deg 286deg, #fbbf24 286deg 298deg, transparent 298deg 312deg, #fde68a 312deg 324deg, transparent 324deg 338deg, #fbbf24 338deg 350deg, transparent 350deg 360deg)',
            filter: 'drop-shadow(0 0 12px rgba(251,191,36,0.9))',
          }}
        />
        <div className="absolute inset-3 rounded-full bg-gradient-to-b from-yellow-300 to-orange-600 shadow-2xl" />
        <div className="relative -rotate-12 font-display text-2xl leading-none text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">NEW</div>
      </div>
    </div>
  );
}

function CornerBrackets({ color }: { color: string }) {
  const base = 'absolute h-10 w-10 border-white/80';
  return (
    <div className="pointer-events-none absolute inset-2">
      <div className={`${base} left-0 top-0 border-l-2 border-t-2`} style={{ borderColor: color }} />
      <div className={`${base} right-0 top-0 border-r-2 border-t-2`} style={{ borderColor: color }} />
      <div className={`${base} bottom-0 left-0 border-b-2 border-l-2`} style={{ borderColor: color }} />
      <div className={`${base} bottom-0 right-0 border-b-2 border-r-2`} style={{ borderColor: color }} />
    </div>
  );
}

// ───────── メイン ─────────

export default function RevealCutscene({ items, onDone }: { items: PullResult[] | null; onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const [stage, setStage] = useState(0);
  const [nameText, setNameText] = useState('');
  const [quoteText, setQuoteText] = useState('');
  const [prevItems, setPrevItems] = useState(items);
  const stageRef = useRef(0);
  stageRef.current = stage;

  // 新しい召喚結果が来たらシーンを先頭へ戻す
  if (prevItems !== items) {
    setPrevItems(items);
    setIdx(0);
  }

  const results = useMemo(() => (items ?? []).filter((r) => UNIT_MAP[r.id]), [items]);
  const item = results[Math.min(idx, Math.max(0, results.length - 1))];
  const def: UnitDef | undefined = item ? UNIT_MAP[item.id] : undefined;

  const advance = useCallback(() => {
    if (idx + 1 >= results.length) onDone();
    else setIdx(idx + 1);
  }, [idx, results.length, onDone]);
  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  // シーン開始
  useEffect(() => {
    if (!def) return;
    setStage(0);
    setNameText(def.name);
    setQuoteText('');
    sfx.reveal(rarityRank(def.rarity));
    const timers = [
      window.setTimeout(() => setStage(1), T_SQUARE),
      window.setTimeout(() => setStage(2), T_IDENT),
      window.setTimeout(() => setStage(3), T_READY),
      window.setTimeout(() => advanceRef.current(), T_AUTO),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [idx, def]);

  // 名前のスクランブル演出
  useEffect(() => {
    if (!def) return;
    const target = def.name;
    let intervalId = 0;
    const timer = window.setTimeout(() => {
      if (stageRef.current >= 3) {
        setNameText(target);
        return;
      }
      let frame = 0;
      intervalId = window.setInterval(() => {
        frame++;
        if (frame > 12) {
          setNameText(target);
          window.clearInterval(intervalId);
          return;
        }
        const k = Math.floor((frame / 12) * target.length);
        setNameText(
          target
            .split('')
            .map((c, i) => (i < k ? c : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]))
            .join(''),
        );
      }, 36);
    }, T_IDENT + 120);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(intervalId);
    };
  }, [idx, def]);

  // 名台詞のタイプライター
  useEffect(() => {
    if (!def) return;
    const target = def.quote;
    let intervalId = 0;
    const timer = window.setTimeout(() => {
      if (stageRef.current >= 3) {
        setQuoteText(target);
        return;
      }
      const step = Math.min(42, 1500 / Math.max(1, target.length));
      let i = 0;
      intervalId = window.setInterval(() => {
        i += 1;
        setQuoteText(target.slice(0, i));
        if (i >= target.length) window.clearInterval(intervalId);
      }, step);
    }, T_IDENT + 240);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(intervalId);
    };
  }, [idx, def]);

  const onTap = () => {
    sfx.tap();
    if (stage < 3) setStage(3);
    else advance();
  };

  if (!def || !item) return null;

  const rank = rarityRank(def.rarity);
  const th = themeOf(def.rarity);
  const flavor = FLAVOR[def.id] ?? { words: ['✝本質✝', def.title], layer: 'none' as LayerKind };
  const square = 'min(94vw, 88vh)';
  const size: CSSProperties = { width: square, height: square };
  const heavy = th.heavy;

  const art = (cls: string, style?: CSSProperties) =>
    def.portrait ? (
      <img src={def.portrait} alt={def.name} className={cls} style={style} draggable={false} />
    ) : (
      <div
        className={`${cls} flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-black`}
        style={style}
      >
        <span className={def.rarity === 'LR' ? 'rc-flicker drop-shadow-[0_0_30px_rgba(239,68,68,0.9)]' : 'drop-shadow-[0_0_30px_rgba(255,255,255,0.35)]'} style={{ fontSize: '46%', lineHeight: 1 }}>
          {def.emoji}
        </span>
      </div>
    );

  return (
    <div className="fixed inset-0 z-[100] select-none overflow-hidden" onClick={onTap} role="presentation">
      {/* ── 背景 ── */}
      <div className="absolute inset-0" style={{ background: th.bg }} />
      {flavor.layer === 'contour' && <ContourLayer />}
      <Rays heavy={heavy} />
      <div className="absolute inset-0" style={{ background: th.vignette }} />

      {/* ── 衝撃波・フラッシュ ── */}
      {stage === 0 && <ShockRings color={th.ring} key={`ring-${idx}`} />}
      <div key={`flash-${idx}`} className="rc-flash pointer-events-none absolute inset-0 bg-white" />

      {/* ── 大シギル＋レアリティ（フェーズ0） ── */}
      {stage === 0 && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="rc-sigil font-display leading-none"
            style={{ fontSize: 'min(38vmin, 300px)', color: '#fff', textShadow: th.glow, filter: `drop-shadow(0 0 30px ${th.ring})` }}
          >
            {th.sigil}
          </div>
          <div
            className={`rc-rarity mt-2 bg-gradient-to-r bg-clip-text font-display text-transparent ${rank >= 5 ? 'from-red-400 via-white to-red-500' : rank >= 4 ? 'from-fuchsia-300 via-white to-sky-300' : 'from-yellow-200 via-amber-300 to-orange-500'}`}
            style={{ fontSize: 'min(16vmin, 120px)', textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}
          >
            {rank >= 5 ? '✝LR✝' : def.rarity}
          </div>
        </div>
      )}

      {/* ── 正方形の画像（フェーズ1〜） ── */}
      {stage >= 1 && (
        <div className="rc-shake absolute inset-0 flex items-center justify-center">
          {/* 光背 */}
          <div
            className="rc-halo rc-glowpulse pointer-events-none absolute inset-0 m-auto rounded-full opacity-80"
            style={{ width: `calc(${square} * 1.28)`, height: `calc(${square} * 1.28)`, background: th.halo, filter: 'blur(46px)' }}
          />
          <div
            className="rc-slam relative overflow-hidden rounded-[4%] border-[3px] border-white/70"
            style={{ ...size, boxShadow: th.glow }}
          >
            {/* 画像本体（ケンバーンズ） */}
            <div className="rc-kenburns absolute inset-0">{art('h-full w-full object-cover')}</div>

            {/* カラーゴースト（UR/LR・縁だけ色ズレる） */}
            {heavy && def.portrait && (
              <>
                <div
                  className="pointer-events-none absolute inset-0 opacity-60 mix-blend-screen"
                  style={{
                    transform: 'translateX(-5px)',
                    maskImage: 'radial-gradient(circle at 50% 50%, transparent 52%, rgba(0,0,0,1) 88%)',
                    WebkitMaskImage: 'radial-gradient(circle at 50% 50%, transparent 52%, rgba(0,0,0,1) 88%)',
                  }}
                >
                  <img src={def.portrait} alt="" className="h-full w-full object-cover" style={{ filter: 'hue-rotate(120deg) saturate(1.8)' }} draggable={false} />
                </div>
                <div
                  className="pointer-events-none absolute inset-0 opacity-60 mix-blend-screen"
                  style={{
                    transform: 'translateX(5px)',
                    maskImage: 'radial-gradient(circle at 50% 50%, transparent 52%, rgba(0,0,0,1) 88%)',
                    WebkitMaskImage: 'radial-gradient(circle at 50% 50%, transparent 52%, rgba(0,0,0,1) 88%)',
                  }}
                >
                  <img src={def.portrait} alt="" className="h-full w-full object-cover" style={{ filter: 'hue-rotate(-110deg) saturate(1.8)' }} draggable={false} />
                </div>
              </>
            )}

            {/* 崩壊スライス（LR系） */}
            {flavor.layer === 'glitch' && <GlitchSlices art={art} />}

            {/* 走査線 */}
            <Scanlines opacity={heavy ? 0.22 : 0.12} />

            {/* 光沢スイープ */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="rc-shine absolute -inset-y-10 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent" style={{ animationDelay: '1s' }} />
              <div className="rc-shine absolute -inset-y-10 left-0 w-1/6 bg-gradient-to-r from-transparent via-white/25 to-transparent" style={{ animationDelay: '2.2s', animationDuration: '4.2s' }} />
            </div>

            {/* 周縁の光 */}
            <div className="pointer-events-none absolute inset-0 rounded-[4%]" style={{ boxShadow: `inset 0 0 60px ${th.ring}, inset 0 0 120px rgba(0,0,0,0.45)` }} />
            <CornerBrackets color={th.ring} />

            {/* 上部帯：タイプ・NEW */}
            <div className="absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-black/70 to-transparent p-3">
              <div className={`rc-pop flex flex-wrap items-center gap-1.5 ${stage >= 1 ? '' : 'opacity-0'}`}>
                <RarityBadge r={def.rarity} className="!text-sm !px-2 !py-1" />
                <TypeBadge t={def.type} className="!text-sm !px-2 !py-1" />
              </div>
              {item.isNew ? (
                <NewBurst />
              ) : (
                <div className="rc-pop rounded-lg border border-amber-300/70 bg-black/70 px-3 py-1.5 text-sm font-black text-amber-200">
                  凸+1 ★{item.star}
                </div>
              )}
            </div>

            {/* 下部帯：名前・称号・名台詞・ステータス */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent px-4 pb-4 pt-10 sm:pt-16">
              <div className="text-xs font-bold tracking-[0.35em] text-white/70">
                {item.isNew ? 'NEW MEMBER — 教室に漏れ出した' : '再出現 — 凸が深まった'}
              </div>
              <div
                className="mt-1 font-display leading-tight text-white"
                style={{ fontSize: 'min(8.2vmin, 46px)', textShadow: `0 0 22px ${th.ring}, 0 4px 12px rgba(0,0,0,0.8)` }}
              >
                {nameText || def.name}
              </div>
              <div className={`mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 ${stage >= 2 ? '' : 'opacity-0'}`}>
                <div className="rc-slide text-sm font-bold text-amber-200 sm:text-base">― {def.title} ―</div>
                <div className="rc-slide flex flex-wrap items-center gap-1.5" style={{ animationDelay: '0.12s' }}>
                  <span className="rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white/90">⚔ ATK {def.atk}</span>
                  <span className="rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white/90">♥ HP {def.hp}</span>
                  <span className="rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white/90">⚡ SPD {def.spd}</span>
                  <span className="rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white/90">✝毎秒 {def.prod}</span>
                </div>
              </div>
              {stage >= 2 && (
                <div className="rc-slide mt-2 max-w-[52ch] text-sm italic leading-relaxed text-white/95 sm:text-base" style={{ animationDelay: '0.22s' }}>
                  「{quoteText}
                  <span className="rc-cursor ml-0.5 inline-block h-[1em] w-[0.45em] translate-y-[0.12em] bg-white/90 align-middle" />」
                </div>
              )}
              {stage >= 3 && (
                <div className="rc-slide mt-2 flex flex-wrap items-center gap-2 text-xs" style={{ animationDelay: '0.05s' }}>
                  <span className="rounded-full border border-purple-300/50 bg-purple-500/25 px-2.5 py-1 font-bold text-purple-100">
                    スキル「{def.skill.name}」
                  </span>
                  <span className="text-white/75">{def.skill.desc}</span>
                </div>
              )}
            </div>
          </div>

          {/* 正方形の外側に散る光 */}
          <div
            className="rc-glowpulse pointer-events-none absolute inset-0 m-auto h-[calc(min(94vw,88vh)*1.45)] w-[calc(min(94vw,88vh)*1.45)] rounded-full"
            style={{ boxShadow: `0 0 120px 40px ${th.ring}` }}
          />
        </div>
      )}

      {/* ── 浮遊フレーバー ── */}
      <FloatingGlyphs words={flavor.words} symbol={th.sigil} color={rank >= 5 ? '#f87171' : rank >= 4 ? '#e9d5ff' : '#fde68a'} />
      {heavy && <Confetti colors={rank >= 5 ? ['#ef4444', '#fff', '#7f1d1d', '#fca5a5'] : ['#f472b6', '#facc15', '#4ade80', '#38bdf8', '#a78bfa']} />}
      {rank >= 5 && (
        <div className="rc-flicker pointer-events-none absolute inset-x-0 top-[12%] text-center font-display text-lg text-red-200/80" style={{ textShadow: '0 0 20px rgba(239,68,68,0.9)' }}>
          存在しないが、ある
        </div>
      )}
      {flavor.layer === 'glint' && <div className="pointer-events-none absolute right-[18%] top-[22%] h-3 w-3 rounded-full bg-white shadow-[0_0_24px_8px_rgba(255,255,255,0.9)] rc-glowpulse" />}

      {/* ── 操作 ── */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDone();
        }}
        className="absolute right-3 top-3 z-30 rounded-full border border-white/25 bg-black/55 px-4 py-1.5 text-xs font-bold text-white/85 backdrop-blur transition hover:bg-black/80"
      >
        スキップ ≫
      </button>

      <div className="absolute inset-x-0 bottom-3 z-30 flex items-center justify-center gap-3">
        <div className="rounded-full border border-white/15 bg-black/50 px-4 py-1.5 text-xs text-white/85 backdrop-blur">
          {results.length > 1 && <span className="mr-2 text-amber-200">{idx + 1} / {results.length}</span>}
          {stage < 3 ? '演出中……' : 'タップして続ける'}
          <span className="rc-cursor ml-1 inline-block">▶</span>
        </div>
      </div>
    </div>
  );
}
