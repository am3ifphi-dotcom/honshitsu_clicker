import { useGame } from '../game/store';
import { Btn, Modal } from './ui';
import { sfx } from '../utils/sfx';

const REWARDS = [
  { day: 1, title: '初日出席', emoji: '🥫', reward: '缶×50' },
  { day: 2, title: '2日目出席', emoji: '🎫', reward: 'チケット×3' },
  { day: 3, title: '3日目出席', emoji: '💎', reward: '結晶×10' },
  { day: 4, title: '4日目出席', emoji: '🥫', reward: '缶×100' },
  { day: 5, title: '5日目出席', emoji: '🎫', reward: 'チケット×10' },
  { day: 6, title: '6日目出席', emoji: '🗺️', reward: '同じ地図×2' },
  { day: 7, title: '皆勤賞！', emoji: '👑', reward: '缶300+💎30+🎫10' },
];

export default function LoginBonusModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useGame();
  const today = new Date().toISOString().split('T')[0];
  const canClaim = s.lastLoginDate !== today;
  const currentStreak = s.loginStreak;
  const currentDayInCycle = canClaim ? (currentStreak % 7) + 1 : ((currentStreak - 1) % 7) + 1;

  const handleClaim = () => {
    sfx.awaken();
    useGame.getState().claimDailyLogin();
  };

  return (
    <Modal open={open} onClose={onClose} wide title="📅 桐葉高校 理数科 出席カード">
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-xl bg-purple-950/40 border border-purple-500/30 p-2.5 text-xs text-purple-200">
          <span>毎日の登校（ログイン）でコーンスープ缶やチケット、貴重な育成素材を獲得できます。</span>
          <span className="font-bold text-white shrink-0 ml-2">通算出席: {currentStreak}日目</span>
        </div>

        {/* 7日サイクルスタンプシート */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {REWARDS.map((r) => {
            const isToday = currentDayInCycle === r.day;
            const isPast = canClaim ? currentDayInCycle > r.day : currentDayInCycle >= r.day;

            return (
              <div
                key={r.day}
                className={`relative flex flex-col items-center rounded-xl border p-2 text-center transition ${
                  isToday
                    ? 'border-amber-400 bg-amber-500/20 shadow-lg shadow-amber-900/30 scale-105'
                    : isPast
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : 'border-white/10 bg-black/30 opacity-70'
                }`}
              >
                {isPast && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-black shadow">
                    ✓
                  </span>
                )}
                {isToday && canClaim && (
                  <span className="absolute -left-1 -top-1 rounded bg-rose-500 px-1 text-[8px] font-bold text-white animate-bounce">
                    今日！
                  </span>
                )}

                <span className="text-[10px] text-slate-400">Day {r.day}</span>
                <span className="text-3xl my-1">{r.emoji}</span>
                <span className="text-[10px] font-bold text-white leading-tight">{r.reward}</span>
              </div>
            );
          })}
        </div>

        {/* アクションボタン */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">
            {canClaim ? '本日の出席スタンプが押せます！' : '本日の出席スタンプは受取済みです（明日また登校しよう）'}
          </span>
          <div className="flex gap-2">
            <Btn variant="ghost" onClick={onClose}>
              閉じる
            </Btn>
            {canClaim && (
              <Btn variant="gold" onClick={handleClaim}>
                出席スタンプを押す！
              </Btn>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
