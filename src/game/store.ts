import { create } from 'zustand';
import type { Buff, GameData, GachaPoolId, Line, OwnedUnit, PrestigeDef, PullResult, Rarity, Reward, RewardSummary, Toast, UltraPrestigeDef } from './types';
import {
  derive, computeMods, xpToNext, spTotal, spSpent, levelCap, unitLevelCost, bulkCost, maxAffordable,
  gachaRates, pityMax, rollWeighted, rebirthGain, ultraRebirthGain, devToPower, rarityRank, RARITY_REFUND, RARITY_CRYSTALS, RARITIES, unitStats, getMaxStar,
} from './formulas';
import { UNITS, UNIT_MAP } from './data/units';
import { ITEM_MAP, EQUIPS, DROP_CONSUMABLES, SHOP, EQUIP_WEIGHTS, LOSTBOX_WEIGHTS } from './data/items';
import type { ShopEntry } from './data/items';
import { FAC_MAP } from './data/facilities';
import { NODE_MAP, PRESTIGE_MAP, ULTRA_PRESTIGE_MAP } from './data/skills';
import { ACHIEVEMENTS } from './data/achievements';
import { DEV_EVENTS, DEV_THRESHOLDS, FACILITY_EVENTS, replyTo } from './data/chatter';
import { getUnitAwakenings, CRYSTAL_SHOP } from './data/awakening';
import { GACHA_POOLS, POOL_MAP } from './data/gacha';
import { fmt } from './format';

const SAVE_KEY = 'honshitsu-leak-save-v1';

export interface BattleCtx {
  kind: 'story' | 'league' | 'endless';
  id: string;
  rec: number;
  reward?: Reward;
  level?: number;
}

interface Actions {
  init: () => number;
  save: () => void;
  tick: () => void;
  click: () => { amount: number; crit: boolean };
  clickGolden: () => string | null;
  buyFacility: (id: string, mode: number | 'max') => void;
  levelUp: (id: string, times: number | 'max') => void;
  toggleParty: (id: string) => void;
  autoParty: () => void;
  equip: (unitId: string, itemId: string | null) => void;
  pull: (count: 1 | 10 | 100, useTicket?: boolean, poolId?: GachaPoolId) => PullResult[] | null;
  allocSkill: (id: string) => void;
  resetSkills: () => void;
  useItem: (id: string, unitId?: string) => boolean;
  consumeItem: (id: string) => boolean;
  buyShop: (id: string) => void;
  openLostBox: () => string | null;
  winBattle: (ctx: BattleCtx) => RewardSummary;
  loseBattle: () => void;
  rebirth: () => number;
  ultraRebirth: () => number;
  buyPrestige: (id: string) => void;
  buyUltraPrestige: (id: string) => void;
  awakenUnit: (unitId: string) => boolean;
  giftBond: (unitId: string, itemId: string) => boolean;
  buyCrystalShop: (shopId: string) => boolean;
  claimDailyLogin: () => boolean;
  claimUpdateGift: () => boolean;
  checkAchievements: () => void;
  pushChat: (s: string, t: string) => void;
  pushLines: (lines: Line[], gap?: number) => void;
  toast: (text: string, kind?: Toast['kind']) => void;
  userSay: (text: string) => void;
  processLevel: () => void;
  markTitleSeen: () => void;
  hardReset: () => void;
  exportSave: () => string;
  importSave: (str: string) => boolean;
}

export type GameStore = GameData & Actions;

let msgId = 100;
let toastId = 0;
let initialized = false;

function fresh(): GameData {
  const now = Date.now();
  return {
    honshitsu: 0,
    totalEarned: 0,
    allTimeEarned: 0,
    cans: 50,
    memories: 0,
    totalMemories: 0,
    rebirths: 0,
    // ウルトラ転生
    ultraRebirths: 0,
    cores: 0,
    totalCores: 0,
    ultraPrestige: {},
    // 本質結晶
    crystals: 0,
    totalCrystals: 0,
    // 部員新育成
    awakening: {},
    bonds: {},
    // ログボ＆アプデ配布
    claimedUpdateGift: false,
    lastLoginDate: '',
    loginStreak: 0,
    loginClaimedDays: [],
    clicks: 0,
    allClicks: 0,
    facilities: {},
    units: { ryoma: { level: 1, star: 0, equip: null }, sub: { level: 1, star: 0, equip: null } },
    party: ['ryoma', 'sub', null, null],
    items: { hotsoup: 3, jiroitem: 1, ticket: 1 },
    skills: {},
    prestige: {},
    level: 1,
    xp: 0,
    bonusSP: 0,
    story: {},
    league: {},
    endless: 0,
    pulls: 0,
    pity: 0,
    achievements: {},
    buffs: [],
    maxDev: 0,
    bestDev: 0,
    goldenClicks: 0,
    itemsUsed: 0,
    battlesWon: 0,
    battlesLost: 0,
    shopBought: {},
    lostBoxOpened: 0,
    canAcc: 0,
    autoAcc: 0,
    nextGolden: 40,
    lastTick: now,
    lastSave: now,
    hadZeroCans: false,
    seenTitle: false,
    golden: null,
    chat: [
      { id: 1, s: 'sys', t: '✝ グループLINE「理数科B組（✝）」に ✝本質✝（あなた）が参加しました' },
      { id: 2, s: 'ryoma', t: 'お、なんか漏れてる。これまじ✝本質✝' },
      { id: 3, s: 'sys', t: '（中央の✝をクリックして✝本質✝を漏らそう。下の入力欄から発言もできる）' },
    ],
    toasts: [],
  };
}

const TRANSIENT: (keyof GameData)[] = ['golden', 'chat', 'toasts'];
const PERSIST_KEYS = (Object.keys(fresh()) as (keyof GameData)[]).filter((k) => !TRANSIENT.includes(k));

/** 古いセーブを現行形式にマージ（欠けたキーは初期値で補完） */
function sanitize(raw: any): GameData {
  const base = fresh();
  if (!raw || typeof raw !== 'object') return base;
  const out: any = { ...base };
  for (const k of PERSIST_KEYS) {
    const v = raw[k];
    if (v === undefined || v === null) continue;
    const b = (base as any)[k];
    if (typeof b === 'number') out[k] = Number.isFinite(Number(v)) ? Number(v) : b;
    else if (Array.isArray(b)) out[k] = Array.isArray(v) ? v : b;
    else if (b && typeof b === 'object') out[k] = typeof v === 'object' && !Array.isArray(v) ? { ...b, ...v } : b;
    else out[k] = v;
  }
  if (typeof raw.lastSave === 'number') out.lastSave = raw.lastSave;
  out.golden = null;
  out.toasts = [];
  return out as GameData;
}

// 読み込み失敗時はセーブを上書きしない（データ消失防止）
let saveBlocked = false;

function serialize(s: GameData): string {
  const out: Record<string, unknown> = {};
  for (const k of PERSIST_KEYS) out[k] = s[k];
  out.lastSave = Date.now();
  return JSON.stringify(out);
}

function addBuff(buffs: Buff[], nb: Buff): Buff[] {
  return [...buffs.filter((b) => b.id !== nb.id), nb];
}

