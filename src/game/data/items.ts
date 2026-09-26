import type { ItemDef, Rarity } from '../types';

export const ITEMS: ItemDef[] = [
  // ───── 消費アイテム（戦闘） ─────
  { id: 'hotsoup', name: 'ホットコーンスープ', emoji: '🌽', rarity: 'N', kind: 'consumable', scene: 'battle', effect: { kind: 'healAll', pct: 0.35 }, desc: '戦闘中：味方全体のHPを35%回復', flavor: '北棟の自販機に補充された。奇跡。' },
  { id: 'jiroitem', name: '二郎系ラーメン（全マシ）', emoji: '🍜', rarity: 'R', kind: 'consumable', scene: 'battle', effect: { kind: 'atkBuff', mult: 1.6, duration: 20 }, desc: '戦闘中：味方ATK×1.6（20秒）', flavor: 'この脂の浮き方まじ✝本質✝' },
  { id: 'tamagoitem', name: '母親の卵焼き', emoji: '🍳', rarity: 'R', kind: 'consumable', scene: 'battle', effect: { kind: 'reviveOne' }, desc: '戦闘中：倒れた部員1人を全快で復活（いなければ最もHPが低い部員を全快）', flavor: 'テンション上がるやつ。' },
  { id: 'charger', name: '充電器', emoji: '🔋', rarity: 'R', kind: 'consumable', scene: 'battle', effect: { kind: 'gaugeFull' }, desc: '戦闘中：味方全員のスキルゲージをMAXに', flavor: '砂糖が忘れた日、世界は変わった。' },
  { id: 'akafuku', name: '赤福', emoji: '🍡', rarity: 'SR', kind: 'consumable', scene: 'battle', effect: { kind: 'enemyDmg', mult: 4 }, desc: '戦闘中：敵全体に平均ATK×400%のダメージ', flavor: '三重県の名物。こっちは本物。' },
  // ───── 消費アイテム（フィールド） ─────
  { id: 'cafeaulait', name: 'カフェオレ（南棟限定）', emoji: '☕', rarity: 'R', kind: 'consumable', scene: 'field', effect: { kind: 'prodBuff', mult: 2, duration: 300 }, desc: '毎秒本質×2（5分）', flavor: '内進の味。少しだけ偏差値が上がった気がする。' },
  { id: 'water', name: 'ミネラルウォーター（南棟）', emoji: '💧', rarity: 'R', kind: 'consumable', scene: 'field', effect: { kind: 'clickBuff', mult: 7, duration: 60 }, desc: 'クリック力×7（60秒）', flavor: '北棟には売っていない。' },
  { id: 'mikan', name: '三重県産みかん', emoji: '🍊', rarity: 'SR', kind: 'consumable', scene: 'field', effect: { kind: 'honshitsu', seconds: 900 }, desc: '毎秒本質の15分ぶんを即座に獲得', flavor: '臣下が剥いた。白い筋は取ってある。' },
  { id: 'crepeitem', name: 'クレープ', emoji: '🥞', rarity: 'R', kind: 'consumable', scene: 'field', effect: { kind: 'golden' }, desc: '黄金✝をすぐに出現させる', flavor: '亜✝本質✝ではない。' },
  { id: 'guide', name: '✝本質✝入門ガイド', emoji: '📘', rarity: 'SSR', kind: 'consumable', scene: 'field', effect: { kind: 'sp' }, desc: 'スキルポイント+1（永続）', flavor: '倉石編。全八ページ。第四章で三重が否定の守護者にされている。' },
  { id: 'ticket', name: '召喚チケット', emoji: '🎫', rarity: 'SR', kind: 'consumable', scene: 'gacha', effect: { kind: 'ticket' }, desc: '召喚画面で1回無料召喚', flavor: 'ハワイ行きではない。' },
  // ───── 消費アイテム（部員） ─────
  { id: 'gyuu', name: '松阪牛', emoji: '🥩', rarity: 'SR', kind: 'consumable', scene: 'unit', effect: { kind: 'levelUp', levels: 3 }, desc: '部員のレベル+3（上限まで）', flavor: '三重県産の松阪牛が臣下に伝えた味。' },
  { id: 'mapcopy', name: '同じ地形図（コピー）', emoji: '🗾', rarity: 'UR', kind: 'consumable', scene: 'unit', effect: { kind: 'star' }, desc: '部員の凸+1（最大5）', flavor: '三回目。同じに見えるか？' },
  // ───── 装備 ─────
  { id: 'pen', name: 'シャーペン（零の回転用）', emoji: '✏️', rarity: 'N', kind: 'equip', equip: { atkPct: 0.1, spdPct: 0.05 }, desc: 'ATK+10% / 速度+5%', flavor: '授業中に回すためのもの。' },
  { id: 'paper', name: 'A4コピー用紙（21枚）', emoji: '📄', rarity: 'N', kind: 'equip', equip: { hpPct: 0.2 }, desc: 'HP+20%', flavor: '本質配信第四回で使われた。寺地の引き出しにしまってある。' },
  { id: 'enjitie', name: 'えんじのネクタイ', emoji: '🎗️', rarity: 'N', kind: 'equip', equip: { atkPct: 0.08, hpPct: 0.08 }, desc: 'ATK+8% / HP+8%', flavor: '理数科の証。偏差値60の色。' },
  { id: 'marker', name: '太いマジックペン', emoji: '🖊️', rarity: 'R', kind: 'equip', equip: { atkPct: 0.2 }, desc: 'ATK+20%', flavor: '本質を紙に書くための聖具（倉石談）。' },
  { id: 'earphone', name: 'イヤホン（英語リスニング）', emoji: '🎧', rarity: 'R', kind: 'equip', equip: { spdPct: 0.15, atkPct: 0.1 }, desc: '速度+15% / ATK+10%', flavor: 'A big gap. Gap is also ✝本質✝.' },
  { id: 'astro', name: '天文学の本', emoji: '📚', rarity: 'R', kind: 'equip', equip: { hpPct: 0.3, gaugePct: 0.1 }, desc: 'HP+30% / スキルゲージ+10%', flavor: '膝の上で読むもの。地理の授業中に。' },
  { id: 'shuusei', name: '修正液（✝刻印用）', emoji: '🧴', rarity: 'SR', kind: 'equip', equip: { crit: 0.12, typeBonus: { type: '本質', atkPct: 0.3 } }, desc: '会心率+12% / 本質タイプATK+30%', flavor: 'ブレザーの裏に書くために使われた。' },
  { id: 'kontie', name: '紺のネクタイ（内進）', emoji: '👔', rarity: 'SR', kind: 'equip', equip: { atkPct: 0.15, hpPct: 0.15, spdPct: 0.05 }, desc: 'ATK+15% / HP+15% / 速度+5%', flavor: '偏差値が10上がった気がする（気のせい）。' },
  { id: 'notebook', name: '恋愛学ノート（第十五法則まで）', emoji: '📓', rarity: 'SR', kind: 'equip', equip: { gaugePct: 0.3, typeBonus: { type: '恋愛', atkPct: 0.3 } }, desc: 'スキルゲージ+30% / 恋愛タイプATK+30%', flavor: '後半は✝本質✝に汚染されている。「助けて。」' },
  { id: 'phone', name: '両馬のスマホ（サブ垢7個）', emoji: '📲', rarity: 'SR', kind: 'equip', equip: { prodPct: 1, atkPct: 0.1 }, desc: 'この部員の生産+100% / ATK+10%', flavor: 'ログインしているアカウントが毎回違う。' },
  { id: 'uniform', name: '背番号✝7✝ユニフォーム', emoji: '👕', rarity: 'SR', kind: 'equip', equip: { atkPct: 0.25, hpPct: 0.25 }, desc: 'ATK+25% / HP+25%', flavor: '番号は7なのに✝が多い。' },
  { id: 'emptycan', name: '空のコーンスープ缶', emoji: '🥫', rarity: 'SR', kind: 'equip', equip: { typeBonus: { type: '本質', atkPct: 0.77 }, hpPct: -0.1 }, desc: '本質タイプATK+77% / HP-10%', flavor: 'あるときより、ないときの方が本質である。' },
  { id: 'heimap', name: 'ヘイカツの地形図', emoji: '🗺️', rarity: 'SSR', kind: 'equip', equip: { atkPct: 0.4, typeBonus: { type: '地理', atkPct: 0.4 } }, desc: 'ATK+40% / 地理タイプATK+40%', flavor: '三年間同じ地図。見る側が変わる。' },
  { id: 'lava', name: 'ハワイの溶岩（持ち出し禁止）', emoji: '🌋', rarity: 'SSR', kind: 'equip', equip: { atkPct: 0.6, hpPct: -0.1 }, desc: 'ATK+60% / HP-10%（呪い）', flavor: '持ち帰ると呪われるらしい。呪いの内容：HP-10%。' },
  { id: 'ring', name: '封印の刻印', emoji: '💍', rarity: 'SSR', kind: 'equip', equip: { typeBonus: { type: '恋愛', atkPct: 0.8 }, crit: 0.05 }, desc: '恋愛タイプATK+80% / 会心率+5%', flavor: '封じられた光は、封じられていない光より美しい。' },
  { id: 'mask', name: '冷笑の仮面', emoji: '🎭', rarity: 'SSR', kind: 'equip', equip: { hpPct: 0.5, typeBonus: { type: '冷笑', atkPct: 0.4 } }, desc: 'HP+50% / 冷笑タイプATK+40%', flavor: '「まあ」で全てを流す。二回言うと外れる。' },
  { id: 'spinpen', name: '零のシャーペン（高速回転）', emoji: '🌀', rarity: 'SSR', kind: 'equip', equip: { spdPct: 0.3, typeBonus: { type: '面白', atkPct: 0.4 } }, desc: '速度+30% / 面白タイプATK+40%', flavor: '回転数が偏差値に比例する（諸説ある）。' },
  { id: 'yearbook', name: '✝本質✝年鑑', emoji: '📖', rarity: 'UR', kind: 'equip', equip: { atkPct: 0.5, hpPct: 0.5, spdPct: 0.1, gaugePct: 0.2 }, desc: 'ATK+50% / HP+50% / 速度+10% / ゲージ+20%', flavor: '「は？」四百二十回（推定・統計補正済）。' },
  { id: 'fault', name: '糸魚川-静岡構造線の欠片', emoji: '🪨', rarity: 'UR', kind: 'equip', equip: { atkPct: 1.0, hpPct: -0.2, crit: 0.1 }, desc: 'ATK+100% / 会心率+10% / HP-20%', flavor: '東と西で石が違う。この欠片はどっちの石だ。' },
  { id: 'goldsoup', name: '黄金のコーンスープ', emoji: '🏆', rarity: 'UR', kind: 'equip', equip: { atkPct: 0.4, hpPct: 0.4, prodPct: 3 }, desc: 'ATK+40% / HP+40% / この部員の生産+300%', flavor: '六ヶ月の不在を経て、黄金になった。' },
  // ───── ✝聖典✝ 特級神器・聖遺物 ─────
  {
    id: 'arte_kuraishi',
    name: '聖典・倉石の修正液ブレザー',
    emoji: '✝',
    rarity: 'LR',
    kind: 'equip',
    equip: { atkPct: 2.5, crit: 0.25, typeBonus: { type: '本質', atkPct: 1.5 } },
    desc: 'ATK+250% / 会心率+25% / 本質タイプATK+150%',
    flavor: 'ブレザーの裏地に修正液で書き殴られた✝本質✝。四百二十回の「は？」を耐え抜いた聖衣。',
  },
  {
    id: 'arte_heikatsu',
    name: 'ヘイカツの地形図定規（縮尺1:25000）',
    emoji: '📐',
    rarity: 'LR',
    kind: 'equip',
    equip: { atkPct: 2.0, gaugePct: 0.5, typeBonus: { type: '地理', atkPct: 2.5 } },
    desc: 'ATK+200% / ゲージ加速+50% / 地理タイプATK+250%',
    flavor: '地形図の向こう側を測り続けた定規。三年間同じ地図を見せても、定規の目盛りは決して狂わない。',
  },
  {
    id: 'arte_rei',
    name: '数理零の首席試験問題用紙',
    emoji: '📝',
    rarity: 'LR',
    kind: 'equip',
    equip: { atkPct: 2.0, hpPct: 2.0, prodPct: 10 },
    desc: 'ATK+200% / HP+200% / 生産+1000%',
    flavor: '全教科満点。余白に殴り書きされた「家が近いから」。内進棟のエリートたちを沈黙させた紙。',
  },
  {
    id: 'arte_terachi',
    name: '寺地星の太マジック＆コピー用紙',
    emoji: '🖊️',
    rarity: 'UR',
    kind: 'equip',
    equip: { prodPct: 8, hpPct: 1.5, gaugePct: 0.3 },
    desc: '生産+800% / HP+150% / ゲージ+30%',
    flavor: '「寺地星のカス配信」。紙に太マジックで書いてカメラに見せる。十五秒の沈黙を刻んだ神具。',
  },
  {
    id: 'arte_mitsumine',
    name: '三峰瑠衣の紺ネクタイ（南棟の結界）',
    emoji: '👔',
    rarity: 'UR',
    kind: 'equip',
    equip: { hpPct: 2.5, spdPct: 0.15, typeBonus: { type: '冷笑', atkPct: 1.0 } },
    desc: 'HP+250% / 速度+15% / 冷笑タイプATK+100%',
    flavor: '偏差値70の内進生が締める紺色。理数科の観客席に座ったあの日、国境を越えた。',
  },
  {
    id: 'arte_futami',
    name: '二見玲子の結婚指輪の残像',
    emoji: '💍',
    rarity: 'UR',
    kind: 'equip',
    equip: { crit: 0.3, typeBonus: { type: '恋愛', atkPct: 3.0 } },
    desc: '会心率+30% / 恋愛タイプATK+300%',
    flavor: '左手薬指に刻まれた封印の刻印。召野が百二十五人を抜き去った英語の奇跡の源。',
  },
  {
    id: 'arte_sato',
    name: '砂糖東洋の電車定期券（四十分）',
    emoji: '🎫',
    rarity: 'UR',
    kind: 'equip',
    equip: { atkPct: 1.8, spdPct: 0.2, typeBonus: { type: '地理', atkPct: 1.5 } },
    desc: 'ATK+180% / 速度+20% / 地理タイプATK+150%',
    flavor: '田舎から電車で毎朝四十分。山と田んぼの車窓から何億年もの地層を無言で観察し続けた証。',
  },
  {
    id: 'arte_ryoma',
    name: '両馬二郎の全マシ黒烏龍茶',
    emoji: '🍵',
    rarity: 'SSR',
    kind: 'equip',
    equip: { atkPct: 1.2, gaugePct: 0.4, prodPct: 3 },
    desc: 'ATK+120% / ゲージ+40% / 生産+300%',
    flavor: 'ニンニク入れますか？ 週三で二郎系を食べても太らない体質を支える生命の茶。',
  },
  {
    id: 'arte_corn',
    name: '奇跡のコーンスープ缶（未開封）',
    emoji: '🥫',
    rarity: 'SSR',
    kind: 'equip',
    equip: { prodPct: 5, hpPct: 1.0 },
    desc: '生産+500% / HP+100%',
    flavor: 'あるときより、ないときの方が本質である。だが今、目の前に温かい缶がある。',
  },
];

