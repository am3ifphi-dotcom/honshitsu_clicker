import { useState } from 'react';
import { useGame, prestigeCost, ultraPrestigeCost } from '../game/store';
import { computeMods, rebirthGain, ultraRebirthGain } from '../game/formulas';
import { PRESTIGE, ULTRA_PRESTIGE } from '../game/data/skills';
import { fmt } from '../game/format';
import { Btn, Modal, Panel } from './ui';
import { sfx } from '../utils/sfx';

export default function RebirthTab() {
  const s = useGame();
  const m = computeMods(s);
  const [subTab, setSubTab] = useState<'normal' | 'ultra'>('normal');

  // 通常転生
  const gainNormal = rebirthGain(s, m);
  const [confirmNormal, setConfirmNormal] = useState(false);
  const [animNormal, setAnimNormal] = useState<{ gain: number; n: number } | null>(null);
  const nextDevNormal = 55 + 5 * Math.sqrt((gainNormal + 1) / (1 + m.memoryPct));

  // ウルトラ転生
  const gainUltra = ultraRebirthGain(s, m);
  const [confirmUltra, setConfirmUltra] = useState(false);
  const [animUltra, setAnimUltra] = useState<{ gain: number; n: number } | null>(null);
  const canUltra = s.maxDev >= 120;

  return (
    <div className="space-y-4">
      {/* サブタブ切り替え */}
      <div className="flex gap-2">
        <button
          onClick={() => setSubTab('normal')}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 font-bold transition ${
            subTab === 'normal'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
              : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          <span className="text-xl">🎓</span>
          <span>卒業（通常転生）</span>
        </button>

        <button
          onClick={() => setSubTab('ultra')}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 font-bold transition ${
            subTab === 'ultra'
              ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600 text-white shadow-lg shadow-purple-900/40'
              : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          <span className="text-xl">🌌</span>
          <span>ウルトラ転生（超越）</span>
          {canUltra && <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />}
        </button>
      </div>

      {subTab === 'normal' ? (
        <>
          {/* 通常転生パネル */}
          <Panel title="🎓 卒業（通常転生）">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="space-y-2 text-sm text-slate-300">
                <p>
                  総合偏差値<b className="text-white">60以上</b>に到達した周回は卒業できる。卒業すると
                  <b className="text-rose-300">
                    ✝本質✝・本質発生源・部員のレベル・学年レベル・スキル振り分け・購買の値上がり
                  </b>
                  がリセットされ、代わりに<b className="text-emerald-300">🌏地面の記憶</b>を獲得する。
                </p>
                <p className="text-xs text-slate-400">
                  引き継ぎ：部員（★凸含む）・編成・装備・アイテム・コーンスープ缶・ストーリー／対抗戦の進行・実績・地面の記憶の強化。
                </p>
                <p className="text-xs italic text-slate-400">——地面は忘れない。（ヘイカツ）</p>
              </div>

              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-center">
                <div className="text-[11px] text-slate-300">今回の最高総合偏差値</div>
                <div className="font-display text-3xl">{s.maxDev.toFixed(1)}</div>
                <div className="mt-1 text-[11px] text-slate-300">獲得予定の地面の記憶</div>
                <div className="font-display text-3xl text-emerald-300">+{gainNormal}</div>
                <div className="text-[10px] text-slate-400">次の+1まで：偏差値 {nextDevNormal.toFixed(1)}</div>
                <Btn
                  className="mt-2 w-full"
                  variant="green"
                  disabled={gainNormal <= 0}
                  onClick={() => setConfirmNormal(true)}
                >
                  卒業する
                </Btn>
                {gainNormal <= 0 && <div className="mt-1 text-[10px] text-rose-300">総合偏差値60で解放</div>}
              </div>
            </div>
          </Panel>

          {/* 地面の記憶ツリー */}
          <Panel
            title="🌏 地面は忘れない（永続強化）"
            right={
              <span className="rounded-xl bg-emerald-500/20 px-3 py-1 font-mono text-sm font-bold text-emerald-200">
                地面の記憶: {fmt(s.memories)}
              </span>
            }
          >
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {PRESTIGE.map((p) => {
                const lv = s.prestige[p.id] || 0;
                const maxed = lv >= p.max;
                const cost = prestigeCost(p, lv);
                const can = !maxed && s.memories >= cost;
                return (
                  <div
                    key={p.id}
                    className={`rounded-xl border p-3 ${
                      maxed ? 'border-amber-300/50 bg-amber-500/10' : 'border-white/10 bg-white/5'
                    }`}
                  >
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
                      <Btn
                        small
                        variant={can ? 'green' : 'ghost'}
                        disabled={!can}
                        onClick={() => {
                          sfx.tap();
                          useGame.getState().buyPrestige(p.id);
                        }}
                      >
                        {maxed ? 'MAX' : `🌏${fmt(cost)}で強化`}
                      </Btn>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </>
      ) : (
        <>
          {/* ウルトラ転生パネル */}
          <Panel title="🌌 ウルトラ転生（超越：時空崩壊と原初回帰）">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="space-y-2 text-sm text-slate-300">
                <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-2.5 text-xs text-rose-200">
                  ⚠️ <b>ウルトラ転生のリセット警告：</b>
                  <br />
                  通常転生のリセット内容に加え、<b className="text-white">「地面の記憶（プレステージツリーも全リセット）」</b>
                  されます！
                  <br />
                  その代わりに、永久不滅の高次元通貨<b className="text-amber-300">「🌌 構造線の核」</b>
                  を獲得し、常識を遥かに超越したウルトラ転生ツリーを永続強化できます。
                </div>
                <p className="text-xs text-slate-400">
                  解放条件：総合偏差値<b className="text-white">120以上</b>（「地形図の向こう側を見る男」到達）。
                </p>
                <p className="text-xs italic text-purple-300">
                  ——糸魚川-静岡構造線が破断する。東も西も超えて、全ては原初へ。（ヘイカツ）
                </p>
              </div>

              <div className="rounded-2xl border border-purple-400/40 bg-purple-950/40 p-3 text-center">
                <div className="text-[11px] text-purple-200">今回の最高総合偏差値</div>
                <div className="font-display text-3xl text-white">{s.maxDev.toFixed(1)}</div>
                <div className="mt-1 text-[11px] text-purple-200">獲得予定の構造線の核</div>
                <div className="font-display text-3xl text-amber-300">+{gainUltra}</div>
                <Btn
                  className="mt-2 w-full bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-bold"
                  disabled={!canUltra || gainUltra <= 0}
                  onClick={() => setConfirmUltra(true)}
                >
                  🌌 ウルトラ転生
                </Btn>
                {!canUltra && <div className="mt-1 text-[10px] text-rose-300">総合偏差値120で解放</div>}
              </div>
            </div>
          </Panel>

          {/* ウルトラ転生ツリー */}
          <Panel
            title="🌌 構造線の深淵（超越永続パッシブ）"
            right={
              <span className="rounded-xl bg-purple-500/20 px-3 py-1 font-mono text-sm font-bold text-amber-300">
                構造線の核: 🌌 {fmt(s.cores)}
              </span>
            }
          >
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {ULTRA_PRESTIGE.map((up) => {
                const lv = s.ultraPrestige[up.id] || 0;
                const maxed = lv >= up.max;
                const cost = ultraPrestigeCost(up, lv);
                const can = !maxed && s.cores >= cost;
                return (
                  <div
                    key={up.id}
                    className={`rounded-xl border p-3 transition ${
                      maxed
                        ? 'border-amber-400/50 bg-amber-500/10 shadow-lg'
                        : 'border-purple-500/30 bg-purple-950/20 hover:bg-purple-900/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{up.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-white">{up.name}</div>
                        <div className="text-[11px] text-purple-300">
                          Lv {lv} / {up.max}
                        </div>
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-amber-200">{up.desc}</div>
                    <div className="mt-2 flex justify-end">
                      <Btn
                        small
                        variant={can ? 'gold' : 'ghost'}
                        disabled={!can}
                        onClick={() => {
                          sfx.tap();
                          useGame.getState().buyUltraPrestige(up.id);
                        }}
                      >
                        {maxed ? 'MAX' : `🌌${fmt(cost)}で超越習得`}
                      </Btn>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </>
      )}

      {/* 通常転生確認モーダル */}
      <Modal open={confirmNormal} onClose={() => setConfirmNormal(false)} title="本当に卒業しますか？">
        <p className="text-sm text-slate-300">
          地面の記憶 <b className="text-emerald-300">+{gainNormal}</b> を獲得して、また入学式からやり直します。
        </p>
        <p className="mt-2 text-xs text-slate-400">三重「本当にいいのか」／両馬「卒業の✝本質✝」／倉石「記録します」</p>
        <div className="mt-4 flex justify-end gap-2">
          <Btn variant="ghost" onClick={() => setConfirmNormal(false)}>
            やめる
          </Btn>
          <Btn
            variant="green"
            onClick={() => {
              const n = s.rebirths + 1;
              const g = useGame.getState().rebirth();
              setConfirmNormal(false);
              if (g > 0) {
                setAnimNormal({ gain: g, n });
                window.setTimeout(() => setAnimNormal(null), 4200);
              }
            }}
          >
            卒業する
          </Btn>
        </div>
      </Modal>

      {/* ウルトラ転生確認モーダル */}
      <Modal open={confirmUltra} onClose={() => setConfirmUltra(false)} title="🌌 本当にウルトラ転生しますか？">
        <div className="space-y-2 text-sm text-slate-300">
          <p className="font-bold text-rose-400">
            【厳重警告】これまでの「地面の記憶」とプレステージツリーが全てリセットされます！
          </p>
          <p>
            その代わりに、超越通貨<b className="text-amber-300">「🌌 構造線の核 +{gainUltra}」</b>を獲得し、
            永久不滅のウルトラ転生ツリーを強化できます。
          </p>
          <p className="text-xs italic text-slate-400">
            零「面白いな。世界ごと作り直そう」／両馬「ウルトラ転生の✝本質✝」／三重「マジで全部消えるぞ……」
          </p>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Btn variant="ghost" onClick={() => setConfirmUltra(false)}>
            やめる
          </Btn>
          <Btn
            variant="danger"
            onClick={() => {
              sfx.ultra();
              const n = s.ultraRebirths + 1;
              const g = useGame.getState().ultraRebirth();
              setConfirmUltra(false);
              if (g > 0) {
                setAnimUltra({ gain: g, n });
                window.setTimeout(() => setAnimUltra(null), 5000);
              }
            }}
          >
            全てを超越してウルトラ転生する
          </Btn>
        </div>
      </Modal>

      {/* 通常転生トラックアニメーション */}
      {animNormal && (
        <div
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center overflow-hidden bg-black/95 text-center"
          onClick={() => setAnimNormal(null)}
        >
          <div className="anim-truck text-[120px] leading-none">🚚</div>
          <div className="anim-fadein mt-6 px-6 font-display text-lg text-white sm:text-2xl" style={{ animationDelay: '1.2s' }}>
            コーンスープ補充業者のトラックに轢かれて転生した……
          </div>
          <div className="anim-fadein mt-3 text-sm text-slate-300" style={{ animationDelay: '2s' }}>
            気がつくと、また入学式だった。（{animNormal.n}周目）
          </div>
          <div className="anim-fadein mt-3 font-display text-2xl text-emerald-300" style={{ animationDelay: '2.6s' }}>
            🌏 地面の記憶 +{animNormal.gain}
          </div>
          <div className="anim-fadein mt-6 text-xs text-slate-500" style={{ animationDelay: '3s' }}>
            （タップで閉じる）
          </div>
        </div>
      )}

      {/* ウルトラ転生時空超越アニメーション */}
      {animUltra && (
        <div
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-hidden bg-black text-center"
          onClick={() => setAnimUltra(null)}
        >
          <div className="animate-spin text-[140px] leading-none duration-1000">🌀</div>
          <div className="anim-fadein mt-6 px-6 font-display text-2xl text-amber-300 sm:text-4xl" style={{ animationDelay: '1s' }}>
            🌌 糸魚川-静岡構造線が破断した……！
          </div>
          <div className="anim-fadein mt-3 text-base text-purple-200 sm:text-xl" style={{ animationDelay: '2s' }}>
            理数科の教室が時空を超越した。（ウルトラ転生 {animUltra.n}回目）
          </div>
          <div className="anim-fadein mt-4 font-display text-3xl text-emerald-300" style={{ animationDelay: '2.8s' }}>
            🌌 構造線の核 +{animUltra.gain}
          </div>
          <div className="anim-fadein mt-6 text-xs text-slate-400" style={{ animationDelay: '3.5s' }}>
            （タップで教室へ戻る）
          </div>
        </div>
      )}
    </div>
  );
}
