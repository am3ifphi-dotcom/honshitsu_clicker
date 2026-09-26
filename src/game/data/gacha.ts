import type { GachaPoolDef, GachaPoolId } from '../types';

export const GACHA_POOLS: GachaPoolDef[] = [
  {
    id: 'standard',
    name: '北棟の自販機（部員召喚）',
    subtitle: 'コーンスープ缶を捧げると、✝本質✝が応える',
    desc: '理数科B組の生徒や内進生、先生たちが排出される基本召喚。重複で限界突破！',
    emoji: '🥫',
    currency: 'can',
    featuredIds: ['rei', 'heikatsu', 'feikatsu', 'pregen', 'ryoma', 'mie', 'terachi', 'sato'],
    bannerGradient: 'from-rose-600 via-rose-700 to-rose-900',
  },
  {
    id: 'artifact',
    name: '✝聖典✝ 秘宝・神器召喚（装備ガチャ）',
    subtitle: '部員を劇的に強化する原作の特級装備・聖遺物！',
    desc: '倉石の修正液ブレザー、ヘイカツの地形図定規、零の首席問題用紙など伝説の装備が出現！',
    emoji: '📜',
    currency: 'can',
    featuredIds: ['arte_kuraishi', 'arte_heikatsu', 'arte_rei', 'arte_terachi', 'arte_mitsumine'],
    bannerGradient: 'from-amber-600 via-orange-700 to-amber-950',
  },
  {
    id: 'abyss',
    name: '🌌 構造線の深淵召喚（ウルトラ超越ガチャ）',
    subtitle: 'ウルトラ転生の彼方から現れる神格化EX部員！',
    desc: '構造線の核または✝本質結晶✝で引く最上位召喚。EX神格化部員や超常アーティファクトのみ排出！',
    emoji: '🌌',
    currency: 'core',
    featuredIds: ['ex_ryoma', 'ex_rei', 'ex_heikatsu', 'ex_terachi', 'ex_mie'],
    bannerGradient: 'from-purple-700 via-indigo-900 to-black',
  },
];

export const POOL_MAP: Record<GachaPoolId, GachaPoolDef> = Object.fromEntries(
  GACHA_POOLS.map((p) => [p.id, p])
) as Record<GachaPoolId, GachaPoolDef>;
