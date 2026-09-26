import type { FacilityDef } from '../types';

export const FACILITIES: FacilityDef[] = [
  { id: 'thread', name: '匿名掲示板スレ', emoji: '📝', baseCost: 15, baseProd: 0.1, desc: 'ヘイカツ雑談スレ。住人は四人。', flavor: 'うち二人は俺かもしれない。' },
  { id: 'subacc', name: '両馬のサブ垢', emoji: '📱', baseCost: 100, baseProd: 1, desc: '自演ではない。自己対話である。', flavor: '自演は嘘だけど、自己対話は✝本質✝。' },
  { id: 'groupline', name: 'グループLINE', emoji: '💬', baseCost: 1100, baseProd: 8, desc: '三重の「は？」が定期的に流れる。', flavor: '三重：は？' },
  { id: 'stream', name: '本質配信', emoji: '📹', baseCost: 12000, baseProd: 47, desc: '紙に書いて読みます。', flavor: '……来なかったです。' },
  { id: 'openchat', name: 'オープンチャット「✝本質✝募集所」', emoji: '📨', baseCost: 130000, baseProd: 260, desc: '寺地が勝手に作った。', flavor: '先に言ったら両馬がしゃしゃり出てくるから。' },
  { id: 'feikatsu', name: 'フェイカツ（受験ナビ）', emoji: '🎭', baseCost: 1.4e6, baseProd: 1400, desc: '中学生を困惑させて本質を得る。', flavor: '内緒さん：何も伝わってこないです。' },
  { id: 'map', name: 'ヘイカツの地形図', emoji: '🗺️', baseCost: 2e7, baseProd: 7800, desc: '三年間同じ地図。見る側が変わる。', flavor: '同じ地図だ。同じに見えるか？' },
  { id: 'vending', name: '北棟の自販機', emoji: '🥫', baseCost: 3.3e8, baseProd: 44000, desc: 'たまにコーンスープ缶を産む。', flavor: 'コーンスープは、ないときの方が本質である。' },
  { id: 'yearbook', name: '✝本質✝年鑑（倉石編）', emoji: '📜', baseCost: 5.1e9, baseProd: 260000, desc: '全ての「は？」を統計的に補正。', flavor: '四百二十一回目です。' },
  { id: 'matome', name: 'まとめサイト', emoji: '📰', baseCost: 7.5e10, baseProd: 1.6e6, desc: '【永久保存版】【悲報】【朗報】', flavor: '学校特定したら面白くね？（やめろ）' },
  { id: 'joint', name: '異棟合同課題', emoji: '🏫', baseCost: 1e12, baseProd: 1e7, desc: '南棟の効率を北棟の面白さで上書き。', flavor: 'ハワイがかかっている。' },
  { id: 'hawaii', name: 'ハワイ研修旅行', emoji: '🌺', baseCost: 1.4e13, baseProd: 6.5e7, desc: '地図が追いつかない地面。', flavor: 'ここでは書くな。帰ってから書け。' },
  { id: 'ground', name: '地面', emoji: '🌏', baseCost: 1.7e14, baseProd: 4.3e8, desc: '地面は全部を記録している。', flavor: '地面は忘れない。' },
  { id: 'genhon', name: '原✝本質✝', emoji: '☨', baseCost: 2.1e15, baseProd: 2.9e9, desc: '言語化以前の本質。存在しないが、ある。', flavor: '✝✝✝（重い）' },
];

export const FAC_MAP: Record<string, FacilityDef> = Object.fromEntries(FACILITIES.map((f) => [f.id, f]));
