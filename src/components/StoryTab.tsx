import { useState } from 'react';
import { useGame } from '../game/store';
import { derive, judge } from '../game/formulas';
import { CHAPTERS } from '../game/data/story';
import { getUnitForm } from '../game/data/units';
import { ITEM_MAP } from '../game/data/items';
import { EVOLUTION_BATTLE_DROPS } from '../game/data/evolutions';
import type { Chapter, RewardSummary } from '../game/types';
import Dialogue from './Dialogue';
import Battle from './Battle';
import RewardModal from './RewardModal';
import { Btn, Modal, Panel, UnitIcon } from './ui';

type Phase =
  | { k: 'list' }
  | { k: 'intro'; ch: Chapter }
  | { k: 'battle'; ch: Chapter }
  | { k: 'outro'; ch: Chapter; rw: RewardSummary }
  | { k: 'reward'; ch: Chapter; rw: RewardSummary }
  | { k: 'lose'; ch: Chapter };

export function LoseModal({ rec, onClose, onRetry }: { rec: number; onClose: () => void; onRetry: () => void }) {
  const d = derive(useGame.getState());
  const j = judge(d.battleDev, rec);
  return (
    <Modal open onClose={onClose} title="敗北…（チャイムが鳴った）">
      <p className="text-sm text-slate-300">
        推奨偏差値 <b>{rec}</b> に対して、あなたの戦闘偏差値は <b>{d.battleDev.toFixed(1)}</b>（<span style={{ color: j.color }}>{j.grade}判定</span>）。
      </p>
      <ul className="mt-3 space-y-1 text-xs text-slate-300">
        <li>👥 部員タブで<b>レベルアップ</b>（1レベルごとに戦闘偏差値が上がる）</li>
        <li>🥫 召喚で仲間を増やす・重複で<b>凸</b>して強化</li>
        <li>🌳 スキルツリーの<b>地形図ルート</b>（火力）・<b>冷笑ルート</b>（耐久）</li>
        <li>🎒 装備をつける／戦闘中にアイテムを使う</li>
        <li>👆 戦闘中は敵を<b>連打</b>！ タップでもダメージ＆スキルゲージが溜まる</li>
        <li>🎓 詰まったら<b>卒業（転生）</b>で永続強化</li>
      </ul>
      <p className="mt-2 text-xs italic text-slate-400">三重「偏差値が足りなかっただけだろ」／両馬「負けも✝本質✝」</p>
      <div className="mt-4 flex justify-end gap-2">
        <Btn variant="ghost" onClick={onClose}>
          戻る
        </Btn>
        <Btn onClick={onRetry}>再挑戦</Btn>
      </div>
    </Modal>
  );
}

