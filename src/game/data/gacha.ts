import type { GachaPoolDef, GachaPoolId } from '../types';

export const GACHA_POOLS: GachaPoolDef[] = [
  {
    id: 'standard',
    name: '北棟の自販機（恒常召喚）',
    subtitle: 'コーンスープ缶を捧げると、✝本質✝が応える',
    desc: '全部員がバランスよく排出される北棟の伝説的自販機。冬でも温かい。',
    emoji: '🥫',
    currency: 'can',
    featuredIds: ['rei', 'heikatsu', 'feikatsu', 'pregen', 'ryoma', 'mie', 'terachi', 'sato'],
    bannerGradient: 'from-rose-600 via-rose-700 to-rose-900',
  },
  {
    id: 'pickup_b',
    name: '理数科B組ピックアップ',
    subtitle: '南棟打倒！ 理数科の核となる面々が集結',
    desc: '両馬二郎、数理零、ヘイカツ、寺地星、三重県臣のピックアップ排出率UP！',
    emoji: '📐',
    currency: 'can',
    featuredIds: ['rei', 'heikatsu', 'ryoma', 'terachi', 'mie'],
    bannerGradient: 'from-purple-600 via-indigo-700 to-slate-900',
  },
  {
    id: 'pickup_inner',
    name: '内進・学術セレクション',
    subtitle: '偏差値の向こう側へ——紺ネクタイと狂信者たち',
    desc: '倉石暁、櫻優、召野カイト、三峰瑠衣、二見玲子、内藤蘭がピックアップ！',
    emoji: '📜',
    currency: 'can',
    featuredIds: ['kuraishi', 'sakura', 'meshino', 'mitsumine', 'futami', 'naito'],
    bannerGradient: 'from-pink-600 via-rose-800 to-amber-950',
  },
  {
    id: 'essence',
    name: '購買部・本質友情召喚',
    subtitle: '余剰な✝本質✝で引ける！ 部活の備品と助っ人',
    desc: '缶ではなく✝本質✝を消費して召喚。各種アイテムや装備、稀に部員も出現！',
    emoji: '🏪',
    currency: 'honshitsu',
    featuredIds: ['pan', 'tamago', 'jiro', 'izaki', 'izumi', 'cornsoup'],
    bannerGradient: 'from-emerald-600 via-teal-700 to-cyan-900',
  },
];

export const POOL_MAP: Record<GachaPoolId, GachaPoolDef> = Object.fromEntries(
  GACHA_POOLS.map((p) => [p.id, p])
) as Record<GachaPoolId, GachaPoolDef>;
