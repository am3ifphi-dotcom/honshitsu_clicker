import type { BranchId, PrestigeDef, SkillNode } from '../types';

export interface BranchDef {
  id: BranchId;
  name: string;
  emoji: string;
  color: string;
  desc: string;
}

export const BRANCHES: BranchDef[] = [
  { id: 'honshitsu', name: '✝本質✝ルート', emoji: '✝', color: '#a855f7', desc: 'クリック特化。指一本で✝本質✝を漏らす両馬型ビルド。' },
  { id: 'reisho', name: '冷笑ルート', emoji: '🧊', color: '#38bdf8', desc: '耐久特化。全てを「は？」で受け流す三重型ビルド。' },
  { id: 'omoshiro', name: '面白いルート', emoji: '😆', color: '#fb923c', desc: '放置生産特化。「面白い」を毎年抱負にする零型ビルド。' },
  { id: 'chikei', name: '地形図ルート', emoji: '🗺️', color: '#34d399', desc: '戦闘火力特化。地形図の向こう側を見るヘイカツ型ビルド。' },
  { id: 'renai', name: '恋愛学ルート', emoji: '💘', color: '#f472b6', desc: '運・召喚特化。理論が崩壊しても前に進む櫻型ビルド。' },
];

export const SKILL_NODES: SkillNode[] = [
  // ✝本質✝
  { id: 'h1', branch: 'honshitsu', tier: 0, name: 'これまじ✝本質✝', desc: 'クリック力 +100%／ランク', max: 10, cost: 1, req: [], mods: (r) => ({ clickPct: 1 * r }) },
  { id: 'h2', branch: 'honshitsu', tier: 1, name: 'まじ✝本質✝（会心）', desc: 'クリック会心率 +2%／ランク', max: 10, cost: 1, req: ['h1'], mods: (r) => ({ critChance: 0.02 * r }) },
  { id: 'h3', branch: 'honshitsu', tier: 1, name: '自己対話', desc: 'クリックに毎秒本質の +1% を加算／ランク', max: 5, cost: 1, req: ['h1'], mods: (r) => ({ clickFromPS: 0.01 * r }) },
  { id: 'h4', branch: 'honshitsu', tier: 2, name: '✝✝（二重十字）', desc: 'クリック会心倍率 +2／ランク', max: 5, cost: 1, req: ['h2'], mods: (r) => ({ critMult: 2 * r }) },
  { id: 'h7', branch: 'honshitsu', tier: 2, name: '修正液で刻む', desc: '本質タイプのATK +20%／ランク', max: 5, cost: 1, req: ['h1'], mods: (r) => ({ typeAtk: { 本質: 0.2 * r } }) },
  { id: 'h5', branch: 'honshitsu', tier: 2, name: '本質は降りてくる', desc: '黄金✝の出現率 +20%／ランク', max: 5, cost: 1, req: ['h3'], mods: (r) => ({ goldenRate: 0.2 * r }) },
  { id: 'h6', branch: 'honshitsu', tier: 3, name: '✝本質✝に教祖はいない', desc: '【奥義】クリック力 ×3', max: 1, cost: 3, req: ['h4', 'h5'], capstone: true, mods: () => ({ clickX: 3 }) },
  // 冷笑
  { id: 'r1', branch: 'reisho', tier: 0, name: 'は？', desc: '部員HP +15%／ランク', max: 10, cost: 1, req: [], mods: (r) => ({ hpPct: 0.15 * r }) },
  { id: 'r2', branch: 'reisho', tier: 1, name: 'まあ（二回）', desc: '被ダメージ -4%／ランク', max: 5, cost: 1, req: ['r1'], mods: (r) => ({ dmgReduce: 0.04 * r }) },
  { id: 'r3', branch: 'reisho', tier: 1, name: 'パターン認識', desc: '敵のスキルゲージ増加 -8%／ランク', max: 5, cost: 1, req: ['r1'], mods: (r) => ({ enemyGaugeSlow: 0.08 * r }) },
  { id: 'r4', branch: 'reisho', tier: 2, name: '否定の守護者', desc: '戦闘開始時、HP10%のバリア／ランク', max: 3, cost: 1, req: ['r2'], mods: (r) => ({ shieldPct: 0.1 * r }) },
  { id: 'r7', branch: 'reisho', tier: 2, name: '冷笑系を自認', desc: '冷笑タイプのATK +25%／ランク', max: 5, cost: 1, req: ['r1'], mods: (r) => ({ typeAtk: { 冷笑: 0.25 * r } }) },
  { id: 'r5', branch: 'reisho', tier: 2, name: '否定しない（全肯定）', desc: '部員ATK・HP +5%／ランク', max: 5, cost: 1, req: ['r3'], mods: (r) => ({ atkPct: 0.05 * r, hpPct: 0.05 * r }) },
  { id: 'r6', branch: 'reisho', tier: 3, name: '冷笑の向こう側', desc: '【奥義】HP50%以下の部員の攻撃 ×2', max: 1, cost: 3, req: ['r4', 'r5'], capstone: true, mods: () => ({ berserk: 1 }) },
  // 面白い
  { id: 'o1', branch: 'omoshiro', tier: 0, name: '面白い', desc: '毎秒本質 +25%／ランク', max: 10, cost: 1, req: [], mods: (r) => ({ prodPct: 0.25 * r }) },
  { id: 'o2', branch: 'omoshiro', tier: 1, name: '全部繋がってる', desc: '本質発生源のコスト -3%／ランク', max: 5, cost: 1, req: ['o1'], mods: (r) => ({ costReduce: 0.03 * r }) },
  { id: 'o3', branch: 'omoshiro', tier: 1, name: 'ロマンない？', desc: '部員の生産 +40%／ランク', max: 5, cost: 1, req: ['o1'], mods: (r) => ({ unitProdPct: 0.4 * r }) },
  { id: 'o4', branch: 'omoshiro', tier: 2, name: '毎年同じ抱負', desc: 'オフライン報酬の上限 +2時間／ランク', max: 5, cost: 1, req: ['o2'], mods: (r) => ({ offlineHours: 2 * r }) },
  { id: 'o7', branch: 'omoshiro', tier: 2, name: '零の評価軸', desc: '面白タイプのATK +20%／ランク', max: 5, cost: 1, req: ['o1'], mods: (r) => ({ typeAtk: { 面白: 0.2 * r } }) },
  { id: 'o5', branch: 'omoshiro', tier: 2, name: '面白いの基準が広い', desc: '学年XP +15%／ランク', max: 5, cost: 1, req: ['o3'], mods: (r) => ({ xpPct: 0.15 * r }) },
  { id: 'o6', branch: 'omoshiro', tier: 3, name: '面白いことを探す', desc: '【奥義】全生産 ×2', max: 1, cost: 3, req: ['o4', 'o5'], capstone: true, mods: () => ({ prodX: 2 }) },
  // 地形図
  { id: 'c1', branch: 'chikei', tier: 0, name: '等高線を読む', desc: '部員ATK +15%／ランク', max: 10, cost: 1, req: [], mods: (r) => ({ atkPct: 0.15 * r }) },
  { id: 'c2', branch: 'chikei', tier: 1, name: '河岸段丘', desc: '攻撃速度 +5%／ランク', max: 5, cost: 1, req: ['c1'], mods: (r) => ({ spdPct: 0.05 * r }) },
  { id: 'c3', branch: 'chikei', tier: 1, name: '窓の外を見る', desc: 'スキルゲージ増加 +10%／ランク', max: 5, cost: 1, req: ['c1'], mods: (r) => ({ gaugePct: 0.1 * r }) },
  { id: 'c4', branch: 'chikei', tier: 2, name: '地面は忘れない', desc: '戦闘中1回、倒れた部員が復活', max: 1, cost: 2, req: ['c2'], mods: () => ({ revive: 1 }) },
  { id: 'c7', branch: 'chikei', tier: 2, name: 'ヘイカツ監修', desc: '地理タイプのATK +20%／ランク', max: 5, cost: 1, req: ['c1'], mods: (r) => ({ typeAtk: { 地理: 0.2 * r } }) },
  { id: 'c5', branch: 'chikei', tier: 2, name: '上から描く', desc: '戦闘報酬の本質 +20%／ランク', max: 5, cost: 1, req: ['c3'], mods: (r) => ({ rewardPct: 0.2 * r }) },
  { id: 'c6', branch: 'chikei', tier: 3, name: '地形図の向こう側', desc: '【奥義】与ダメージ ×2', max: 1, cost: 3, req: ['c4', 'c5'], capstone: true, mods: () => ({ dmgX: 2 }) },
  // 恋愛学
  { id: 'l1', branch: 'renai', tier: 0, name: '第一法則（近接性）', desc: 'ドロップ率 +15%／ランク', max: 5, cost: 1, req: [], mods: (r) => ({ dropPct: 0.15 * r }) },
  { id: 'l2', branch: 'renai', tier: 1, name: 'シュレディンガーの好意', desc: 'SSR以上の排出率 +0.4%／ランク', max: 5, cost: 1, req: ['l1'], mods: (r) => ({ ssrBonus: 0.004 * r }) },
  { id: 'l3', branch: 'renai', tier: 1, name: '消しゴム事象', desc: '黄金✝から出る缶 +2／ランク', max: 3, cost: 1, req: ['l1'], mods: (r) => ({ goldenCan: r }) },
  { id: 'l4', branch: 'renai', tier: 2, name: '不理解の引力', desc: 'コーンスープ缶獲得 +15%／ランク', max: 5, cost: 1, req: ['l2'], mods: (r) => ({ canPct: 0.15 * r }) },
  { id: 'l7', branch: 'renai', tier: 2, name: '第十四法則', desc: '恋愛タイプのATK +25%／ランク（当事者になると理論は機能しない）', max: 5, cost: 1, req: ['l1'], mods: (r) => ({ typeAtk: { 恋愛: 0.25 * r } }) },
  { id: 'l5', branch: 'renai', tier: 2, name: '面白いは理論を超える', desc: '面白・恋愛タイプのATK +10%／ランク', max: 5, cost: 1, req: ['l3'], mods: (r) => ({ typeAtk: { 恋愛: 0.1 * r, 面白: 0.1 * r } }) },
  { id: 'l6', branch: 'renai', tier: 3, name: '理論のない恋', desc: '【奥義】10連召喚でSSR以上が1枠確定', max: 1, cost: 3, req: ['l4', 'l5'], capstone: true, mods: () => ({ tenGuarantee: 1 }) },
];

