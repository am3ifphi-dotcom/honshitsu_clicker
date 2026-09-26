import type { UnitDef } from '../types';
import ryomaImg from '../../assets/img/ryoma.jpg';
import mieImg from '../../assets/img/mie.jpg';
import reiImg from '../../assets/img/rei.jpg';
import terachiImg from '../../assets/img/terachi.jpg';
import satoImg from '../../assets/img/sato.jpg';
import heikatsuImg from '../../assets/img/heikatsu.jpg';
import izakiImg from '../../assets/img/izaki.jpg';
import izumiImg from '../../assets/img/izumi.jpg';
import meshinoImg from '../../assets/img/meshino.jpg';
import sakuraImg from '../../assets/img/sakura.jpg';
import mitsumineImg from '../../assets/img/mitsumine.jpg';
import naitoImg from '../../assets/img/naito.jpg';
import futamiImg from '../../assets/img/futami.jpg';
import kuraishiImg from '../../assets/img/kuraishi.jpg';
import feikatsuImg from '../../assets/img/feikatsu.jpg';

export const PORTRAITS: Record<string, string> = {
  ryoma: ryomaImg,
  mie: mieImg,
  rei: reiImg,
  terachi: terachiImg,
  sato: satoImg,
  heikatsu: heikatsuImg,
  izaki: izakiImg,
  izumi: izumiImg,
  meshino: meshinoImg,
  sakura: sakuraImg,
  mitsumine: mitsumineImg,
  naito: naitoImg,
  futami: futamiImg,
  kuraishi: kuraishiImg,
  feikatsu: feikatsuImg,
};

