import { useState } from 'react';
import { useGame, prestigeCost } from '../game/store';
import { computeMods, rebirthGain } from '../game/formulas';
import { PRESTIGE } from '../game/data/skills';
import { fmt } from '../game/format';
import { Btn, Modal, Panel } from './ui';

export default function RebirthTab() {
  const s = useGame();
  const m = computeMods(s);
  const gain = rebirthGain(s, m);
  const [confirm, setConfirm] = useState(false);
  const [anim, setAnim] = useState<{ gain: number; n: number } | null>(null);
  const nextDev = 55 + 5 * Math.sqrt((gain + 1) / (1 + m.memoryPct));

  return (
    <div className="space-y-3">
      <Panel title="🎓 卒業（転生）">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="space-y-2 text-sm text-slate-300">
            <p>
              総合偏差値<b className="text-white">60以上</b>に到達した周回は卒業できる。卒業すると
              <b className="text-rose-300">✝本質✝・本質発生源・部員のレベル・学年レベル・スキル振り分け・購買の値上がり</b>がリセットされ、
              代わりに<b className="text-emerald-300">🌏地面の記憶</b>を獲得する。
            </p>
            <p className="text-xs text-slate-400">
              引き継ぎ：部員（凸含む）・編成・装備・アイテム・コーンスープ缶・ストーリー／対抗戦の進行・実績・ストーリー由来SP・地面の記憶の強化。
            </p>
            <p className="text-xs italic text-slate-400">——地面は忘れない。（ヘイカツ）</p>
          </div>
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-center">
            <div className="text-[11px] text-slate-300">今回の最高総合偏差値</div>
            <div className="font-display text-3xl">{s.maxDev.toFixed(1)}</div>
            <div className="mt-1 text-[11px] text-slate-300">獲得予定の地面の記憶</div>
            <div className="font-display text-3xl text-emerald-300">+{gain}</div>
            <div className="text-[10px] text-slate-400">次の+1まで：偏差値 {nextDev.toFixed(1)}</div>
            <Btn className="mt-2 w-full" variant="green" disabled={gain <= 0} onClick={() => setConfirm(true)}>
              卒業する
            </Btn>
            {gain <= 0 && <div className="mt-1 text-[10px] text-rose-300">総合偏差値60で解放</div>}
          </div>
        </div>
      </Panel>

      <Panel title="🌏 地面は忘れない（永続強化）" right={<span className="rounded-lg bg-emerald-500/20 px-2 py-1 text-sm font-bold text-emerald-200">地面の記憶 {fmt(s.memories)}</span>}>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {PRESTIGE.map((p) => {
            const lv = s.prestige[p.id] || 0;
            const maxed = lv >= p.max;
            const cost = prestigeCost(p, lv);
            const can = !maxed && s.memories >= cost;
            return (
              <div key={p.id} className={`rounded-xl border p-3 ${maxed ? 'border-amber-300/50 bg-amber-500/10' : 'border-white/10 bg-white/5'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{p.name}</div>
                    <div className="text-[11px] text-slate-400">
                      Lv {lv} / {p.max}
                    </div>
                  </div>
                </div>
                <div className="mt-1 text-xs text-emerald-300">{p.desc}</div>
                <div className="mt-2 flex justify-end">
                  <Btn small variant={can ? 'green' : 'ghost'} disabled={!can} onClick={() => useGame.getState().buyPrestige(p.id)}>
                    {maxed ? 'MAX' : `🌏${fmt(cost)}で強化`}
                  </Btn>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="本当に卒業しますか？">
        <p className="text-sm text-slate-300">
          地面の記憶 <b className="text-emerald-300">+{gain}</b> を獲得して、また入学式からやり直す。
        </p>
        <p className="mt-2 text-xs text-slate-400">三重「本当にいいのか」／両馬「卒業の✝本質✝」／倉石「記録します」</p>
        <div className="mt-4 flex justify-end gap-2">
          <Btn variant="ghost" onClick={() => setConfirm(false)}>
            やめる
          </Btn>
          <Btn
            variant="green"
            onClick={() => {
              const n = s.rebirths + 1;
              const g = useGame.getState().rebirth();
              setConfirm(false);
              if (g > 0) {
                setAnim({ gain: g, n });
                window.setTimeout(() => setAnim(null), 4200);
              }
            }}
          >
            卒業する
          </Btn>
        </div>
      </Modal>

      {anim && (
        <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center overflow-hidden bg-black/95 text-center" onClick={() => setAnim(null)}>
          <div className="anim-truck text-[120px] leading-none">🚚</div>
          <div className="anim-fadein mt-6 px-6 font-display text-lg text-white sm:text-2xl" style={{ animationDelay: '1.2s' }}>
            コーンスープ補充業者のトラックに轢かれて転生した……
          </div>
          <div className="anim-fadein mt-3 text-sm text-slate-300" style={{ animationDelay: '2s' }}>
            気がつくと、また入学式だった。（{anim.n + 1}周目）
          </div>
          <div className="anim-fadein mt-3 font-display text-2xl text-emerald-300" style={{ animationDelay: '2.6s' }}>
            🌏 地面の記憶 +{anim.gain}
          </div>
          <div className="anim-fadein mt-6 text-xs text-slate-500" style={{ animationDelay: '3s' }}>
            （タップで閉じる）
          </div>
        </div>
      )}
    </div>
  );
}
