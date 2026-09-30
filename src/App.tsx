import { useEffect, useState } from 'react';
import { useGame } from './game/store';
import { installDebugShortcut } from './utils/debugShortcut';
import { derive, spTotal, spSpent } from './game/formulas';
import { CHAPTERS } from './game/data/story';
import { THREADS } from './game/data/chatter';
import { fmt } from './game/format';
import Header from './components/Header';
import Toasts from './components/Toasts';
import ChatPanel from './components/ChatPanel';
import ClickerTab from './components/ClickerTab';
import GachaTab from './components/GachaTab';
import UnitsTab from './components/UnitsTab';
import SkillTab from './components/SkillTab';
import StoryTab from './components/StoryTab';
import LeagueTab from './components/LeagueTab';
import ItemsTab from './components/ItemsTab';
import RebirthTab from './components/RebirthTab';
import RecordsTab from './components/RecordsTab';
import TitleScreen from './components/TitleScreen';
import LoginBonusModal from './components/LoginBonusModal';
import UpdateGiftModal from './components/UpdateGiftModal';
import { Btn, Modal } from './components/ui';

type Tab = 'class' | 'gacha' | 'units' | 'skill' | 'story' | 'league' | 'items' | 'rebirth' | 'records';

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'class', label: '教室', emoji: '✝' },
  { id: 'story', label: 'ストーリー', emoji: '📖' },
  { id: 'league', label: '対抗戦', emoji: '🏫' },
  { id: 'gacha', label: '召喚', emoji: '🥫' },
  { id: 'units', label: '部員', emoji: '👥' },
  { id: 'skill', label: 'スキル', emoji: '🌳' },
  { id: 'items', label: '持ち物', emoji: '🎒' },
  { id: 'rebirth', label: '卒業・超越', emoji: '🎓' },
  { id: 'records', label: '年鑑', emoji: '📜' },
];

function hasSaveData() {
  try {
    return !!localStorage.getItem('honshitsu-leak-save-v1');
  } catch {
    return false;
  }
}

