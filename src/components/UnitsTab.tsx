import { useState } from 'react';
import { useGame } from '../game/store';
import { computeMods, derive, levelCap, powerToDev, rarityRank, unitLevelCost, unitStats, RARITIES, TYPES } from '../game/formulas';
import { UNITS, UNIT_MAP } from '../game/data/units';
import { ITEM_MAP, EQUIPS } from '../game/data/items';
import type { Rarity, UnitType } from '../game/types';
import { fmt, pct } from '../game/format';
import { Btn, Chip, ItemIcon, Modal, Panel, RarityBadge, Stars, TypeBadge, UnitIcon } from './ui';

const SKILL_KIND: Record<string, string> = {
  nuke: '単体攻撃', aoe: '全体攻撃', heal: '全体回復', buff: '攻撃バフ', stun: 'スタン', multi: '連続攻撃', gamble: 'ギャンブル', shield: 'バリア',
};

function equipText(id: string) {
  const it = ITEM_MAP[id];
  return it ? it.desc : '';
}

function UnitDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const s = useGame();
  const [picking, setPicking] = useState(false);
  const def = UNIT_MAP[id];
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
            <div className="mt-2 text-xs text-slate-300">召喚（北棟の自販機）で出現する。ストーリーで仲間になる部員もいる。</div>
          </div>
        </div>
      </Modal>
    );
  }
  const st = unitStats(def, u, m);
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

  return (
    <Modal open onClose={onClose} wide>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-col items-center sm:w-48">
          <UnitIcon def={def} size={150} />
          <div className="mt-2 flex gap-1">
            <RarityBadge r={def.rarity} />
            <TypeBadge t={def.type} />
          </div>
          <div className="mt-1">
            <Stars n={u.star} />
          </div>
          <div className="mt-2 text-center text-xs italic text-slate-300">「{def.quote}」</div>
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
            <StatBox label="戦闘力" value={fmt(st.power)} sub={`偏差値換算 ${powerToDev(st.power).toFixed(1)}`} />
            <StatBox label="生産" value={`+${fmt(st.prod)}/秒`} />
          </div>
          <div className="rounded-xl border border-amber-300/30 bg-amber-500/10 p-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-200">スキル：{def.skill.name}</span>
              <span className="text-slate-400">{SKILL_KIND[def.skill.kind]}／ゲージ{def.skill.charge}</span>
            </div>
            <div className="text-xs">{def.skill.desc}</div>
            <div className="text-[11px] italic text-slate-400">発動時「{def.skill.line}」</div>
          </div>
          <div className="rounded-xl border border-sky-300/30 bg-sky-500/10 p-2 text-xs">
            <span className="font-bold text-sky-200">パッシブ（{def.passive.scope === 'owned' ? '所持で常時発動' : '編成中のみ発動'}）：</span>
            {def.passive.desc}
          </div>
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
          <div className="flex flex-wrap gap-2">
            <Btn onClick={() => useGame.getState().levelUp(id, 1)} disabled={maxed || s.honshitsu < cost1}>
              Lv+1
              <div className="text-[10px] font-normal">✝{fmt(cost1)}</div>
            </Btn>
            <Btn onClick={() => useGame.getState().levelUp(id, 10)} disabled={maxed || s.honshitsu < cost1}>
              Lv+{Math.max(1, n10)}
              <div className="text-[10px] font-normal">最大✝{fmt(cost10)}</div>
            </Btn>
            <Btn variant="gold" onClick={() => useGame.getState().levelUp(id, 'max')} disabled={maxed || s.honshitsu < cost1}>
              MAX
              <div className="text-[10px] font-normal">買えるだけ</div>
            </Btn>
            <Btn variant={inParty ? 'danger' : 'green'} onClick={() => useGame.getState().toggleParty(id)}>
              {inParty ? '編成から外す' : '編成に入れる'}
            </Btn>
          </div>
          {maxed && <div className="text-xs text-amber-200">レベル上限！ 凸（重複召喚・同じ地形図）や転生強化で上限アップ</div>}
          <div className="flex flex-wrap gap-2">
            {(['gyuu', 'mapcopy'] as const).map((iid) => {
              const it = ITEM_MAP[iid];
              const cnt = s.items[iid] || 0;
              return (
                <Btn key={iid} small variant="ghost" disabled={cnt <= 0} onClick={() => useGame.getState().useItem(iid, id)}>
                  {it.emoji} {it.name}（{cnt}）：{iid === 'gyuu' ? 'Lv+3' : '凸+1'}
                </Btn>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
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
  const ownedCount = Object.keys(s.units).length;
  const list = UNITS.filter((u) => {
    if (filter === 'all') return true;
    if (filter === 'owned') return !!s.units[u.id];
    if ((RARITIES as string[]).includes(filter)) return u.rarity === filter;
    return u.type === filter;
  }).sort((a, b) => {
    const oa = s.units[a.id] ? 1 : 0;
    const ob = s.units[b.id] ? 1 : 0;
    if (oa !== ob) return ob - oa;
    return rarityRank(b.rarity) - rarityRank(a.rarity);
  });

  return (
    <div className="space-y-3">
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
            const def = pid ? UNIT_MAP[pid] : null;
            const u = pid ? s.units[pid] : null;
            return (
              <button key={i} onClick={() => pid && setSel(pid)} className="flex flex-col items-center rounded-xl border border-white/10 bg-black/30 p-2 hover:bg-white/5">
                {def && u ? (
                  <>
                    <UnitIcon def={def} size={60} />
                    <div className="mt-1 w-full truncate text-center text-[11px] font-bold">{def.name}</div>
                    <div className="text-[10px] text-slate-400">Lv{u.level}</div>
                  </>
                ) : (
                  <>
                    <div className="flex h-[60px] w-[60px] items-center justify-center rounded-xl border-2 border-dashed border-white/20 text-2xl text-white/30">＋</div>
                    <div className="mt-1 text-[11px] text-slate-500">空き</div>
                  </>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-2 text-[11px] text-slate-400">冷笑タイプは敵に狙われやすい（タンク向き）。編成中のみ発動するパッシブもある。スキルは戦闘中にゲージが溜まると発動。</div>
      </Panel>

      <Panel title={`部員図鑑 ${ownedCount}/${UNITS.length}`}>
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
            return (
              <button key={def.id} onClick={() => setSel(def.id)} className={`relative flex flex-col items-center rounded-xl border p-2 transition hover:bg-white/5 ${inParty ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-white/10 bg-black/20'}`}>
                {inParty && <span className="absolute left-1 top-1 rounded bg-emerald-500 px-1 text-[9px] font-bold text-black">編成</span>}
                <UnitIcon def={def} size={60} dim={!u} />
                <div className="mt-1 w-full truncate text-center text-[11px] font-bold">{def.name}</div>
                {u ? (
                  <div className="flex items-center gap-1 text-[10px] text-slate-300">
                    Lv{u.level} <Stars n={u.star} />
                  </div>
                ) : (
                  <RarityBadge r={def.rarity} />
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-3 text-[11px] text-slate-400">
          部員は所持しているだけで毎秒✝本質✝を生み、レベル×レア度に応じて全生産を底上げする（現在の全体倍率 ×{fmt(d.globalMult)}）。会心率など詳細：部員の基礎会心 {pct(0.05)}。
        </div>
      </Panel>

      {sel && <UnitDetail id={sel} onClose={() => setSel(null)} />}
    </div>
  );
}