export const UNITS: UnitDef[] = [
  // ───────── N ─────────
  {
    id: 'sub', name: '両馬のサブ垢', title: '自己対話の化身', rarity: 'N', type: '本質', emoji: '📱',
    atk: 10, hp: 65, spd: 1.1, prod: 10,
    skill: { name: '自己対話', kind: 'multi', power: 0.8, hits: 3, charge: 100, line: 'うち二人は俺かもしれない', desc: 'ランダムな敵に3回攻撃（ATK×80%）' },
    passive: { desc: 'クリック力+15%・部員生産+10%', scope: 'owned', mods: { clickPct: 0.15, unitProdPct: 0.1 } },
    quote: '自演じゃない。自己対話だ。', desc: '両馬の複数アカウントの一つ。たまに勝手に送信する。',
  },
  {
    id: 'aircon', name: '北棟の室外機', title: '窓際の唸り', rarity: 'N', type: '冷笑', emoji: '🌀',
    atk: 8, hp: 80, spd: 1.0, prod: 10,
    skill: { name: '唸り', kind: 'stun', power: 0.6, duration: 1.5, charge: 120, line: 'ヴォォォォン……', desc: '敵全体にATK×60%＋1.5秒スタン' },
    passive: { desc: '【編成時】部員HP+5%・部員生産+10%', scope: 'party', mods: { hpPct: 0.05, unitProdPct: 0.1 } },
    quote: '冷房をつけると、窓際の生徒は二つの音を聞くことになる。', desc: '授業の声と室外機の唸り。北棟の日常。',
  },
  {
    id: 'densen', name: '今日の電線', title: '本質感のある線', rarity: 'N', type: '本質', emoji: '⚡',
    atk: 12, hp: 60, spd: 1.0, prod: 10,
    skill: { name: '✝本質✝感', kind: 'nuke', power: 2.2, charge: 100, line: '今日の電線✝本質✝感ある', desc: '単体にATK×220%' },
    passive: { desc: 'クリック会心率+1%・部員生産+10%', scope: 'owned', mods: { critChance: 0.01, unitProdPct: 0.1 } },
    quote: '電線に本質感があるとは何なのか。', desc: '教室の窓から撮影された。本質感がある。',
  },
  {
    id: 'baran', name: '弁当のバラン', title: '添え物の意地', rarity: 'N', type: '地理', emoji: '🌿',
    atk: 8, hp: 85, spd: 1.0, prod: 10,
    skill: { name: '添え物の意地', kind: 'shield', power: 0.15, charge: 100, line: '地理は弁当で言えばバランの位置にある', desc: '味方全体にHP15%のバリア' },
    passive: { desc: '【編成時】地理タイプATK+5%・部員生産+10%', scope: 'party', mods: { typeAtk: { 地理: 0.05 }, unitProdPct: 0.1 } },
    quote: '添え物にも、意地がある。', desc: '理数科における地理の立ち位置を体現する。',
  },
  {
    id: 'mop', name: 'モップの匂い', title: '金曜五限の廊下', rarity: 'N', type: '冷笑', emoji: '🧹',
    atk: 9, hp: 70, spd: 1.05, prod: 10,
    skill: { name: '微かに漂う', kind: 'stun', power: 0.2, duration: 2, charge: 110, line: '（微かに漂う）', desc: '敵全体を2秒スタン' },
    passive: { desc: 'オフライン上限+1時間・部員生産+10%', scope: 'owned', mods: { offlineHours: 1, unitProdPct: 0.1 } },
    quote: '廊下側から、微かに。', desc: '金曜五限、生徒の脳を省エネモードにする。',
  },
  {
    id: 'pan', name: '北棟の購買パン', title: '弁当派の宿敵', rarity: 'N', type: '面白', emoji: '🥖',
    atk: 10, hp: 72, spd: 1.0, prod: 10,
    skill: { name: '購買ダッシュ', kind: 'heal', power: 0.12, charge: 100, line: '焼きそばパンはもうない', desc: '味方全体HP12%回復' },
    passive: { desc: '毎秒本質+5%・部員生産+10%', scope: 'owned', mods: { prodPct: 0.05, unitProdPct: 0.1 } },
    quote: '弁当派か、購買派か。', desc: '食堂は南棟にある。理数科は購買で生きる。',
  },
  // ───────── R ─────────
  {
    id: 'cornsoup', name: 'コーンスープ', title: '不在の本質', rarity: 'R', type: '本質', emoji: '🌽',
    atk: 15, hp: 180, spd: 1.0, prod: 80,
    skill: { name: '不在の本質', kind: 'heal', power: 0.25, charge: 100, line: 'あるときより、ないときの方が本質である', desc: '味方全体HP25%回復' },
    passive: { desc: 'コーンスープ缶獲得+15%・部員生産+25%', scope: 'owned', mods: { canPct: 0.15, unitProdPct: 0.25 } },
    quote: '六ヶ月ぶりに、帰ってきた。', desc: '北棟の自販機から消えていた。誰も理由を知らない。',
  },
  {
    id: 'jiro', name: '二郎系ラーメン', title: '全マシの✝', rarity: 'R', type: '本質', emoji: '🍜',
    atk: 24, hp: 110, spd: 0.9, prod: 80,
    skill: { name: '全マシ', kind: 'nuke', power: 3.0, charge: 110, line: 'この脂の浮き方まじ✝本質✝', desc: '単体にATK×300%' },
    passive: { desc: '【編成時】部員ATK+6%・部員生産+25%', scope: 'party', mods: { atkPct: 0.06, unitProdPct: 0.25 } },
    quote: 'ニンニク入れますか？', desc: '両馬が週三で食べる。なぜか太らない。',
  },
  {
    id: 'tamago', name: '母親の卵焼き', title: 'テンション源', rarity: 'R', type: '面白', emoji: '🍳',
    atk: 14, hp: 160, spd: 1.0, prod: 80,
    skill: { name: 'テンション上昇', kind: 'heal', power: 0.3, charge: 110, line: '母親の卵焼きまじ✝本質✝', desc: '味方全体HP30%回復' },
    passive: { desc: '【編成時】部員HP+8%・部員生産+25%', scope: 'party', mods: { hpPct: 0.08, unitProdPct: 0.25 } },
    quote: '卵焼きがうまくてテンション上がっただけかもしれない。', desc: '理論を広げる力を持つ（両馬談）。',
  },
  {
    id: 'akamiso', name: '赤味噌スライム', title: '西の味', rarity: 'R', type: '地理', emoji: '🟤',
    atk: 18, hp: 130, spd: 1.0, prod: 80,
    skill: { name: '地殻変動の味', kind: 'aoe', power: 0.9, charge: 100, line: '地殻変動が決めた味！', desc: '敵全体にATK×90%' },
    passive: { desc: '【編成時】地理タイプATK+8%・部員生産+25%', scope: 'party', mods: { typeAtk: { 地理: 0.08 }, unitProdPct: 0.25 } },
    quote: 'お前らが今朝飲んだ味噌汁は、地殻変動が決めてる。', desc: '糸魚川-静岡構造線の西側から湧いた。',
  },
  {
    id: 'shiromiso', name: '白味噌スライム', title: '合わせる者', rarity: 'R', type: '地理', emoji: '⚪',
    atk: 16, hp: 140, spd: 1.05, prod: 80,
    skill: { name: '合わせ味噌', kind: 'heal', power: 0.2, charge: 100, line: '東と西の境界で混ざる', desc: '味方全体HP20%回復' },
    passive: { desc: '【編成時】部員HP+5%・部員生産+25%', scope: 'party', mods: { hpPct: 0.05, unitProdPct: 0.25 } },
    quote: '境界線の向こうから来た。', desc: '赤味噌とはライバル関係。仲は悪くない。',
  },
  {
    id: 'contour', name: '等高線ワーム', title: '間隔が狭い者', rarity: 'R', type: '地理', emoji: '〰️',
    atk: 20, hp: 120, spd: 1.0, prod: 80,
    skill: { name: '傾斜が急', kind: 'nuke', power: 2.5, charge: 100, line: '間隔が狭い＝傾斜が急だ！', desc: '単体にATK×250%' },
    passive: { desc: '毎秒本質+5%・部員生産+25%', scope: 'owned', mods: { prodPct: 0.05, unitProdPct: 0.25 } },
    quote: '等高線の線一本に、人の判断が載ってる。', desc: '地形図から這い出してきた。',
  },
  {
    id: 'dankyu', name: '河岸段丘ゴーレム', title: '時間の階段', rarity: 'R', type: '地理', emoji: '🪜',
    atk: 14, hp: 200, spd: 0.9, prod: 80,
    skill: { name: '上から描く', kind: 'shield', power: 0.25, charge: 110, line: '時間を掘ってると思ってくれ', desc: '味方全体にHP25%のバリア' },
    passive: { desc: '【編成時】被ダメージ-5%・部員生産+25%', scope: 'party', mods: { dmgReduce: 0.05, unitProdPct: 0.25 } },
    quote: '一番上の段が一番古い。', desc: '洪水のたびに川が下がり、段になった。',
  },
  {
    id: 'schro', name: 'シュレディンガーの好意', title: '重ね合わせの猫', rarity: 'R', type: '恋愛', emoji: '🐱',
    atk: 22, hp: 110, spd: 1.1, prod: 80,
    skill: { name: '波動関数の崩壊', kind: 'gamble', power: 3.5, charge: 100, line: '観測した瞬間に確定する！', desc: '50%で敵全体にATK×350%／50%で何も起きない' },
    passive: { desc: 'SSR以上の排出率+0.2%・部員生産+25%', scope: 'owned', mods: { ssrBonus: 0.002, unitProdPct: 0.25 } },
    quote: '好意は観測されていない状態で重ね合わさっている。', desc: '櫻優の理論から生まれた。生きてるか死んでるかは不明。',
  },
  {
    id: 'crepe', name: 'クレープ（亜✝本質✝）', title: '格下扱いされた者', rarity: 'R', type: '恋愛', emoji: '🥞',
    atk: 18, hp: 130, spd: 1.1, prod: 80,
    skill: { name: '亜✝本質✝の逆襲', kind: 'multi', power: 0.9, hits: 4, charge: 110, line: '亜じゃない！ ✝本質✝だ！', desc: 'ランダムに4回攻撃（ATK×90%）' },
    passive: { desc: '黄金✝の出現率+10%・部員生産+25%', scope: 'owned', mods: { goldenRate: 0.1, unitProdPct: 0.25 } },
    quote: '亜✝本質✝扱いされて、ずっと怒っている。', desc: '倉石のグレートチェーンで下位に置かれた。',
  },
  {
    id: 'sasakama', name: '笹かまぼこ（宮城）', title: '地理ミスの被害者', rarity: 'R', type: '面白', emoji: '🍥',
    atk: 16, hp: 140, spd: 1.0, prod: 80,
    skill: { name: '地理ミス', kind: 'stun', power: 0.8, duration: 1.5, charge: 100, line: '三重の名物ではない！', desc: '敵全体ATK×80%＋1.5秒スタン' },
    passive: { desc: '学年XP+10%・部員生産+25%', scope: 'owned', mods: { xpPct: 0.1, unitProdPct: 0.25 } },
    quote: '笹かまぼこは宮城だろ（寺地）', desc: '両馬に三重県の名物にされかけた。',
  },
  {
    id: 'mikansuji', name: 'みかんの白い筋', title: '見えない境界線', rarity: 'R', type: '冷笑', emoji: '🍊',
    atk: 18, hp: 125, spd: 1.0, prod: 80,
    skill: { name: '見えない境界', kind: 'nuke', power: 2.4, charge: 100, line: '糸魚川-静岡構造線より深い', desc: '単体にATK×240%' },
    passive: { desc: 'クリック会心倍率+0.5・部員生産+25%', scope: 'owned', mods: { critMult: 0.5, unitProdPct: 0.25 } },
    quote: '取る人間と取らない人間の間には、見えない境界線がある。', desc: '三重県産。臣下が剥く。',
  },
  {
    id: 'marumochi', name: '丸餅', title: '西の雑煮', rarity: 'R', type: '地理', emoji: '⭕',
    atk: 15, hp: 155, spd: 0.95, prod: 80,
    skill: { name: '西は丸', kind: 'shield', power: 0.2, charge: 100, line: '諸説ある', desc: '味方全体にHP20%のバリア' },
    passive: { desc: '【編成時】部員HP+5%・部員生産+25%', scope: 'party', mods: { hpPct: 0.05, unitProdPct: 0.25 } },
    quote: '西は丸。諸説ある。', desc: '地質と関係があるという研究もある。',
  },
  {
    id: 'kakumochi', name: '角餅', title: '東の雑煮', rarity: 'R', type: '地理', emoji: '⬜',
    atk: 18, hp: 135, spd: 0.95, prod: 80,
    skill: { name: '東は四角', kind: 'aoe', power: 0.85, charge: 100, line: '諸説ある（二回目）', desc: '敵全体にATK×85%' },
    passive: { desc: '【編成時】部員ATK+5%・部員生産+25%', scope: 'party', mods: { atkPct: 0.05, unitProdPct: 0.25 } },
    quote: '東は四角。諸説ある。', desc: '丸餅とは永遠の境界線を挟んで対峙している。',
  },
  // ───────── SR ─────────
  {
    id: 'izaki', name: '伊崎', title: 'まとめ役', rarity: 'SR', type: '面白', emoji: '😄', speaker: 'izaki', portrait: PORTRAITS.izaki,
    atk: 28, hp: 220, spd: 1.0, prod: 500,
    skill: { name: 'まとめ役', kind: 'buff', power: 0.4, duration: 8, charge: 110, line: '面白いな！ 俺も混ぜて', desc: '味方全体のATK+40%（8秒）' },
    passive: { desc: '【編成時】部員ATK+8%・部員生産+50%', scope: 'party', mods: { atkPct: 0.08, unitProdPct: 0.5 } },
    quote: '朝飯が何億年前の地面で決まってるって、やばくないか。', desc: 'B組のまとめ役。三重の「まあ」の隙間を正確に突く（無自覚）。',
  },
  {
    id: 'izumi', name: '伊豆見', title: '大喜利の司会', rarity: 'SR', type: '面白', emoji: '🎤', speaker: 'izumi', portrait: PORTRAITS.izumi,
    atk: 25, hp: 230, spd: 1.1, prod: 500,
    skill: { name: '大喜利', kind: 'gamble', power: 4.0, charge: 100, line: 'お題：✝本質✝を一言で説明してください', desc: '50%で敵全体ATK×400%／滑ると何も起きない' },
    passive: { desc: '学年XP+15%・部員生産+50%', scope: 'owned', mods: { xpPct: 0.15, unitProdPct: 0.5 } },
    quote: '俺が司会やりたい。', desc: '伊崎の横から、半歩だけ自分の方へ歩き出した。',
  },
  {
    id: 'meshino', name: '召野カイト', title: '人妻の使徒', rarity: 'SR', type: '恋愛', emoji: '💍', speaker: 'meshino', portrait: PORTRAITS.meshino,
    atk: 38, hp: 180, spd: 1.0, prod: 500,
    skill: { name: '封印の刻印', kind: 'nuke', power: 4.5, charge: 120, line: '指輪が光るたびに心臓が止まる！', desc: '単体にATK×450%' },
    passive: { desc: '【編成時】恋愛タイプATK+25%・部員生産+50%', scope: 'party', mods: { typeAtk: { 恋愛: 0.25 }, unitProdPct: 0.5 } },
    quote: '人妻は美しい。封印されているからこそ輝く。', desc: '英語の成績が百二十五人抜き。動機は不純だった。今は違う。',
  },
  {
    id: 'sakura', name: '櫻優', title: '恋愛学の研究者', rarity: 'SR', type: '恋愛', emoji: '📓', speaker: 'sakura', portrait: PORTRAITS.sakura,
    atk: 30, hp: 200, spd: 1.0, prod: 500,
    skill: { name: 'シュレディンガーの好意', kind: 'gamble', power: 5.0, charge: 110, line: '告白は波動関数の崩壊である！', desc: '50%で敵全体ATK×500%／50%で理論崩壊' },
    passive: { desc: 'ドロップ率+15%・部員生産+50%', scope: 'owned', mods: { dropPct: 0.15, unitProdPct: 0.5 } },
    quote: '彼女はいません。いたこともありません。', desc: '内進二年。サンプルG-07を二ヶ月観察していた。',
  },
  {
    id: 'mitsumine', name: '三峰瑠衣', title: '内進の「は？」', rarity: 'SR', type: '冷笑', emoji: '😤', speaker: 'mitsumine', portrait: PORTRAITS.mitsumine,
    atk: 25, hp: 280, spd: 1.0, prod: 500,
    skill: { name: 'は？（内進）', kind: 'stun', power: 1.0, duration: 2.5, charge: 110, line: 'は？', desc: '敵全体ATK×100%＋2.5秒スタン' },
    passive: { desc: '【編成時】部員HP+12%・部員生産+50%', scope: 'party', mods: { hpPct: 0.12, unitProdPct: 0.5 } },
    quote: '好きなら好きって言いなよ。', desc: '常識の塊。三重と「は？」がハモる（本人たちは否定）。',
  },
  {
    id: 'naito', name: '内藤蘭', title: '少し笑う人', rarity: 'SR', type: '面白', emoji: '📖', speaker: 'naito', portrait: PORTRAITS.naito,
    atk: 22, hp: 260, spd: 1.0, prod: 500,
    skill: { name: '面白い考え方だね', kind: 'heal', power: 0.4, charge: 110, line: '（少し笑った）', desc: '味方全体HP40%回復' },
    passive: { desc: '【編成時】スキルゲージ増加+8%・部員生産+50%', scope: 'party', mods: { gaugePct: 0.08, unitProdPct: 0.5 } },
    quote: '意味わかんないけど、聞いてると安心する。', desc: '本質配信の視聴者。櫻の理論に核爆弾を落とした。',
  },
  {
    id: 'futami', name: '二見玲子', title: '副担任（英語）', rarity: 'SR', type: '恋愛', emoji: '🔤', speaker: 'futami', portrait: PORTRAITS.futami,
    atk: 28, hp: 230, spd: 1.0, prod: 500,
    skill: { name: 'すごい、召野くん', kind: 'buff', power: 0.5, duration: 8, charge: 120, line: 'Great job!', desc: '味方全体のATK+50%（8秒）' },
    passive: { desc: '【編成時】恋愛タイプATK+15%・部員生産+50%', scope: 'party', mods: { typeAtk: { 恋愛: 0.15 }, unitProdPct: 0.5 } },
    quote: '私のためじゃなくて、自分のためにね。', desc: '明るい先生。左手薬指に封印の刻印。',
  },
  {
    id: 'kuraishi', name: '倉石暁', title: '✝本質✝の狂信者', rarity: 'SR', type: '本質', emoji: '📜', speaker: 'kuraishi', portrait: PORTRAITS.kuraishi,
    atk: 32, hp: 200, spd: 1.05, prod: 500,
    skill: { name: 'グレートチェーン', kind: 'multi', power: 0.8, hits: 5, charge: 110, line: '前-原✝本質✝→原✝本質✝→✝本質✝→亜✝本質✝→非✝本質✝！', desc: 'ランダムに5回攻撃（ATK×80%）' },
    passive: { desc: 'クリック力+35%・部員生産+50%', scope: 'owned', mods: { clickPct: 0.35, unitProdPct: 0.5 } },
    quote: '教祖に会えた。', desc: 'ブレザーの裏に修正液で✝本質✝。全ての「は？」を数えている。',
  },
  {
    id: 'kilauea', name: 'キラウエア火山', title: '新しい地面', rarity: 'SR', type: '地理', emoji: '🌋',
    atk: 38, hp: 220, spd: 0.85, prod: 500,
    skill: { name: '地図が追いつかない', kind: 'aoe', power: 1.3, charge: 120, line: '数年前には存在しなかった地面だ！', desc: '敵全体にATK×130%' },
    passive: { desc: '【編成時】地理タイプATK+15%・部員生産+50%', scope: 'party', mods: { typeAtk: { 地理: 0.15 }, unitProdPct: 0.5 } },
    quote: '地球は今も地面を作り続けている。', desc: 'ハワイ研修旅行で出会った。',
  },
  // ───────── SSR ─────────
  {
    id: 'ryoma', name: '両馬二郎', title: '✝本質✝の創始者', rarity: 'SSR', type: '本質', emoji: '✝', speaker: 'ryoma', portrait: PORTRAITS.ryoma,
    atk: 45, hp: 320, spd: 1.0, prod: 3500,
    skill: { name: 'これまじ✝本質✝', kind: 'aoe', power: 1.8, charge: 110, line: 'これまじ✝本質✝', desc: '敵全体にATK×180%' },
    passive: { desc: 'クリック力+80%・部員生産+100%', scope: 'owned', mods: { clickPct: 0.8, unitProdPct: 1.0 } },
    quote: '✝本質✝に教祖はいないよ。元からあった。俺はそれに✝をつけただけだ。', desc: '三重の名前をネットのあちこちに埋め込む。十回に一回、すごいことを言う。',
  },
  {
    id: 'mie', name: '三重県臣', title: '否定の守護者', rarity: 'SSR', type: '冷笑', emoji: '😑', speaker: 'mie', portrait: PORTRAITS.mie,
    atk: 30, hp: 480, spd: 1.0, prod: 3500,
    skill: { name: 'は？', kind: 'stun', power: 1.4, duration: 3, charge: 110, line: 'は？', desc: '敵全体ATK×140%＋3秒スタン' },
    passive: { desc: '【編成時】被ダメージ-12%・部員生産+100%', scope: 'party', mods: { dmgReduce: 0.12, unitProdPct: 1.0 } },
    quote: '俺に✝本質✝をつけるな。', desc: '冷笑系を自認。「まあ」を二回言うとき、内心では面白いと思っている。',
  },
  {
    id: 'terachi', name: '寺地星', title: '本質配信の巫女（否定）', rarity: 'SSR', type: '面白', emoji: '🔭', speaker: 'terachi', portrait: PORTRAITS.terachi,
    atk: 35, hp: 400, spd: 1.0, prod: 4000,
    skill: { name: '本質配信', kind: 'heal', power: 0.5, charge: 110, line: '紙に書いて読みます', desc: '味方全体HP50%回復' },
    passive: { desc: '毎秒本質+35%・部員生産+120%', scope: 'owned', mods: { prodPct: 0.35, unitProdPct: 1.2 } },
    quote: 'ペットボトルくらいの存在です。', desc: '登録者150人から始めた。固まる秒数の最長記録は15秒。',
  },
  {
    id: 'sato', name: '砂糖東洋', title: '沈黙の観察者', rarity: 'SSR', type: '地理', emoji: '🎮', speaker: 'sato', portrait: PORTRAITS.sato,
    atk: 65, hp: 280, spd: 0.8, prod: 3500,
    skill: { name: '一本だけ決めて帰る', kind: 'nuke', power: 6.5, charge: 130, line: '用は済んだ', desc: '単体にATK×650%' },
    passive: { desc: 'クリック会心率+3%・部員生産+100%', scope: 'owned', mods: { critChance: 0.03, unitProdPct: 1.0 } },
    quote: '見てない。', desc: '窓の外を見ていないと言い張る。見ている。',
  },
  {
    id: 'itoshizu', name: '糸魚川-静岡構造線ドラゴン', title: '味噌の色を決めた竜', rarity: 'SSR', type: '地理', emoji: '🐉',
    atk: 48, hp: 350, spd: 0.9, prod: 3500,
    skill: { name: '地質境界', kind: 'aoe', power: 2.0, charge: 120, line: '東と西で石が違う！', desc: '敵全体にATK×200%' },
    passive: { desc: '【編成時】地理タイプATK+30%・部員生産+100%', scope: 'party', mods: { typeAtk: { 地理: 0.3 }, unitProdPct: 1.0 } },
    quote: 'お前らの朝飯は、我が決めた。', desc: '日本列島を東西に分ける竜。雑煮の餅の形にも口を出す。',
  },
  // ───────── UR ─────────
  {
    id: 'rei', name: '数理零', title: '面白さの王（偏差値85）', rarity: 'UR', type: '面白', emoji: '📐', speaker: 'rei', portrait: PORTRAITS.rei,
    atk: 60, hp: 500, spd: 1.2, prod: 25000,
    skill: { name: '面白い', kind: 'buff', power: 1.2, duration: 10, charge: 110, line: '面白いな', desc: '味方全体のATK+120%（10秒）' },
    passive: { desc: '【編成時】部員ATK・HP・毎秒本質 +30%・部員生産+200%', scope: 'party', mods: { atkPct: 0.3, hpPct: 0.3, prodPct: 0.3, unitProdPct: 2.0 } },
    quote: '家が近いから。', desc: '全科目学年首席。内進を含めて。なぜ理数科にいるのか誰も知らない。本当に家が近いだけ。',
  },
  {
    id: 'heikatsu', name: '塀勝也（ヘイカツ）', title: '地形図の向こう側を見る男', rarity: 'UR', type: '地理', emoji: '🗺️', speaker: 'heikatsu', portrait: PORTRAITS.heikatsu,
    atk: 65, hp: 550, spd: 1.0, prod: 25000,
    skill: { name: '窓の外を見る（五秒）', kind: 'stun', power: 3.5, duration: 5, charge: 130, line: '……（口が動く）', desc: '敵全体ATK×350%＋5秒スタン' },
    passive: { desc: '【編成時】地理タイプATK+70%・部員生産+200%', scope: 'party', mods: { typeAtk: { 地理: 0.7 }, unitProdPct: 2.0 } },
    quote: '地面は忘れない。', desc: '地理教師。三年間同じ地図を見せて、見る側が変わるのを待てる。',
  },
  {
    id: 'feikatsu', name: 'フェイカツ', title: '概念', rarity: 'UR', type: '本質', emoji: '🎭', speaker: 'feikatsu', portrait: PORTRAITS.feikatsu,
    atk: 70, hp: 420, spd: 1.1, prod: 25000,
    skill: { name: '受験ナビ荒らし', kind: 'multi', power: 1.4, hits: 6, charge: 120, line: '受験生よ、来い。✝', desc: 'ランダムに6回攻撃（ATK×140%）' },
    passive: { desc: 'コーンスープ缶獲得+35%・黄金✝出現+20%・部員生産+200%', scope: 'owned', mods: { canPct: 0.35, goldenRate: 0.2, unitProdPct: 2.0 } },
    quote: 'フェイカツはフェイカツであって俺じゃない。', desc: '受験情報掲示板に棲息する。中身は両馬（本人は否定）。',
  },
  // ───────── LR ─────────
  {
    id: 'pregen', name: '前-原✝本質✝', title: 'グレートチェーンの頂点', rarity: 'LR', type: '本質', emoji: '☨',
    atk: 100, hp: 950, spd: 1.1, prod: 150000,
    skill: { name: '存在しないが、ある', kind: 'aoe', power: 4.0, charge: 120, line: '…………', desc: '敵全体にATK×400%' },
    passive: { desc: '全生産×2.5・クリック力×2.5・部員生産×3', scope: 'owned', mods: { prodX: 2.5, clickX: 2.5, unitProdPct: 3.0 } },
    quote: '（概念としてすら存在しない）', desc: '原✝本質✝のさらに前。倉石が発見し、寺地が一瞬で崩壊させた。',
  },
  {
    id: 'jimen', name: '地面', title: '全部を記録するもの', rarity: 'LR', type: '地理', emoji: '🌏',
    atk: 75, hp: 1400, spd: 1.0, prod: 150000,
    skill: { name: '地面は忘れない', kind: 'shield', power: 0.8, charge: 120, line: '……（全部記録している）', desc: '味方全体にHP80%のバリア' },
    passive: { desc: '戦闘中の復活+2・地面の記憶獲得+100%・部員生産×3', scope: 'owned', mods: { revive: 2, memoryPct: 1.0, unitProdPct: 3.0 } },
    quote: '地面は忘れない。', desc: '地図は人間が作る。地面には限界がない。',
  },
  // ───────── EX（深淵召喚限定・神格化部員） ─────────
  {
    id: 'ex_ryoma', name: '✝神託者✝ 両馬二郎', title: '天啓を降ろす始祖', rarity: 'LR', type: '本質', emoji: '✝', speaker: 'ryoma', portrait: PORTRAITS.ryoma,
    atk: 180, hp: 1600, spd: 1.1, prod: 800000,
    skill: { name: '超・これまじ✝本質✝', kind: 'aoe', power: 5.5, charge: 110, line: '全宇宙がまじ✝本質✝', desc: '敵全体にATK×550%' },
    passive: { desc: '全生産×5・クリック力×5・本質タイプATK+100%', scope: 'owned', mods: { prodX: 5, clickX: 5, typeAtk: { 本質: 1.0 } } },
    quote: '天啓は降ろすものじゃない。俺自身が天啓だ。', desc: '構造線の深淵から神格化して帰還した両馬。二郎系を宇宙規模で食べる。',
  },
  {
    id: 'ex_rei', name: '絶対領域の首席・数理零', title: '偏差値1000の超越者', rarity: 'LR', type: '面白', emoji: '📐', speaker: 'rei', portrait: PORTRAITS.rei,
    atk: 220, hp: 1800, spd: 1.3, prod: 1200000,
    skill: { name: '絶対の「面白い」', kind: 'buff', power: 2.0, duration: 15, charge: 100, line: '世界は本当に面白いな', desc: '味方全体のATK+200%（15秒）' },
    passive: { desc: '全ステータス×3・毎秒本質×3・部員生産×5', scope: 'owned', mods: { statX: 3, prodX: 3, unitProdPct: 5.0 } },
    quote: '家が近いから。それ以上の真理はないよ。', desc: '内進も理数科も次元の壁も全て解き明かした怪童。',
  },
  {
    id: 'ex_heikatsu', name: '地殻統率者・塀勝也', title: '地球の記憶そのもの', rarity: 'LR', type: '地理', emoji: '🗺️', speaker: 'heikatsu', portrait: PORTRAITS.heikatsu,
    atk: 200, hp: 2500, spd: 1.0, prod: 900000,
    skill: { name: '構造線大破断', kind: 'stun', power: 6.0, duration: 8, charge: 120, line: '地球が、お前らを覚えている！', desc: '敵全体ATK×600%＋8秒スタン' },
    passive: { desc: '地理タイプATK+200%・味方被ダメ-20%・戦闘復活+3', scope: 'owned', mods: { typeAtk: { 地理: 2.0 }, dmgReduce: 0.2, revive: 3 } },
    quote: '地球が何億年かけて作った地面の上で、お前らは生きている。', desc: '三年間見せた地図が、全惑星規模の地殻へ拡大した。',
  },
  {
    id: 'ex_terachi', name: '星と地面の主・寺地星', title: '全宇宙配信者', rarity: 'LR', type: '面白', emoji: '🔭', speaker: 'terachi', portrait: PORTRAITS.terachi,
    atk: 160, hp: 2000, spd: 1.0, prod: 1000000,
    skill: { name: '三十秒の宇宙フリーズ', kind: 'heal', power: 1.0, charge: 100, line: '……（全銀河が固まった）', desc: '味方全体HP100%全快＋バリア50%' },
    passive: { desc: '全生産×4・黄金✝出現率+50%・部員生産×4', scope: 'owned', mods: { prodX: 4, goldenRate: 0.5, unitProdPct: 4.0 } },
    quote: '銀河くらいの存在になりました。紙に書いて読みます。', desc: '登録者数が百億人を突破。沈黙の長さも新記録を更新。',
  },
  {
    id: 'ex_mie', name: '完全否定神・三重県臣', title: '冷笑の絶対領域', rarity: 'LR', type: '冷笑', emoji: '😑', speaker: 'mie', portrait: PORTRAITS.mie,
    atk: 170, hp: 3000, spd: 1.0, prod: 850000,
    skill: { name: '「は？」の神域', kind: 'stun', power: 3.5, duration: 6, charge: 110, line: '……は？（宇宙が静止する）', desc: '敵全体ATK×350%＋6秒スタン' },
    passive: { desc: '味方被ダメ-25%・全冷笑タイプATK+150%', scope: 'owned', mods: { dmgReduce: 0.25, typeAtk: { 冷笑: 1.5 } } },
    quote: '神とか言うな。俺はただの三重県臣だ。', desc: 'すべてのナンセンスを拒絶し切った結果、宇宙の安定を守る神となった。',
  },
];

export const UNIT_MAP: Record<string, UnitDef> = Object.fromEntries(UNITS.map((u) => [u.id, u]));
