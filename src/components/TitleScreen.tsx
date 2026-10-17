import { useEffect, useState } from 'react';
import { Info, Volume2, VolumeX } from 'lucide-react';
import titleImg from '../assets/img/title.jpg';
import { getSettings, setSettings, unlockAudio } from '../utils/audio';
import { sfx } from '../utils/sfx';
import { preloadBgm, startBgm } from '../utils/bgm';

export default function TitleScreen({
  onStart,
  hasSave,
  onCredits,
}: {
  onStart: () => void;
  hasSave: boolean;
  onCredits: () => void;
}) {
  const [muted, setMuted] = useState(() => getSettings().muted);

  // タイトル表示中に BGM の音色だけ先にデコードしておく（自動再生はしない）
  useEffect(() => {
    void preloadBgm();
  }, []);

  const start = () => {
    // 自動再生ポリシー：ユーザー操作の中で AudioContext を起こす
    unlockAudio();
    sfx.preload();
    void startBgm();
    sfx.door();
    onStart();
  };

  const toggleMute = () => {
    unlockAudio();
    const next = setSettings({ muted: !muted });
    setMuted(next.muted);
    if (!next.muted) sfx.toggle();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-black">
      <img src={titleImg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-75" draggable={false} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/90" />
      <div className="relative flex max-w-2xl flex-col items-center px-6 text-center">
        <div className="anim-bob cross-glow font-display text-7xl text-purple-200">✝</div>
        <h1 className="mt-2 font-display text-2xl leading-snug text-white [text-shadow:0_4px_16px_rgba(0,0,0,.85)] sm:text-4xl">
          偏差値60の教室から
          <br />
          <span className="text-purple-300">✝本質✝</span>が漏れ出している件について
        </h1>
        <div className="mt-3 rounded-full bg-black/60 px-4 py-1 text-xs text-amber-200 sm:text-sm">～ ✝本質✝クリッカー ＆ 学校対抗・偏差値バトル ～</div>
        <ul className="mt-4 space-y-0.5 text-xs text-slate-200 sm:text-sm">
          <li>✝ クリックで✝本質✝を漏らせ</li>
          <li>🥫 コーンスープを捧げて部員を召喚・育成しろ</li>
          <li>🏫 学校同士で偏差値をぶつけ合え</li>
          <li>🎓 卒業（転生）しても、地面は忘れない</li>
        </ul>
        <p className="mt-3 text-xs text-slate-400">これが何を意味するかは、最後まで遊んでもわからない。</p>
        <button
          onClick={start}
          className="mt-6 rounded-2xl border-2 border-purple-200/60 bg-gradient-to-b from-purple-500 to-purple-800 px-10 py-3 font-display text-xl text-white shadow-2xl shadow-purple-700/60 transition hover:scale-105 active:scale-95"
        >
          {hasSave ? '続きから（✝）' : '✝本質✝に触れる'}
        </button>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-xs text-slate-200 hover:bg-black/80"
            aria-label={muted ? '音をオンにする' : 'ミュートする'}
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            {muted ? 'ミュート中' : '音あり'}
          </button>
          <button
            onClick={() => {
              unlockAudio();
              sfx.ui();
              onCredits();
            }}
            className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-xs text-slate-200 hover:bg-black/80"
          >
            <Info size={14} />
            使用素材
          </button>
        </div>

        <p className="mt-4 text-[10px] text-slate-500">※この作品に登場する✝本質✝は実在しません（あるかもしれません）</p>
      </div>
    </div>
  );
}