export const NODE_MAP: Record<string, SkillNode> = Object.fromEntries(SKILL_NODES.map((n) => [n.id, n]));

export const PRESTIGE: PrestigeDef[] = [
  { id: 'p_contour', name: '等高線の記憶', emoji: '〰️', desc: '全生産 ×1.5（累積）', max: 60, baseCost: 1, costMult: 1.45, mods: (lv) => ({ prodX: Math.pow(1.5, lv) }) },
  { id: 'p_geo', name: '地質の記憶', emoji: '🪨', desc: '部員のATK・HP ×1.3（累積）', max: 60, baseCost: 2, costMult: 1.45, mods: (lv) => ({ statX: Math.pow(1.3, lv) }) },
  { id: 'p_dankyu', name: '河岸段丘の記憶', emoji: '🪜', desc: 'クリック力 ×2（累積）', max: 40, baseCost: 1, costMult: 1.6, mods: (lv) => ({ clickX: Math.pow(2, lv) }) },
  { id: 'p_map', name: '同じ地図（三回目）', emoji: '🗺️', desc: '部員のレベル上限 +10', max: 15, baseCost: 3, costMult: 1.7, mods: (lv) => ({ levelCap: 10 * lv }) },
  { id: 'p_hand', name: '三年目の挙手', emoji: '✋', desc: '毎秒1回オートクリック', max: 25, baseCost: 2, costMult: 1.45, mods: (lv) => ({ autoClick: lv }) },
  { id: 'p_lava', name: '溶岩台地', emoji: '🌋', desc: '転生直後の✝本質✝ +（1000×10^Lv）', max: 12, baseCost: 1, costMult: 1.9, mods: () => ({}) },
  { id: 'p_soup', name: 'コーンスープ定期便', emoji: '🥫', desc: '転生時に缶+30／缶獲得 +10%', max: 20, baseCost: 1, costMult: 1.4, mods: (lv) => ({ canPct: 0.1 * lv }) },
  { id: 'p_ryunen', name: '留年の知恵', emoji: '🎓', desc: '学年XP +30%（＝SP増加）', max: 20, baseCost: 1, costMult: 1.5, mods: (lv) => ({ xpPct: 0.3 * lv }) },
  { id: 'p_cross', name: '✝の刻印', emoji: '✝', desc: 'クリック会心倍率 +1', max: 15, baseCost: 2, costMult: 1.6, mods: (lv) => ({ critMult: lv }) },
  { id: 'p_ceiling', name: '天井の低い北棟', emoji: '🏚️', desc: '召喚の天井 -5回', max: 10, baseCost: 3, costMult: 1.6, mods: (lv) => ({ pityReduce: 5 * lv }) },
  { id: 'p_luck', name: '消しゴム事象（永続）', emoji: '🧽', desc: 'SSR以上の排出率 +0.5%', max: 10, baseCost: 3, costMult: 1.8, mods: (lv) => ({ ssrBonus: 0.005 * lv }) },
];

export const PRESTIGE_MAP: Record<string, PrestigeDef> = Object.fromEntries(PRESTIGE.map((p) => [p.id, p]));
