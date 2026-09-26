import { useState } from 'react';
import { useGame } from '../game/store';
import { spTotal, spSpent } from '../game/formulas';
import { BRANCHES, SKILL_NODES, NODE_MAP } from '../game/data/skills';
import type { BranchId, SkillNode } from '../game/types';
import { Btn, Modal, Panel } from './ui';

const BUILD_NAMES: Record<BranchId, string> = {
  honshitsu: '両馬型（指が✝本質✝）',
  reisho: '三重型（鉄壁の「は？」）',
  omoshiro: '零型（面白いを放置する王）',
  chikei: 'ヘイカツ型（地形図の向こう側）',
  renai: '櫻型（理論崩壊ガチャ狂）',
};

export default function SkillTab() {
  const s = useGame();
  const [branch, setBranch] = useState<BranchId>('honshitsu');
  const [confirmReset, setConfirmReset] = useState(false);
  const total = spTotal(s);
  const spent = spSpent(s);
  const avail = total - spent;
  const br = BRANCHES.find((b) => b.id === branch) ?? BRANCHES[0];
  const nodes = SKILL_NODES.filter((n) => n.branch === branch);
  const tiers = [0, 1, 2, 3].map((t) => nodes.filter((n) => n.tier === t));
  const branchPts = (id: BranchId) => SKILL_NODES.filter((n) => n.branch === id).reduce((a, n) => a + (s.skills[n.id] || 0) * n.cost, 0);
  const pts = BRANCHES.map((b) => ({ id: b.id, p: branchPts(b.id) })).sort((a, b) => b.p - a.p);
  const buildName = pts[0].p === 0 ? '無所属（まだ何者でもない）' : pts[1].p > 0 && pts[1].p >= pts[0].p * 0.8 ? '✝本質✝的バランス型（器用貧乏）' : BUILD_NAMES[pts[0].id];

  const nodeCard = (node: SkillNode) => {
    const r = s.skills[node.id] || 0;
    const unlocked = node.req.every((q) => (s.skills[q] || 0) > 0);
    const maxed = r >= node.max;
    const can = unlocked && !maxed && avail >= node.cost;
    return (
      <button
        key={node.id}
        onClick={() => useGame.getState().allocSkill(node.id)}
        disabled={!can}
        className={`tap-none w-full max-w-[260px] rounded-xl border-2 p-2 text-left transition active:scale-[0.98] ${
          maxed ? 'border-amber-300/80 bg-amber-500/15' : can ? 'bg-white/10 hover:bg-white/15' : unlocked ? 'border-white/15 bg-black/30' : 'border-white/10 bg-black/40 opacity-60'
        } ${node.capstone ? 'shadow-lg shadow-purple-900/60' : ''}`}
        style={can && !maxed ? { borderColor: br.color } : undefined}
      >
        <div className="flex items-start justify-between gap-1">
          <span className="text-sm font-bold leading-tight">
            {node.capstone ? '👑 ' : ''}
            {node.name}
          </span>
          <span className={`shrink-0 text-xs font-bold ${maxed ? 'text-amber-300' : 'text-slate-300'}`}>
            {r}/{node.max}
          </span>
        </div>
        <div className="mt-0.5 text-[11px] leading-snug text-slate-300">{node.desc}</div>
        <div className="mt-1 h-1.5 overflow-hidden rounded bg-black/40">
          <div className="h-full" style={{ width: `${(r / node.max) * 100}%`, background: br.color }} />
        </div>
        <div className="mt-1 flex justify-between text-[10px]">
          {!unlocked ? <span className="text-rose-300">🔒 前提：{node.req.map((q) => NODE_MAP[q]?.name).join('・')}</span> : <span className="text-slate-500">{maxed ? '習得完了' : 'タップで習得'}</span>}
          <span className="text-slate-400">SP{node.cost}</span>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <Panel
        title="本質スキルツリー"
        right={
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-rose-500/20 px-2 py-1 text-sm">
              SP <b className="font-display text-lg text-rose-200">{avail}</b>
              <span className="text-xs text-slate-400"> / {total}</span>
            </span>
            <Btn small variant="ghost" onClick={() => setConfirmReset(true)} disabled={spent === 0}>
              記憶喪失（リセット）
            </Btn>
          </div>
        }
      >
        <div className="grid gap-2 text-xs sm:grid-cols-3">
          <div className="rounded-lg bg-white/5 p-2">
            現在のビルド：<b className="text-amber-200">{buildName}</b>
          </div>
          <div className="rounded-lg bg-white/5 p-2 text-slate-300">
            SPの内訳：学年Lv由来 {s.level - 1} ＋ ストーリー・アイテム {s.bonusSP}
          </div>
          <div className="rounded-lg bg-white/5 p-2 text-slate-300">リセットは無料。何度でも組み直せる。卒業（転生）すると学年Lv由来のSPは消える。</div>
        </div>
      </Panel>

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {BRANCHES.map((b) => (
          <button
            key={b.id}
            onClick={() => setBranch(b.id)}
            className={`tap-none shrink-0 rounded-xl border-2 px-3 py-2 text-left transition ${branch === b.id ? 'bg-white/10' : 'border-white/10 bg-black/20 hover:bg-white/5'}`}
            style={branch === b.id ? { borderColor: b.color } : undefined}
          >
            <div className="text-sm font-bold">
              {b.emoji} {b.name}
            </div>
            <div className="text-[10px] text-slate-400">投資 {branchPts(b.id)} SP</div>
          </button>
        ))}
      </div>

      <Panel>
        <div className="mb-3 text-center text-xs text-slate-300">{br.desc}</div>
        <div className="flex flex-col items-center gap-2">
          {tiers.map((row, i) => (
            <div key={i} className="flex w-full flex-col items-center gap-2">
              {i > 0 && <div className="text-lg leading-none" style={{ color: br.color }}>▼</div>}
              <div className="grid w-full justify-items-center gap-2" style={{ gridTemplateColumns: `repeat(${Math.max(1, row.length)}, minmax(0, 1fr))` }}>
                {row.map((n) => nodeCard(n))}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="記憶喪失しますか？">
        <p className="text-sm text-slate-300">振り分けたスキルポイントが全て戻ります（無料）。</p>
        <p className="mt-1 text-xs text-slate-400">三重「何も覚えてないのか」／両馬「忘れても地面は忘れない」</p>
        <div className="mt-4 flex justify-end gap-2">
          <Btn variant="ghost" onClick={() => setConfirmReset(false)}>
            やめる
          </Btn>
          <Btn
            variant="danger"
            onClick={() => {
              useGame.getState().resetSkills();
              setConfirmReset(false);
            }}
          >
            記憶喪失する
          </Btn>
        </div>
      </Modal>
    </div>
  );
}
