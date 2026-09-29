import { useState } from 'react';
import { useGame } from '../game/store';
import { computeMods, derive, levelCap, powerToDev, rarityRank, unitLevelCost, unitStats, RARITIES, TYPES, getMaxStar } from '../game/formulas';
import { UNITS, UNIT_MAP, getUnitForm } from '../game/data/units';
import { EVOLUTION_FORMS, EVOLUTION_MATERIAL_SOURCES } from '../game/data/evolutions';
import { ITEM_MAP, EQUIPS } from '../game/data/items';
import { getUnitAwakenings, BOND_VOICES, CRYSTAL_SHOP } from '../game/data/awakening';
import type { Rarity, UnitType } from '../game/types';
import { fmt } from '../game/format';
import { Btn, Chip, ItemIcon, Modal, Panel, RarityBadge, Stars, TypeBadge, UnitIcon } from './ui';
import { sfx } from '../utils/sfx';
import EvolutionCutscene from './EvolutionCutscene';

const SKILL_KIND: Record<string, string> = {
  nuke: '単体攻撃',
  aoe: '全体攻撃',
  heal: '全体回復',
  buff: '攻撃バフ',
  stun: 'スタン',
  multi: '連続攻撃',
  gamble: 'ギャンブル',
  shield: 'バリア',
};

function equipText(id: string) {
  const it = ITEM_MAP[id];
  return it ? it.desc : '';
}

