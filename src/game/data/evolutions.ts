import type { EvolutionEffect, PassiveDef, SkillDef } from '../types';
import ryomaAfter from '../../assets/img/ryoma_shinka.jpg';
import reiAfter from '../../assets/img/rei_shinka.jpg';
import terachiAfter from '../../assets/img/terachi_shinka.jpg';
import heikatsuAfter from '../../assets/img/heikatsu_shinka.jpg';
import mieAfter from '../../assets/img/mie_shinka.jpg';

export interface EvolutionCost {
  cans: number;
  crystals: number;
  cores: number;
  memories: number;
  materialId: string;
  materialCount: number;
}

export interface EvolutionForm {
  name: string;
  title: string;
  portrait?: string;
  emoji?: string;
  quote: string;
  desc: string;
  passive: PassiveDef;
  skill: Partial<SkillDef>;
  stats: { atk: number; hp: number; spd: number; prod: number; skill: number };
  effect: EvolutionEffect;
  accent: string;
  motif: string;
  cutsceneLine: string;
  cutsceneNarration: string;
  cost: EvolutionCost;
}

const standardCost = (materialId: string): EvolutionCost => ({
  cans: 1000,
  crystals: 45,
  cores: 4,
  memories: 35,
  materialId,
  materialCount: 3,
});

// どの素材も関連するストーリー／対抗戦の初回勝利で1個確定。
// クリア済みのセーブでも、同じバトルを再挑戦すれば追加で集められる。
export const EVOLUTION_BATTLE_DROPS: Record<string, string> = {
  'y1-1': 'evo_ryoma',
  'y1-9': 'evo_rei',
  'y3-5': 'evo_terachi',
  'y3-1': 'evo_heikatsu',
  'y3-4': 'evo_mie',
  'y3-2': 'evo_pregen',
  'y2-7': 'evo_jimen',
};

export const EVOLUTION_MATERIAL_SOURCES: Record<string, { battleId: string; label: string }> = {
  evo_ryoma: { battleId: 'y1-1', label: '第一章「両馬二郎の生態系と、✝本質✝の発生」' },
  evo_rei: { battleId: 'y1-9', label: '第九章「昼休みの力学と、零の話」' },
  evo_terachi: { battleId: 'y3-5', label: '第五章「寺地星、沈黙する」' },
  evo_heikatsu: { battleId: 'y3-1', label: '第一章「火曜三限、最後の地形図」' },
  evo_mie: { battleId: 'y3-4', label: '第四章「球技大会、二点差」' },
  evo_pregen: { battleId: 'y3-2', label: '第二章「✝本質✝のグレートチェーン」' },
  evo_jimen: { battleId: 'y2-7', label: '第九章「ハワイの✝本質✝」' },
};

