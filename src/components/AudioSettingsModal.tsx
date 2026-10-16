import { useEffect, useState } from 'react';
import { Info, Music4, Volume1, Volume2, VolumeX } from 'lucide-react';
import { Modal } from './ui';
import { DEFAULT_SETTINGS, audioStats, getSettings, onSettingsChange, setSettings, unlockAudio, type AudioSettings } from '../utils/audio';
import { isPlaying, startBgm, stopBgm } from '../utils/bgm';
import { sfx } from '../utils/sfx';

function Slider({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  icon: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-300">
        <span className="text-purple-300">{icon}</span>
        {label}
        <span className="ml-auto tabular-nums text-slate-400">{Math.round(value * 100)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-purple-400"
      />
    </label>
  );
}

export default function AudioSettingsModal({ open, onClose, onCredits }: { open: boolean; onClose: () => void; onCredits: () => void }) {
  const [s, setS] = useState<AudioSettings>(() => getSettings());

  useEffect(() => onSettingsChange(setS), []);

  const patch = (p: Partial<AudioSettings>, quiet = false) => {
    unlockAudio();
    setS(setSettings(p));
    if (!quiet) sfx.toggle();
  };

  const stats = audioStats();

  return (
    <Modal open={open} onClose={onClose} title="音の設定">
      <div className="space-y-3">
        <button
          onClick={() => patch({ muted: !s.muted })}
          className={`flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
            s.muted ? 'border-rose-400/60 bg-rose-600/30 text-rose-100' : 'border-emerald-300/50 bg-emerald-600/30 text-emerald-100'
          }`}
        >
          {s.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          {s.muted ? 'ミュート中（タップで解除）' : '音を出す'}
        </button>

        <Slider label="全体" value={s.master} icon={<Volume1 size={14} />} onChange={(v) => patch({ master: v }, true)} />
        <Slider label="効果音（SE）" value={s.sfx} icon={<Volume2 size={14} />} onChange={(v) => patch({ sfx: v }, true)} />
        <Slider label="BGM" value={s.bgm} icon={<Music4 size={14} />} onChange={(v) => patch({ bgm: v }, true)} />

        <div className="flex gap-2">
          <button
            onClick={() => {
              const next = !s.bgmEnabled;
              patch({ bgmEnabled: next }, true);
              if (next) void startBgm();
              else stopBgm();
              sfx.toggle();
            }}
            className={`flex-1 rounded-xl border px-3 py-2 text-xs font-bold ${
              s.bgmEnabled ? 'border-purple-300/50 bg-purple-600/40 text-purple-100' : 'border-white/15 bg-white/5 text-slate-300'
            }`}
          >
            BGM {s.bgmEnabled ? 'ON' : 'OFF'}
          </button>
          <button onClick={() => setS(setSettings({ ...DEFAULT_SETTINGS }))} className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10">
            既定に戻す
          </button>
        </div>

        <button
          onClick={() => {
            unlockAudio();
            sfx.confirm();
          }}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10"
        >
          ▶ テスト音（効果音を確認する）
        </button>

        <div className="rounded-lg bg-black/30 p-2 text-[10px] leading-relaxed text-slate-400">
          音声素材は Kenney（CC0）と FluidR3 GM soundfont（CC BY 3.0）を使用。BGM は自作シーケンス。
          <br />
          読み込み: {stats.decoded}/{stats.total} デコード済み ／ 失敗 {stats.failed.length} 件 ／ BGM {isPlaying() ? '再生中' : '停止中'}
          {stats.failed.length > 0 && <span className="text-rose-300">（未取得: {stats.failed.slice(0, 4).join(', ')}{stats.failed.length > 4 ? ' …' : ''}）</span>}
        </div>

        <button onClick={onCredits} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-sky-300/40 bg-sky-600/25 px-3 py-2 text-xs font-bold text-sky-100 hover:bg-sky-600/40">
          <Info size={14} />
          使用素材・クレジットを見る
        </button>
      </div>
    </Modal>
  );
}
