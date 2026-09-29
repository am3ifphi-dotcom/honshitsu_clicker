import type { GameData, Mods, ModPatch, OwnedUnit, Rarity, UnitDef, UnitType } from './types';
import { SKILL_NODES, PRESTIGE, NODE_MAP, ULTRA_PRESTIGE } from './data/skills';
import { getUnitForm } from './data/units';
import { ITEM_MAP } from './data/items';
import { FACILITIES } from './data/facilities';
import { getUnitAwakenings } from './data/awakening';

export const TYPES: UnitType[] = ['本質', '冷笑', '面白', '地理', '恋愛'];
export const RARITIES: Rarity[] = ['N', 'R', 'SR', 'SSR', 'UR', 'LR', 'EX'];
export const rarityRank = (r: Rarity) => RARITIES.indexOf(r);

export const RARITY_COST: Record<Rarity, number> = { N: 8, R: 20, SR: 50, SSR: 120, UR: 300, LR: 800, EX: 1400 };
export const RARITY_PROD_PCT: Record<Rarity, number> = { N: 0.01, R: 0.03, SR: 0.08, SSR: 0.20, UR: 0.50, LR: 1.00, EX: 1.5 };

// 缶の重複還元は0。結晶還元と交換所価格も上限を設定し、最悪の連続LRでも自己増殖しない。
export const RARITY_REFUND: Record<Rarity, number> = { N: 0, R: 0, SR: 0, SSR: 0, UR: 0, LR: 0, EX: 0 };
export const RARITY_CRYSTALS: Record<Rarity, number> = { N: 0, R: 0, SR: 0, SSR: 1, UR: 2, LR: 3, EX: 0 };
export const crystalReturnMultiplier = (m: Mods) => 1 + Math.min(1, Math.max(0, m.crystalBonus || 0));

export const BASE_MAX_STAR = 15;
export const getMaxStar = (m: Mods) => BASE_MAX_STAR + (m.maxStarBonus || 0);

export const devToPower = (dev: number) => 50 * (Math.pow(10, (dev - 40) / 15) - 1);
export const powerToDev = (p: number) => 40 + 15 * Math.log10(1 + Math.max(0, p) / 50);

export function baseMods(): Mods {
  return {
    clickPct: 0, clickX: 1, clickFromPS: 0.01, critChance: 0.02, critMult: 5,
    prodPct: 0, prodX: 1, unitProdPct: 0, costReduce: 0,
    atkPct: 0, hpPct: 0, spdPct: 0, dmgX: 1, statX: 1, dmgReduce: 0, gaugePct: 0, shieldPct: 0,
    revive: 0, berserk: 0, enemyGaugeSlow: 0, dropPct: 0, rewardPct: 0, ssrBonus: 0,
    goldenRate: 0, goldenCan: 0, offlineHours: 0, xpPct: 0, levelCap: 0, autoClick: 0,
    tenGuarantee: 0, pityReduce: 0, canPct: 0, memoryPct: 0,
    typeAtk: { 本質: 0, 冷笑: 0, 面白: 0, 地理: 0, 恋愛: 0 },
    ultraProdX: 1, ultraStatX: 1, autoGachaSpeed: 0, maxStarBonus: 0, corePct: 0, crystalBonus: 0, bondExpPct: 0,
  };
}

type NumKey = Exclude<keyof Mods, 'typeAtk'>;
const MULT_KEYS: NumKey[] = ['clickX', 'prodX', 'dmgX', 'statX', 'ultraProdX', 'ultraStatX'];

export function addMods(m: Mods, p: ModPatch) {
  for (const k of Object.keys(p) as (keyof ModPatch)[]) {
    if (k === 'typeAtk') {
      const t = p.typeAtk;
      if (!t) continue;
      for (const ty of Object.keys(t) as UnitType[]) m.typeAtk[ty] += t[ty] ?? 0;
      continue;
    }
    const v = p[k as NumKey];
    if (typeof v !== 'number') continue;
    const key = k as NumKey;
    if (MULT_KEYS.includes(key)) m[key] *= v;
    else m[key] += v;
  }
}

export function computeMods(s: GameData): Mods {
  const m = baseMods();
  for (const node of SKILL_NODES) {
    const r = s.skills[node.id] || 0;
    if (r > 0) addMods(m, node.mods(r));
  }
  for (const p of PRESTIGE) {
    const lv = s.prestige[p.id] || 0;
    if (lv > 0) addMods(m, p.mods(lv));
  }
  // ウルトラ転生ツリー
  if (s.ultraPrestige) {
    for (const up of ULTRA_PRESTIGE) {
      const lv = s.ultraPrestige[up.id] || 0;
      if (lv > 0) addMods(m, up.mods(lv));
    }
  }
  for (const id of Object.keys(s.units)) {
    const def = getUnitForm(id, !!s.evolvedUnits?.[id]);
    if (!def) continue;
    if (def.passive.scope === 'owned' || s.party.includes(id)) addMods(m, def.passive.mods);
  }
  return m;
}

