import { useState } from 'react';
import { useGame } from '../game/store';
import { computeMods, gachaRates, pityMax, rarityRank, RARITIES } from '../game/formulas';
import { UNITS, UNIT_MAP } from '../game/data/units';
import type { PullResult } from '../game/types';
import { Btn, Modal, Panel, RarityBadge, UnitIcon, RARITY_STYLE, TypeBadge } from './ui';
import RevealCutscene from './RevealCutscene';
import { pct } from '../game/format';

const FEATURED = ['rei', 'heikatsu', 'feikatsu', 'pregen', 'ryoma', 'mie', 'terachi', 'sato'];
const BEST_MSG = ['……（何も起きない）', '（普通の音）', 'ガコン！', 'ガコン！！（金色に光った）', '✝✝ 虹色のコーンスープが出てきた ✝✝', '☨ 存在しないが、ある ☨'];

export default function GachaTab() {
  const s = useGame();
  const m = computeMods(s);
  const rates = gachaRates(m);
  const pmax = pityMax(m);
  const [results, setResults] = useState<PullResult[] | null>(null);
  const [reveal, setReveal] = useState<PullResult[] | null>(null);
  const [anim, setAnim] = useState(false);
  const [showPool, setShowPool] = useState(false);
  const tickets = s.items['ticket'] || 0;

  const doPull = (count: 1 | 10, ticket = false) => {
    const r = useGame.getState().pull(count, ticket);
    if (!r) {
      useGame.getState().toast(ticket ? 'チケットが足りない' : 'コーンスープ缶が足りない（ないときの方が本質である）', 'bad');
      return;
    }
    setResults(r);
    // 強キャラ（SSR以上）が出たら全画面の正方形レベール演出へ
    const strong = r.filter((x) => rarityRank(UNIT_MAP[x.id].rarity) >= rarityRank('SSR'));
    if (strong.length) {
      setReveal(strong);
      setAnim(false);
    } else {
      setAnim(true);
      setTimeout(() => setAnim(false), 1000);
    }
  };

  const bestRank = results ? Math.max(...results.map((r) => rarityRank(UNIT_MAP[r.id].rarity))) : 0;
  const owned = Object.keys(s.units).length;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
      <div className="relative mx-auto w-full max-w-md rounded-[28px] border-4 border-slate-300 bg-gradient-to-b from-rose-600 via-rose-700 to-rose-900 p-3 shadow-2xl shadow-rose-900/40">
        <div className="rounded-2xl bg-gradient-to-b from-sky-50 to-white p-3 text-slate-800">
          <div className="text-center font-display text-lg text-rose-700">北棟の自販機（召喚仕様）</div>
          <div className="text-center text-[11px] text-slate-500">コーンスープ缶を捧げると、✝本質✝が応える</div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {FEATURED.map((id) => {
              const u = UNIT_MAP[id];
              return (
                <div key={id} className="flex flex-col items-center rounded-lg bg-slate-100 p-1 shadow-inner">
                  <UnitIcon def={u} size={48} />
                  <div className="mt-0.5 w-full truncate text-center text-[9px] font-bold">{u.name}</div>
                  <RarityBadge r={u.rarity} className="mt-0.5" />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-bold">
            <span className="rounded bg-sky-500 px-1.5 text-white">つめた～い</span>
            <span className="text-slate-400">※コーンスープは売り切れの場合があります</span>
            <span className="rounded bg-rose-500 px-1.5 text-white">あったか～い✝</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg border-2 border-slate-500 bg-black/85 px-3 py-2 font-mono text-sm text-emerald-300">
          <span>投入：🥫{s.cans}</span>
          <span>🎫{tickets}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Btn variant="gold" onClick={() => doPull(1)} disabled={s.cans < 5}>
            単発召喚
            <div className="text-[11px] font-normal">🥫×5</div>
          </Btn>
          <Btn variant="gold" onClick={() => doPull(10)} disabled={s.cans < 45}>
            10連召喚
            <div className="text-[11px] font-normal">🥫×45（SR以上1枠確定{m.tenGuarantee ? '／SSR確定' : ''}）</div>
          </Btn>
          <Btn variant="ghost" onClick={() => doPull(1, true)} disabled={tickets < 1}>
            🎫チケット単発
          </Btn>
          <Btn variant="ghost" onClick={() => doPull(10, true)} disabled={tickets < 10}>
            🎫チケット10連
          </Btn>
        </div>
        <div className="mt-3 flex h-14 items-center justify-center rounded-lg border-2 border-slate-400 bg-black/70 text-xs text-slate-400">
          <span className={anim ? 'anim-gacon font-display text-xl text-amber-300' : ''}>{anim ? 'ガコン！' : '取り出し口'}</span>
        </div>
        {s.cans <= 0 && <div className="mt-2 text-center text-xs text-amber-100">「コーンスープは、あるときより、ないときの方が本質である。」——砂糖</div>}
      </div>

      <div className="space-y-3">
        <Panel title="排出率（本質的に公正）">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {RARITIES.map((r) => (
              <div key={r} className="rounded-lg border border-white/10 bg-black/30 p-2 text-center">
                <RarityBadge r={r} />
                <div className={`mt-1 text-sm font-bold ${RARITY_STYLE[r].text}`}>{pct(rates[r], 1)}</div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs">
              <span>UR天井（北棟の天井は低い）</span>
              <span className="font-bold text-pink-200">
                あと {Math.max(0, pmax - s.pity)} 回 ／ {pmax}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/50">
              <div className="h-full bg-rainbow" style={{ width: `${(s.pity / pmax) * 100}%` }} />
            </div>
          </div>
          <ul className="mt-3 space-y-1 text-xs text-slate-300">
            <li>・重複した部員は<b className="text-amber-200">凸（★）+1</b>。ステータス+30%＆レベル上限+10。</li>
            <li>・5凸済みの重複はコーンスープ缶に還元される。</li>
            <li>・新しい部員は編成に空きがあれば自動で編成される。</li>
            <li>・召喚1回ごとに学年XP+3。</li>
          </ul>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              図鑑 {owned}/{UNITS.length}（累計召喚 {s.pulls}回）
            </span>
            <Btn small variant="ghost" onClick={() => setShowPool(true)}>
              排出される部員一覧
            </Btn>
          </div>
        </Panel>
        <Panel title="コーンスープ缶の入手方法">
          <ul className="space-y-1 text-xs text-slate-300">
            <li>📖 ストーリー初回クリア（大量）／🏫 対抗戦で勝利</li>
            <li>✨ 黄金✝をクリック（たまにコーンスープの帰還）</li>
            <li>🏆 実績（✝本質✝年鑑）の解除</li>
            <li>🥫 本質発生源「北棟の自販機」が勝手に産む</li>
            <li>🏪 持ち物 → 購買で✝本質✝と交換</li>
          </ul>
        </Panel>
      </div>

      <Modal open={!!results && !reveal} onClose={anim ? undefined : () => setResults(null)} wide title={anim ? undefined : '召喚結果'}>
        {results && anim ? (
          <div className={`flex h-72 flex-col items-center justify-center rounded-xl ${bestRank >= 4 ? 'bg-rainbow' : bestRank === 3 ? 'bg-gradient-to-b from-amber-400 to-orange-700' : 'bg-gradient-to-b from-slate-600 to-slate-900'}`}>
            <div className="anim-gacon font-display text-5xl text-white drop-shadow-lg">ガコン！</div>
            <div className="mt-3 font-bold text-white drop-shadow">{BEST_MSG[bestRank]}</div>
          </div>
        ) : results ? (
          <div>
            {bestRank >= 4 && <div className="mb-3 rounded-lg bg-rainbow py-1 text-center font-display text-black">✝✝ 確定演出 ✝✝</div>}
            <div className={`grid gap-2 ${results.length > 1 ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-1'}`}>
              {results.map((r, i) => {
                const u = UNIT_MAP[r.id];
                return (
                  <div key={i} className={`anim-pop flex flex-col items-center rounded-xl border-2 ${RARITY_STYLE[u.rarity].border} bg-black/40 p-2 text-center`} style={{ animationDelay: `${i * 70}ms` }}>
                    <UnitIcon def={u} size={results.length > 1 ? 64 : 110} />
                    <div className="mt-1 flex items-center gap-1">
                      <RarityBadge r={u.rarity} />
                      <TypeBadge t={u.type} />
                    </div>
                    <div className="mt-1 w-full truncate text-xs font-bold">{u.name}</div>
                    <div className="text-[11px]">
                      {r.isNew ? <span className="font-bold text-rose-300">NEW!</span> : r.refund > 0 ? <span className="text-amber-200">🥫+{r.refund}（還元）</span> : <span className="text-amber-300">凸+1 ★{r.star}</span>}
                    </div>
                    {results.length === 1 && <div className="mt-2 text-xs italic text-slate-300">「{u.quote}」</div>}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex justify-center gap-2">
              <Btn variant="ghost" onClick={() => setResults(null)}>
                閉じる
              </Btn>
              <Btn variant="gold" onClick={() => doPull(results.length === 10 ? 10 : 1)} disabled={s.cans < (results.length === 10 ? 45 : 5)}>
                もう一回（🥫{results.length === 10 ? 45 : 5}）
              </Btn>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={showPool} onClose={() => setShowPool(false)} wide title="排出される部員一覧">
        {[...RARITIES].reverse().map((r) => (
          <div key={r} className="mb-3">
            <div className="mb-1 flex items-center gap-2">
              <RarityBadge r={r} />
              <span className="text-xs text-slate-400">{pct(rates[r], 1)}</span>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {UNITS.filter((u) => u.rarity === r).map((u) => (
                <div key={u.id} className="flex flex-col items-center text-center">
                  <UnitIcon def={u} size={48} dim={!s.units[u.id]} />
                  <div className="mt-0.5 w-full truncate text-[10px]">{u.name}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Modal>

      <RevealCutscene items={reveal} onDone={() => setReveal(null)} />
    </div>
  );
}