export default function StoryTab() {
  const s = useGame();
  const d = derive(s);
  const [phase, setPhase] = useState<Phase>({ k: 'list' });
  const [battleKey, setBattleKey] = useState(0);
  const hasParty = s.party.some(Boolean);
  const cleared = CHAPTERS.filter((c) => s.story[c.id]).length;

  const start = (ch: Chapter, skipIntro: boolean) => {
    if (!hasParty) {
      useGame.getState().toast('部員を編成してください（部員タブ）', 'bad');
      return;
    }
    setBattleKey((k) => k + 1);
    setPhase(skipIntro ? { k: 'battle', ch } : { k: 'intro', ch });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnd = (ch: Chapter, win: boolean) => {
    if (win) {
      const rw = useGame.getState().winBattle({ kind: 'story', id: ch.id, rec: ch.rec, reward: ch.reward });
      setPhase(rw.first && ch.outro.length ? { k: 'outro', ch, rw } : { k: 'reward', ch, rw });
    } else {
      useGame.getState().loseBattle();
      setPhase({ k: 'lose', ch });
    }
  };

  if (phase.k === 'intro') {
    return <Dialogue key={phase.ch.id + 'i'} title={`${phase.ch.no}　${phase.ch.title}`} lines={phase.ch.intro} onDone={() => setPhase({ k: 'battle', ch: phase.ch })} doneLabel="戦闘開始！" />;
  }
  if (phase.k === 'battle') {
    const ch = phase.ch;
    return <Battle key={battleKey} title={`${ch.no}　${ch.title}`} rec={ch.rec} enemies={ch.enemies} onEnd={(win) => handleEnd(ch, win)} onRetreat={() => setPhase({ k: 'list' })} />;
  }
  if (phase.k === 'outro') {
    const { ch, rw } = phase;
    return <Dialogue key={ch.id + 'o'} title={`${ch.no}　${ch.title}（その後）`} lines={ch.outro} onDone={() => setPhase({ k: 'reward', ch, rw })} doneLabel="報酬を受け取る" />;
  }

  const arcs = Array.from(new Set(CHAPTERS.map((c) => c.arc)));

  return (
    <div className="space-y-3">
      <Panel title="ストーリーモード" right={<span className="text-xs text-slate-300">進行度 {cleared}/{CHAPTERS.length} 章</span>}>
        <p className="text-xs text-slate-300">
          原作『偏差値60の教室から✝本質✝が漏れ出している件について』をなぞる物語。各章の最後は戦闘。初回クリアで<b className="text-amber-200">コーンスープ缶・仲間・装備・スキルポイント+1</b>。判定は模試と同じA〜E。
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/40">
          <div className="h-full bg-gradient-to-r from-purple-500 to-amber-400" style={{ width: `${(cleared / CHAPTERS.length) * 100}%` }} />
        </div>
      </Panel>
      {arcs.map((arc) => (
        <Panel key={arc} title={arc}>
          <div className="grid gap-2 md:grid-cols-2">
            {CHAPTERS.filter((c) => c.arc === arc).map((ch) => {
              const idx = CHAPTERS.indexOf(ch);
              const unlocked = idx === 0 || !!s.story[CHAPTERS[idx - 1].id];
              const done = !!s.story[ch.id];
              const j = judge(d.battleDev, ch.rec);
              const unit = ch.reward.unit ? getUnitForm(ch.reward.unit, !!s.evolvedUnits?.[ch.reward.unit]) : undefined;
              const evoDrop = EVOLUTION_BATTLE_DROPS[ch.id] ? ITEM_MAP[EVOLUTION_BATTLE_DROPS[ch.id]] : undefined;
              return (
                <div
                  key={ch.id}
                  className={`relative rounded-xl border p-3 ${done ? 'border-amber-300/40 bg-amber-500/5' : unlocked ? 'border-purple-400/50 bg-purple-500/10' : 'border-white/10 bg-black/30 opacity-55'}`}
                >
                  {done && <div className="absolute right-2 top-2 rotate-12 rounded border-2 border-amber-300 px-1 font-display text-xs text-amber-300">✝済</div>}
                  <div className="flex items-start gap-3">
                    {unit && unlocked ? <UnitIcon def={unit} size={44} dim={!done} /> : <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xl">📖</div>}
                    <div className="min-w-0 flex-1 pr-8">
                      <div className="font-display text-[11px] text-purple-300">{ch.no}</div>
                      <div className="text-sm font-bold leading-tight">{unlocked ? ch.title : '？？？（前の章をクリア）'}</div>
                      <div className="mt-1 text-[11px] text-slate-400">
                        推奨偏差値 <b className="text-slate-200">{ch.rec}</b> ・{' '}
                        <b style={{ color: j.color }}>{j.grade}判定</b> <span className="text-slate-500">{j.note}</span>
                      </div>
                      {unlocked && !done && (
                        <div className="mt-0.5 text-[11px] text-amber-200/90">
                          初回：🥫{ch.reward.cans ?? 0}
                          {unit && ` ・${unit.name}加入`}
                          {ch.reward.items &&
                            Object.entries(ch.reward.items).map(([id, n]) => ` ・${ITEM_MAP[id]?.emoji ?? ''}${ITEM_MAP[id]?.name ?? id}×${n}`)}
                          {evoDrop && ` ・✦${evoDrop.name}×1（進化素材・確定）`}
                          {' ・SP+1'}
                        </div>
                      )}
                      {unlocked && evoDrop && (
                        <div className="mt-1.5 inline-flex flex-wrap items-center gap-1 rounded-lg border border-cyan-300/40 bg-cyan-500/15 px-2 py-1 text-[10px] font-bold text-cyan-100">
                          ✦ 進化素材ドロップ：{evoDrop.emoji} {evoDrop.name}
                          <span className="font-normal text-cyan-200/80">（初回勝利で1個確定・再戦で18%〜ドロップ）</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {unlocked && (
                    <div className="mt-2 flex justify-end gap-2">
                      {done && (
                        <Btn small variant="ghost" onClick={() => start(ch, true)}>
                          戦闘だけ（周回）
                        </Btn>
                      )}
                      <Btn small variant={done ? 'ghost' : 'primary'} onClick={() => start(ch, false)}>
                        {done ? 'もう一度読む' : 'ストーリー開始'}
                      </Btn>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>
      ))}
      {phase.k === 'reward' && <RewardModal rw={phase.rw} title={`${phase.ch.no} クリア！`} onClose={() => setPhase({ k: 'list' })} />}
      {phase.k === 'lose' && <LoseModal rec={phase.ch.rec} onClose={() => setPhase({ k: 'list' })} onRetry={() => start(phase.ch, true)} />}
    </div>
  );
}