export const EVOLUTION_FORMS: Record<string, EvolutionForm> = {
  ex_ryoma: {
    name: '燃え盛る真夏の✝本質✝ 両馬二郎',
    title: '北極ラーメンの火を噴く神託者',
    portrait: ryomaAfter,
    quote: '北極の辛さで火が出ても、箸は止まらない。これまじ✝本質✝。',
    desc: '真夏の熱気と北極ラーメンの辛さが重なる。火を噴きながら、それでも麺を食べ進める神託者。',
    passive: { scope: 'owned', desc: '全生産×6.5・クリック力×6.5・本質タイプATK+130%・会心率+4%', mods: { prodX: 6.5, clickX: 6.5, typeAtk: { 本質: 1.3 }, critChance: 0.04 } },
    skill: { name: '北極・灼熱の天啓', line: '辛さで火が出ても、これまじ✝本質✝！', desc: '敵全体にATK×700%の灼熱攻撃' },
    stats: { atk: 1.55, hp: 1.45, spd: 1.06, prod: 1.8, skill: 1.27 },
    effect: 'inferno', accent: '#ff5a26', motif: 'EMBER / JIRO',
    cutsceneLine: '北極の辛さで火が出ても、箸は止まらない。――これまじ✝本質✝。',
    cutsceneNarration: '熱気でゆがむ視界。赤く燃える一杯を前に、両馬の箸が再び動き出す。',
    cost: standardCost('evo_ryoma'),
  },
  ex_rei: {
    name: '孤高ではない首席・数理零',
    title: '夕暮れの黒板を囲む首席',
    portrait: reiAfter,
    quote: '数学に本質的なところだけってないよ。全部繋がってるから。……皆と解くのも面白いな。',
    desc: '最後の数式を書き終えた夕暮れ。皆が帰っていく教室で、零は一人きりの首席ではなくなった。',
    passive: { scope: 'owned', desc: '全ステータス×4・毎秒本質×4・部員生産+700%・学年XP+20%', mods: { statX: 4, prodX: 4, unitProdPct: 7, xpPct: 0.2 } },
    skill: { name: '放課後・全員の解', line: '答えは一つでも、考える時間は一人のものじゃないよ', desc: '味方全体のATK+240%（18秒）' },
    stats: { atk: 1.42, hp: 1.42, spd: 1.08, prod: 1.75, skill: 1.2 },
    effect: 'afterglow', accent: '#ffbd77', motif: 'AFTER CLASS / ∑',
    cutsceneLine: '数学に本質的なところだけってないよ。全部繋がってるから。',
    cutsceneNarration: '黒板に残る最後の式。夕陽に染まる教室から、仲間たちが一人ずつ帰っていく。',
    cost: standardCost('evo_rei'),
  },
  ex_terachi: {
    name: '星と地面を繋ぐ声 寺地星',
    title: '届くまで書き続ける配信者',
    portrait: terachiAfter,
    quote: '一人でも千人でも✝本質✝は✝本質✝。数は関係ない。でも、千人は嬉しい。',
    desc: 'ペンを走らせる音が、星と地面のあいだをつなぐ。大勢ではなく、待っていてくれた人へ言葉を届ける。',
    passive: { scope: 'owned', desc: '全生産×5.4・黄金✝出現率+75%・部員生産+550%・ドロップ率+20%', mods: { prodX: 5.4, goldenRate: 0.75, unitProdPct: 5.5, dropPct: 0.2 } },
    skill: { name: '星と地面の生配信', line: '……待っててくれて、ありがとう', desc: '味方全体HPを全快し、バリア50%' },
    stats: { atk: 1.5, hp: 1.5, spd: 1.06, prod: 1.8, skill: 1.2 },
    effect: 'starfall', accent: '#8ed7ff', motif: 'LIVE / STARS × EARTH',
    cutsceneLine: '一人でも千人でも✝本質✝は✝本質✝。数は関係ない。でも、千人は嬉しい。',
    cutsceneNarration: '太いペンが紙を走る。書き上げた言葉の向こうで、星明かりと地面の記憶がつながる。',
    cost: standardCost('evo_terachi'),
  },
  ex_heikatsu: {
    name: '地形図の向こう側が見える男・塀勝也',
    title: '地面の時間を読む教師',
    portrait: heikatsuAfter,
    quote: '地図は人間が作るものだから、人間の限界がある。でも地面は限界がない。地面は忘れない。',
    desc: '地形図の等高線から、地層と断層、そしてその地面で暮らした人々の時間までを見通す。',
    passive: { scope: 'owned', desc: '地理タイプATK+260%・味方被ダメージ-30%・戦闘復活+4・地面の記憶+20%', mods: { typeAtk: { 地理: 2.6 }, dmgReduce: 0.3, revive: 4, memoryPct: 0.2 } },
    skill: { name: '地形図・向こう側の断層', line: '地面が何億年かけて作った時間を見ろ！', desc: '敵全体にATK×750%＋8秒スタン' },
    stats: { atk: 1.55, hp: 1.6, spd: 1.04, prod: 1.7, skill: 1.25 },
    effect: 'contour', accent: '#ffd68a', motif: 'CONTOUR / DEEP TIME',
    cutsceneLine: '地図は人間が作る。地面には限界がない。地面は忘れない。',
    cutsceneNarration: 'ペン先が等高線をなぞる。一本の線がほどけ、地層と断層、暮らしの時間をひらいていく。',
    cost: standardCost('evo_heikatsu'),
  },
  ex_mie: {
    name: '［冷笑を脱ぎ捨てて］三重県臣',
    title: '理屈じゃないパスを出す男',
    portrait: mieAfter,
    quote: '知ってて出した。勝ち負けじゃなくて、お前が打つべきだと思ったんだよ。理屈じゃない。',
    desc: '最後の球技大会。冷笑を脱ぎ捨て、両馬を信じてボールを渡した瞬間の三重。',
    passive: { scope: 'owned', desc: '味方被ダメージ-37%・冷笑タイプATK+200%・味方全体バリア+25%', mods: { dmgReduce: 0.37, typeAtk: { 冷笑: 2 }, shieldPct: 0.25 } },
    skill: { name: '理屈じゃないパス', line: 'お前が打つべきだと思った。――理屈じゃない', desc: '敵全体ATK×440%＋6秒スタン' },
    stats: { atk: 1.55, hp: 1.6, spd: 1.1, prod: 1.65, skill: 1.25 },
    effect: 'court-pass', accent: '#9ed9ff', motif: 'COURT / TRUST',
    cutsceneLine: '知ってて出した。勝ち負けじゃなくて、お前が打つべきだと思ったんだよ。理屈じゃない。',
    cutsceneNarration: '観客席の光が弾ける。三重の手から離れたボールは、冷笑ではなく信頼を乗せてコートを横切る。',
    cost: standardCost('evo_mie'),
  },
  pregen: {
    name: '終端なき位相・前-原✝本質✝',
    title: '観測される前の最前線',
    emoji: '☨',
    quote: '前-原✝本質✝は概念としてすら存在しない。存在しないが、ある。',
    desc: 'グレートチェーンの頂点から、さらに外側へ。観測も定義も追いつけない、最初の一線。',
    passive: { scope: 'owned', desc: '全生産×4・クリック力×4・部員生産+500%・会心倍率+1.5', mods: { prodX: 4, clickX: 4, unitProdPct: 5, critMult: 1.5 } },
    skill: { name: '存在以前のグレートチェーン', line: '…………（線が引かれる前から、ある）', desc: '敵全体にATK×540%の位相攻撃' },
    stats: { atk: 1.65, hp: 1.55, spd: 1.08, prod: 2, skill: 1.35 },
    effect: 'phase-break', accent: '#ff425f', motif: 'BEFORE / OUT OF FRAME',
    cutsceneLine: '前-原✝本質✝は概念としてすら存在しない。存在しないが、ある。',
    cutsceneNarration: '観測の枠が砕ける。けれど存在は消えない。原初を越える位相が、そこに立ち上がる。',
    cost: standardCost('evo_pregen'),
  },
  jimen: {
    name: '地層の果てを抱くもの・地面',
    title: '数億年を記録する基盤',
    emoji: '🌏',
    quote: '地図は人間が作る。地面は全部を記録してる。人間が忘れても、地面は忘れない。',
    desc: '新しい溶岩も、古い地層も、そこで暮らした人たちの選択も。全てを重ねて記録する地面。',
    passive: { scope: 'owned', desc: '戦闘中の復活+4・地面の記憶+200%・部員生産+500%・部員HP+20%', mods: { revive: 4, memoryPct: 2, unitProdPct: 5, hpPct: 0.2 } },
    skill: { name: 'すべてを記録する地面', line: '地面は忘れない。君たちが歩いた時間も。', desc: '味方全体にHP130%のバリア' },
    stats: { atk: 1.45, hp: 1.8, spd: 1.02, prod: 1.9, skill: 1.3 },
    effect: 'strata-memory', accent: '#d7a56d', motif: 'STRATA / MEMORY',
    cutsceneLine: '地面が記憶してる。地図は人間が作るものだ。地面は忘れない。',
    cutsceneNarration: '新しい溶岩の下にも古い地層がある。ひとつずつ重なる記録が、光を帯びて脈打ちはじめる。',
    cost: standardCost('evo_jimen'),
  },
};