export interface UnitStats {
  atk: number;
  hp: number;
  spd: number;
  crit: number;
  gaugePct: number;
  power: number;
  prod: number;
  cap: number;
  starMul: number;
  awakenStatMul: number;
  awakenProdMul: number;
}

export const levelCap = (u: OwnedUnit, m: Mods) => 50 + 10 * u.star + m.levelCap;

export function unitStats(def: UnitDef, u: OwnedUnit, m: Mods, s?: GameData): UnitStats {
  const eq = u.equip ? ITEM_MAP[u.equip]?.equip : undefined;
  const lvMul = Math.pow(1.055, u.level - 1);
  // 凸倍率：★1〜★15以上
  const starMul = 1 + 0.35 * u.star + (u.star >= 5 ? 0.5 : 0) + (u.star >= 10 ? 1.0 : 0) + (u.star >= 15 ? 2.0 : 0);
  
  // 覚醒倍率
  let awakenStatMul = 1;
  let awakenProdMul = 1;
  if (s?.awakening) {
    const stage = s.awakening[def.id] || 0;
    const stages = getUnitAwakenings(def.id);
    for (let i = 0; i < stage; i++) {
      if (stages[i]) {
        awakenStatMul += stages[i].statMult;
        awakenProdMul += stages[i].prodMult;
      }
    }
  }

  // 絆倍率
  let bondStatMul = 1;
  let bondProdMul = 1;
  if (s?.bonds?.[def.id]) {
    const bondLv = s.bonds[def.id].lv || 1;
    bondStatMul += (bondLv - 1) * 0.1;
    bondProdMul += (bondLv - 1) * 0.15;
  }

  const typeB = m.typeAtk[def.type] + (eq?.typeBonus && eq.typeBonus.type === def.type ? eq.typeBonus.atkPct : 0);
  const totalStatX = m.statX * (m.ultraStatX || 1) * awakenStatMul * bondStatMul;
  const atk = def.atk * lvMul * starMul * Math.max(0.1, 1 + m.atkPct + (eq?.atkPct ?? 0) + typeB) * totalStatX;
  const hp = def.hp * lvMul * starMul * Math.max(0.1, 1 + m.hpPct + (eq?.hpPct ?? 0)) * totalStatX;
  const spd = def.spd * (1 + m.spdPct + (eq?.spdPct ?? 0));
  const crit = 0.05 + (eq?.crit ?? 0);
  const gaugePct = m.gaugePct + (eq?.gaugePct ?? 0);
  const power = 2 * atk * spd * m.dmgX * (1 + crit) + (0.25 * hp) / (1 - Math.min(0.85, m.dmgReduce));
  
  // 部員の本質生産：レベル、凸、覚醒、絆、装備が乗算
  const prod = def.prod * Math.pow(1.08, u.level - 1) * starMul * awakenProdMul * bondProdMul * (1 + (eq?.prodPct ?? 0));
  
  return { atk, hp, spd, crit, gaugePct, power, prod, cap: levelCap(u, m), starMul, awakenStatMul, awakenProdMul };
}

export const MILESTONES = [10, 25, 50, 100, 150, 200, 300, 400, 500, 750, 1000, 1500, 2000, 3000, 5000];
export function milestoneMult(n: number) {
  let c = 0;
  for (const t of MILESTONES) if (n >= t) c++;
  return Math.pow(2, c);
}
export const nextMilestone = (n: number) => MILESTONES.find((t) => t > n) ?? null;

export interface Derived {
  m: Mods;
  perSec: number;
  perSecBase: number;
  clickPower: number;
  clickBase: number;
  power: number;
  battleDev: number;
  prodDev: number;
  clickDev: number;
  totalDev: number;
  prodBuff: number;
  clickBuff: number;
  globalMult: number;
}

export function derive(s: GameData): Derived {
  const m = computeMods(s);
  const now = Date.now();
  let prodBuff = 1;
  let clickBuff = 1;
  for (const b of s.buffs) {
    if (b.until > now) {
      if (b.kind === 'prod') prodBuff *= b.mult;
      else clickBuff *= b.mult;
    }
  }
  let facRaw = 0;
  for (const f of FACILITIES) {
    const n = s.facilities[f.id] || 0;
    if (n > 0) facRaw += f.baseProd * n * milestoneMult(n);
  }
  let unitFlat = 0;
  let unitGlobal = 0;
  for (const id of Object.keys(s.units)) {
    const def = getUnitForm(id, !!s.evolvedUnits?.[id]);
    if (!def) continue;
    const u = s.units[id];
    unitFlat += unitStats(def, u, m, s).prod;
    unitGlobal += RARITY_PROD_PCT[def.rarity] * u.level * (1 + 0.35 * u.star);
  }
  const G = (1 + m.prodPct + unitGlobal) * m.prodX * (m.ultraProdX || 1);
  const perSecBase = (facRaw + unitFlat * (1 + m.unitProdPct)) * G;
  const perSec = perSecBase * prodBuff;
  const clickBase = (1 + m.clickPct) * m.clickX + perSecBase * m.clickFromPS;
  const clickPower = clickBase * clickBuff;
  let power = 0;
  for (const id of s.party) {
    if (!id) continue;
    const def = getUnitForm(id, !!s.evolvedUnits?.[id]);
    const u = s.units[id];
    if (!def || !u) continue;
    power += unitStats(def, u, m, s).power;
  }
  const battleDev = powerToDev(power);
  const prodDev = 40 + 7 * Math.log10(1 + perSecBase);
  const clickDev = 40 + 7 * Math.log10(1 + clickBase);
  const totalDev = battleDev * 0.5 + prodDev * 0.25 + clickDev * 0.25;
  return { m, perSec, perSecBase, clickPower, clickBase, power, battleDev, prodDev, clickDev, totalDev, prodBuff, clickBuff, globalMult: G * prodBuff };
}

