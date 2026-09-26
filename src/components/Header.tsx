import { useEffect, useRef, useState } from 'react';
import { useGame } from '../game/store';
import { derive, devTier, gradeName, xpToNext, spTotal, spSpent } from '../game/formulas';
import { fmt } from '../game/format';
import { Bar, Btn } from './ui';
import LoginBonusModal from './LoginBonusModal';
import UpdateGiftModal from './UpdateGiftModal';

function DevNum({ value, className }: { value: number; className: string }) {
  const [anim, setAnim] = useState(0);
  const prev = useRef(value);
  const r = Math.floor(value * 10);
  useEffect(() => {
    if (r > Math.floor(prev.current * 10)) setAnim((a) => a + 1);
    prev.current = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r]);
  return (
    <span key={anim} className={`inline-block tabular-nums ${anim ? 'anim-devup' : ''} ${className}`}>
      {value.toFixed(1)}
    </span>
  );
}

function MiniDev({ label, v }: { label: string; v: number }) {
  return (
    <div className="rounded-md bg-black/30 px-1 py-0.5 text-center leading-tight">
      <div className="text-[9px] text-slate-400">{label}</div>
      <DevNum value={v} className="text-[11px] font-bold text-slate-100" />
    </div>
  );
}

function Res({ icon, value, sub, color, title }: { icon: string; value: string; sub?: string; color: string; title: string }) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1" title={title}>
      <span className="text-sm">{icon}</span>
      <span className={`font-bold tabular-nums ${color}`}>{value}</span>
      {sub && <span className="text-[10px] text-slate-400">{sub}</span>}
    </div>
  );
}

export default function Header() {
  const s = useGame();
  const d = derive(s);
  const now = Date.now();
  const need = xpToNext(s.level);
  const sp = spTotal(s) - spSpent(s);
  const buffs = s.buffs.filter((b) => b.until > now);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const canClaimDaily = s.lastLoginDate !== today;
  const canClaimGift = !s.claimedUpdateGift;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0d0920]/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] items-stretch gap-2 px-2 py-2 sm:px-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="cross-glow font-display text-2xl leading-none text-purple-300">✝</span>
            <div className="min-w-0">
              <div className="truncate font-display text-[11px] text-purple-100 sm:text-sm">
                偏差値60の教室から✝本質✝が漏れ出している件について
              </div>
              <div className="truncate text-[10px] text-slate-400">
                桐葉高校 北棟 理数科B組 ／ {s.rebirths + 1}周目
                {s.ultraRebirths > 0 && `（🌌超越${s.ultraRebirths}回）`} ／ 最高偏差値 {s.bestDev.toFixed(1)}
              </div>
            </div>

            {/* ログボ ＆ アプデ記念ボタン */}
            <div className="flex items-center gap-1.5 ml-auto sm:ml-2">
              <button
                onClick={() => setShowLoginModal(true)}
                className="relative flex items-center gap-1 rounded-lg bg-purple-600/30 border border-purple-400/40 px-2 py-1 text-xs font-bold text-purple-200 hover:bg-purple-600/50"
                title="出席カード（ログインボーナス）"
              >
                <span>📅 出席</span>
                {canClaimDaily && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rose-500 animate-ping" />
                )}
                {canClaimDaily && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rose-500" />
                )}
              </button>

              <button
                onClick={() => setShowGiftModal(true)}
                className={`relative flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition ${
                  canClaimGift
                    ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white animate-pulse shadow-md'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
                title="大型アプデ記念コーンスープ450缶プレゼント"
              >
                <span>🎉 🥫450</span>
                {canClaimGift && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                    !
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
            <Res icon="✝" title="✝本質✝" value={fmt(s.honshitsu)} sub={`+${fmt(d.perSec)}/秒`} color="text-purple-200" />
            <Res icon="🥫" title="コーンスープ缶（召喚用）" value={fmt(s.cans)} color="text-amber-200" />
            <Res icon="💎" title="✝本質結晶✝（完凸余剰通貨）" value={fmt(s.crystals)} color="text-purple-300" />
            {(s.memories > 0 || s.rebirths > 0) && (
              <Res icon="🌏" title="地面の記憶（通常転生通貨）" value={fmt(s.memories)} color="text-emerald-200" />
            )}
            {(s.cores > 0 || s.ultraRebirths > 0) && (
              <Res icon="🌌" title="構造線の核（ウルトラ転生通貨）" value={fmt(s.cores)} color="text-amber-300" />
            )}
            <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1" title="学年レベル（上がるとスキルポイント+1）">
              <span className="text-sm">🎓</span>
              <div className="w-20">
                <div className="flex justify-between text-[10px] leading-tight">
                  <span className="font-bold">Lv{s.level}</span>
                  <span className="text-slate-400">{gradeName(s.level)}</span>
                </div>
                <Bar value={s.xp / need} color="bg-sky-400" h={4} />
              </div>
              {sp > 0 && <span className="rounded bg-rose-500 px-1 text-[10px] font-bold leading-4">SP{sp}</span>}
            </div>
          </div>
        </div>

        <div className="shrink-0 rounded-xl border border-purple-400/40 bg-gradient-to-br from-purple-900/70 to-indigo-950/70 px-2.5 py-1.5 text-right shadow-lg shadow-purple-900/40">
          <div className="flex items-center justify-end gap-1 text-[10px] font-bold tracking-widest text-purple-300">
            <span>戦力</span>
            <span className="rounded bg-purple-500/30 px-1">総合偏差値</span>
          </div>
          <DevNum value={d.totalDev} className="font-display text-3xl leading-none text-white sm:text-4xl" />
          <div className="max-w-[10rem] truncate text-[10px] text-amber-200 sm:max-w-[13rem]">{devTier(d.totalDev)}</div>
          <div className="mt-1 grid grid-cols-3 gap-1">
            <MiniDev label="⚔戦闘" v={d.battleDev} />
            <MiniDev label="✝本質" v={d.prodDev} />
            <MiniDev label="👆指" v={d.clickDev} />
          </div>
        </div>
      </div>

      {buffs.length > 0 && (
        <div className="no-scrollbar mx-auto flex max-w-[1600px] gap-1.5 overflow-x-auto px-2 pb-1.5 sm:px-3">
          {buffs.map((b) => (
            <span key={b.id} className="shrink-0 rounded-full border border-amber-300/50 bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-100">
              {b.kind === 'prod' ? '✝' : '👆'} {b.name} ×{b.mult} 残り{Math.ceil((b.until - now) / 1000)}秒
            </span>
          ))}
        </div>
      )}

      {showLoginModal && <LoginBonusModal open onClose={() => setShowLoginModal(false)} />}
      {showGiftModal && <UpdateGiftModal open onClose={() => setShowGiftModal(false)} />}
    </header>
  );
}
