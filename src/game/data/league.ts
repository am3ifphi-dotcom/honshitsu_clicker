import type { EnemyDef, School } from '../types';

export const SCHOOLS: School[] = [
  {
    id: 's1', name: '私立ねむねむ学園', emoji: '😴', dev: 44, motto: '校訓：五限は寝る。六限も寝る。', color: '#64748b',
    enemies: [
      { name: 'ねむねむ生A', emoji: '😪', w: 1 },
      { name: 'ねむねむ生B', emoji: '😪', w: 1 },
      { name: 'ねむねむ番長', emoji: '🛌', w: 1.5, boss: true, skill: { name: '二度寝', kind: 'heal', power: 0.2, line: 'あと五分……' } },
    ],
    reward: { cans: 10 },
  },
  {
    id: 's2', name: '市立二郎系高校 全マシ科', emoji: '🍜', dev: 50, motto: 'ニンニク入れますか？（入学試験の第一問）', color: '#b45309',
    enemies: [
      { name: 'ヤサイマシ', emoji: '🥬', w: 1 },
      { name: 'アブラマシ', emoji: '🧈', w: 1, skill: { name: '背脂', kind: 'aoe', power: 0.7, line: '背脂チャッチャ' } },
      { name: 'カラメ', emoji: '🧂', w: 1 },
      { name: '店主（無言）', emoji: '👨‍🍳', w: 1.8, boss: true, skill: { name: 'ロット乱し禁止', kind: 'stun', power: 0.5, duration: 2, line: '……（無言の圧）' } },
    ],
    reward: { cans: 12, items: { jiroitem: 3 } },
  },
  {
    id: 's3', name: '県立コーンスープ高校', emoji: '🌽', dev: 56, motto: '自販機に常にある（北棟への当てつけ）', color: '#ca8a04',
    enemies: [
      { name: 'コーンの粒', emoji: '🌽', w: 0.8 },
      { name: 'コーンの粒', emoji: '🌽', w: 0.8 },
      { name: '缶の底に残る最後の一粒', emoji: '🥫', w: 2.2, boss: true, skill: { name: '出てこない', kind: 'heal', power: 0.2, line: '（缶を振っても出てこない）' } },
    ],
    reward: { cans: 18, items: { hotsoup: 5 } },
  },
  {
    id: 's4', name: '私立映え学院 クレープ部', emoji: '🥞', dev: 62, motto: '亜✝本質✝と呼ばれた恨みを忘れない', color: '#db2777',
    enemies: [
      { name: '生クリーム増量', emoji: '🍦', w: 1 },
      { name: 'いちごチョコ', emoji: '🍓', w: 1, skill: { name: '映え', kind: 'buff', power: 0.3, duration: 8, line: '映えてる！' } },
      { name: 'クレープ部部長', emoji: '🥞', w: 2, boss: true, skill: { name: '亜じゃない', kind: 'aoe', power: 1.0, line: '亜✝本質✝じゃない！' } },
    ],
    reward: { cans: 20, items: { crepeitem: 3 } },
  },
  {
    id: 's5', name: '国立冷笑高等専門学校', emoji: '🧊', dev: 67, motto: '全てに「ふーん」で返す。', color: '#0284c7',
    enemies: [
      { name: '「ふーん」使い', emoji: '😐', w: 1 },
      { name: '「知らんけど」使い', emoji: '🙄', w: 1, skill: { name: '知らんけど', kind: 'stun', power: 0.3, duration: 1.5, line: '知らんけど' } },
      { name: '冷笑の頂点', emoji: '🥶', w: 2, boss: true, skill: { name: 'は？（本場）', kind: 'stun', power: 0.8, duration: 2, line: 'は？' } },
    ],
    reward: { cans: 25, items: { mask: 1 } },
  },
  {
    id: 's6', name: '桐葉高校 南棟（内進）', emoji: '👔', dev: 72, motto: '偏差値70。自販機にカフェオレとコーンスープがある。', color: '#1e3a8a',
    enemies: [
      { name: '内進生「Excel派」', emoji: '📊', w: 1 },
      { name: '内進生「効率厨」', emoji: '⏱️', w: 1, skill: { name: '効率化', kind: 'buff', power: 0.3, duration: 8, line: '効率よくやろう' } },
      { name: '模試掲示板の上位者', emoji: '📋', w: 1, skill: { name: 'ふーん', kind: 'nuke', power: 1.8, line: 'ふーん（上位者の余裕）' } },
      { name: '紺ネクタイの主将', emoji: '👔', w: 2, boss: true, skill: { name: 'あいつ理数科でしょ', kind: 'aoe', power: 1.0, line: 'あいつ理数科でしょ' } },
    ],
    reward: { cans: 40, items: { kontie: 1, cafeaulait: 3 } },
  },
  {
    id: 's7', name: '私立恋愛学院 大学附属', emoji: '💘', dev: 78, motto: '理論より実践（在校生全員彼女なし）', color: '#e11d48',
    enemies: [
      { name: '恋愛発生の第二十法則', emoji: '📐', w: 1 },
      { name: '告白の練習台', emoji: '🗿', w: 1, skill: { name: '好きです', kind: 'stun', power: 0.3, duration: 2, line: '好きです（練習）' } },
      { name: '恋愛学博士（経験ゼロ）', emoji: '🎓', w: 2.2, boss: true, skill: { name: '文献値', kind: 'aoe', power: 1.1, line: 'だいたい三ヶ月で半減します' } },
    ],
    reward: { cans: 40, items: { ring: 1 } },
  },
  {
    id: 's8', name: '県立等高線高校 地理部', emoji: '🗾', dev: 83, motto: '地図に感動できる人間しかいない。', color: '#059669',
    enemies: [
      { name: '三角点マニア', emoji: '🔺', w: 1 },
      { name: '扇状地の申し子', emoji: '🪭', w: 1, skill: { name: '扇頂', kind: 'aoe', power: 0.8, line: '扇頂・扇央・扇端！' } },
      { name: '地理部顧問（ヘイカツの同期）', emoji: '🧭', w: 2.2, boss: true, skill: { name: '窓の外を見る（三秒）', kind: 'stun', power: 0.6, duration: 3, line: '……（三秒）' } },
    ],
    reward: { cans: 45, items: { heimap: 1 } },
  },
  {
    id: 's9', name: 'まとめサイト工業高校', emoji: '📰', dev: 88, motto: '【悲報】【朗報】【永久保存版】【画像あり】', color: '#7c3aed',
    enemies: [
      { name: '【悲報】', emoji: '😱', w: 1 },
      { name: '【朗報】', emoji: '🎉', w: 1, skill: { name: '拡散', kind: 'buff', power: 0.4, duration: 8, line: '拡散希望' } },
      { name: '【画像あり】', emoji: '🖼️', w: 1 },
      { name: '管理人', emoji: '💻', w: 2.2, boss: true, skill: { name: '切り抜き', kind: 'aoe', power: 1.2, line: 'ここだけ切り抜けば伸びる' } },
    ],
    reward: { cans: 50, items: { guide: 1 } },
  },
  {
    id: 's10', name: '全国模試連合', emoji: '📊', dev: 94, motto: '偏差値で全てを測る。人格も測る。', color: '#475569',
    enemies: [
      { name: 'マークシート', emoji: '📄', w: 1 },
      { name: '記述式', emoji: '✍️', w: 1, skill: { name: '部分点なし', kind: 'nuke', power: 2.2, line: '部分点はありません' } },
      { name: 'E判定', emoji: '🅴', w: 1, skill: { name: '絶望', kind: 'stun', power: 0.3, duration: 2, line: '志望校を再考してください' } },
      { name: '偏差値そのもの', emoji: '📈', w: 2.4, boss: true, skill: { name: '標準偏差', kind: 'aoe', power: 1.2, line: '平均との差を標準偏差で割って10倍して50を足す' } },
    ],
    reward: { cans: 60, items: { fault: 1 } },
  },
  {
    id: 's11', name: '私立偏差値の彼方学院', emoji: '🌌', dev: 100, motto: '偏差値100以上しか入れない（在校生0名）', color: '#312e81',
    enemies: [
      { name: '空席', emoji: '🪑', w: 1 },
      { name: '空席', emoji: '🪑', w: 1 },
      { name: '校長（一人で運営）', emoji: '🧙', w: 2.5, boss: true, skill: { name: '孤独', kind: 'aoe', power: 1.3, line: '誰も入学してこない……' } },
    ],
    reward: { cans: 70, items: { goldsoup: 1 } },
  },
  {
    id: 's12', name: '✝本質✝大学附属 地面高校', emoji: '🌏', dev: 108, motto: '地面は忘れない。', color: '#0f766e',
    enemies: [
      { name: '地層（新生代）', emoji: '🟫', w: 1 },
      { name: '地層（中生代）', emoji: '🟫', w: 1, skill: { name: '堆積', kind: 'heal', power: 0.2, line: '積み重なる' } },
      { name: '地層（古生代）', emoji: '🟫', w: 1 },
      { name: '地面そのもの', emoji: '🌏', w: 2.8, boss: true, skill: { name: '全部記録している', kind: 'stun', power: 0.8, duration: 3, line: '地面は忘れない' } },
    ],
    reward: { cans: 100, items: { mapcopy: 1 } },
  },
];

