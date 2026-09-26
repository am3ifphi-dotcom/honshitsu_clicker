import { useState, useEffect, useRef } from 'react';
import { useGame } from '../game/store';
import { computeMods, gachaRates, pityMax, rarityRank, RARITIES } from '../game/formulas';
import { UNITS, UNIT_MAP } from '../game/data/units';
import { GACHA_POOLS, POOL_MAP } from '../game/data/gacha';
import type { GachaPoolId, PullResult, Rarity } from '../game/types';
import { Btn, Modal, Panel, RarityBadge, UnitIcon, RARITY_STYLE, TypeBadge } from './ui';
import RevealCutscene from './RevealCutscene';
import { fmt, pct } from '../game/format';
import { sfx } from '../utils/sfx';

const BEST_MSG = [
  '……（何も起きない）',
  '（普通の音）',
  'ガコン！',
  'ガコン！！（金色に光った）',
  '✝✝ 虹色のコーンスープが出てきた ✝✝',
  '☨ 存在しないが、ある ☨',
];

export default function GachaTab() {
  const s = useGame();
  const m = computeMods(s);
  const rates = gachaRates(m);
  const pmax = pityMax(m);

  const [poolId, setPoolId] = useState<GachaPoolId>('standard');
  const [results, setResults] = useState<PullResult[] | null>(null);
  const [reveal, setReveal] = useState<PullResult[] | null>(null);
  const [anim, setAnim] = useState(false);
  const [showPool, setShowPool] = useState(false);

  // 高速召喚（演出スキップ＆連打）
  const [fastMode, setFastMode] = useState(false);
  const [fastHistory, setFastHistory] = useState<PullResult[]>([]);

  // オート召喚機能
  const [autoRunning, setAutoRunning] = useState(false);
  const [autoMode, setAutoMode] = useState<'10' | '100'>('10');
  const [autoStop, setAutoStop] = useState<'out' | 'ssr' | 'ur'>('out');
  const [autoStats, setAutoStats] = useState({ pulls: 0, ssr: 0, ur: 0, lr: 0, crystals: 0 });

  const tickets = s.items['ticket'] || 0;
  const currentPool = POOL_MAP[poolId] || POOL_MAP['standard'];
  const isEssence = currentPool.currency === 'honshitsu';

  // オートガチャのループ
  useEffect(() => {
    if (!autoRunning) return;
    const interval = Math.max(150, 600 - (m.autoGachaSpeed || 1) * 60);
    const timer = setInterval(() => {
      const count = autoMode === '100' ? 100 : 10;

      // コストチェック
      if (isEssence) {
        const cost = count === 100 ? 8e5 : 9e4;
        if (s.honshitsu < cost) {
          setAutoRunning(false);
          useGame.getState().toast('✝本質✝が尽きたため自動召喚を停止しました', 'info');
          return;
        }
      } else {
        const discount = s.ultraPrestige['u_auto_mach'] ? 20 : 0;
        const cost = count === 100 ? Math.max(300, 400 - discount) : 45;
        if (s.cans < cost) {
          setAutoRunning(false);
          useGame.getState().toast('コーンスープ缶が尽きたため自動召喚を停止しました', 'info');
          return;
        }
      }

      const res = useGame.getState().pull(count, false, poolId);
      if (!res) {
        setAutoRunning(false);
        return;
      }

      sfx.gacon();

      let ssrCount = 0;
      let urCount = 0;
      let lrCount = 0;
      let crystalSum = 0;
      for (const r of res) {
        const u = UNIT_MAP[r.id];
        if (u.rarity === 'SSR') ssrCount++;
        else if (u.rarity === 'UR') urCount++;
        else if (u.rarity === 'LR') lrCount++;
        if (r.crystals) crystalSum += r.crystals;
      }

      setAutoStats((prev) => ({
        pulls: prev.pulls + count,
        ssr: prev.ssr + ssrCount,
        ur: prev.ur + urCount,
        lr: prev.lr + lrCount,
        crystals: prev.crystals + crystalSum,
      }));

      setFastHistory(res.slice(-10));

      // 停止条件判定
      if (autoStop === 'ssr' && ssrCount + urCount + lrCount > 0) {
        setAutoRunning(false);
        useGame.getState().toast('SSR以上が出現したため自動召喚を停止しました！', 'rare');
      } else if (autoStop === 'ur' && urCount + lrCount > 0) {
        setAutoRunning(false);
        useGame.getState().toast('UR以上が出現したため自動召喚を停止しました！', 'rare');
      }
    }, interval);

    return () => clearInterval(timer);
  }, [autoRunning, autoMode, autoStop, poolId, isEssence, s.cans, s.honshitsu, m.autoGachaSpeed, s.ultraPrestige]);

  const doPull = (count: 1 | 10 | 100, ticket = false) => {
    const r = useGame.getState().pull(count, ticket, poolId);
    if (!r) {
      if (ticket) {
        useGame.getState().toast('召喚チケットが足りません', 'bad');
      } else if (isEssence) {
        useGame.getState().toast('✝本質✝が足りません', 'bad');
      } else {
        useGame.getState().toast('コーンスープ缶が足りません（ないときの方が本質である）', 'bad');
      }
      return;
    }

    if (count === 100) sfx.hundred();
    else sfx.gacon();

    // 高速モードならモーダルを出さずに履歴のみ更新（連打が超快適！）
    if (fastMode) {
      setFastHistory(r.slice(-10));
      return;
    }

    setResults(r);
    const strong = r.filter((x) => rarityRank(UNIT_MAP[x.id].rarity) >= rarityRank('SSR'));
    if (strong.length && count <= 10) {
      setReveal(strong);
      setAnim(false);
    } else {
      setAnim(true);
      setTimeout(() => setAnim(false), count === 100 ? 500 : 700);
    }
  };

  const bestRank = results ? Math.max(...results.map((r) => rarityRank(UNIT_MAP[r.id].rarity))) : 0;
  const owned = Object.keys(s.units).length;

  // 100連割引チェック
  const discount100 = s.ultraPrestige['u_auto_mach'] ? 20 : 0;
  const cost100Cans = Math.max(300, 400 - discount100);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)]">
      {/* 召喚自販機本体 */}
      <div className="relative mx-auto w-full max-w-lg rounded-[32px] border-4 border-slate-300 bg-gradient-to-b from-slate-900 via-slate-800 to-black p-3.5 shadow-2xl">
        {/* 筐体選択タブ */}
        <div className="mb-2 flex gap-1 overflow-x-auto pb-1 text-xs">
          {GACHA_POOLS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setPoolId(p.id);
                setAutoRunning(false);
              }}
              className={`flex shrink-0 items-center gap-1 rounded-xl px-2.5 py-1.5 font-bold transition ${
                poolId === p.id
                  ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-black shadow-md'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <span>{p.emoji}</span>
              <span>{p.name.slice(0, 7)}</span>
            </button>
          ))}
        </div>

        {/* 自販機フロントパネル */}
        <div className={`rounded-2xl bg-gradient-to-b ${currentPool.bannerGradient} p-3 text-white shadow-inner`}>
          <div className="flex items-center justify-between">
            <span className="rounded-md bg-black/40 px-2 py-0.5 text-[10px] font-bold text-amber-200">
              {currentPool.emoji} {currentPool.name}
            </span>
            <span className="text-[10px] text-white/80">{currentPool.subtitle}</span>
          </div>

          <div className="mt-2 text-center text-xs text-white/90">{currentPool.desc}</div>

          {/* ピックアップキャラ表示 */}
          <div className="mt-2.5 grid grid-cols-4 gap-1.5 rounded-xl bg-black/40 p-2 backdrop-blur-sm">
            {currentPool.featuredIds.slice(0, 8).map((id) => {
              const u = UNIT_MAP[id];
              if (!u) return null;
              return (
                <div key={id} className="flex flex-col items-center rounded-lg bg-white/10 p-1">
                  <UnitIcon def={u} size={42} />
                  <div className="mt-0.5 w-full truncate text-center text-[9px] font-bold">{u.name}</div>
                  <RarityBadge r={u.rarity} className="mt-0.5 text-[8px]" />
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex justify-between text-[10px] font-bold text-white/90">
            <span className="rounded bg-sky-500/80 px-1.5 text-white">つめた～い</span>
            <span className="text-white/60">※コーンスープは売り切れの場合があります</span>
            <span className="rounded bg-rose-500/80 px-1.5 text-white">あったか～い✝</span>
          </div>
        </div>

        {/* コイン投入口＆残高 */}
        <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-600 bg-black/90 px-3 py-2 font-mono text-sm">
          <div className="flex items-center gap-3">
            <span className="text-emerald-300">🥫 {fmt(s.cans)}</span>
            <span className="text-purple-300">💎 {fmt(s.crystals)}</span>
            <span className="text-cyan-300">🎫 {tickets}</span>
          </div>
          {isEssence && <span className="text-amber-300">✝ {fmt(s.honshitsu)}</span>}
        </div>

        {/* 召喚操作ボタン */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {/* 単発 */}
          <Btn
            variant="gold"
            onClick={() => doPull(1)}
            disabled={isEssence ? s.honshitsu < 1e4 : s.cans < 5}
            className="flex flex-col items-center py-2"
          >
            <span className="font-bold">単発召喚</span>
            <span className="text-[10px] font-normal">{isEssence ? '✝10,000' : '🥫×5'}</span>
          </Btn>

          {/* 10連 */}
          <Btn
            variant="gold"
            onClick={() => doPull(10)}
            disabled={isEssence ? s.honshitsu < 9e4 : s.cans < 45}
            className="flex flex-col items-center py-2"
          >
            <span className="font-bold">10連召喚</span>
            <span className="text-[10px] font-normal">{isEssence ? '✝90,000' : '🥫×45（SR確定）'}</span>
          </Btn>

          {/* 100連（超お得＆高速！） */}
          <Btn
            variant="gold"
            onClick={() => doPull(100)}
            disabled={isEssence ? s.honshitsu < 8e5 : s.cans < cost100Cans}
            className="relative flex flex-col items-center py-2 overflow-hidden border-2 border-amber-300"
          >
            <span className="absolute -right-5 top-1 rotate-45 bg-rose-600 px-5 text-[8px] font-bold text-white shadow">
              特価
            </span>
            <span className="font-bold text-amber-200">💥 100連召喚</span>
            <span className="text-[10px] font-normal">
              {isEssence ? '✝800,000' : `🥫×${cost100Cans}（SSR+確）`}
            </span>
          </Btn>
        </div>

        {/* チケット召喚ボタン */}
        {!isEssence && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            <Btn small variant="ghost" onClick={() => doPull(1, true)} disabled={tickets < 1}>
              🎫チケット単発
            </Btn>
            <Btn small variant="ghost" onClick={() => doPull(10, true)} disabled={tickets < 10}>
              🎫チケット10連
            </Btn>
            <Btn small variant="ghost" onClick={() => doPull(100, true)} disabled={tickets < 100}>
              🎫チケット100連
            </Btn>
          </div>
        )}

        {/* 連打モード＆オートガチャトグル */}
        <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-2 text-xs">
          <label className="flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={fastMode}
              onChange={(e) => setFastMode(e.target.checked)}
              className="h-4 w-4 rounded accent-rose-500"
            />
            <span className="font-bold text-amber-200">⚡ 高速召喚モード（連打OK）</span>
          </label>
          <span className="text-[10px] text-slate-400">演出をスキップして即引き</span>
        </div>

        {/* オート高速召喚パネル */}
        <div className="mt-2 rounded-xl border border-rose-500/30 bg-rose-950/20 p-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-rose-300">🎰 オート高速召喚（自動投入）</span>
            <div className="flex gap-1">
              <button
                onClick={() => setAutoMode('10')}
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  autoMode === '10' ? 'bg-rose-500 text-white' : 'bg-black/40 text-slate-400'
                }`}
              >
                10連ずつ
              </button>
              <button
                onClick={() => setAutoMode('100')}
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  autoMode === '100' ? 'bg-rose-500 text-white' : 'bg-black/40 text-slate-400'
                }`}
              >
                100連ずつ
              </button>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-1 text-slate-300">
              <span>停止条件：</span>
              <select
                value={autoStop}
                onChange={(e) => setAutoStop(e.target.value as any)}
                className="rounded border border-white/10 bg-black/60 px-1 py-0.5 text-xs text-white"
              >
                <option value="out">缶/本質が尽きるまで</option>
                <option value="ssr">SSR以上が出現するまで</option>
                <option value="ur">UR以上が出現するまで</option>
              </select>
            </div>

            <Btn
              small
              variant={autoRunning ? 'danger' : 'green'}
              onClick={() => {
                if (!autoRunning) setAutoStats({ pulls: 0, ssr: 0, ur: 0, lr: 0, crystals: 0 });
                setAutoRunning(!autoRunning);
              }}
            >
              {autoRunning ? '⏹ 停止する' : '▶ 自動開始'}
            </Btn>
          </div>

          {autoRunning && (
            <div className="mt-2 flex items-center justify-between rounded-lg bg-black/60 px-2 py-1 text-[10px] text-emerald-300">
              <span className="animate-pulse">🔄 高速召喚中……</span>
              <span>
                引いた数: {autoStats.pulls}回 (SSR: {autoStats.ssr} / UR: {autoStats.ur} / LR: {autoStats.lr} / 💎+
                {autoStats.crystals})
              </span>
            </div>
          )}
        </div>

        {/* 取り出し口 */}
        <div className="mt-3 flex h-14 items-center justify-center rounded-xl border-2 border-slate-600 bg-black/80 text-xs text-slate-400">
          <span className={anim ? 'anim-gacon font-display text-2xl text-amber-300' : ''}>
            {anim ? 'ガコン！！' : '取り出し口'}
          </span>
        </div>

        {/* 高速モード時の最近の結果ログ */}
        {fastMode && fastHistory.length > 0 && (
          <div className="mt-2 rounded-xl bg-black/50 p-2">
            <div className="mb-1 text-[10px] text-slate-400">最新の獲得部員（直近10枠）</div>
            <div className="flex gap-1 overflow-x-auto pb-1">
              {fastHistory.map((r, i) => {
                const u = UNIT_MAP[r.id];
                return (
                  <div
                    key={i}
                    className={`flex shrink-0 flex-col items-center rounded-lg border p-1 ${
                      RARITY_STYLE[u.rarity].border
                    } bg-black/60`}
                  >
                    <UnitIcon def={u} size={36} />
                    <span className="text-[9px] font-bold">{u.name.slice(0, 4)}</span>
                    <span className="text-[8px] text-amber-300">
                      {r.isNew ? 'NEW' : r.crystals > 0 ? `💎+${r.crystals}` : `★${r.star}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {s.cans <= 0 && !isEssence && (
          <div className="mt-2 text-center text-xs text-amber-200">
            「コーンスープは、あるときより、ないときの方が本質である。」——砂糖
          </div>
        )}
      </div>

      {/* 排出率＆天井パネル */}
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
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/50">
              <div className="h-full bg-rainbow transition-all duration-300" style={{ width: `${(s.pity / pmax) * 100}%` }} />
            </div>
          </div>

          <ul className="mt-3 space-y-1 text-xs text-slate-300">
            <li>
              ・重複した部員は<b className="text-amber-200">限界突破（★）+1</b>。最大★15（ウルトラ転生でさらに拡張）。
            </li>
            <li>
              ・★完凸後の重複は、大量のコーンスープ缶に加えて<b className="text-purple-300">「💎 ✝本質結晶✝」</b>
              へ還元される！
            </li>
            <li>・10連でSR以上1枠確定。100連ならSSR以上1枠確定＆特別値引き！</li>
            <li>・高速召喚モードをONにすると、演出待機なしで爆速連打が可能。</li>
          </ul>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              図鑑 {owned}/{UNITS.length}（累計召喚 {s.pulls}回）
            </span>
            <Btn small variant="ghost" onClick={() => setShowPool(true)}>
              排出部員一覧
            </Btn>
          </div>
        </Panel>

        <Panel title="🥫 コーンスープ缶の入手方法">
          <ul className="space-y-1 text-xs text-slate-300">
            <li>📅 ログインボーナス（毎日出席スタンプで大量獲得）</li>
            <li>🎉 大型アプデ記念プレゼント（全員に🥫×450缶配布中！）</li>
            <li>📖 ストーリー初回クリア（大量）／🏫 対抗戦で勝利</li>
            <li>✨ 黄金✝をクリック（たまにコーンスープの帰還）</li>
            <li>🏆 実績（✝本質✝年鑑）の解除</li>
            <li>🏪 持ち物 → 購買で✝本質✝と交換</li>
          </ul>
        </Panel>
      </div>

      {/* 召喚結果モーダル */}
      <Modal
        open={!!results && !reveal}
        onClose={anim ? undefined : () => setResults(null)}
        wide
        title={anim ? undefined : `召喚結果（${results?.length || 0}連）`}
      >
        {results && anim ? (
          <div
            className={`flex h-72 flex-col items-center justify-center rounded-2xl ${
              bestRank >= 5
                ? 'bg-black text-rose-500 border-4 border-rose-500 shadow-2xl shadow-rose-900'
                : bestRank >= 4
                ? 'bg-rainbow'
                : bestRank === 3
                ? 'bg-gradient-to-b from-amber-400 to-orange-700'
                : 'bg-gradient-to-b from-slate-600 to-slate-900'
            }`}
          >
            <div className="anim-gacon font-display text-5xl text-white drop-shadow-lg">ガコン！</div>
            <div className="mt-3 font-bold text-white drop-shadow">{BEST_MSG[bestRank]}</div>
          </div>
        ) : results ? (
          <div>
            {bestRank >= 4 && (
              <div className="mb-3 rounded-xl bg-rainbow py-1 text-center font-display text-black">
                ✝✝ 確定演出：高レアリティ降臨 ✝✝
              </div>
            )}

            {/* 100連結果サマリー */}
            {results.length === 100 && (
              <div className="mb-3 flex flex-wrap items-center justify-between rounded-xl bg-white/5 p-2 text-xs">
                <div className="flex gap-2">
                  <span className="font-bold">内訳:</span>
                  {RARITIES.map((r) => {
                    const count = results.filter((x) => UNIT_MAP[x.id].rarity === r).length;
                    if (count === 0) return null;
                    return (
                      <span key={r} className="font-mono">
                        <RarityBadge r={r} />×{count}
                      </span>
                    );
                  })}
                </div>
                <div className="flex gap-3 text-emerald-300">
                  <span>
                    💎 結晶: +{results.reduce((acc, x) => acc + (x.crystals || 0), 0)}
                  </span>
                  <span>
                    🥫 返還缶: +{results.reduce((acc, x) => acc + (x.refund || 0), 0)}
                  </span>
                </div>
              </div>
            )}

            {/* リザルトグリッド */}
            <div
              className={`max-h-[60vh] overflow-y-auto grid gap-2 p-1 ${
                results.length === 100
                  ? 'grid-cols-4 sm:grid-cols-10'
                  : results.length === 10
                  ? 'grid-cols-2 sm:grid-cols-5'
                  : 'grid-cols-1'
              }`}
            >
              {results.map((r, i) => {
                const u = UNIT_MAP[r.id];
                return (
                  <div
                    key={i}
                    className={`anim-pop flex flex-col items-center rounded-xl border-2 ${
                      RARITY_STYLE[u.rarity].border
                    } bg-black/40 p-2 text-center`}
                    style={{ animationDelay: `${Math.min(i * 30, 400)}ms` }}
                  >
                    <UnitIcon def={u} size={results.length === 100 ? 44 : results.length === 10 ? 64 : 110} />
                    <div className="mt-1 flex items-center gap-1">
                      <RarityBadge r={u.rarity} />
                      {results.length <= 10 && <TypeBadge t={u.type} />}
                    </div>
                    <div className="mt-1 w-full truncate text-xs font-bold">{u.name}</div>
                    <div className="text-[10px]">
                      {r.isNew ? (
                        <span className="font-bold text-rose-300">NEW!</span>
                      ) : r.crystals > 0 ? (
                        <span className="font-bold text-purple-300">💎+{r.crystals}</span>
                      ) : (
                        <span className="text-amber-300">★{r.star}</span>
                      )}
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
              <Btn
                variant="gold"
                onClick={() => doPull(results.length as any)}
                disabled={
                  isEssence
                    ? s.honshitsu < (results.length === 100 ? 8e5 : results.length === 10 ? 9e4 : 1e4)
                    : s.cans < (results.length === 100 ? cost100Cans : results.length === 10 ? 45 : 5)
                }
              >
                もう一回（
                {isEssence
                  ? `✝${fmt(results.length === 100 ? 8e5 : results.length === 10 ? 9e4 : 1e4)}`
                  : `🥫${results.length === 100 ? cost100Cans : results.length === 10 ? 45 : 5}`}
                ）
              </Btn>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* 排出部員一覧モーダル */}
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
