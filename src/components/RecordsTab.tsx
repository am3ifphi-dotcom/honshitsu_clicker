import { useState } from 'react';
import { useGame, getSnapInfo } from '../game/store';
import { ACHIEVEMENTS } from '../game/data/achievements';
import { UNITS } from '../game/data/units';
import { fmt, fmtInt } from '../game/format';
import { Btn, Modal, Panel } from './ui';

export default function RecordsTab() {
  const s = useGame();
  const [code, setCode] = useState('');
  const [importText, setImportText] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const done = ACHIEVEMENTS.filter((a) => s.achievements[a.id]).length;

  const stats: [string, string][] = [
    ['累計クリック（倉石調べ）', fmtInt(s.allClicks) + '回'],
    ['累計の✝本質✝', fmt(s.allTimeEarned)],
    ['最高総合偏差値', s.bestDev.toFixed(1)],
    ['卒業（転生）回数', s.rebirths + '回'],
    ['累計の地面の記憶', fmt(s.totalMemories)],
    ['累計召喚', s.pulls + '回'],
    ['部員図鑑', `${Object.keys(s.units).length}/${UNITS.length}`],
    ['戦闘', `${s.battlesWon}勝 ${s.battlesLost}敗`],
    ['黄金✝クリック', s.goldenClicks + '回'],
    ['アイテム使用', s.itemsUsed + '回'],
    ['全国模試 最高到達', `第${s.endless}回`],
    ['三重の「は？」', '四百二十回（推定・統計補正済）'],
  ];

  return (
    <div className="space-y-3">
      <Panel title="📜 ✝本質✝年鑑（倉石暁 編）">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {stats.map(([k, v]) => (
            <div key={k} className="rounded-lg bg-white/5 px-3 py-2">
              <div className="text-[10px] text-slate-400">{k}</div>
              <div className="font-bold text-purple-100">{v}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title={`🏆 実績 ${done}/${ACHIEVEMENTS.length}`}>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((a) => {
            const got = !!s.achievements[a.id];
            return (
              <div key={a.id} className={`flex items-center gap-2 rounded-xl border p-2 ${got ? 'border-amber-300/40 bg-amber-500/10' : 'border-white/10 bg-black/30'}`}>
                <div className="text-2xl">{got ? '🏆' : '🔒'}</div>
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-sm font-bold ${got ? 'text-amber-100' : 'text-slate-400'}`}>{a.name}</div>
                  <div className="text-[11px] text-slate-400">{a.desc}</div>
                </div>
                <div className="shrink-0 text-xs text-amber-200">🥫{a.reward}</div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="⚙ セーブデータ">
        <div className="flex flex-wrap gap-2">
          <Btn
            small
            onClick={() => {
              useGame.getState().save();
              useGame.getState().toast('セーブした（10秒ごとに自動セーブもしている）', 'good');
            }}
          >
            今すぐセーブ
          </Btn>
          <Btn small variant="ghost" onClick={() => setCode(useGame.getState().exportSave())}>
            エクスポート
          </Btn>
          <Btn small variant="danger" onClick={() => setConfirmReset(true)}>
            データを全部消す
          </Btn>
        </div>
        {code && <textarea readOnly value={code} onFocus={(e) => e.currentTarget.select()} className="mt-2 h-20 w-full rounded-lg bg-black/40 p-2 font-mono text-[10px] text-slate-300" />}
        <div className="mt-3 flex gap-2">
          <input value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="エクスポートしたコードを貼り付け" className="min-w-0 flex-1 rounded-lg bg-black/40 px-2 py-1.5 text-xs text-white outline-none focus:ring-2 focus:ring-purple-400" />
          <Btn
            small
            variant="ghost"
            onClick={() => {
              const ok = useGame.getState().importSave(importText);
              useGame.getState().toast(ok ? 'インポートした' : 'コードが正しくない（✝本質✝が足りない）', ok ? 'good' : 'bad');
              if (ok) setImportText('');
            }}
          >
            インポート
          </Btn>
        </div>
        {(() => {
          const snap = getSnapInfo();
          return (
            <div className="mt-3 rounded-lg bg-black/30 p-2 text-xs text-slate-300">
              <div className="font-bold">🛟 最高記録の転生直前データから復元</div>
              {snap ? (
                <>
                  <div className="mt-1 text-[11px] text-slate-400">
                    {new Date(snap.at).toLocaleString()}（{snap.kind}直前）／累計 {fmt(snap.allTimeEarned)} ✝／転生 {snap.rebirths}回・ウルトラ {snap.ultraRebirths}回
                  </div>
                  <Btn
                    small
                    variant="ghost"
                    onClick={() => {
                      if (!confirm('現在の進行度を、最高記録の転生直前データで置き換えますか？')) return;
                      const ok = useGame.getState().restoreSnapshot();
                      useGame.getState().toast(ok ? '転生直前の最高記録から復元した' : '復元に失敗した', ok ? 'good' : 'bad');
                    }}
                  >
                    復元する
                  </Btn>
                </>
              ) : (
                <div className="mt-1 text-[11px] text-slate-400">まだ記録なし（次に転生した時から自動で保存される）</div>
              )}
            </div>
          );
        })()}
        <p className="mt-3 text-[11px] text-slate-500">
          原作：『偏差値60の教室から✝本質✝が漏れ出している件について』をモチーフにしたファンメイドのゲームです。✝本質✝が何を意味するかは、最後まで遊んでもわかりません。
        </p>
      </Panel>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="本当に全部消しますか？">
        <p className="text-sm text-slate-300">全ての進行度・部員・実績が消える。地面も今回ばかりは忘れる。</p>
        <p className="mt-1 text-xs italic text-slate-400">三重「は？ 本気か」</p>
        <div className="mt-4 flex justify-end gap-2">
          <Btn variant="ghost" onClick={() => setConfirmReset(false)}>
            やめる
          </Btn>
          <Btn
            variant="danger"
            onClick={() => {
              useGame.getState().hardReset();
              setConfirmReset(false);
            }}
          >
            消す
          </Btn>
        </div>
      </Modal>
    </div>
  );
}
