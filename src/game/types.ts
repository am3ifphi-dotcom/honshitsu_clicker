export type Rarity = 'N' | 'R' | 'SR' | 'SSR' | 'UR' | 'LR';
export type UnitType = '本質' | '冷笑' | '面白' | '地理' | '恋愛';
export type SkillKind = 'nuke' | 'aoe' | 'heal' | 'buff' | 'stun' | 'multi' | 'gamble' | 'shield';

export interface SkillDef {
  name: string;
  kind: SkillKind;
  power: number;
  duration?: number;
  hits?: number;
  charge: number;
  line: string;
  desc: string;
}

export interface Mods {
  clickPct: number;
  clickX: number;
  clickFromPS: number;
  critChance: number;
  critMult: number;
  prodPct: number;
  prodX: number;
  unitProdPct: number;
  costReduce: number;
  atkPct: number;
  hpPct: number;
  spdPct: number;
  dmgX: number;
  statX: number;
  dmgReduce: number;
  gaugePct: number;
  shieldPct: number;
  revive: number;
  berserk: number;
  enemyGaugeSlow: number;
  dropPct: number;
  rewardPct: number;
  ssrBonus: number;
  goldenRate: number;
  goldenCan: number;
  offlineHours: number;
  xpPct: number;
  levelCap: number;
  autoClick: number;
  tenGuarantee: number;
  pityReduce: number;
  canPct: number;
  memoryPct: number;
  typeAtk: Record<UnitType, number>;
  // ウルトラ転生・拡張モディファイア
  ultraProdX: number;
  ultraStatX: number;
  autoGachaSpeed: number;
  maxStarBonus: number;
  corePct: number;
  crystalBonus: number;
  bondExpPct: number;
}

export type ModPatch = Partial<Omit<Mods, 'typeAtk'>> & { typeAtk?: Partial<Record<UnitType, number>> };

export interface PassiveDef {
  desc: string;
  scope: 'owned' | 'party';
  mods: ModPatch;
}

export interface UnitDef {
  id: string;
  name: string;
  title: string;
  rarity: Rarity;
  type: UnitType;
  emoji: string;
  portrait?: string;
  atk: number;
  hp: number;
  spd: number;
  prod: number;
  skill: SkillDef;
  passive: PassiveDef;
  quote: string;
  desc: string;
  speaker?: string;
}

export type ConsumableEffect =
  | { kind: 'healAll'; pct: number }
  | { kind: 'atkBuff'; mult: number; duration: number }
  | { kind: 'reviveOne' }
  | { kind: 'gaugeFull' }
  | { kind: 'enemyDmg'; mult: number }
  | { kind: 'prodBuff'; mult: number; duration: number }
  | { kind: 'clickBuff'; mult: number; duration: number }
  | { kind: 'honshitsu'; seconds: number }
  | { kind: 'golden' }
  | { kind: 'ticket' }
  | { kind: 'sp' }
  | { kind: 'levelUp'; levels: number }
  | { kind: 'star' };

export interface EquipStats {
  atkPct?: number;
  hpPct?: number;
  spdPct?: number;
  crit?: number;
  gaugePct?: number;
  prodPct?: number;
  typeBonus?: { type: UnitType; atkPct: number };
}

export interface ItemDef {
  id: string;
  name: string;
  emoji: string;
  rarity: Rarity;
  kind: 'consumable' | 'equip';
  desc: string;
  flavor: string;
  scene?: 'battle' | 'field' | 'unit' | 'gacha';
  effect?: ConsumableEffect;
  equip?: EquipStats;
}

export interface FacilityDef {
  id: string;
  name: string;
  emoji: string;
  baseCost: number;
  baseProd: number;
  desc: string;
  flavor: string;
}

export type Line = [string, string];

export interface EnemySkill {
  name: string;
  kind: 'aoe' | 'nuke' | 'stun' | 'heal' | 'buff';
  power: number;
  duration?: number;
  line: string;
}

export interface EnemyDef {
  name: string;
  emoji: string;
  w: number;
  boss?: boolean;
  spd?: number;
  skill?: EnemySkill;
}

export interface Reward {
  cans?: number;
  unit?: string;
  items?: Record<string, number>;
}