// ───────── 本質覚醒モーダル ─────────
function AwakeningModal({ unitId, onClose }: { unitId: string; onClose: () => void }) {
  const s = useGame();
  const def = getUnitForm(unitId, !!s.evolvedUnits?.[unitId]);
  const u = s.units[unitId];
  const currentStage = s.awakening[unitId] || 0;
  const stages = getUnitAwakenings(unitId);

  if (!def || !u) return null;

  return (
    <Modal open onClose={onClose} wide title={`✨ ${def.name} の✝本質覚醒✝`}>
      <div className="space-y-3">
        <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-2.5 text-xs text-purple-200">
          部員ごとの潜在能力を解放し、ステータス＆本質生産力を爆発的に向上させます。（最大5段階）
        </div>

        <div className="space-y-2">
          {stages.map((st, idx) => {
            const unlocked = currentStage > idx;
            const isNext = currentStage === idx;
            const canAwaken =
              isNext &&
              u.star >= st.reqStar &&
              u.level >= st.reqLevel &&
              s.honshitsu >= st.costHonshitsu &&
              s.cans >= st.costCans &&
              s.crystals >= st.costCrystals;

            return (
              <div
                key={idx}
                className={`rounded-xl border p-3 transition ${
                  unlocked
                    ? 'border-amber-400/50 bg-amber-500/10'
                    : isNext
                    ? 'border-purple-400 bg-purple-900/30'
                    : 'border-white/10 bg-black/30 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        unlocked ? 'bg-amber-400 text-black' : 'bg-white/20 text-white'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-bold text-sm text-white">{st.title}</span>
                  </div>
                  {unlocked ? (
                    <span className="rounded bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      解放済み
                    </span>
                  ) : isNext ? (
                    <Btn
                      small
                      variant={canAwaken ? 'gold' : 'ghost'}
                      disabled={!canAwaken}
                      onClick={() => {
                        sfx.awaken();
                        useGame.getState().awakenUnit(unitId);
                      }}
                    >
                      覚醒する
                    </Btn>
                  ) : (
                    <span className="text-[10px] text-slate-500">第{idx}段階が必要</span>
                  )}
                </div>

                <div className="mt-1 text-xs text-emerald-300">{st.desc}</div>
                <div className="mt-1 text-[11px] italic text-slate-400">「{st.flavor}」</div>

                {isNext && (
                  <div className="mt-2 flex flex-wrap gap-2 border-t border-white/10 pt-2 text-[10px]">
                    <span className={u.star >= st.reqStar ? 'text-emerald-300' : 'text-rose-400'}>
                      必要: ★{st.reqStar}凸 (現在: ★{u.star})
                    </span>
                    <span className={u.level >= st.reqLevel ? 'text-emerald-300' : 'text-rose-400'}>
                      必要: Lv{st.reqLevel} (現在: Lv{u.level})
                    </span>
                    <span className={s.honshitsu >= st.costHonshitsu ? 'text-emerald-300' : 'text-rose-400'}>
                      ✝{fmt(st.costHonshitsu)}
                    </span>
                    <span className={s.cans >= st.costCans ? 'text-emerald-300' : 'text-rose-400'}>
                      🥫×{st.costCans}
                    </span>
                    <span className={s.crystals >= st.costCrystals ? 'text-emerald-300' : 'text-rose-400'}>
                      💎×{st.costCrystals}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

// ───────── 放課後絆（親愛度）モーダル ─────────
function BondModal({ unitId, onClose }: { unitId: string; onClose: () => void }) {
  const s = useGame();
  const def = getUnitForm(unitId, !!s.evolvedUnits?.[unitId]);
  const u = s.units[unitId];
  const bond = s.bonds[unitId] || { exp: 0, lv: 1 };
  const voices = BOND_VOICES[unitId] || [
    '今日もいい天気だな。',
    '一緒に部活しよう。',
    'コーンスープ美味しいね。',
    '君といると落ち着くよ。',
    'これからもよろしく！',
  ];

  if (!def || !u) return null;

  const reqNext = Math.floor(50 * Math.pow(1.3, bond.lv - 1));
  const treatItems = [
    { id: 'pan', name: '購買パン', exp: 20 },
    { id: 'tamago', name: '母親の卵焼き', exp: 40 },
    { id: 'hotsoup', name: 'コーンスープ缶', exp: 30 },
    { id: 'jiroitem', name: '二郎系ラーメン', exp: 50 },
    { id: 'gyuu', name: '学食の牛乳', exp: 60 },
  ];

  return (
    <Modal open onClose={onClose} wide title={`❤️ ${def.name} との放課後交流（絆）`}>
      <div className="space-y-4">
        {/* 絆レベルとゲージ */}
        <div className="rounded-xl bg-rose-500/10 border border-rose-400/30 p-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-rose-300">絆レベル: Lv {bond.lv} / 10</span>
            <span className="text-xs text-slate-400">
              {bond.lv >= 10 ? 'MAX' : `${bond.exp} / ${reqNext} EXP`}
            </span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-black/60">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-pink-400 transition-all duration-300"
              style={{ width: `${bond.lv >= 10 ? 100 : (bond.exp / reqNext) * 100}%` }}
            />
          </div>
          <div className="mt-1 text-[11px] text-slate-300">
            効果：ステータス +{(bond.lv - 1) * 10}% ／ 毎秒本質 +{(bond.lv - 1) * 15}%
          </div>
        </div>

        {/* 差し入れ */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-300">差し入れ（アイテムを渡して親愛度UP）</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {treatItems.map((it) => {
              const count = s.items[it.id] || 0;
              const idef = ITEM_MAP[it.id];
              return (
                <button
                  key={it.id}
                  disabled={count <= 0 || bond.lv >= 10}
                  onClick={() => {
                    sfx.tap();
                    useGame.getState().giftBond(unitId, it.id);
                  }}
                  className={`flex flex-col items-center rounded-xl border p-2 text-center transition ${
                    count > 0 && bond.lv < 10
                      ? 'border-white/20 bg-white/5 hover:bg-white/10'
                      : 'border-white/5 bg-black/20 opacity-50'
                  }`}
                >
                  <span className="text-2xl">{idef?.emoji || '🎁'}</span>
                  <span className="text-xs font-bold mt-1">{it.name}</span>
                  <span className="text-[10px] text-rose-300">+{it.exp} EXP</span>
                  <span className="text-[10px] text-slate-400">所持: {count}個</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 解放されたボイス・メッセージ */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-300">親愛メッセージ（絆Lvに応じて解放）</div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {voices.map((msg, i) => {
              const unlocked = bond.lv >= (i + 1) * 2 - 1;
              return (
                <div
                  key={i}
                  className={`rounded-lg p-2 text-xs transition ${
                    unlocked ? 'bg-white/10 text-white' : 'bg-black/30 text-slate-500'
                  }`}
                >
                  <span className="font-bold text-rose-300 mr-2">Lv{(i + 1) * 2 - 1}:</span>
                  {unlocked ? `「${msg}」` : '（絆を深めると解放）'}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ───────── ✝本質結晶交換所モーダル ─────────
function CrystalShopModal({ onClose }: { onClose: () => void }) {
  const s = useGame();

  return (
    <Modal open onClose={onClose} wide title="💎 ✝本質結晶交換所（部室購買特設）">
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-purple-950/40 border border-purple-500/30 p-2.5">
          <span className="text-xs text-purple-200">
            召喚で完凸部員が重複した際に獲得できる「✝本質結晶✝」を貴重な品と交換できます。
          </span>
          <span className="font-mono text-sm font-bold text-purple-300 shrink-0 ml-2">
            所持: 💎 {fmt(s.crystals)}
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {CRYSTAL_SHOP.map((e) => {
            const canBuy = s.crystals >= e.costCrystals;
            return (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-3xl shrink-0">{e.emoji}</span>
                  <div className="min-w-0">
                    <div className="font-bold text-xs truncate">{e.name}</div>
                    <div className="text-[10px] text-slate-400">{e.desc}</div>
                  </div>
                </div>

                <Btn
                  small
                  variant={canBuy ? 'gold' : 'ghost'}
                  disabled={!canBuy}
                  onClick={() => {
                    sfx.tap();
                    useGame.getState().buyCrystalShop(e.id);
                  }}
                  className="shrink-0 ml-2"
                >
                  💎 {e.costCrystals}
                </Btn>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

// ───────── 部員詳細モーダル ─────────
function UnitDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const s = useGame();
  const [picking, setPicking] = useState(false);
  const [showAwakening, setShowAwakening] = useState(false);
  const [showBond, setShowBond] = useState(false);
  const [showBefore, setShowBefore] = useState(false);
  const [showArtwork, setShowArtwork] = useState(false);
  const [showEvolution, setShowEvolution] = useState(false);

  const evolved = !!s.evolvedUnits?.[id];
  const def = getUnitForm(id, evolved);
  const baseDef = UNIT_MAP[id];
  const evolution = EVOLUTION_FORMS[id];
  const u = s.units[id];
  const m = computeMods(s);

  if (!def) return null;
  if (!u) {
    return (
      <Modal open onClose={onClose} title="未入手の部員">
        <div className="flex items-center gap-3">
          <UnitIcon def={def} size={88} dim />
          <div>
            <div className="flex gap-1">
              <RarityBadge r={def.rarity} />
              <TypeBadge t={def.type} />
            </div>
            <div className="mt-1 font-display text-lg">{def.name}</div>
            <div className="text-xs text-slate-400">{def.title}</div>
            <div className="mt-2 text-xs text-slate-300">
              召喚（北棟の自販機）で出現する。ストーリーで仲間になる部員もいる。
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  const st = unitStats(def, u, m, s);
  const cap = levelCap(u, m);
  const inParty = s.party.includes(id);
  const cost1 = unitLevelCost(def, u.level);
  let cost10 = 0;
  let n10 = 0;
  for (let lv = u.level; lv < Math.min(cap, u.level + 10); lv++) {
    cost10 += unitLevelCost(def, lv);
    n10++;
  }
  const equip = u.equip ? ITEM_MAP[u.equip] : null;
  const invEquips = EQUIPS.filter((e) => (s.items[e.id] || 0) > 0);
  const maxed = u.level >= cap;
  const maxStar = getMaxStar(m);
  const awakenStage = s.awakening[id] || 0;
  const bond = s.bonds[id] || { exp: 0, lv: 1 };
  const evolutionMaterial = evolution ? ITEM_MAP[evolution.cost.materialId] : undefined;
  const evolutionMaterialCount = evolution ? (s.items[evolution.cost.materialId] || 0) : 0;
  const evolutionMaterialSource = evolution ? EVOLUTION_MATERIAL_SOURCES[evolution.cost.materialId] : undefined;
  const evolutionCanPay = !!evolution && s.cans >= evolution.cost.cans && s.crystals >= evolution.cost.crystals && s.cores >= evolution.cost.cores && s.memories >= evolution.cost.memories && evolutionMaterialCount >= evolution.cost.materialCount;
  const canEvolve = !!evolution && !evolved && u.star >= maxStar && evolutionCanPay;
  const iconDef = evolved && showBefore && baseDef ? baseDef : def;

  return (
    <>
      <Modal open onClose={onClose} wide>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-col items-center sm:w-48">
            <button type="button" onClick={() => setShowArtwork(true)} aria-label="イラストを拡大" className="cursor-zoom-in"><UnitIcon def={iconDef} size={150} /></button>
            <Btn small variant="ghost" className="mt-2" onClick={() => setShowArtwork(true)}>イラストを拡大</Btn>
            {evolved && <Btn small variant="ghost" className="mt-2" onClick={() => setShowBefore((v) => !v)}>{showBefore ? 'EXの姿に戻す' : '進化前の立ち絵を見る'}</Btn>}
            <div className="mt-2 flex gap-1">
              <RarityBadge r={def.rarity} />
              <TypeBadge t={def.type} />
            </div>
            <div className="mt-1">
              <Stars n={u.star} max={maxStar} />
            </div>
            <div className="mt-2 text-center text-xs italic text-slate-300">「{def.quote}」</div>

            {/* 新育成アクションボタン */}
            <div className="mt-3 flex w-full flex-col gap-1.5">
              <Btn
                small
                variant="gold"
                onClick={() => setShowAwakening(true)}
                className="w-full flex justify-between px-2"
              >
                <span>✨ ✝本質覚醒✝</span>
                <span className="font-mono">段階 {awakenStage}/5</span>
              </Btn>
              <Btn
                small
                variant="ghost"
                onClick={() => setShowBond(true)}
                className="w-full flex justify-between px-2 text-rose-300 border-rose-400/30"
              >
                <span>❤️ 放課後絆</span>
                <span className="font-mono">Lv {bond.lv}/10</span>
              </Btn>
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <div className="text-xs text-purple-300">{def.title}</div>
              <div className="font-display text-2xl">{def.name}</div>
              <div className="text-xs text-slate-400">{def.desc}</div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <StatBox label="レベル" value={`${u.level} / ${cap}`} />
              <StatBox label="ATK" value={fmt(st.atk)} />
              <StatBox label="HP" value={fmt(st.hp)} />
              <StatBox label="速度" value={st.spd.toFixed(2)} />
              <StatBox
                label="戦闘力"
                value={fmt(st.power)}
                sub={`偏差値換算 ${powerToDev(st.power).toFixed(1)}`}
              />
              <StatBox label="生産" value={`+${fmt(st.prod)}/秒`} sub={`凸倍率 ×${st.starMul.toFixed(1)}`} />
            </div>

            <div className="rounded-xl border border-amber-300/30 bg-amber-500/10 p-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-200">スキル：{def.skill.name}</span>
                <span className="text-slate-400">
                  {SKILL_KIND[def.skill.kind]}／ゲージ{def.skill.charge}
                </span>
              </div>
              <div className="text-xs">{def.skill.desc}</div>
              <div className="text-[11px] italic text-slate-400">発動時「{def.skill.line}」</div>
            </div>

            <div className="rounded-xl border border-sky-300/30 bg-sky-500/10 p-2 text-xs">
              <span className="font-bold text-sky-200">
                パッシブ（{def.passive.scope === 'owned' ? '所持で常時発動' : '編成中のみ発動'}）：
              </span>
              {def.passive.desc}
            </div>

            {evolution && (
              <div className="relative overflow-hidden rounded-2xl border border-cyan-200/40 bg-gradient-to-br from-cyan-950/70 via-violet-950/50 to-rose-950/60 p-3 shadow-[0_0_28px_rgba(34,211,238,0.12)]">
                <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-cyan-300/10 blur-2xl" />
                <div className="relative flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200/80">Limit Break / Evolution</div>
                    <div className="mt-0.5 flex items-center gap-2 font-display text-lg">
                      <span>LR</span><span className="text-cyan-200">⟶</span><RarityBadge r="EX" />
                    </div>
                    <div className="mt-1 text-xs text-slate-300">{evolved ? `EX進化済み：${evolution.title}` : evolution.title}</div>
                  </div>
                  <div className="rounded-full border border-cyan-200/30 bg-cyan-300/10 px-2 py-1 text-[10px] font-bold text-cyan-100">EX / AWAKENING</div>
                </div>
                <p className="relative mt-2 text-xs leading-relaxed text-slate-300">{evolution.desc}</p>
                {evolved ? (
                  <div className="relative mt-2 rounded-lg border border-cyan-200/20 bg-black/25 px-2.5 py-2 text-xs text-cyan-100">
                    <Btn small variant="gold" className="mb-2 w-full" onClick={() => setShowEvolution(true)}>▶ 進化演出をもう一度観る</Btn>
                    <span className="mr-1.5 font-black">EX / PASSIVE</span>{evolution.passive.desc}
                    <div className="mt-1 text-[10px] text-slate-400">進化前の立ち絵も切替ボタンからいつでも閲覧できます。</div>
                  </div>
                ) : (
                  <>
                    <div className="relative mt-3 grid grid-cols-2 gap-1.5 text-[10px] sm:grid-cols-3">
                      <span className={u.star >= maxStar ? 'text-emerald-300' : 'text-rose-300'}>完凸 ★{maxStar}（現在 ★{u.star}）</span>
                      <span className={s.cans >= evolution.cost.cans ? 'text-emerald-300' : 'text-rose-300'}>🥫 {s.cans.toLocaleString()}/{evolution.cost.cans.toLocaleString()}</span>
                      <span className={s.crystals >= evolution.cost.crystals ? 'text-emerald-300' : 'text-rose-300'}>💎 {s.crystals}/{evolution.cost.crystals}</span>
                      <span className={s.cores >= evolution.cost.cores ? 'text-emerald-300' : 'text-rose-300'}>🌌 {s.cores}/{evolution.cost.cores}</span>
                      <span className={s.memories >= evolution.cost.memories ? 'text-emerald-300' : 'text-rose-300'}>🌏 {s.memories.toLocaleString()}/{evolution.cost.memories}</span>
                      <span className={evolutionMaterialCount >= evolution.cost.materialCount ? 'text-emerald-300' : 'text-rose-300'}>{evolutionMaterial?.emoji ?? '✦'} {evolutionMaterialCount}/{evolution.cost.materialCount} {evolutionMaterial?.name ?? '専用素材'}</span>
                    </div>
                    <div className="relative mt-1.5 rounded-lg border border-cyan-300/30 bg-cyan-500/10 px-2 py-1.5 text-[10px] leading-tight">
                      <div className="font-bold text-cyan-200">📍 {evolutionMaterial?.name ?? '専用素材'} の入手先：{evolutionMaterialSource ? `${evolutionMaterialSource.mode} ${evolutionMaterialSource.short}『${evolutionMaterialSource.title}』` : '関連バトル'}</div>
                      <div className="mt-0.5 text-slate-300">初回勝利で1個確定、再戦で基本18%ドロップ（ドロップ率ボーナスで最大80%）。ストーリータブから挑戦できます。</div>
                    </div>
                    <Btn variant={canEvolve ? 'gold' : 'ghost'} disabled={!canEvolve} className="relative mt-3 w-full" onClick={() => setShowEvolution(true)}>
                      ✦ EXへ進化
                    </Btn>
                    {!canEvolve && <div className="relative mt-1 text-center text-[10px] text-slate-500">完凸と表示中のすべての素材がそろうと進化できます。</div>}
                  </>
                )}
              </div>
            )}

            {/* 装備 */}
            <div className="rounded-xl border border-white/10 bg-black/30 p-2">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-bold">装備</span>
                <div className="flex gap-1">
                  {equip && (
                    <Btn small variant="ghost" onClick={() => useGame.getState().equip(id, null)}>
                      外す
                    </Btn>
                  )}
                  <Btn small variant="ghost" onClick={() => setPicking((p) => !p)}>
                    {picking ? '閉じる' : '変更'}
                  </Btn>
                </div>
              </div>
              {equip ? (
                <div className="flex items-center gap-2">
                  <ItemIcon item={equip} size={36} />
                  <div className="text-xs">
                    <div className="font-bold">{equip.name}</div>
                    <div className="text-emerald-300">{equip.desc}</div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500">なし（戦闘ドロップ・落とし物ボックスで入手）</div>
              )}
              {picking && (
                <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                  {invEquips.length === 0 && <div className="text-xs text-slate-500">装備を持っていない</div>}
                  {invEquips.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => {
                        useGame.getState().equip(id, e.id);
                        setPicking(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg bg-white/5 p-1.5 text-left hover:bg-white/10"
                    >
                      <ItemIcon item={e} size={30} />
                      <div className="min-w-0 flex-1 text-xs">
                        <div className="truncate font-bold">
                          {e.name} <span className="text-slate-400">×{s.items[e.id]}</span>
                        </div>
                        <div className="truncate text-emerald-300">{equipText(e.id)}</div>
                      </div>
                      <RarityBadge r={e.rarity} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* レベルアップ＆編成 */}
            <div className="flex flex-wrap gap-2">
              <Btn onClick={() => useGame.getState().levelUp(id, 1)} disabled={maxed || s.honshitsu < cost1}>
                Lv+1
                <div className="text-[10px] font-normal">✝{fmt(cost1)}</div>
              </Btn>
              <Btn onClick={() => useGame.getState().levelUp(id, 10)} disabled={maxed || s.honshitsu < cost1}>
                Lv+{Math.max(1, n10)}
                <div className="text-[10px] font-normal">最大✝{fmt(cost10)}</div>
              </Btn>
              <Btn
                variant="gold"
                onClick={() => useGame.getState().levelUp(id, 'max')}
                disabled={maxed || s.honshitsu < cost1}
              >
                MAX
                <div className="text-[10px] font-normal">買えるだけ</div>
              </Btn>
              <Btn
                variant={inParty ? 'danger' : 'green'}
                onClick={() => useGame.getState().toggleParty(id)}
              >
                {inParty ? '編成から外す' : '編成に入れる'}
              </Btn>
            </div>

            {maxed && (
              <div className="text-xs text-amber-200">
                レベル上限！ 限界突破（★15まで拡張・ウルトラ転生でさらにUP）で上限解放
              </div>
            )}

            {/* 育成アイテム使用 */}
            <div className="flex flex-wrap gap-2">
              {(['gyuu', 'mapcopy'] as const).map((iid) => {
                const it = ITEM_MAP[iid];
                const cnt = s.items[iid] || 0;
                return (
                  <Btn
                    key={iid}
                    small
                    variant="ghost"
                    disabled={cnt <= 0}
                    onClick={() => useGame.getState().useItem(iid, id)}
                  >
                    {it.emoji} {it.name}（{cnt}）：{iid === 'gyuu' ? 'Lv+3' : '凸★+1'}
                  </Btn>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      {showAwakening && <AwakeningModal unitId={id} onClose={() => setShowAwakening(false)} />}
      {showBond && <BondModal unitId={id} onClose={() => setShowBond(false)} />}
      {showArtwork && <Modal open wide onClose={() => setShowArtwork(false)} title={iconDef.name}>
        <div className="flex flex-col items-center gap-3">
          {iconDef.portrait ? <img src={iconDef.portrait} alt={iconDef.name} className="max-h-[72dvh] w-full object-contain" /> : <UnitIcon def={iconDef} size={280} />}
          {evolved && <Btn variant="ghost" onClick={() => setShowBefore(v => !v)}>{showBefore ? 'EXのイラストへ' : '進化前のイラストへ'}</Btn>}
        </div>
      </Modal>}
      {showEvolution && <EvolutionCutscene unitId={id} replay={evolved} onComplete={() => {
        if (!evolved) useGame.getState().evolveUnit(id);
        setShowEvolution(false);
      }} />}
    </>
  );
}

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-white/5 px-2 py-1.5">
      <div className="text-[10px] text-slate-400">{label}</div>
      <div className="font-bold">{value}</div>
      {sub && <div className="text-[9px] text-purple-300">{sub}</div>}
    </div>
  );
}

export default function UnitsTab() {
  const s = useGame();
  const d = derive(s);
  const [sel, setSel] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'owned' | Rarity | UnitType>('all');
  const [showCrystalShop, setShowCrystalShop] = useState(false);

  const ownedCount = Object.keys(s.units).length;
  const list = UNITS.map((base) => getUnitForm(base.id, !!s.evolvedUnits?.[base.id]) ?? base)
    .filter((u) => {
      if (filter === 'all') return true;
      if (filter === 'owned') return !!s.units[u.id];
      if ((RARITIES as string[]).includes(filter)) return u.rarity === filter;
      return u.type === filter;
    })
    .sort((a, b) => {
      const oa = s.units[a.id] ? 1 : 0;
      const ob = s.units[b.id] ? 1 : 0;
      if (oa !== ob) return ob - oa;
      return rarityRank(b.rarity) - rarityRank(a.rarity);
    });

  return (
    <div className="space-y-3">
      {/* 編成パネル */}
      <Panel
        title="編成（最大4人）"
        right={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">
              戦闘偏差値 <b className="font-display text-lg text-white">{d.battleDev.toFixed(1)}</b>
            </span>
            <Btn small variant="ghost" onClick={() => useGame.getState().autoParty()}>
              おまかせ編成
            </Btn>
          </div>
        }
      >
        <div className="grid grid-cols-4 gap-2">
          {s.party.map((pid, i) => {
            const def = pid ? getUnitForm(pid, !!s.evolvedUnits?.[pid]) : null;
            const u = pid ? s.units[pid] : null;
            return (
              <button
                key={i}
                onClick={() => pid && setSel(pid)}
                className="flex flex-col items-center rounded-xl border border-white/10 bg-black/30 p-2 hover:bg-white/5"
              >
                {def && u ? (
                  <>
                    <UnitIcon def={def} size={60} />
                    <div className="mt-1 w-full truncate text-center text-[11px] font-bold">{def.name}</div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-300">
                      <span>Lv{u.level}</span>
                      <Stars n={u.star} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex h-[60px] w-[60px] items-center justify-center rounded-xl border-2 border-dashed border-white/20 text-2xl text-white/30">
                      ＋
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">空き</div>
                  </>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          部員は所持しているだけで毎秒大量の✝本質✝を生み出し、レベル・限界突破（★）・覚醒・絆で爆発的に成長します。
        </div>
      </Panel>

      {/* 部員図鑑 ＆ 特設結晶交換所 */}
      <Panel
        title={`部員図鑑 ${ownedCount}/${UNITS.length}`}
        right={
          <Btn small variant="gold" onClick={() => setShowCrystalShop(true)}>
            💎 結晶交換所（所持: {fmt(s.crystals)}）
          </Btn>
        }
      >
        <div className="no-scrollbar mb-3 flex gap-1.5 overflow-x-auto pb-1">
          <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
            全て
          </Chip>
          <Chip active={filter === 'owned'} onClick={() => setFilter('owned')}>
            所持
          </Chip>
          {[...RARITIES].reverse().map((r) => (
            <Chip key={r} active={filter === r} onClick={() => setFilter(r)}>
              {r}
            </Chip>
          ))}
          {TYPES.map((t) => (
            <Chip key={t} active={filter === t} onClick={() => setFilter(t)}>
              {t}
            </Chip>
          ))}
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-2">
          {list.map((def) => {
            const u = s.units[def.id];
            const inParty = s.party.includes(def.id);
            const awakenStage = s.awakening[def.id] || 0;
            return (
              <button
                key={def.id}
                onClick={() => setSel(def.id)}
                className={`relative flex flex-col items-center rounded-xl border p-2 transition hover:bg-white/5 ${
                  inParty
                    ? 'border-emerald-400/60 bg-emerald-500/10'
                    : 'border-white/10 bg-black/20'
                }`}
              >
                {inParty && (
                  <span className="absolute left-1 top-1 rounded bg-emerald-500 px-1 text-[9px] font-bold text-black">
                    編成
                  </span>
                )}
                {awakenStage > 0 && (
                  <span className="absolute right-1 top-1 rounded bg-purple-500 px-1 text-[8px] font-bold text-white shadow">
                    覚醒{awakenStage}
                  </span>
                )}
                <UnitIcon def={def} size={60} dim={!u} />
                <div className="mt-1 w-full truncate text-center text-[11px] font-bold">{def.name}</div>
                {u ? (
                  <div className="flex items-center gap-1 text-[10px] text-slate-300">
                    <span>Lv{u.level}</span>
                    <Stars n={u.star} />
                  </div>
                ) : (
                  <RarityBadge r={def.rarity} />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 text-[11px] text-slate-400">
          部員はタップで詳細画面を開き、レベルアップ、★限界突破、✝本質覚醒✝、❤️放課後絆の強化が可能です。
        </div>
      </Panel>

      {sel && <UnitDetail id={sel} onClose={() => setSel(null)} />}
      {showCrystalShop && <CrystalShopModal onClose={() => setShowCrystalShop(false)} />}
    </div>
  );
}