export default function App() {
  const [tab, setTab] = useState<Tab>('class');
  const [chatOpen, setChatOpen] = useState(false);
  const [offline, setOffline] = useState(0);
  const [showTitle, setShowTitle] = useState(true);
  const [hasSave] = useState(hasSaveData);
  const [seenId, setSeenId] = useState(0);
  const [showAutoGift, setShowAutoGift] = useState(false);
  const [showAutoLogin, setShowAutoLogin] = useState(false);

  const cans = useGame((s) => s.cans);
  const tickets = useGame((s) => s.items['ticket'] || 0);
  const spAvail = useGame((s) => spTotal(s) - spSpent(s));
  const canRebirth = useGame((s) => s.maxDev >= 60);
  const lastChatId = useGame((s) => (s.chat.length ? s.chat[s.chat.length - 1].id : 0));
  const storyReady = useGame((s) => {
    const i = CHAPTERS.findIndex((c) => !s.story[c.id]);
    if (i < 0) return false;
    return derive(s).battleDev >= CHAPTERS[i].rec - 1;
  });

  useEffect(() => {
    const gained = useGame.getState().init();
    if (gained > 1) setOffline(gained);

    // アプデ記念プレゼント未受取なら自動で案内
    const st = useGame.getState();
    if (!st.claimedUpdateGift) {
      setTimeout(() => setShowAutoGift(true), 800);
    } else {
      const today = new Date().toISOString().split('T')[0];
      if (st.lastLoginDate !== today) {
        setTimeout(() => setShowAutoLogin(true), 800);
      }
    }

    const t = window.setInterval(() => useGame.getState().tick(), 200);
    const a = window.setInterval(() => useGame.getState().checkAchievements(), 1000);
    const sv = window.setInterval(() => useGame.getState().save(), 10000);
    const onHide = () => useGame.getState().save();
    window.addEventListener('beforeunload', onHide);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.clearInterval(t);
      window.clearInterval(a);
      window.clearInterval(sv);
      window.removeEventListener('beforeunload', onHide);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.hidden) return;
      const th = THREADS[Math.floor(Math.random() * THREADS.length)];
      useGame.getState().pushLines(th, 1300);
    }, 17000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (chatOpen) setSeenId(lastChatId);
  }, [chatOpen, lastChatId]);

  useEffect(() => installDebugShortcut(window, () => useGame.getState().maxEverything()), []);

  const badge: Partial<Record<Tab, boolean>> = {
    gacha: cans >= 5 || tickets > 0,
    skill: spAvail > 0,
    rebirth: canRebirth,
    story: storyReady,
  };

  const content = (() => {
    switch (tab) {
      case 'class':
        return <ClickerTab />;
      case 'gacha':
        return <GachaTab />;
      case 'units':
        return <UnitsTab />;
      case 'skill':
        return <SkillTab />;
      case 'story':
        return <StoryTab />;
      case 'league':
        return <LeagueTab />;
      case 'items':
        return <ItemsTab />;
      case 'rebirth':
        return <RebirthTab />;
      case 'records':
        return <RecordsTab />;
      default:
        return null;
    }
  })();

  const unread = !chatOpen && lastChatId > seenId;

  return (
    <div className="bg-app min-h-screen text-slate-100">
      <div className="grid-paper pointer-events-none fixed inset-0" />
      <Header />
      <div className="relative mx-auto flex max-w-[1600px] gap-3 px-2 pt-3 sm:px-3">
        <nav className="sticky top-28 hidden w-40 shrink-0 flex-col gap-1 self-start md:flex">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`tap-none relative flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition ${tab === t.id ? 'border-purple-300/60 bg-purple-600/40 text-white shadow-lg shadow-purple-900/40' : 'border-transparent text-slate-300 hover:bg-white/5'}`}
            >
              <span className="w-6 text-center text-lg">{t.emoji}</span>
              {t.label}
              {badge[t.id] && <span className="absolute right-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-rose-500" />}
            </button>
          ))}
          <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-2 text-[10px] leading-relaxed text-slate-400">
            ヒント：✝を連打→発生源を買う→部員を育てる→ストーリーで戦う→偏差値60で卒業（転生）。
          </div>
        </nav>

        <main className="min-w-0 flex-1 pb-28 md:pb-8">{content}</main>

        <aside className="sticky top-28 hidden h-[calc(100vh-8rem)] w-80 shrink-0 self-start xl:block">
          <ChatPanel />
        </aside>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0d0920]/95 backdrop-blur md:hidden">
        <div className="no-scrollbar flex overflow-x-auto px-1 pb-[env(safe-area-inset-bottom)]">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                window.scrollTo({ top: 0 });
              }}
              className={`tap-none relative flex min-w-[64px] flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-bold ${tab === t.id ? 'text-purple-200' : 'text-slate-400'}`}
            >
              <span className={`text-lg leading-none ${tab === t.id ? 'scale-110' : ''}`}>{t.emoji}</span>
              {t.label}
              {tab === t.id && <span className="absolute inset-x-3 top-0 h-0.5 rounded bg-purple-400" />}
              {badge[t.id] && <span className="absolute right-3 top-1.5 h-2 w-2 rounded-full bg-rose-500" />}
            </button>
          ))}
        </div>
      </nav>

      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-20 right-3 z-40 flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-300/60 bg-emerald-600 text-2xl shadow-xl shadow-emerald-900/50 md:bottom-5 xl:hidden"
        aria-label="グループLINEを開く"
      >
        💬
        {unread && <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-[#0d0920] bg-rose-500" />}
      </button>

      {chatOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 xl:hidden" onClick={() => setChatOpen(false)}>
          <div className="h-full w-full max-w-sm p-2" onClick={(e) => e.stopPropagation()}>
            <ChatPanel onClose={() => setChatOpen(false)} />
          </div>
        </div>
      )}

      <Toasts />

      <Modal open={offline > 0 && !showTitle} onClose={() => setOffline(0)} title="おかえり">
        <p className="text-sm text-slate-300">あなたがいない間も、北棟の教室から✝本質✝は漏れ続けていた。</p>
        <div className="my-3 text-center font-display text-3xl text-purple-200">+{fmt(offline)} ✝</div>
        <p className="text-xs italic text-slate-400">両馬「寝てる間にすごい✝本質✝が降りてきた」／三重「寝てたなら降りてきたかわからないだろ」</p>
        <div className="mt-4 flex justify-end">
          <Btn onClick={() => setOffline(0)}>受け取る</Btn>
        </div>
      </Modal>

      {showAutoGift && !showTitle && (
        <UpdateGiftModal
          open
          onClose={() => {
            setShowAutoGift(false);
            const today = new Date().toISOString().split('T')[0];
            if (useGame.getState().lastLoginDate !== today) {
              setShowAutoLogin(true);
            }
          }}
        />
      )}

      {showAutoLogin && !showTitle && !showAutoGift && (
        <LoginBonusModal open onClose={() => setShowAutoLogin(false)} />
      )}

      {showTitle && (
        <TitleScreen
          hasSave={hasSave}
          onStart={() => {
            setShowTitle(false);
            useGame.getState().markTitleSeen();
          }}
        />
      )}
    </div>
  );
}