function rollEquip(weights: Record<Rarity, number>): string {
  const r = rollWeighted(weights);
  const pool = EQUIPS.filter((e) => e.rarity === r);
  const list = pool.length ? pool : EQUIPS;
  return list[Math.floor(Math.random() * list.length)].id;
}

export const shopPrice = (e: ShopEntry, ps: number, bought: number) => Math.ceil(Math.max(e.min, ps * e.sec) * Math.pow(e.grow, bought));
export const lostBoxPrice = (ps: number, n: number) => Math.ceil(Math.max(300, ps * 60) * Math.pow(1.08, n));
export const prestigeCost = (p: PrestigeDef, lv: number) => Math.floor(p.baseCost * Math.pow(p.costMult, lv));
export const ultraPrestigeCost = (p: UltraPrestigeDef, lv: number) => Math.floor(p.baseCost * Math.pow(p.costMult, lv));

function toB64(str: string) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function fromB64(b64: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function setupDebugCommands(set: any, get: any) {
  if (typeof window === 'undefined') return;
  const dbg = {
    help: () => {
      console.log(`
%c✝ 本質クリッカー デバッグコマンド一覧 ✝%c
・ hdebug.addHonshitsu(n = 1e30)  : ✝本質✝を増やす
・ hdebug.addCans(n = 1000)       : コーンスープ缶を増やす
・ hdebug.addCrystals(n = 500)    : ✝本質結晶✝を増やす
・ hdebug.addCores(n = 50)        : 構造線の核を増やす
・ hdebug.addTickets(n = 100)     : 召喚チケットを増やす
・ hdebug.setDev(150)             : 最高総合偏差値を設定（120以上でウルトラ転生解放）
・ hdebug.maxAllUnits()           : 所持部員のLvと凸を最大化
・ hdebug.unlockAllUnits()        : 全キャラクター（EX神格化部員含む）を一括解放
・ hdebug.awakenAll()             : 全部員を第5段階まで本質覚醒
・ hdebug.unlockAllStory()        : 全ストーリー・対抗戦をクリア
・ hdebug.triggerGolden()         : 黄金✝を今すぐ召喚
・ hdebug.clearSave()             : セーブデータをリセット
`, 'color: #c084fc; font-weight: bold; font-size: 14px;', 'color: #cbd5e1; font-size: 11px;');
    },
    addHonshitsu: (n = 1e30) => {
      set((s: GameData) => ({ honshitsu: s.honshitsu + n, totalEarned: s.totalEarned + n, allTimeEarned: s.allTimeEarned + n }));
      console.log(`✝本質✝ +${fmt(n)} 注入完了！`);
    },
    addCans: (n = 1000) => {
      set((s: GameData) => ({ cans: s.cans + n }));
      console.log(`コーンスープ缶 +${n} 缶注入完了！`);
    },
    addCrystals: (n = 500) => {
      set((s: GameData) => ({ crystals: s.crystals + n, totalCrystals: s.totalCrystals + n }));
      console.log(`✝本質結晶✝ +${n} 個注入完了！`);
    },
    addCores: (n = 50) => {
      set((s: GameData) => ({ cores: s.cores + n, totalCores: s.totalCores + n }));
      console.log(`構造線の核 +${n} 個注入完了！`);
    },
    addTickets: (n = 100) => {
      set((s: GameData) => ({ items: { ...s.items, ticket: (s.items.ticket || 0) + n } }));
      console.log(`召喚チケット +${n} 枚注入完了！`);
    },
    setDev: (dev = 150) => {
      set({ maxDev: dev, bestDev: Math.max(get().bestDev, dev) });
      console.log(`最高総合偏差値を ${dev} に設定しました（120以上でウルトラ転生が可能です）`);
    },
    maxAllUnits: () => {
      const units: Record<string, OwnedUnit> = {};
      for (const u of UNITS) {
        units[u.id] = { level: 200, star: 15, equip: (get().units[u.id] || {}).equip || null };
      }
      set({ units });
      console.log('全部員を Lv200 / ★15凸 に最大化しました！');
    },
    unlockAllUnits: () => {
      const units = { ...get().units };
      for (const u of UNITS) {
        if (!units[u.id]) units[u.id] = { level: 1, star: 0, equip: null };
      }
      set({ units });
      console.log(`全部員（${UNITS.length}人）を解放しました！`);
    },
    awakenAll: () => {
      const awakening: Record<string, number> = {};
      for (const u of UNITS) awakening[u.id] = 5;
      set({ awakening });
      console.log('全部員を第5段階まで本質覚醒しました！');
    },
    unlockAllStory: () => {
      const story: Record<string, boolean> = {};
      for (let i = 1; i <= 30; i++) story[`ch${i}`] = true;
      set({ story, endless: 100 });
      console.log('ストーリー・対抗戦を全クリア状態にしました！');
    },
    triggerGolden: () => {
      set({ golden: { id: Date.now(), x: 45, y: 40, until: Date.now() + 20000 } });
      console.log('黄金✝を画面中央に出現させました！');
    },
    clearSave: () => {
      localStorage.removeItem(SAVE_KEY);
      location.reload();
    },
  };

  (window as any).hdebug = dbg;
  (window as any).cheat = dbg;
  (window as any).debug = dbg;
  dbg.help();
}

export const useGame = create<GameStore>()((set, get) => ({
  ...fresh(),

  init: () => {
    if (initialized) return 0;
    initialized = true;
    setupDebugCommands(set, get);
    let offlineGain = 0;
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const merged = sanitize(JSON.parse(raw));
        set(merged);
        const d = derive(get());
        const now = Date.now();
        const dt = (now - (merged.lastSave || now)) / 1000;
        if (dt > 60) {
          const cap = (8 + d.m.offlineHours) * 3600;
          offlineGain = d.perSecBase * Math.min(dt, cap);
          set((st) => ({ honshitsu: st.honshitsu + offlineGain, totalEarned: st.totalEarned + offlineGain, allTimeEarned: st.allTimeEarned + offlineGain }));
        }
        set({ lastTick: now });
        get().pushChat('sys', 'おかえり。✝本質✝は漏れ続けていた。');
      } else {
        set({ lastTick: Date.now() });
      }
    } catch (e) {
      console.error('セーブ読み込み失敗。元データ保護のため自動セーブを停止します', e);
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) localStorage.setItem(SAVE_KEY + '-backup-' + Date.now(), raw);
      } catch { /* ignore */ }
      saveBlocked = true;
      set({ lastTick: Date.now() });
    }
    return offlineGain;
  },

  save: () => {
    if (saveBlocked) return;
    try {
      localStorage.setItem(SAVE_KEY, serialize(get()));
    } catch {
      /* storage full or disabled */
    }
  },

  tick: () => {
    const s = get();
    const now = Date.now();
    let dt = (now - s.lastTick) / 1000;
    if (dt <= 0) return;
    if (dt > 10) dt = 10;
    const d = derive(s);
    let gain = d.perSec * dt;
    let autoAcc = s.autoAcc + d.m.autoClick * dt;
    const autoClicks = Math.floor(autoAcc);
    autoAcc -= autoClicks;
    if (autoClicks > 0) gain += d.clickPower * autoClicks;
    let canAcc = s.canAcc + (s.facilities['vending'] || 0) * 0.002 * (1 + d.m.canPct) * dt;
    const newCans = Math.floor(canAcc);
    canAcc -= newCans;
    let nextGolden = s.nextGolden - dt;
    let golden = s.golden;
    if (golden && golden.until < now) golden = null;
    if (!golden && nextGolden <= 0) {
      golden = { id: now, x: 10 + Math.random() * 78, y: 10 + Math.random() * 70, until: now + 13000 };
      nextGolden = (60 + Math.random() * 90) / (1 + d.m.goldenRate);
    }
    const buffs = s.buffs.some((b) => b.until <= now) ? s.buffs.filter((b) => b.until > now) : s.buffs;
    const maxDev = Math.max(s.maxDev, d.totalDev);
    const bestDev = Math.max(s.bestDev, d.totalDev);
    set({
      lastTick: now,
      honshitsu: s.honshitsu + gain,
      totalEarned: s.totalEarned + gain,
      allTimeEarned: s.allTimeEarned + gain,
      autoAcc,
      canAcc,
      cans: s.cans + newCans,
      nextGolden,
      golden,
      buffs,
      maxDev,
      bestDev,
      xp: s.xp + 0.5 * (1 + d.m.xpPct) * dt,
    });
    if (newCans > 0 && Math.random() < 0.25) get().pushChat('izumi', `自販機からコーンスープ缶が出てきた（+${newCans}）`);
    let crossed = 0;
    for (const t of DEV_THRESHOLDS) if (s.maxDev < t && maxDev >= t) crossed = t;
    if (crossed) {
      get().pushLines(DEV_EVENTS[crossed]);
      if (crossed >= 60 && s.maxDev < 60) get().toast('🎓 総合偏差値60到達！ 卒業（転生）が可能になった', 'rare');
    }
    get().processLevel();
  },

  processLevel: () => {
    const s = get();
    let level = s.level;
    let xp = s.xp;
    let ups = 0;
    while (xp >= xpToNext(level) && ups < 200) {
      xp -= xpToNext(level);
      level++;
      ups++;
    }
    if (ups > 0) {
      set({ level, xp });
      get().toast(`🎓 学年レベル${level}！ スキルポイント+${ups}`, 'good');
      if (s.level < 10 && level >= 10) get().pushLines([['sys', '2年生に進級した'], ['ryoma', '二年目の✝本質✝始まるな'], ['mie', '始まらない。始めるな']]);
      else if (s.level < 20 && level >= 20) get().pushLines([['sys', '3年生に進級した'], ['kuraishi', '先輩方。最終年度です']]);
      else if (s.level < 30 && level >= 30) get().pushLines([['sys', '留年した（卒業＝転生を検討しよう）'], ['mie', '留年するな'], ['ryoma', '留年の✝本質✝']]);
    }
  },

  click: () => {
    const s = get();
    const d = derive(s);
    const crit = Math.random() < d.m.critChance;
    const amount = d.clickPower * (crit ? d.m.critMult : 1);
    set({
      honshitsu: s.honshitsu + amount,
      totalEarned: s.totalEarned + amount,
      allTimeEarned: s.allTimeEarned + amount,
      clicks: s.clicks + 1,
      allClicks: s.allClicks + 1,
      xp: s.xp + (1 + d.m.xpPct),
    });
    const c = s.allClicks + 1;
    if (c === 420) get().pushLines([['kuraishi', '✝クリック、四百二十回目です'], ['mie', '俺の「は？」と同じ回数にするな']]);
    if (c === 1000) get().pushLines([['ryoma', '千回クリック。指の✝本質✝'], ['sato', '指、大丈夫か']]);
    else if (c % 150 === 0) {
      const pool: Line[][] = [
        [['mie', 'クリックしすぎだろ'], ['ryoma', '指の✝本質✝']],
        [['kuraishi', `✝クリック、${c}回目です`], ['mie', '数えるな']],
        [['sato', '連打うるさい'], ['mie', 'お前のゲーム音もうるさい']],
        [['rei', '連打のリズム、面白いね']],
        [['terachi', 'えー……「クリックとは何か」。……紙に書いて読みます']],
        [['izumi', '大喜利。お題「✝を連打する人の気持ち」'], ['sato', '指が勝手に動く']],
        [['meshino', 'Keep clicking. Clicking is also ✝本質✝.'], ['mie', '日本語で']],
      ];
      get().pushLines(pool[Math.floor(Math.random() * pool.length)]);
    }
    get().processLevel();
    return { amount, crit };
  },

  clickGolden: () => {
    const s = get();
    if (!s.golden) return null;
    const d = derive(s);
    const now = Date.now();
    const r = Math.random();
    let msg = '';
    const patch: Partial<GameData> = { golden: null, goldenClicks: s.goldenClicks + 1 };
    if (r < 0.08) {
      msg = '三重に「は？」と言われた。何も起きなかった。';
      get().pushLines([['mie', 'は？'], ['kuraishi', '記録しました']]);
    } else if (r < 0.4) {
      msg = '✝本質✝フィーバー！ 毎秒本質×7（30秒）';
      patch.buffs = addBuff(s.buffs, { id: 'fever', name: '✝本質✝フィーバー', kind: 'prod', mult: 7, until: now + 30000 });
    } else if (r < 0.6) {
      msg = 'まじ✝本質✝連打！ クリック×30（13秒）';
      patch.buffs = addBuff(s.buffs, { id: 'frenzy', name: 'まじ✝本質✝連打', kind: 'click', mult: 30, until: now + 13000 });
    } else if (r < 0.82) {
      const amt = Math.max(50, Math.min(s.honshitsu * 0.2, d.perSecBase * 900) + d.perSecBase * 60 + 10 * d.clickBase);
      msg = `本質が降りてきた！ +${fmt(amt)}`;
      patch.honshitsu = s.honshitsu + amt;
      patch.totalEarned = s.totalEarned + amt;
      patch.allTimeEarned = s.allTimeEarned + amt;
    } else {
      const c = Math.floor((3 + Math.floor(Math.random() * 5) + d.m.goldenCan * 2) * (1 + d.m.canPct));
      msg = `コーンスープの帰還！ 🥫+${c}`;
      patch.cans = s.cans + c;
    }
    set(patch);
    get().toast('✨ ' + msg, 'rare');
    return msg;
  },

  buyFacility: (id, mode) => {
    const s = get();
    const f = FAC_MAP[id];
    if (!f) return;
    const d = derive(s);
    const base = f.baseCost * Math.max(0.2, 1 - d.m.costReduce);
    const owned = s.facilities[id] || 0;
    const n = mode === 'max' ? maxAffordable(base, owned, s.honshitsu) : mode;
    if (n <= 0) return;
    const cost = bulkCost(base, owned, n);
    if (cost > s.honshitsu * (1 + 1e-9) + 1e-6) return;
    set({
      honshitsu: Math.max(0, s.honshitsu - cost),
      facilities: { ...s.facilities, [id]: owned + n },
      xp: s.xp + 1.5 * n * (1 + d.m.xpPct),
    });
    if (owned === 0 && FACILITY_EVENTS[id]) get().pushLines(FACILITY_EVENTS[id]);
    get().processLevel();
  },

  levelUp: (id, times) => {
    const s = get();
    const def = UNIT_MAP[id];
    const u = s.units[id];
    if (!def || !u) return;
    const cap = levelCap(u, computeMods(s));
    let lv = u.level;
    let money = s.honshitsu;
    let n = 0;
    const limit = times === 'max' ? 9999 : times;
    while (n < limit && lv < cap) {
      const c = unitLevelCost(def, lv);
      if (c > money) break;
      money -= c;
      lv++;
      n++;
    }
    if (n === 0) return;
    set({ honshitsu: money, units: { ...s.units, [id]: { ...u, level: lv } } });
  },

  toggleParty: (id) => {
    const s = get();
    if (!s.units[id]) return;
    const party = [...s.party];
    const idx = party.indexOf(id);
    if (idx >= 0) {
      party[idx] = null;
    } else {
      const empty = party.indexOf(null);
      if (empty < 0) {
        get().toast('編成がいっぱい（4人まで）。誰かを外してね', 'bad');
        return;
      }
      party[empty] = id;
    }
    set({ party });
  },

  autoParty: () => {
    const s = get();
    const m = computeMods(s);
    const ranked = Object.keys(s.units)
      .filter((id) => UNIT_MAP[id])
      .map((id) => ({ id, p: unitStats(UNIT_MAP[id], s.units[id], m).power }))
      .sort((a, b) => b.p - a.p)
      .slice(0, 4)
      .map((x) => x.id);
    const party: (string | null)[] = [0, 1, 2, 3].map((i) => ranked[i] ?? null);
    set({ party });
    get().toast('おまかせ編成した（戦闘力の高い順）', 'info');
  },

  equip: (unitId, itemId) => {
    const s = get();
    const u = s.units[unitId];
    if (!u) return;
    const items = { ...s.items };
    if (itemId && (items[itemId] || 0) <= 0) return;
    if (u.equip) items[u.equip] = (items[u.equip] || 0) + 1;
    if (itemId) items[itemId] = (items[itemId] || 0) - 1;
    set({ items, units: { ...s.units, [unitId]: { ...u, equip: itemId } } });
  },

  pull: (count, useTicket = false, poolId = 'standard') => {
    const s = get();
    const m = computeMods(s);
    const poolDef = POOL_MAP[poolId] || POOL_MAP['standard'];

    // ───── コスト計算 ─────
    let canCost = 0;
    let ticketCost = 0;
    let coreCost = 0;
    let crystalCost = 0;

    if (poolId === 'abyss') {
      // ウルトラ深淵召喚：構造線の核または✝本質結晶✝
      if (s.cores >= (count === 100 ? 90 : count === 10 ? 10 : 1)) {
        coreCost = count === 100 ? 90 : count === 10 ? 10 : 1;
      } else {
        crystalCost = count === 100 ? 2500 : count === 10 ? 270 : 30;
        if (s.crystals < crystalCost) {
          get().toast('構造線の核または✝本質結晶✝が足りません', 'bad');
          return null;
        }
      }
    } else if (useTicket) {
      ticketCost = count;
      if ((s.items['ticket'] || 0) < ticketCost) {
        get().toast('召喚チケットが足りません', 'bad');
        return null;
      }
    } else {
      const discount = s.ultraPrestige['u_auto_mach'] ? 20 : 0;
      if (poolId === 'artifact') {
        canCost = count === 100 ? Math.max(200, 300 - discount) : count === 10 ? 35 : 4;
      } else {
        canCost = count === 100 ? Math.max(300, 400 - discount) : count === 10 ? 45 : 5;
      }
      if (s.cans < canCost) {
        get().toast('コーンスープ缶が足りません', 'bad');
        return null;
      }
    }

    const rates = gachaRates(m);
    const pmax = pityMax(m);
    const maxStar = getMaxStar(m);
    let pity = s.pity;
    const units: Record<string, OwnedUnit> = { ...s.units };
    const party = [...s.party];
    const items = { ...s.items };
    let refundTotal = 0;
    let crystalsTotal = 0;
    const rolled: number[] = [];
    const results: PullResult[] = [];

    // ───── 神器・秘宝装備ガチャの場合 ─────
    if (poolId === 'artifact') {
      for (let i = 0; i < count; i++) {
        pity++;
        let r = rollWeighted(rates);
        if (count >= 10 && (i + 1) % 10 === 0) {
          const recent = rolled.slice(i - 9, i);
          const bestRecent = Math.max(rarityRank(r), ...(recent.length ? recent : [0]));
          if (bestRecent < rarityRank('SR')) r = 'SR';
        }
        if (count === 100 && i === 99) {
          const bestAll = Math.max(rarityRank(r), ...rolled);
          if (bestAll < rarityRank('SSR')) r = 'SSR';
        }
        if (pity >= pmax && rarityRank(r) < rarityRank('UR')) r = 'UR';
        if (rarityRank(r) >= rarityRank('UR')) pity = 0;
        rolled.push(rarityRank(r));

        // 該当レアリティの装備を取得（なければ全装備から）
        const pool = EQUIPS.filter((e) => e.rarity === r);
        const eq = pool.length ? pool[Math.floor(Math.random() * pool.length)] : EQUIPS[Math.floor(Math.random() * EQUIPS.length)];
        items[eq.id] = (items[eq.id] || 0) + 1;
        results.push({
          id: eq.id,
          isNew: false,
          star: 0,
          refund: 0,
          crystals: 0,
          kind: 'equip',
          equipId: eq.id,
        });
      }

      set({
        items: useTicket ? { ...items, ticket: items.ticket - ticketCost } : items,
        pity,
        pulls: s.pulls + count,
        cans: s.cans - canCost,
        xp: s.xp + 3 * count * (1 + m.xpPct),
      });

      let bestEquip = results[0];
      for (const r of results) {
        const itemA = ITEM_MAP[r.id];
        const itemB = ITEM_MAP[bestEquip.id];
        if (itemA && itemB && rarityRank(itemA.rarity) > rarityRank(itemB.rarity)) bestEquip = r;
      }
      const bItem = ITEM_MAP[bestEquip.id];
      if (bItem && rarityRank(bItem.rarity) >= rarityRank('SSR')) {
        get().pushLines([['sys', `✝ 特級神器【${bItem.name}】が降臨した！`], ['kuraishi', '聖典に記録します']]);
      }

      get().processLevel();
      return results;
    }

    // ───── 構造線の深淵召喚（ウルトラ超越ガチャ）の場合 ─────
    if (poolId === 'abyss') {
      const abyssUnits = UNITS.filter((u) => u.id.startsWith('ex_') || u.rarity === 'LR' || u.rarity === 'UR');
      for (let i = 0; i < count; i++) {
        // EX部員を高確率選出
        const def = abyssUnits[Math.floor(Math.random() * abyssUnits.length)];
        const cur = units[def.id];
        if (!cur) {
          units[def.id] = { level: 1, star: 0, equip: null };
          const e = party.indexOf(null);
          if (e >= 0) party[e] = def.id;
          results.push({ id: def.id, isNew: true, star: 0, refund: 0, crystals: 0, kind: 'unit' });
        } else if (cur.star < maxStar) {
          units[def.id] = { ...cur, star: cur.star + 1 };
          results.push({ id: def.id, isNew: false, star: cur.star + 1, refund: 0, crystals: 0, kind: 'unit' });
        } else {
          const rf = RARITY_REFUND[def.rarity];
          const cry = Math.floor(RARITY_CRYSTALS[def.rarity] * 2);
          refundTotal += rf;
          crystalsTotal += cry;
          results.push({ id: def.id, isNew: false, star: cur.star, refund: rf, crystals: cry, kind: 'unit' });
        }
      }

      set({
        units,
        party,
        pulls: s.pulls + count,
        cans: s.cans + refundTotal,
        cores: s.cores - coreCost,
        crystals: s.crystals - crystalCost + crystalsTotal,
        totalCrystals: s.totalCrystals + crystalsTotal,
        xp: s.xp + 10 * count * (1 + m.xpPct),
      });

      get().pushLines([
        ['sys', `🌌 構造線の深淵から神格化EX部員が呼び出された……！`],
        ['ryoma', 'これまじ深淵の✝本質✝'],
        ['rei', '面白いな。常識が通用しない'],
      ]);

      get().processLevel();
      return results;
    }

    // ───── 通常自販機（部員召喚） ─────
    for (let i = 0; i < count; i++) {
      pity++;
      let r = rollWeighted(rates);

      if (count >= 10 && (i + 1) % 10 === 0) {
        const recentChunk = rolled.slice(i - 9, i);
        const bestInChunk = Math.max(rarityRank(r), ...(recentChunk.length ? recentChunk : [0]));
        if (m.tenGuarantee > 0 && bestInChunk < rarityRank('SSR')) r = 'SSR';
        else if (bestInChunk < rarityRank('SR')) r = 'SR';
      }

      if (count === 100 && i === 99) {
        const bestAll = Math.max(rarityRank(r), ...rolled);
        if (bestAll < rarityRank('SSR')) r = 'SSR';
      }

      if (pity >= pmax && rarityRank(r) < rarityRank('UR')) r = 'UR';
      if (rarityRank(r) >= rarityRank('UR')) pity = 0;
      rolled.push(rarityRank(r));

      // EX部員は深淵限定のため除外
      const pool = UNITS.filter((u) => u.rarity === r && !u.id.startsWith('ex_'));
      const def = pool.length ? pool[Math.floor(Math.random() * pool.length)] : UNITS[0];

      const cur = units[def.id];
      if (!cur) {
        units[def.id] = { level: 1, star: 0, equip: null };
        const e = party.indexOf(null);
        if (e >= 0) party[e] = def.id;
        results.push({ id: def.id, isNew: true, star: 0, refund: 0, crystals: 0, kind: 'unit' });
      } else if (cur.star < maxStar) {
        units[def.id] = { ...cur, star: cur.star + 1 };
        results.push({ id: def.id, isNew: false, star: cur.star + 1, refund: 0, crystals: 0, kind: 'unit' });
      } else {
        const rf = RARITY_REFUND[def.rarity];
        const cry = Math.floor(RARITY_CRYSTALS[def.rarity] * (1 + (m.crystalBonus || 0)));
        refundTotal += rf;
        crystalsTotal += cry;
        results.push({ id: def.id, isNew: false, star: cur.star, refund: rf, crystals: cry, kind: 'unit' });
      }
    }

    const newCans = useTicket ? s.cans + refundTotal : s.cans - canCost + refundTotal;
    const finalItems = useTicket ? { ...items, ticket: items.ticket - ticketCost } : items;

    set({
      units,
      party,
      pity,
      pulls: s.pulls + count,
      cans: newCans,
      items: finalItems,
      crystals: s.crystals + crystalsTotal,
      totalCrystals: s.totalCrystals + crystalsTotal,
      hadZeroCans: s.hadZeroCans || newCans <= 0,
      xp: s.xp + 3 * count * (1 + m.xpPct),
    });

    let best = results[0];
    for (const r of results) if (rarityRank(UNIT_MAP[r.id].rarity) > rarityRank(UNIT_MAP[best.id].rarity)) best = r;
    const bdef = UNIT_MAP[best.id];

    if (rarityRank(bdef.rarity) >= rarityRank('SSR')) {
      const lines: Line[] = [['sys', `✝ ${bdef.name}【${bdef.rarity}】が教室に漏れ出した！`]];
      if (bdef.speaker) lines.push([bdef.speaker, bdef.quote]);
      if (bdef.id === 'rei') lines.push(['mie', 'なんで召喚で来るんだよ'], ['rei', '家が近いから']);
      else if (bdef.rarity === 'LR') lines.push(['kuraishi', '✝LR✝……！ 聖典に記録します'], ['mie', 'は？']);
      else lines.push(['ryoma', '出た！ これまじ✝本質✝']);
      get().pushLines(lines, 900);
    } else if (count >= 10 && rarityRank(bdef.rarity) <= rarityRank('SR')) {
      get().pushLines([['mie', `${count}連でそれか`], ['ryoma', 'ハズレも✝本質✝']], 900);
    }

    if (crystalsTotal > 0) {
      get().toast(`💎 完凸余剰により ✝本質結晶✝ +${crystalsTotal} 獲得！`, 'rare');
    }

    get().processLevel();
    return results;
  },

  allocSkill: (id) => {
    const s = get();
    const n = NODE_MAP[id];
    if (!n) return;
    const r = s.skills[id] || 0;
    if (r >= n.max) return;
    if (spTotal(s) - spSpent(s) < n.cost) {
      get().toast('スキルポイントが足りない（学年レベルを上げよう）', 'bad');
      return;
    }
    if (!n.req.every((q) => (s.skills[q] || 0) > 0)) {
      get().toast('前提スキルが未習得', 'bad');
      return;
    }
    set({ skills: { ...s.skills, [id]: r + 1 } });
    if (n.capstone) get().pushLines([['sys', `奥義「${n.name}」を習得した`], ['ryoma', 'ビルドの✝本質✝'], ['mie', 'ビルドに✝本質✝をつけるな']]);
  },

  resetSkills: () => {
    set({ skills: {} });
    get().toast('記憶喪失した。スキルポイントが全部戻った', 'info');
    get().pushLines([['mie', '何も覚えてないのか'], ['ryoma', '忘れても地面は忘れない']]);
  },

  useItem: (id, unitId) => {
    const s = get();
    const def = ITEM_MAP[id];
    if (!def?.effect || (s.items[id] || 0) <= 0) return false;
    const e = def.effect;
    const now = Date.now();
    const patch: Partial<GameData> = {};
    switch (e.kind) {
      case 'prodBuff':
        patch.buffs = addBuff(s.buffs, { id: 'item_' + id, name: def.name, kind: 'prod', mult: e.mult, until: now + e.duration * 1000 });
        break;
      case 'clickBuff':
        patch.buffs = addBuff(s.buffs, { id: 'item_' + id, name: def.name, kind: 'click', mult: e.mult, until: now + e.duration * 1000 });
        break;
      case 'honshitsu': {
        const d = derive(s);
        const amt = Math.max(500, d.perSecBase * e.seconds);
        patch.honshitsu = s.honshitsu + amt;
        patch.totalEarned = s.totalEarned + amt;
        patch.allTimeEarned = s.allTimeEarned + amt;
        get().toast(`${def.emoji} +${fmt(amt)} ✝本質✝`, 'good');
        break;
      }
      case 'golden':
        patch.golden = { id: now, x: 20 + Math.random() * 60, y: 20 + Math.random() * 55, until: now + 13000 };
        break;
      case 'sp':
        patch.bonusSP = s.bonusSP + 1;
        get().toast('📘 スキルポイント+1', 'good');
        break;
      case 'levelUp': {
        if (!unitId) return false;
        const u = s.units[unitId];
        if (!u) return false;
        const cap = levelCap(u, computeMods(s));
        if (u.level >= cap) {
          get().toast('レベル上限です（凸で上限アップ）', 'bad');
          return false;
        }
        patch.units = { ...s.units, [unitId]: { ...u, level: Math.min(cap, u.level + e.levels) } };
        break;
      }
      case 'star': {
        if (!unitId) return false;
        const u = s.units[unitId];
        if (!u) return false;
        const maxStar = getMaxStar(computeMods(s));
        if (u.star >= maxStar) {
          get().toast(`すでに最大（★${maxStar}）凸です`, 'bad');
          return false;
        }
        patch.units = { ...s.units, [unitId]: { ...u, star: u.star + 1 } };
        break;
      }
      default:
        return false;
    }
    patch.items = { ...s.items, [id]: (s.items[id] || 0) - 1 };
    patch.itemsUsed = s.itemsUsed + 1;
    set(patch);
    return true;
  },

  consumeItem: (id) => {
    const s = get();
    if ((s.items[id] || 0) <= 0) return false;
    set({ items: { ...s.items, [id]: s.items[id] - 1 }, itemsUsed: s.itemsUsed + 1 });
    return true;
  },

  buyShop: (id) => {
    const s = get();
    const entry = SHOP.find((e) => e.id === id);
    if (!entry) return;
    const d = derive(s);
    const price = shopPrice(entry, d.perSecBase, s.shopBought[id] || 0);
    if (s.honshitsu < price) {
      get().toast('✝本質✝が足りない', 'bad');
      return;
    }
    const patch: Partial<GameData> = {
      honshitsu: s.honshitsu - price,
      shopBought: { ...s.shopBought, [id]: (s.shopBought[id] || 0) + 1 },
    };
    if (id === 'cans5') patch.cans = s.cans + 5;
    else patch.items = { ...s.items, [id]: (s.items[id] || 0) + 1 };
    set(patch);
  },

  openLostBox: () => {
    const s = get();
    const d = derive(s);
    const price = lostBoxPrice(d.perSecBase, s.lostBoxOpened);
    if (s.honshitsu < price) {
      get().toast('✝本質✝が足りない', 'bad');
      return null;
    }
    const id = rollEquip(LOSTBOX_WEIGHTS);
    set({ honshitsu: s.honshitsu - price, lostBoxOpened: s.lostBoxOpened + 1, items: { ...s.items, [id]: (s.items[id] || 0) + 1 } });
    return id;
  },

  winBattle: (ctx) => {
    const s = get();
    const d = derive(s);
    const m = d.m;
    const first = ctx.kind === 'story' ? !s.story[ctx.id] : ctx.kind === 'league' ? !s.league[ctx.id] : (ctx.level ?? 1) > s.endless;
    let hs = (devToPower(ctx.rec) * 0.6 + d.perSecBase * 30) * (1 + m.rewardPct) * (first ? 1.5 : 1);
    if (ctx.kind === 'endless') hs *= 1.5;
    let cans = 0;
    const gained: Record<string, number> = {};
    const add = (k: string, n: number) => {
      gained[k] = (gained[k] || 0) + n;
    };
    let unit: string | undefined;
    let sp = 0;
    if (first && ctx.reward) {
      cans += ctx.reward.cans || 0;
      if (ctx.reward.items) for (const k of Object.keys(ctx.reward.items)) add(k, ctx.reward.items[k]);
      unit = ctx.reward.unit;
    }
    if (ctx.kind === 'endless') cans += first ? 5 + Math.floor((ctx.level ?? 1) / 2) : 2;
    else if (!first) cans += ctx.kind === 'story' ? 1 : 2 + Math.floor(Math.random() * 2);
    cans = Math.floor(cans * (1 + m.canPct));
    if (first && ctx.kind === 'story') sp = 1;
    if (Math.random() < Math.min(0.95, (first ? 0.6 : 0.3) * (1 + m.dropPct))) add(rollEquip(EQUIP_WEIGHTS(ctx.rec)), 1);
    if (Math.random() < Math.min(0.95, 0.55 * (1 + m.dropPct))) add(DROP_CONSUMABLES[Math.floor(Math.random() * DROP_CONSUMABLES.length)], 1);
    const xp = Math.floor((10 + ctx.rec * 0.8) * (1 + m.xpPct));
    const items = { ...s.items };
    for (const k of Object.keys(gained)) items[k] = (items[k] || 0) + gained[k];
    const units = { ...s.units };
    let party = s.party;
    let unitResult: RewardSummary['unitResult'];
    if (unit && UNIT_MAP[unit]) {
      const cur = units[unit];
      const maxStar = getMaxStar(computeMods(s));
      if (!cur) {
        units[unit] = { level: 1, star: 0, equip: null };
        unitResult = 'new';
        const e = party.indexOf(null);
        if (e >= 0) {
          party = [...party];
          party[e] = unit;
        }
      } else if (cur.star < maxStar) {
        units[unit] = { ...cur, star: cur.star + 1 };
        unitResult = 'star';
      } else {
        unitResult = 'refund';
        cans += RARITY_REFUND[UNIT_MAP[unit].rarity];
        const cry = RARITY_CRYSTALS[UNIT_MAP[unit].rarity];
        set({ crystals: s.crystals + cry, totalCrystals: s.totalCrystals + cry });
      }
    }
    const patch: Partial<GameData> = {
      honshitsu: s.honshitsu + hs,
      totalEarned: s.totalEarned + hs,
      allTimeEarned: s.allTimeEarned + hs,
      cans: s.cans + cans,
      xp: s.xp + xp,
      items,
      units,
      party,
      bonusSP: s.bonusSP + sp,
      battlesWon: s.battlesWon + 1,
    };
    if (ctx.kind === 'story') patch.story = { ...s.story, [ctx.id]: true };
    if (ctx.kind === 'league') patch.league = { ...s.league, [ctx.id]: true };
    if (ctx.kind === 'endless') patch.endless = Math.max(s.endless, ctx.level ?? 1);
    set(patch);
    if (unit && unitResult === 'new') {
      const ud = UNIT_MAP[unit];
      const lines: Line[] = [['sys', `✝ ${ud.name}がグループに参加しました`]];
      if (ud.speaker) lines.push([ud.speaker, ud.quote]);
      get().pushLines(lines);
    }
    get().processLevel();
    return { honshitsu: hs, cans, xp, items: gained, unit, unitResult, sp, first };
  },

  loseBattle: () => {
    const s = get();
    set({ battlesLost: s.battlesLost + 1 });
    const pool: Line[][] = [
      [['mie', 'チャイム鳴ったな'], ['ryoma', '負けも✝本質✝']],
      [['rei', '部員のレベル上げたら？ 面白くなるよ']],
      [['sato', '偏差値足りてない'], ['mie', 'お前が言うな']],
      [['sakura', '敗北の第一法則：偏差値が足りない']],
    ];
    get().pushLines(pool[Math.floor(Math.random() * pool.length)]);
  },

  rebirth: () => {
    const s = get();
    const m = computeMods(s);
    const gain = rebirthGain(s, m);
    if (gain <= 0) return 0;
    const units: Record<string, OwnedUnit> = {};
    for (const id of Object.keys(s.units)) units[id] = { ...s.units[id], level: 1 };
    const lava = s.prestige['p_lava'] || 0;
    const soup = s.prestige['p_soup'] || 0;
    set({
      honshitsu: lava > 0 ? 1000 * Math.pow(10, lava) : 0,
      totalEarned: 0,
      facilities: {},
      units,
      level: 1,
      xp: 0,
      skills: {},
      buffs: [],
      maxDev: 0,
      shopBought: {},
      lostBoxOpened: 0,
      memories: s.memories + gain,
      totalMemories: s.totalMemories + gain,
      rebirths: s.rebirths + 1,
      cans: s.cans + soup * 30,
      golden: null,
      nextGolden: 30,
      clicks: 0,
      autoAcc: 0,
      canAcc: 0,
      lastTick: Date.now(),
    });
    get().pushLines([
      ['sys', `コーンスープ補充業者のトラックに轢かれて転生した……（${s.rebirths + 1}周目）`],
      ['narr', '気がつくと、また入学式だった。'],
      ['ryoma', 'お、なんか漏れてる。これまじ✝本質✝'],
      ['mie', '何周目でも言うのか'],
      ['heikatsu', '地面は忘れない'],
    ]);
    get().save();
    return gain;
  },

  ultraRebirth: () => {
    const s = get();
    const m = computeMods(s);
    const gain = ultraRebirthGain(s, m);
    if (gain <= 0) return 0;
    const units: Record<string, OwnedUnit> = {};
    for (const id of Object.keys(s.units)) units[id] = { ...s.units[id], level: 1 };

    const bonusCans = s.ultraPrestige['u_soup_ocean'] ? 500 : 0;

    set({
      honshitsu: 0,
      totalEarned: 0,
      facilities: {},
      units,
      level: 1,
      xp: 0,
      skills: {},
      buffs: [],
      maxDev: 0,
      shopBought: {},
      lostBoxOpened: 0,
      // ウルトラ転生：地面の記憶とプレステージツリーすらもリセット！
      memories: 0,
      prestige: {},
      cores: s.cores + gain,
      totalCores: s.totalCores + gain,
      ultraRebirths: s.ultraRebirths + 1,
      cans: s.cans + bonusCans,
      golden: null,
      nextGolden: 30,
      clicks: 0,
      autoAcc: 0,
      canAcc: 0,
      lastTick: Date.now(),
    });

    get().pushLines([
      ['sys', `🌌 糸魚川-静岡構造線が激しく破断し、理数科の教室が時空を超越した……（ウルトラ転生 ${s.ultraRebirths + 1}回目）`],
      ['narr', '地面の記憶すらも彼方へ消え去り、原初の✝本質✝へと回帰した。'],
      ['rei', '面白いな。世界が作り直されたよ'],
      ['ryoma', 'これが……ウルトラ転生の✝本質✝か'],
      ['mie', '転生ツリーまで消し飛ばすなよ……'],
      ['heikatsu', '地面すらも超えたか。だが地面は忘れないぞ'],
      ['kuraishi', '✝聖典✝に記します。第零章・宇宙開闢'],
    ], 1000);

    get().save();
    return gain;
  },

  buyPrestige: (id) => {
    const s = get();
    const p = PRESTIGE_MAP[id];
    if (!p) return;
    const lv = s.prestige[id] || 0;
    if (lv >= p.max) return;
    const cost = prestigeCost(p, lv);
    if (s.memories < cost) return;
    set({ memories: s.memories - cost, prestige: { ...s.prestige, [id]: lv + 1 } });
  },

  buyUltraPrestige: (id) => {
    const s = get();
    const up = ULTRA_PRESTIGE_MAP[id];
    if (!up) return;
    const lv = s.ultraPrestige[id] || 0;
    if (lv >= up.max) return;
    const cost = ultraPrestigeCost(up, lv);
    if (s.cores < cost) {
      get().toast('構造線の核が足りない', 'bad');
      return;
    }
    set({ cores: s.cores - cost, ultraPrestige: { ...s.ultraPrestige, [id]: lv + 1 } });
    get().toast(`🌌 超越強化「${up.name}」Lv${lv + 1}習得！`, 'rare');
  },

  awakenUnit: (unitId) => {
    const s = get();
    const u = s.units[unitId];
    const def = UNIT_MAP[unitId];
    if (!u || !def) return false;
    const current = s.awakening[unitId] || 0;
    const stages = getUnitAwakenings(unitId);
    if (current >= stages.length) {
      get().toast('すでに最高覚醒段階です', 'bad');
      return false;
    }
    const next = stages[current];
    if (u.star < next.reqStar) {
      get().toast(`★${next.reqStar}凸以上必要です`, 'bad');
      return false;
    }
    if (u.level < next.reqLevel) {
      get().toast(`レベル${next.reqLevel}以上必要です`, 'bad');
      return false;
    }
    if (s.honshitsu < next.costHonshitsu) {
      get().toast('✝本質✝が足りません', 'bad');
      return false;
    }
    if (s.cans < next.costCans) {
      get().toast('コーンスープ缶が足りません', 'bad');
      return false;
    }
    if (s.crystals < next.costCrystals) {
      get().toast('✝本質結晶✝が足りません', 'bad');
      return false;
    }

    set({
      honshitsu: s.honshitsu - next.costHonshitsu,
      cans: s.cans - next.costCans,
      crystals: s.crystals - next.costCrystals,
      awakening: { ...s.awakening, [unitId]: current + 1 },
    });

    get().toast(`✨ ${def.name}が「${next.title}」に本質覚醒！`, 'rare');
    get().pushLines([
      ['sys', `✝ ${def.name}が本質覚醒【第${current + 1}段階：${next.title}】を解放した！`],
      [def.speaker || 'ryoma', `「${next.flavor}」`],
    ]);
    return true;
  },

  giftBond: (unitId, itemId) => {
    const s = get();
    const u = s.units[unitId];
    const def = UNIT_MAP[unitId];
    if (!u || !def) return false;
    if ((s.items[itemId] || 0) <= 0) {
      get().toast('アイテムを持っていません', 'bad');
      return false;
    }

    const expTable: Record<string, number> = {
      hotsoup: 30,
      jiroitem: 50,
      pan: 20,
      tamago: 40,
      gyuu: 60,
    };
    const addExp = (expTable[itemId] || 25) * (1 + (computeMods(s).bondExpPct || 0));

    const curBond = s.bonds[unitId] || { exp: 0, lv: 1 };
    let nExp = curBond.exp + addExp;
    let nLv = curBond.lv;
    const reqNext = (lv: number) => Math.floor(50 * Math.pow(1.3, lv - 1));

    while (nLv < 10 && nExp >= reqNext(nLv)) {
      nExp -= reqNext(nLv);
      nLv++;
      get().toast(`❤️ ${def.name}との絆Lvが${nLv}に上がった！`, 'good');
    }

    set({
      items: { ...s.items, [itemId]: s.items[itemId] - 1 },
      bonds: { ...s.bonds, [unitId]: { exp: nExp, lv: nLv } },
    });
    return true;
  },

  buyCrystalShop: (shopId) => {
    const s = get();
    const entry = CRYSTAL_SHOP.find((e) => e.id === shopId);
    if (!entry) return false;
    if (s.crystals < entry.costCrystals) {
      get().toast('✝本質結晶✝が足りません', 'bad');
      return false;
    }

    const patch: Partial<GameData> = {
      crystals: s.crystals - entry.costCrystals,
    };

    if (entry.rewardKind === 'cans') {
      patch.cans = s.cans + entry.amount;
    } else if (entry.rewardKind === 'ticket') {
      patch.items = { ...s.items, ticket: (s.items['ticket'] || 0) + entry.amount };
    } else if (entry.rewardItemId) {
      if (entry.rewardItemId === 'core_item') {
        patch.cores = s.cores + 1;
        patch.totalCores = s.totalCores + 1;
      } else {
        patch.items = { ...s.items, [entry.rewardItemId]: (s.items[entry.rewardItemId] || 0) + entry.amount };
      }
    }

    set(patch);
    get().toast(`🛒 ${entry.name} を交換しました！`, 'good');
    return true;
  },

  claimDailyLogin: () => {
    const s = get();
    const today = new Date().toISOString().split('T')[0];
    if (s.lastLoginDate === today) {
      get().toast('今日の出席ボーナスは受取済みです', 'info');
      return false;
    }

    const nextStreak = s.loginStreak + 1;
    const dayInCycle = ((nextStreak - 1) % 7) + 1; // 1〜7日目

    const patch: Partial<GameData> = {
      lastLoginDate: today,
      loginStreak: nextStreak,
      loginClaimedDays: [...(s.loginClaimedDays || []), dayInCycle],
    };

    const items = { ...s.items };
    let msg = '';

    switch (dayInCycle) {
      case 1:
        patch.cans = s.cans + 50;
        msg = '🥫コーンスープ缶×50';
        break;
      case 2:
        items.ticket = (items.ticket || 0) + 3;
        patch.items = items;
        msg = '🎫召喚チケット×3';
        break;
      case 3:
        patch.crystals = s.crystals + 10;
        patch.totalCrystals = s.totalCrystals + 10;
        msg = '💎✝本質結晶✝×10';
        break;
      case 4:
        patch.cans = s.cans + 100;
        msg = '🥫コーンスープ缶×100';
        break;
      case 5:
        items.ticket = (items.ticket || 0) + 10;
        patch.items = items;
        msg = '🎫召喚チケット×10';
        break;
      case 6:
        items.mapcopy = (items.mapcopy || 0) + 2;
        patch.items = items;
        msg = '🗺️同じ地図（限凸素材）×2';
        break;
      case 7:
        patch.cans = s.cans + 300;
        patch.crystals = s.crystals + 30;
        patch.totalCrystals = s.totalCrystals + 30;
        items.ticket = (items.ticket || 0) + 10;
        patch.items = items;
        msg = '🥫缶×300 ＋ 💎結晶×30 ＋ 🎫チケット×10！';
        break;
    }

    set(patch);
    get().toast(`📅 出席${nextStreak}日目達成！ ${msg} を獲得！`, 'rare');
    get().pushChat('sys', `【登校】出席スタンプが押されました（通算${nextStreak}日目：${msg}獲得）`);
    return true;
  },

  claimUpdateGift: () => {
    const s = get();
    if (s.claimedUpdateGift) return false;
    set({
      cans: s.cans + 450,
      claimedUpdateGift: true,
    });
    get().toast('🎉 大型アプデ記念！🥫コーンスープ450缶を受け取りました！', 'rare');
    get().pushLines([
      ['sys', '【アプデ記念】北棟の自販機に奇跡の大量補充！理数科生徒全員に🥫コーンスープ450缶を配布しました'],
      ['ryoma', '450個はまじ✝本質✝。自販機壊れたのか？'],
      ['mie', '450本も自販機に入るわけないだろ'],
      ['sato', '……あるときよりないときの方が本質だったが、450本あるなら飲む'],
      ['rei', '面白いな'],
      ['heikatsu', '冬場に温かいスープがあるのは、地殻の恩恵だ'],
    ], 1100);
    return true;
  },

  checkAchievements: () => {
    const s = get();
    const d = derive(s);
    const newly = ACHIEVEMENTS.filter((a) => !s.achievements[a.id] && a.cond(s, d));
    if (!newly.length) return;
    const ach = { ...s.achievements };
    let cans = 0;
    for (const a of newly) {
      ach[a.id] = true;
      cans += a.reward;
    }
    set({ achievements: ach, cans: s.cans + cans });
    for (const a of newly) {
      get().toast(`🏆 実績「${a.name}」解除！ 🥫+${a.reward}`, 'good');
      get().pushChat('kuraishi', `記録しました。実績「${a.name}」。✝本質✝年鑑に追記します`);
    }
  },

  pushChat: (s, t) => {
    set((st) => ({ chat: [...st.chat, { id: ++msgId, s, t }].slice(-80) }));
  },

  pushLines: (lines, gap = 1100) => {
    lines.forEach((l, i) => {
      setTimeout(() => get().pushChat(l[0], l[1]), i * gap);
    });
  },

  toast: (text, kind = 'info') => {
    const id = ++toastId;
    set((st) => ({ toasts: [...st.toasts, { id, text, kind }].slice(-5) }));
    setTimeout(() => set((st) => ({ toasts: st.toasts.filter((t) => t.id !== id) })), 3800);
  },

  userSay: (text) => {
    const t = text.slice(0, 80);
    get().pushChat('you', t);
    const lines = replyTo(t);
    lines.forEach((l, i) => setTimeout(() => get().pushChat(l[0], l[1]), 700 + i * 1000));
  },

  markTitleSeen: () => set({ seenTitle: true }),

  hardReset: () => {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* ignore */
    }
    set({ ...fresh() });
  },

  exportSave: () => {
    get().save();
    return toB64(serialize(get()));
  },

  importSave: (str) => {
    try {
      const json = fromB64(str.trim());
      const data = JSON.parse(json);
      if (!data || typeof data !== 'object' || typeof data.honshitsu !== 'number') return false;
      set({ ...sanitize(data), lastTick: Date.now() });
      get().save();
      return true;
    } catch {
      return false;
    }
  },
}));

export { RARITIES };
