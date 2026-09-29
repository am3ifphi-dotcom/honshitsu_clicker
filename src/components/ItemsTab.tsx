import { useState } from 'react';
import { useGame, shopPrice, lostBoxPrice } from '../game/store';
import { derive } from '../game/formulas';
import { ITEMS, ITEM_MAP, EQUIPS, SHOP } from '../game/data/items';
import { getUnitForm } from '../game/data/units';
import { EVOLUTION_FORMS, EVOLUTION_MATERIAL_SOURCES } from '../game/data/evolutions';
import { fmt } from '../game/format';
import { Btn, Chip, ItemIcon, Modal, Panel, RarityBadge } from './ui';

const SCENE_LABEL: Record<string, string> = { battle: '戦闘中に使用', field: '', unit: '部員画面で使用', gacha: '召喚画面で使用' };

export default function ItemsTab() {
  const s = useGame();
  const d = derive(s);
  const [sub, setSub] = useState<'inv' | 'shop' | 'box'>('inv');
  const [boxResult, setBoxResult] = useState<string | null>(null);
  const consumables = ITEMS.filter((i) => i.kind === 'consumable');
  const evolutionMaterials = ITEMS.filter((i) => i.kind === 'material');
  const equippedBy = (itemId: string) =>
    Object.entries(s.units)
      .filter(([, u]) => u.equip === itemId)
      .map(([id]) => getUnitForm(id, !!s.evolvedUnits?.[id])?.name)
      .filter(Boolean);
  const boxPrice = lostBoxPrice(d.perSecBase, s.lostBoxOpened);
  const boxItem = boxResult ? ITEM_MAP[boxResult] : null;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Chip active={sub === 'inv'} onClick={() => setSub('inv')}>
          🎒 持ち物
        </Chip>
        <Chip active={sub === 'shop'} onClick={() => setSub('shop')}>
          🏪 北棟の購買
        </Chip>
        <Chip active={sub === 'box'} onClick={() => setSub('box')}>
          📦 落とし物ボックス
        </Chip>
      </div>

      {sub === 'inv' && (
        <>
          <Panel title="消費アイテム">
            <div className="grid gap-2 sm:grid-cols-2">
              {consumables.map((it) => {
                const cnt = s.items[it.id] || 0;
                return (
                  <div key={it.id} className={`flex items-center gap-2 rounded-xl border border-white/10 p-2 ${cnt > 0 ? 'bg-white/5' : 'bg-black/30 opacity-50'}`}>
                    <ItemIcon item={it} size={42} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-sm font-bold">
                        <span className="truncate">{it.name}</span>
                        <span className="shrink-0 text-amber-200">×{cnt}</span>
                      </div>
                      <div className="text-[11px] text-emerald-300">{it.desc}</div>
                      <div className="truncate text-[10px] italic text-slate-500">{it.flavor}</div>
                    </div>
                    {it.scene === 'field' ? (
                      <Btn small disabled={cnt <= 0} onClick={() => useGame.getState().useItem(it.id)}>
                        使う
                      </Btn>
                    ) : (
                      <span className="w-16 shrink-0 text-center text-[10px] text-slate-400">{SCENE_LABEL[it.scene ?? 'field']}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>
          <Panel title="✦ EX進化素材">
            <p className="mb-2 text-[11px] text-slate-400">対象バトルの初回勝利で1個確定。再戦では基本18%でドロップし、ドロップ率ボーナスで上昇（最大80%）。進化には各3個必要です。</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {evolutionMaterials.map((it) => {
                const count = s.items[it.id] || 0;
                const form = Object.values(EVOLUTION_FORMS).find((entry) => entry.cost.materialId === it.id);
                const source = EVOLUTION_MATERIAL_SOURCES[it.id];
                return (
                  <div key={it.id} className={`flex items-center gap-2 rounded-xl border p-2 ${count > 0 ? 'border-cyan-300/30 bg-cyan-950/25' : 'border-white/10 bg-black/30 opacity-75'}`}>
                    <ItemIcon item={it} size={42} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-sm font-bold">
                        <span className="truncate">{it.name}</span>
                        <span className="shrink-0 text-cyan-200">×{count}/{form?.cost.materialCount ?? 3}</span>
                      </div>
                      <div className="text-[10px] leading-tight text-slate-300">入手先：{source?.label ?? '関連バトル'}</div>
                      <div className="truncate text-[10px] italic text-slate-500">{it.flavor}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
          <Panel title={`装備（${EQUIPS.filter((e) => (s.items[e.id] || 0) > 0 || equippedBy(e.id).length).length}/${EQUIPS.length}種）`}>
            <div className="grid gap-2 sm:grid-cols-2">
              {EQUIPS.map((it) => {
                const cnt = s.items[it.id] || 0;
                const by = equippedBy(it.id);
                const known = cnt > 0 || by.length > 0;
                return (
                  <div key={it.id} className={`flex items-center gap-2 rounded-xl border border-white/10 p-2 ${known ? 'bg-white/5' : 'bg-black/30 opacity-45'}`}>
                    <ItemIcon item={it} size={42} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <RarityBadge r={it.rarity} />
                        <span className="truncate text-sm font-bold">{known ? it.name : '？？？'}</span>
                      </div>
                      <div className="text-[11px] text-emerald-300">{known ? it.desc : '戦闘ドロップ・落とし物ボックスで入手'}</div>
                      {known && <div className="truncate text-[10px] italic text-slate-500">{it.flavor}</div>}
                      {by.length > 0 && <div className="truncate text-[10px] text-sky-300">装備中：{by.join('、')}</div>}
                    </div>
                    <span className="shrink-0 text-sm font-bold text-amber-200">×{cnt}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 text-[11px] text-slate-400">装備は部員タブ → 部員を選択 → 「装備」から。1人1つ。</div>
          </Panel>
        </>
      )}

      {sub === 'shop' && (
        <Panel title="🏪 北棟の購買" right={<span className="text-xs text-slate-400">価格は毎秒✝本質✝に連動（卒業でリセット）</span>}>
          <div className="mb-2 text-xs text-slate-400">焼きそばパンは今日も売り切れ。コーンスープは……ある。</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {SHOP.map((e) => {
              const it = ITEM_MAP[e.id];
              const price = shopPrice(e, d.perSecBase, s.shopBought[e.id] || 0);
              const can = s.honshitsu >= price;
              const name = it ? it.name : e.label ?? e.id;
              const emoji = it ? it.emoji : e.emoji ?? '📦';
              const desc = it ? it.desc : e.desc ?? '';
              return (
                <div key={e.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 text-2xl">{emoji}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{name}</div>
                    <div className="text-[11px] text-emerald-300">{desc}</div>
                    <div className="text-[10px] text-slate-400">所持：{e.id === 'cans5' ? `🥫${s.cans}` : s.items[e.id] || 0}</div>
                  </div>
                  <Btn small variant={can ? 'gold' : 'ghost'} disabled={!can} onClick={() => useGame.getState().buyShop(e.id)}>
                    ✝{fmt(price)}
                  </Btn>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {sub === 'box' && (
        <Panel title="📦 落とし物ボックス（職員室前）">
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="anim-bob text-7xl">📦</div>
            <p className="max-w-md text-sm text-slate-300">職員室前の落とし物ボックス。誰かが落とした装備がランダムで手に入る。持ち主は現れない。✝本質✝的に考えて、もうお前のものだ。</p>
            <div className="text-xs text-slate-400">排出：N 40% ／ R 35% ／ SR 18% ／ SSR 6% ／ UR 1%</div>
            <Btn
              variant="gold"
              disabled={s.honshitsu < boxPrice}
              onClick={() => {
                const id = useGame.getState().openLostBox();
                if (id) setBoxResult(id);
              }}
            >
              開ける（✝{fmt(boxPrice)}）
            </Btn>
            <div className="text-[11px] text-slate-500">今回の周回で {s.lostBoxOpened} 回開けた（開けるほど少し高くなる）</div>
          </div>
        </Panel>
      )}

      <Modal open={!!boxItem} onClose={() => setBoxResult(null)} title="落とし物を拾った！">
        {boxItem && (
          <div className="flex flex-col items-center gap-2 text-center">
            <ItemIcon item={boxItem} size={84} />
            <RarityBadge r={boxItem.rarity} />
            <div className="font-display text-lg">{boxItem.name}</div>
            <div className="text-sm text-emerald-300">{boxItem.desc}</div>
            <div className="text-xs italic text-slate-400">{boxItem.flavor}</div>
            <div className="mt-2 flex gap-2">
              <Btn variant="ghost" onClick={() => setBoxResult(null)}>
                OK
              </Btn>
              <Btn
                variant="gold"
                disabled={s.honshitsu < boxPrice}
                onClick={() => {
                  const id = useGame.getState().openLostBox();
                  if (id) setBoxResult(id);
                }}
              >
                もう一個（✝{fmt(boxPrice)}）
              </Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
