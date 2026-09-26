import type { RewardSummary } from '../game/types';
import { ITEM_MAP } from '../game/data/items';
import { UNIT_MAP } from '../game/data/units';
import { fmt } from '../game/format';
import { Btn, ItemIcon, Modal, UnitIcon } from './ui';

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1.5">
      <span className="w-6 text-center text-lg">{icon}</span>
      <span className="text-slate-300">{label}</span>
      <span className="ml-auto font-bold text-amber-200">{value}</span>
    </div>
  );
}

export default function RewardModal({ rw, title, onClose }: { rw: RewardSummary | null; title: string; onClose: () => void }) {
  if (!rw) return null;
  const unit = rw.unit ? UNIT_MAP[rw.unit] : undefined;
  return (
    <Modal open onClose={onClose} title={title}>
      {rw.first && <div className="mb-2 rounded-lg bg-amber-500/20 px-2 py-1 text-center text-xs font-bold text-amber-200">🎉 初回クリア報酬！</div>}
      <div className="space-y-1.5 text-sm">
        <Row icon="✝" label="✝本質✝" value={'+' + fmt(rw.honshitsu)} />
        {rw.cans > 0 && <Row icon="🥫" label="コーンスープ缶" value={'+' + rw.cans} />}
        <Row icon="🎓" label="学年XP" value={'+' + rw.xp} />
        {rw.sp > 0 && <Row icon="📘" label="スキルポイント（永続）" value={'+' + rw.sp} />}
        {Object.entries(rw.items).map(([id, n]) => {
          const it = ITEM_MAP[id];
          if (!it) return null;
          return (
            <div key={id} className="flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1.5">
              <ItemIcon item={it} size={28} />
              <div className="min-w-0">
                <div className="truncate">{it.name}</div>
                <div className="truncate text-[10px] text-emerald-300">{it.desc}</div>
              </div>
              <span className="ml-auto font-bold text-amber-200">×{n}</span>
            </div>
          );
        })}
      </div>
      {unit && (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-amber-300/40 bg-amber-500/10 p-2">
          <UnitIcon def={unit} size={60} />
          <div className="min-w-0">
            <div className="text-xs font-bold text-amber-200">{rw.unitResult === 'new' ? '仲間になった！' : rw.unitResult === 'star' ? '凸+1！（重複）' : 'コーンスープに還元'}</div>
            <div className="font-bold">{unit.name}</div>
            <div className="text-[11px] italic text-slate-300">「{unit.quote}」</div>
          </div>
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <Btn onClick={onClose}>OK</Btn>
      </div>
    </Modal>
  );
}
