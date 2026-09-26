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
  // ───────── はるか先の超上位施設（京〜無量大数） ─────────
  { id: 'deep_fault', name: '糸魚川-静岡構造線直通パイプ', emoji: '🌋', baseCost: 3.5e16, baseProd: 2.5e10, desc: '東と西を分かつ断層から直接本質を汲み上げる。', flavor: 'お前らの朝飯は、地殻変動が決めている。' },
  { id: 'miso_reactor', name: '地殻味噌熱核融合炉', emoji: '🟤', baseCost: 6.2e18, baseProd: 2.2e12, desc: '赤味噌と白味噌がマントル対流で超臨界状態になる。', flavor: '東西の境界で激しく混ざり合い、無限の熱量を放つ。' },
  { id: 'rei_engine', name: '数理零の思考外挿エンジン', emoji: '📐', baseCost: 1.1e21, baseProd: 2e14, desc: '全教科首席・偏差値85の思考を模倣する純粋知性炉。', flavor: '「面白いな」の一言で全宇宙の物理法則が再帰する。' },
  { id: 'silent_freeze', name: '寺地星15秒フリーズ切り抜き集', emoji: '🔭', baseCost: 2.5e23, baseProd: 1.8e16, desc: '十五秒間の完全沈黙が永久ループで莫大な本質を生む。', flavor: '切り抜きだけで十五万再生。本編は三千再生。' },
  { id: 'great_chain_tower', name: 'グレートチェーン絶対特異点', emoji: '🏛️', baseCost: 7e25, baseProd: 1.6e18, desc: '前-原✝本質✝に至る存在の階層ピラミッドが自立稼働。', flavor: '修正液で書かれた文字が空間を歪め始める。' },
  { id: 'corn_aqueduct', name: '南棟コーンスープ無限導水管', emoji: '🌽', baseCost: 1.8e28, baseProd: 1.5e20, desc: '偏差値70の南棟自販機から北棟へ直結された温かい生命線。', flavor: 'あるときより、ないときの方が本質である。だが今はある。' },
  { id: 'schro_collider', name: 'シュレディンガー好意量子衝突器', emoji: '🐱', baseCost: 4.5e30, baseProd: 1.4e22, desc: '好意の重ね合わせ状態を高エネルギーで衝突・崩壊させる。', flavor: '告白は波動関数の崩壊である！ 理論は崩壊した。' },
  { id: 'sealed_ring', name: '左手薬指の封印解除機構', emoji: '💍', baseCost: 1.2e33, baseProd: 1.3e24, desc: '封印されているからこそ輝く純愛の光をダイソン球で収集。', flavor: '「心の中の二見先生が〈Go, Meshino!〉って言ってる」' },
  { id: 'border_collapse', name: '桐葉高校南北国境線完全崩壊', emoji: '💥', baseCost: 3.5e35, baseProd: 1.2e26, desc: '紺ネクタイとえんじネクタイの境界が消滅し、次元の壁が崩壊。', flavor: '「あんた、なんでこっち側にいるの」「……座りたかったから」' },
  { id: 'event_horizon', name: '前-原✝本質✝事象の地平線', emoji: '🕳️', baseCost: 9e37, baseProd: 1.1e28, desc: 'ブラックホールの向こう側。光すら脱出できない概念の深淵。', flavor: '（概念としてすら存在しない）' },
  { id: 'cosmic_cmb', name: '宇宙背景放射✝本質✝共鳴網', emoji: '🌌', baseCost: 2.5e40, baseProd: 1e30, desc: 'ビッグバンの残光に最初から✝がついていたことが観測される。', flavor: '今日の電線どころか、全宇宙の電磁波が✝本質✝だった。' },
  { id: 'super_ground', name: '全宇宙記録母艦「超・地面」', emoji: '🛸', baseCost: 7e43, baseProd: 9.5e31, desc: '地図は人間が作る。地面には限界がない。銀河系ごと記録。', flavor: '地面は忘れない。地球が消滅しても、地面は残る。' },
  { id: 'corn_ontology', name: '超越次元コーンスープ存在論', emoji: '✨', baseCost: 2e47, baseProd: 9e33, desc: '「不在」そのものが実体化し、無から無限の物質と本質を紡ぐ。', flavor: '飲む人間が北棟にいなくても、自販機は世界を包み込む。' },
  { id: 'ultimate_cross', name: '✝真・前-原✝本質✝（宇宙開闢）', emoji: '✝', baseCost: 6e51, baseProd: 8.5e35, desc: '言葉と数字を超越した全存在の終着点。これまじ✝本質✝。', flavor: '「✝本質✝に教祖はいないよ。元からあった。」' },
];

export const FAC_MAP: Record<string, FacilityDef> = Object.fromEntries(FACILITIES.map((f) => [f.id, f]));