export const ITEM_MAP: Record<string, ItemDef> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
export const EQUIPS = ITEMS.filter((i) => i.kind === 'equip');
export const BATTLE_ITEMS = ITEMS.filter((i) => i.scene === 'battle');
export const DROP_CONSUMABLES = ['hotsoup', 'hotsoup', 'jiroitem', 'tamagoitem', 'charger', 'cafeaulait', 'water', 'crepeitem', 'akafuku', 'mikan', 'gyuu'];

export interface ShopEntry {
  id: string;
  min: number;
  sec: number;
  grow: number;
  label?: string;
  emoji?: string;
  desc?: string;
}

export const SHOP: ShopEntry[] = [
  { id: 'hotsoup', min: 80, sec: 25, grow: 1.02 },
  { id: 'jiroitem', min: 150, sec: 45, grow: 1.02 },
  { id: 'tamagoitem', min: 200, sec: 60, grow: 1.03 },
  { id: 'charger', min: 250, sec: 60, grow: 1.03 },
  { id: 'akafuku', min: 400, sec: 120, grow: 1.04 },
  { id: 'cafeaulait', min: 500, sec: 200, grow: 1.05 },
  { id: 'water', min: 300, sec: 90, grow: 1.05 },
  { id: 'gyuu', min: 1500, sec: 400, grow: 1.08 },
  { id: 'cans5', min: 800, sec: 150, grow: 1.12, label: 'コーンスープ缶×5', emoji: '🥫', desc: '召喚に使える。自販機の業者から横流し。' },
  { id: 'guide', min: 50000, sec: 3000, grow: 2.2 },
];

export const EQUIP_WEIGHTS = (rec: number): Record<Rarity, number> => {
  if (rec >= 95) return { N: 8, R: 27, SR: 37, SSR: 22, UR: 6, LR: 0 };
  if (rec >= 80) return { N: 18, R: 33, SR: 32, SSR: 14, UR: 3, LR: 0 };
  if (rec >= 65) return { N: 30, R: 36, SR: 25, SSR: 8, UR: 1, LR: 0 };
  return { N: 48, R: 35, SR: 14, SSR: 3, UR: 0, LR: 0 };
};

export const LOSTBOX_WEIGHTS: Record<Rarity, number> = { N: 40, R: 35, SR: 18, SSR: 6, UR: 1, LR: 0 };