export const SCHOOL_MAP: Record<string, School> = Object.fromEntries(SCHOOLS.map((s) => [s.id, s]));

const ENDLESS_POOL: EnemyDef[] = [
  { name: '全国模試（数学）', emoji: '📐', w: 1, skill: { name: '難問', kind: 'nuke', power: 2.0, line: '大問5' } },
  { name: '全国模試（英語）', emoji: '🔤', w: 1, skill: { name: '長文', kind: 'aoe', power: 0.9, line: '長文読解' } },
  { name: '全国模試（地理）', emoji: '🗺️', w: 1, skill: { name: '地形図', kind: 'stun', power: 0.4, duration: 2, line: '等高線を読め' } },
  { name: '全国模試（国語）', emoji: '📚', w: 1, skill: { name: '作者の気持ち', kind: 'stun', power: 0.3, duration: 2, line: '作者の気持ちを答えよ' } },
  { name: '判定用紙', emoji: '🧾', w: 1 },
  { name: '志望校欄', emoji: '📝', w: 1, skill: { name: '再考', kind: 'buff', power: 0.3, duration: 8, line: '志望校を再考せよ' } },
  { name: '赤本', emoji: '📕', w: 1, skill: { name: '過去問', kind: 'aoe', power: 1.0, line: '過去十年分' } },
];

export const ENDLESS_BASE = 112;
export const endlessRec = (level: number) => ENDLESS_BASE + (level - 1) * 3;

export function endlessEnemies(level: number): EnemyDef[] {
  const n = 2 + (level % 3);
  const out: EnemyDef[] = [];
  for (let i = 0; i < n; i++) {
    out.push({ ...ENDLESS_POOL[(level * 7 + i * 3) % ENDLESS_POOL.length] });
  }
  out.push({
    name: `全国✝本質✝模試 第${level}回 総合`, emoji: '🏯', w: 2.4, boss: true,
    skill: { name: '総合判定', kind: 'aoe', power: 1.2 + Math.min(1, level * 0.02), line: `第${level}回の判定を下す` },
  });
  return out;
}
