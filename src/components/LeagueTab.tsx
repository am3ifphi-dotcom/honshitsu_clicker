import { useState } from 'react';
import { useGame } from '../game/store';
import type { BattleCtx } from '../game/store';
import { derive, judge } from '../game/formulas';
import { SCHOOLS, endlessEnemies, endlessRec } from '../game/data/league';
import { ITEM_MAP } from '../game/data/items';
import type { EnemyDef, RewardSummary } from '../game/types';
import Battle from './Battle';
import RewardModal from './RewardModal';
import { LoseModal } from './StoryTab';
import { Btn, Panel } from './ui';

type LPhase =
  | { k: 'list' }
  | { k: 'battle'; title: string; rec: number; enemies: EnemyDef[]; ctx: BattleCtx }
  | { k: 'reward'; rw: RewardSummary; title: string }
  | { k: 'lose'; again: { title: string; rec: number; enemies: EnemyDef[]; ctx: BattleCtx } };

export default function LeagueTab() {
  const s = useGame();
  const d = derive(s);
  const [phase, setPhase] = useState<LPhase>({ k: 'list' });
  const [key, setKey] = useState(0);
  const allCleared = !!s.league['s12'];
  const beaten = SCHOOLS.filter((x) => s.league[x.id]).length;

  const start = (title: string, rec: number, enemies: EnemyDef[], ctx: BattleCtx) => {
    if (!s.party.some(Boolean)) {
      useGame.getState().toast('部員を編成してください（部員タブ）', 'bad');
      return;
    }
    setKey((k) => k + 1);
    setPhase({ k: 'battle', title, rec, enemies, ctx });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (phase.k === 'battle') {
    const p = phase;
    return (
      <Battle
        key={key}
        title={p.title}
        rec={p.rec}
        enemies={p.enemies}
        onRetreat={() => setPhase({ k: 'list' })}
        onEnd={(win) => {
          if (win) {
            const rw = useGame.getState().winBattle(p.ctx);
            setPhase({ k: 'reward', rw, title: `${p.title} に勝利！` });
          } else {
            useGame.getState().loseBattle();
            setPhase({ k: 'lose', again: { title: p.title, rec: p.rec, enemies: p.enemies, ctx: p.ctx } });
          }
        }}
      />
    );
  }

  const nextEndless = s.endless + 1;

  return (
    <div className="space-y-3">
      <Panel title="学校対抗・偏差値リーグ" right={<span className="text-xs text-slate-300">論破した学校 {beaten}/{SCHOOLS.length}</span>}>
        <p className="text-xs text-slate-300">
          近隣の学校と✝本質✝をぶつけ合う。勝てば<b className="text-amber-200">コーンスープ缶・装備</b>。一度勝った学校には何度でも再戦できる（報酬は控えめ）。最大の宿敵は<b className="text-sky-300">桐葉高校 南棟（内進）</b>。
        </p>
      </Panel>
      <div className="grid gap-2 md:grid-cols-2">
        {SCHOOLS.map((sc, idx) => {
          const unlocked = idx === 0 || !!s.league[SCHOOLS[idx - 1].id];
          const done = !!s.league[sc.id];
          const j = judge(d.battleDev, sc.dev);
          return (
            <div key={sc.id} className={`relative overflow-hidden rounded-xl border p-3 ${unlocked ? 'border-white/15 bg-white/5' : 'border-white/10 bg-black/30 opacity-55'}`}>
              <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: sc.color }} />
              {done && <div className="absolute right-2 top-2 rotate-12 rounded border-2 border-emerald-300 px-1 font-display text-xs text-emerald-300">論破済</div>}
              <div className="flex items-start gap-3 pl-1">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 text-2xl" style={{ borderColor: sc.color, background: `${sc.color}33` }}>
                  {sc.emoji}
                </div>
                <div className="min-w-0 flex-1 pr-10">
                  <div className="text-sm font-bold leading-tight">{unlocked ? sc.name : '？？？（前の学校に勝利）'}</div>
                  <div className="text-[11px] italic text-slate-400">{unlocked ? `「${sc.motto}」` : ''}</div>
                  <div className="mt-1 text-[11px] text-slate-300">
                    学校偏差値 <b className="font-display text-base text-white">{sc.dev}</b> ・ <b style={{ color: j.color }}>{j.grade}判定</b>
                  </div>
                  {unlocked && !done && (
                    <div className="text-[11px] text-amber-200/90">
                      初回：🥫{sc.reward.cans ?? 0}
                      {sc.reward.items && Object.entries(sc.reward.items).map(([id, n]) => ` ・${ITEM_MAP[id]?.emoji ?? ''}${ITEM_MAP[id]?.name ?? id}×${n}`)}
                    </div>
                  )}
                </div>
              </div>
              {unlocked && (
                <div className="mt-2 flex justify-end">
                  <Btn small variant={done ? 'ghost' : 'primary'} onClick={() => start(`VS ${sc.name}`, sc.dev, sc.enemies, { kind: 'league', id: sc.id, rec: sc.dev, reward: sc.reward })}>
                    {done ? '再戦する' : '挑戦する'}
                  </Btn>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Panel title="🏯 全国✝本質✝模試（エンドレス）">
        {allCleared ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm">
              <div>
                次回：<b>第{nextEndless}回</b> ・推奨偏差値 <b className="font-display text-lg">{endlessRec(nextEndless)}</b> ・{' '}
                <b style={{ color: judge(d.battleDev, endlessRec(nextEndless)).color }}>{judge(d.battleDev, endlessRec(nextEndless)).grade}判定</b>
              </div>
              <div className="text-xs text-slate-400">最高到達：第{s.endless}回 ／ 回を重ねるごとに偏差値の壁が上がる。転生で強くなって挑め。</div>
            </div>
            <div className="flex gap-2">
              {s.endless > 0 && (
                <Btn small variant="ghost" onClick={() => start(`全国✝本質✝模試 第${s.endless}回`, endlessRec(s.endless), endlessEnemies(s.endless), { kind: 'endless', id: 'endless', rec: endlessRec(s.endless), level: s.endless })}>
                  第{s.endless}回を再受験
                </Btn>
              )}
              <Btn variant="gold" onClick={() => start(`全国✝本質✝模試 第${nextEndless}回`, endlessRec(nextEndless), endlessEnemies(nextEndless), { kind: 'endless', id: 'endless', rec: endlessRec(nextEndless), level: nextEndless })}>
                受験する
              </Btn>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-400">対抗戦の全12校を論破すると解放される。（「偏差値の彼方」の、さらに向こう側）</div>
        )}
      </Panel>

      {phase.k === 'reward' && <RewardModal rw={phase.rw} title={phase.title} onClose={() => setPhase({ k: 'list' })} />}
      {phase.k === 'lose' && (
        <LoseModal rec={phase.again.rec} onClose={() => setPhase({ k: 'list' })} onRetry={() => start(phase.again.title, phase.again.rec, phase.again.enemies, phase.again.ctx)} />
      )}
    </div>
  );
}