export const xpToNext = (lv: number) => Math.floor(25 * Math.pow(1.18, lv - 1));

export function spTotal(s: GameData) {
  return s.level - 1 + s.bonusSP;
}
export function spSpent(s: GameData) {
  let t = 0;
  for (const id of Object.keys(s.skills)) {
    const n = NODE_MAP[id];
    if (n) t += (s.skills[id] || 0) * n.cost;
  }
  return t;
}

export function gradeName(lv: number) {
  if (lv < 10) return '1年生';
  if (lv < 20) return '2年生';
  if (lv < 30) return '3年生';
  return `留年${lv - 29}年目`;
}

const TIERS: [number, string][] = [
  [1000, '✝真・前-原✝本質✝（宇宙開闢）'],
  [750, '構造線の支配者'],
  [500, '時空超越の理数科'],
  [350, '全知全能のコーンスープ'],
  [250, 'グレートチェーン絶対特異点'],
  [200, '前-原✝本質✝'],
  [150, '✝本質✝（測定不能）'],
  [120, '地形図の向こう側'],
  [100, '偏差値の向こう側'],
  [90, '模試の枠が足りない'],
  [85, '零の領域（家が近い）'],
  [80, '「なんで理数科に？」'],
  [75, '模試の掲示板に載る'],
  [70, '南棟レベル（紺ネクタイ）'],
  [65, '内進が気にし始める'],
  [60, '理数科（標準）'],
  [55, '理数科見習い'],
  [50, '一般高校生'],
  [45, '金曜五限の睡魔'],
  [0, '北棟の室外機'],
];
export function devTier(d: number) {
  for (const [v, l] of TIERS) if (d >= v) return l;
  return '北棟の室外機';
}

export interface Judge {
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  color: string;
  note: string;
}
export function judge(my: number, rec: number): Judge {
  const d = my - rec;
  if (d >= 3) return { grade: 'A', color: '#34d399', note: '余裕。✝本質✝的に勝てる' };
  if (d >= 1) return { grade: 'B', color: '#a3e635', note: 'たぶん勝てる' };
  if (d >= -1) return { grade: 'C', color: '#facc15', note: '五分五分（波動関数）' };
  if (d >= -4) return { grade: 'D', color: '#fb923c', note: '厳しい。部員を育てよう' };
  return { grade: 'E', color: '#f87171', note: '無謀。三重に「は？」と言われる' };
}

export function rebirthGain(s: GameData, m: Mods) {
  if (s.maxDev < 60) return 0;
  return Math.floor(Math.pow((s.maxDev - 55) / 5, 2) * (1 + m.memoryPct));
}

// 🌌 ウルトラ転生（超越）で獲得する構造線の核（総合偏差値120で解放）
export function ultraRebirthGain(s: GameData, m: Mods) {
  if (s.maxDev < 120) return 0;
  return Math.floor(Math.pow((s.maxDev - 115) / 4, 2.2) * (1 + (m.corePct || 0)));
}

export const unitLevelCost = (def: UnitDef, lv: number) => RARITY_COST[def.rarity] * Math.pow(1.15, lv - 1);

export const FAC_GROWTH = 1.15;
export function bulkCost(base: number, owned: number, n: number) {
  return (base * Math.pow(FAC_GROWTH, owned) * (Math.pow(FAC_GROWTH, n) - 1)) / (FAC_GROWTH - 1);
}
export function maxAffordable(base: number, owned: number, money: number) {
  const first = base * Math.pow(FAC_GROWTH, owned);
  if (money < first) return 0;
  return Math.floor(Math.log((money * (FAC_GROWTH - 1)) / first + 1) / Math.log(FAC_GROWTH));
}

export function gachaRates(m: Mods): Record<Rarity, number> {
  const LR = 0.003 + m.ssrBonus * 0.05;
  const UR = 0.015 + m.ssrBonus * 0.25;
  const SSR = 0.06 + m.ssrBonus;
  const SR = 0.22;
  const R = 0.35;
  const N = Math.max(0, 1 - LR - UR - SSR - SR - R);
  return { N, R, SR, SSR, UR, LR, EX: 0 };
}

export function pityMax(m: Mods) {
  return Math.max(25, 75 - m.pityReduce);
}

export function rollWeighted<T extends string>(weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((a, [, w]) => a + w, 0);
  let r = Math.random() * total;
  for (const [k, w] of entries) {
    r -= w;
    if (r <= 0) return k;
  }
  return entries[0][0];
}
