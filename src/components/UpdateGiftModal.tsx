import { useGame } from '../game/store';
import { Btn, Modal } from './ui';
import { sfx } from '../utils/sfx';

export default function UpdateGiftModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useGame();
  const alreadyClaimed = s.claimedUpdateGift;

  const handleClaim = () => {
    sfx.awaken();
    useGame.getState().claimUpdateGift();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} wide title="🎉 大型アップデート記念！全員にコーンスープ配布！">
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-xl shadow-rose-900/40">
          <span className="text-5xl">🥫</span>
        </div>

        <div>
          <div className="font-display text-2xl text-amber-300">コーンスープ缶 × 450個</div>
          <p className="mt-1 text-xs text-slate-300">
            三ヶ月間補充されていなかった北棟の自販機が、奇跡の超常現象により満杯に！
            <br />
            日頃より✝本質✝を漏らし続ける理数科生徒・内進生全員に緊急配布されます！
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 p-3 text-left text-xs space-y-1.5 text-slate-300">
          <div className="text-[11px] font-bold text-amber-200">【生徒たちの反応】</div>
          <p>両馬：「450個はまじ✝本質✝。自販機の次元が歪んでる」</p>
          <p>三重：「450本も自販機に入るわけないだろ、物理法則を考えろ」</p>
          <p>砂糖：「……あるときよりないときの方が本質だったが、450本あるなら全部飲む」</p>
          <p>零：「面白いな」</p>
          <p>ヘイカツ：「冬場に温かいスープがあるのは、地殻変動の恩恵だぞ」</p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          {alreadyClaimed ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-300 font-bold">受取済みです（すでに缶に加算されています）</span>
              <Btn variant="ghost" onClick={onClose}>
                閉じる
              </Btn>
            </div>
          ) : (
            <Btn
              variant="gold"
              onClick={handleClaim}
              className="text-base font-display px-8 py-3 shadow-lg shadow-amber-600/50 animate-pulse"
            >
              🥫 コーンスープ450缶を受け取る！
            </Btn>
          )}
        </div>
      </div>
    </Modal>
  );
}