export interface Chapter {
  id: string;
  arc: string;
  no: string;
  title: string;
  rec: number;
  intro: Line[];
  enemies: EnemyDef[];
  outro: Line[];
  reward: Reward;
}

export interface School {
  id: string;
  name: string;
  emoji: string;
  dev: number;
  motto: string;
  color: string;
  enemies: EnemyDef[];
  reward: Reward;
}

export type BranchId = 'honshitsu' | 'reisho' | 'omoshiro' | 'chikei' | 'renai';

export interface SkillNode {
  id: string;
  branch: BranchId;
  name: string;
  desc: string;
  max: number;
  cost: number;
  req: string[];
  tier: number;
  mods: (rank: number) => ModPatch;
  capstone?: boolean;
}

export interface PrestigeDef {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  max: number;
  baseCost: number;
  costMult: number;
  mods: (lv: number) => ModPatch;
}

export interface UltraPrestigeDef {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  max: number;
  baseCost: number;
  costMult: number;
  mods: (lv: number) => ModPatch;
}

export interface AwakeningStage {
  title: string;
  desc: string;
  reqLevel: number;
  reqStar: number;
  costCans: number;
  costCrystals: number;
  costHonshitsu: number;
  statMult: number;
  prodMult: number;
  flavor: string;
}

export type GachaPoolId = 'standard' | 'artifact' | 'abyss';

export interface GachaPoolDef {
  id: GachaPoolId;
  name: string;
  subtitle: string;
  desc: string;
  emoji: string;
  currency: 'can' | 'crystal' | 'core';
  featuredIds: string[];
  bannerGradient: string;
}

export interface OwnedUnit {
  level: number;
  star: number;
  equip: string | null;
}

export interface Buff {
  id: string;
  name: string;
  kind: 'prod' | 'click';
  mult: number;
  until: number;
}

export interface ChatMsg {
  id: number;
  s: string;
  t: string;
}

export interface Toast {
  id: number;
  text: string;
  kind: 'info' | 'good' | 'rare' | 'bad';
}

export interface Golden {
  id: number;
  x: number;
  y: number;
  until: number;
}

export interface GameData {
  honshitsu: number;
  totalEarned: number;
  allTimeEarned: number;
  cans: number;
  memories: number;
  totalMemories: number;
  rebirths: number;
  // ウルトラ転生
  ultraRebirths: number;
  cores: number;
  totalCores: number;
  ultraPrestige: Record<string, number>;
  // 本質結晶（凸余剰還元＆交換所）
  crystals: number;
  totalCrystals: number;
  // 部員新育成要素（本質覚醒 & 放課後絆）
  awakening: Record<string, number>;
  bonds: Record<string, { exp: number; lv: number }>;
  // ログボ＆アプデ記念プレゼント
  claimedUpdateGift: boolean;
  lastLoginDate: string;
  loginStreak: number;
  loginClaimedDays: number[];
  clicks: number;
  allClicks: number;
  facilities: Record<string, number>;
  units: Record<string, OwnedUnit>;
  party: (string | null)[];
  items: Record<string, number>;
  skills: Record<string, number>;
  prestige: Record<string, number>;
  level: number;
  xp: number;
  bonusSP: number;
  story: Record<string, boolean>;
  league: Record<string, boolean>;
  endless: number;
  pulls: number;
  pity: number;
  achievements: Record<string, boolean>;
  buffs: Buff[];
  maxDev: number;
  bestDev: number;
  goldenClicks: number;
  itemsUsed: number;
  battlesWon: number;
  battlesLost: number;
  shopBought: Record<string, number>;
  lostBoxOpened: number;
  canAcc: number;
  autoAcc: number;
  nextGolden: number;
  lastTick: number;
  lastSave: number;
  hadZeroCans: boolean;
  seenTitle: boolean;
  golden: Golden | null;
  chat: ChatMsg[];
  toasts: Toast[];
}

export interface RewardSummary {
  honshitsu: number;
  cans: number;
  xp: number;
  items: Record<string, number>;
  unit?: string;
  unitResult?: 'new' | 'star' | 'refund';
  sp: number;
  first: boolean;
}

export interface PullResult {
  id: string;
  isNew: boolean;
  star: number;
  refund: number;
  crystals: number;
  kind?: 'unit' | 'equip';
  equipId?: string;
}
