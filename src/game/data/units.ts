import type { UnitDef } from '../types';
import ryomaImg from '../../assets/img/ryoma.jpg';
import mieImg from '../../assets/img/mie.jpg';
import reiImg from '../../assets/img/rei.jpg';
import terachiImg from '../../assets/img/terachi.jpg';
import satoImg from '../../assets/img/sato.jpg';
import heikatsuImg from '../../assets/img/heikatsu.jpg';

export const PORTRAITS: Record<string, string> = {
  ryoma: ryomaImg,
  mie: mieImg,
  rei: reiImg,
  terachi: terachiImg,
  sato: satoImg,
  heikatsu: heikatsuImg,
};

export const UNITS: UnitDef[] = [
  // ───────── N ─────────
  {
    id: 'sub', name: '両馬のサブ垢', title: '自己対話の化身', rarity: 'N', type: '本質', emoji: '📱',
    atk: 8, hp: 55, spd: 1.1, prod: 0.1,
    skill: { name: '自己対話', kind: 'multi', power: 0.8, hits: 3, charge: 100, line: 'うち二人は俺かもしれない', desc: 'ランダムな敵に3回攻撃（ATK×80%）' },
    passive: { desc: 'クリック力+10%（自演ではない）', scope: 'owned', mods: { clickPct: 0.1 } },
    quote: '自演じゃない。自己対話だ。', desc: '両馬の複数アカウントの一つ。たまに勝手に送信する。',
  },
  {
    id: 'aircon', name: '北棟の室外機', title: '窓際の唸り', rarity: 'N', type: '冷笑', emoji: '🌀',
    atk: 7, hp: 70, spd: 1.0, prod: 0.1,
    skill: { name: '唸り', kind: 'stun', power: 0.6, duration: 1.5, charge: 120, line: 'ヴォォォォン……', desc: '敵全体にATK×60%＋1.5秒スタン' },
    passive: { desc: '【編成時】部員HP+3%', scope: 'party', mods: { hpPct: 0.03 } },
    quote: '冷房をつけると、窓際の生徒は二つの音を聞くことになる。', desc: '授業の声と室外機の唸り。北棟の日常。',
  },
  {
    id: 'densen', name: '今日の電線', title: '本質感のある線', rarity: 'N', type: '本質', emoji: '⚡',
    atk: 9, hp: 50, spd: 1.0, prod: 0.1,
    skill: { name: '✝本質✝感', kind: 'nuke', power: 2.2, charge: 100, line: '今日の電線✝本質✝感ある', desc: '単体にATK×220%' },
    passive: { desc: 'クリック会心率+0.5%', scope: 'owned', mods: { critChance: 0.005 } },
    quote: '電線に本質感があるとは何なのか。', desc: '教室の窓から撮影された。本質感がある。',
  },
  {
    id: 'baran', name: '弁当のバラン', title: '添え物の意地', rarity: 'N', type: '地理', emoji: '🌿',
    atk: 6, hp: 75, spd: 1.0, prod: 0.1,
    skill: { name: '添え物の意地', kind: 'shield', power: 0.15, charge: 100, line: '地理は弁当で言えばバランの位置にある', desc: '味方全体にHP15%のバリア' },
    passive: { desc: '【編成時】地理タイプATK+3%', scope: 'party', mods: { typeAtk: { 地理: 0.03 } } },
    quote: '添え物にも、意地がある。', desc: '理数科における地理の立ち位置を体現する。',
  },
  {
    id: 'mop', name: 'モップの匂い', title: '金曜五限の廊下', rarity: 'N', type: '冷笑', emoji: '🧹',
    atk: 7, hp: 60, spd: 1.05, prod: 0.1,
    skill: { name: '微かに漂う', kind: 'stun', power: 0.2, duration: 2, charge: 110, line: '（微かに漂う）', desc: '敵全体を2秒スタン' },
    passive: { desc: 'オフライン上限+30分', scope: 'owned', mods: { offlineHours: 0.5 } },
    quote: '廊下側から、微かに。', desc: '金曜五限、生徒の脳を省エネモードにする。',
  },
  {
    id: 'pan', name: '北棟の購買パン', title: '弁当派の宿敵', rarity: 'N', type: '面白', emoji: '🥖',
    atk: 8, hp: 62, spd: 1.0, prod: 0.1,
    skill: { name: '購買ダッシュ', kind: 'heal', power: 0.12, charge: 100, line: '焼きそばパンはもうない', desc: '味方全体HP12%回復' },
    passive: { desc: '毎秒本質+2%', scope: 'owned', mods: { prodPct: 0.02 } },
    quote: '弁当派か、購買派か。', desc: '食堂は南棟にある。理数科は購買で生きる。',
  },
  // ───────── R ─────────
  {
    id: 'cornsoup', name: 'コーンスープ', title: '不在の本質', rarity: 'R', type: '本質', emoji: '🌽',
    atk: 12, hp: 150, spd: 1.0, prod: 0.3,
    skill: { name: '不在の本質', kind: 'heal', power: 0.25, charge: 100, line: 'あるときより、ないときの方が本質である', desc: '味方全体HP25%回復' },
    passive: { desc: 'コーンスープ缶獲得+10%', scope: 'owned', mods: { canPct: 0.1 } },
    quote: '六ヶ月ぶりに、帰ってきた。', desc: '北棟の自販機から消えていた。誰も理由を知らない。',
  },
  {
    id: 'jiro', name: '二郎系ラーメン', title: '全マシの✝', rarity: 'R', type: '本質', emoji: '🍜',
    atk: 20, hp: 90, spd: 0.9, prod: 0.3,
    skill: { name: '全マシ', kind: 'nuke', power: 3.0, charge: 110, line: 'この脂の浮き方まじ✝本質✝', desc: '単体にATK×300%' },
    passive: { desc: '【編成時】部員ATK+3%', scope: 'party', mods: { atkPct: 0.03 } },
    quote: 'ニンニク入れますか？', desc: '両馬が週三で食べる。なぜか太らない。',
  },
  {
    id: 'tamago', name: '母親の卵焼き', title: 'テンション源', rarity: 'R', type: '面白', emoji: '🍳',
    atk: 10, hp: 140, spd: 1.0, prod: 0.3,
    skill: { name: 'テンション上昇', kind: 'heal', power: 0.3, charge: 110, line: '母親の卵焼きまじ✝本質✝', desc: '味方全体HP30%回復' },
    passive: { desc: '【編成時】部員HP+5%', scope: 'party', mods: { hpPct: 0.05 } },
    quote: '卵焼きがうまくてテンション上がっただけかもしれない。', desc: '理論を広げる力を持つ（両馬談）。',
  },
  {
    id: 'akamiso', name: '赤味噌スライム', title: '西の味', rarity: 'R', type: '地理', emoji: '🟤',
    atk: 15, hp: 110, spd: 1.0, prod: 0.3,
    skill: { name: '地殻変動の味', kind: 'aoe', power: 0.9, charge: 100, line: '地殻変動が決めた味！', desc: '敵全体にATK×90%' },
    passive: { desc: '【編成時】地理タイプATK+5%', scope: 'party', mods: { typeAtk: { 地理: 0.05 } } },
    quote: 'お前らが今朝飲んだ味噌汁は、地殻変動が決めてる。', desc: '糸魚川-静岡構造線の西側から湧いた。',
  },
  {
    id: 'shiromiso', name: '白味噌スライム', title: '合わせる者', rarity: 'R', type: '地理', emoji: '⚪',
    atk: 13, hp: 120, spd: 1.05, prod: 0.3,
    skill: { name: '合わせ味噌', kind: 'heal', power: 0.2, charge: 100, line: '東と西の境界で混ざる', desc: '味方全体HP20%回復' },
    passive: { desc: '【編成時】部員HP+3%', scope: 'party', mods: { hpPct: 0.03 } },
    quote: '境界線の向こうから来た。', desc: '赤味噌とはライバル関係。仲は悪くない。',
  },
  {
    id: 'contour', name: '等高線ワーム', title: '間隔が狭い者', rarity: 'R', type: '地理', emoji: '〰️',
    atk: 16, hp: 100, spd: 1.0, prod: 0.3,
    skill: { name: '傾斜が急', kind: 'nuke', power: 2.5, charge: 100, line: '間隔が狭い＝傾斜が急だ！', desc: '単体にATK×250%' },
    passive: { desc: '毎秒本質+3%', scope: 'owned', mods: { prodPct: 0.03 } },
    quote: '等高線の線一本に、人の判断が載ってる。', desc: '地形図から這い出してきた。',
  },
  {
    id: 'dankyu', name: '河岸段丘ゴーレム', title: '時間の階段', rarity: 'R', type: '地理', emoji: '🪜',
    atk: 10, hp: 170, spd: 0.9, prod: 0.3,
    skill: { name: '上から描く', kind: 'shield', power: 0.25, charge: 110, line: '時間を掘ってると思ってくれ', desc: '味方全体にHP25%のバリア' },
    passive: { desc: '【編成時】被ダメージ-3%', scope: 'party', mods: { dmgReduce: 0.03 } },
    quote: '一番上の段が一番古い。', desc: '洪水のたびに川が下がり、段になった。',
  },
  {
    id: 'schro', name: 'シュレディンガーの好意', title: '重ね合わせの猫', rarity: 'R', type: '恋愛', emoji: '🐱',
    atk: 18, hp: 90, spd: 1.1, prod: 0.3,
    skill: { name: '波動関数の崩壊', kind: 'gamble', power: 3.5, charge: 100, line: '観測した瞬間に確定する！', desc: '50%で敵全体にATK×350%／50%で何も起きない' },
    passive: { desc: 'SSR以上の排出率+0.1%', scope: 'owned', mods: { ssrBonus: 0.001 } },
    quote: '好意は観測されていない状態で重ね合わさっている。', desc: '櫻優の理論から生まれた。生きてるか死んでるかは不明。',
  },
  {
    id: 'crepe', name: 'クレープ（亜✝本質✝）', title: '格下扱いされた者', rarity: 'R', type: '恋愛', emoji: '🥞',
    atk: 14, hp: 110, spd: 1.1, prod: 0.3,
    skill: { name: '亜✝本質✝の逆襲', kind: 'multi', power: 0.9, hits: 4, charge: 110, line: '亜じゃない！ ✝本質✝だ！', desc: 'ランダムに4回攻撃（ATK×90%）' },
    passive: { desc: '黄金✝の出現率+5%', scope: 'owned', mods: { goldenRate: 0.05 } },
    quote: '亜✝本質✝扱いされて、ずっと怒っている。', desc: '倉石のグレートチェーンで下位に置かれた。',
  },
  {
    id: 'sasakama', name: '笹かまぼこ（宮城）', title: '地理ミスの被害者', rarity: 'R', type: '面白', emoji: '🍥',
    atk: 13, hp: 115, spd: 1.0, prod: 0.3,
    skill: { name: '地理ミス', kind: 'stun', power: 0.8, duration: 1.5, charge: 100, line: '三重の名物ではない！', desc: '敵全体ATK×80%＋1.5秒スタン' },
    passive: { desc: '学年XP+5%', scope: 'owned', mods: { xpPct: 0.05 } },
    quote: '笹かまぼこは宮城だろ（寺地）', desc: '両馬に三重県の名物にされかけた。',
  },
  {
    id: 'mikansuji', name: 'みかんの白い筋', title: '見えない境界線', rarity: 'R', type: '冷笑', emoji: '🍊',
    atk: 14, hp: 100, spd: 1.0, prod: 0.3,
    skill: { name: '見えない境界', kind: 'nuke', power: 2.4, charge: 100, line: '糸魚川-静岡構造線より深い', desc: '単体にATK×240%' },
    passive: { desc: 'クリック会心倍率+0.2', scope: 'owned', mods: { critMult: 0.2 } },
    quote: '取る人間と取らない人間の間には、見えない境界線がある。', desc: '三重県産。臣下が剥く。',
  },
  {
    id: 'marumochi', name: '丸餅', title: '西の雑煮', rarity: 'R', type: '地理', emoji: '⭕',
    atk: 12, hp: 130, spd: 0.95, prod: 0.3,
    skill: { name: '西は丸', kind: 'shield', power: 0.2, charge: 100, line: '諸説ある', desc: '味方全体にHP20%のバリア' },
    passive: { desc: '【編成時】部員HP+3%', scope: 'party', mods: { hpPct: 0.03 } },
    quote: '西は丸。諸説ある。', desc: '地質と関係があるという研究もある。',
  },
  {
    id: 'kakumochi', name: '角餅', title: '東の雑煮', rarity: 'R', type: '地理', emoji: '⬜',
    atk: 14, hp: 115, spd: 0.95, prod: 0.3,
    skill: { name: '東は四角', kind: 'aoe', power: 0.85, charge: 100, line: '諸説ある（二回目）', desc: '敵全体にATK×85%' },
    passive: { desc: '【編成時】部員ATK+3%', scope: 'party', mods: { atkPct: 0.03 } },
    quote: '東は四角。諸説ある。', desc: '丸餅とは永遠の境界線を挟んで対峙している。',
  },
  // ───────── SR ─────────
  {
    id: 'izaki', name: '伊崎', title: 'まとめ役', rarity: 'SR', type: '面白', emoji: '😄', speaker: 'izaki',
    atk: 22, hp: 180, spd: 1.0, prod: 0.8,
    skill: { name: 'まとめ役', kind: 'buff', power: 0.4, duration: 8, charge: 110, line: '面白いな！ 俺も混ぜて', desc: '味方全体のATK+40%（8秒）' },
    passive: { desc: '【編成時】部員ATK+5%', scope: 'party', mods: { atkPct: 0.05 } },
    quote: '朝飯が何億年前の地面で決まってるって、やばくないか。', desc: 'B組のまとめ役。三重の「まあ」の隙間を正確に突く（無自覚）。',
  },
  {
    id: 'izumi', name: '伊豆見', title: '大喜利の司会', rarity: 'SR', type: '面白', emoji: '🎤', speaker: 'izumi',
    atk: 20, hp: 190, spd: 1.1, prod: 0.8,
    skill: { name: '大喜利', kind: 'gamble', power: 4.0, charge: 100, line: 'お題：✝本質✝を一言で説明してください', desc: '50%で敵全体ATK×400%／滑ると何も起きない' },
    passive: { desc: '学年XP+10%', scope: 'owned', mods: { xpPct: 0.1 } },
    quote: '俺が司会やりたい。', desc: '伊崎の横から、半歩だけ自分の方へ歩き出した。',
  },
  {
    id: 'meshino', name: '召野カイト', title: '人妻の使徒', rarity: 'SR', type: '恋愛', emoji: '💍', speaker: 'meshino',
    atk: 30, hp: 140, spd: 1.0, prod: 0.8,
    skill: { name: '封印の刻印', kind: 'nuke', power: 4.5, charge: 120, line: '指輪が光るたびに心臓が止まる！', desc: '単体にATK×450%' },
    passive: { desc: '【編成時】恋愛タイプATK+15%', scope: 'party', mods: { typeAtk: { 恋愛: 0.15 } } },
    quote: '人妻は美しい。封印されているからこそ輝く。', desc: '英語の成績が百二十五人抜き。動機は不純だった。今は違う。',
  },
  {
    id: 'sakura', name: '櫻優', title: '恋愛学の研究者', rarity: 'SR', type: '恋愛', emoji: '📓', speaker: 'sakura',
    atk: 24, hp: 160, spd: 1.0, prod: 0.8,
    skill: { name: 'シュレディンガーの好意', kind: 'gamble', power: 5.0, charge: 110, line: '告白は波動関数の崩壊である！', desc: '50%で敵全体ATK×500%／50%で理論崩壊' },
    passive: { desc: 'ドロップ率+10%', scope: 'owned', mods: { dropPct: 0.1 } },
    quote: '彼女はいません。いたこともありません。', desc: '内進二年。サンプルG-07を二ヶ月観察していた。',
  },
  {
    id: 'mitsumine', name: '三峰瑠衣', title: '内進の「は？」', rarity: 'SR', type: '冷笑', emoji: '😤', speaker: 'mitsumine',
    atk: 20, hp: 220, spd: 1.0, prod: 0.8,
    skill: { name: 'は？（内進）', kind: 'stun', power: 1.0, duration: 2.5, charge: 110, line: 'は？', desc: '敵全体ATK×100%＋2.5秒スタン' },
    passive: { desc: '【編成時】部員HP+8%', scope: 'party', mods: { hpPct: 0.08 } },
    quote: '好きなら好きって言いなよ。', desc: '常識の塊。三重と「は？」がハモる（本人たちは否定）。',
  },
  {
    id: 'naito', name: '内藤蘭', title: '少し笑う人', rarity: 'SR', type: '面白', emoji: '📖', speaker: 'naito',
    atk: 18, hp: 210, spd: 1.0, prod: 0.8,
    skill: { name: '面白い考え方だね', kind: 'heal', power: 0.4, charge: 110, line: '（少し笑った）', desc: '味方全体HP40%回復' },
    passive: { desc: '【編成時】スキルゲージ増加+5%', scope: 'party', mods: { gaugePct: 0.05 } },
    quote: '意味わかんないけど、聞いてると安心する。', desc: '本質配信の視聴者。櫻の理論に核爆弾を落とした。',
  },
  {
    id: 'futami', name: '二見玲子', title: '副担任（英語）', rarity: 'SR', type: '恋愛', emoji: '🔤', speaker: 'futami',
    atk: 22, hp: 180, spd: 1.0, prod: 0.8,
    skill: { name: 'すごい、召野くん', kind: 'buff', power: 0.5, duration: 8, charge: 120, line: 'Great job!', desc: '味方全体のATK+50%（8秒）' },
    passive: { desc: '【編成時】恋愛タイプATK+10%', scope: 'party', mods: { typeAtk: { 恋愛: 0.1 } } },
    quote: '私のためじゃなくて、自分のためにね。', desc: '明るい先生。左手薬指に封印の刻印。',
  },
  {
    id: 'kuraishi', name: '倉石暁', title: '✝本質✝の狂信者', rarity: 'SR', type: '本質', emoji: '📜', speaker: 'kuraishi',
    atk: 26, hp: 150, spd: 1.05, prod: 0.8,
    skill: { name: 'グレートチェーン', kind: 'multi', power: 0.8, hits: 5, charge: 110, line: '前-原✝本質✝→原✝本質✝→✝本質✝→亜✝本質✝→非✝本質✝！', desc: 'ランダムに5回攻撃（ATK×80%）' },
    passive: { desc: 'クリック力+25%（全て記録されている）', scope: 'owned', mods: { clickPct: 0.25 } },
    quote: '教祖に会えた。', desc: 'ブレザーの裏に修正液で✝本質✝。全ての「は？」を数えている。',
  },
  {
    id: 'kilauea', name: 'キラウエア火山', title: '新しい地面', rarity: 'SR', type: '地理', emoji: '🌋',
    atk: 30, hp: 170, spd: 0.85, prod: 0.8,
    skill: { name: '地図が追いつかない', kind: 'aoe', power: 1.3, charge: 120, line: '数年前には存在しなかった地面だ！', desc: '敵全体にATK×130%' },
    passive: { desc: '【編成時】地理タイプATK+10%', scope: 'party', mods: { typeAtk: { 地理: 0.1 } } },
    quote: '地球は今も地面を作り続けている。', desc: 'ハワイ研修旅行で出会った。',
  },
  // ───────── SSR ─────────
  {
    id: 'ryoma', name: '両馬二郎', title: '✝本質✝の創始者', rarity: 'SSR', type: '本質', emoji: '✝', speaker: 'ryoma', portrait: PORTRAITS.ryoma,
    atk: 34, hp: 240, spd: 1.0, prod: 2,
    skill: { name: 'これまじ✝本質✝', kind: 'aoe', power: 1.6, charge: 110, line: 'これまじ✝本質✝', desc: '敵全体にATK×160%' },
    passive: { desc: 'クリック力+50%', scope: 'owned', mods: { clickPct: 0.5 } },
    quote: '✝本質✝に教祖はいないよ。元からあった。俺はそれに✝をつけただけだ。', desc: '三重の名前をネットのあちこちに埋め込む。十回に一回、すごいことを言う。',
  },
  {
    id: 'mie', name: '三重県臣', title: '否定の守護者', rarity: 'SSR', type: '冷笑', emoji: '😑', speaker: 'mie', portrait: PORTRAITS.mie,
    atk: 22, hp: 360, spd: 1.0, prod: 2,
    skill: { name: 'は？', kind: 'stun', power: 1.2, duration: 3, charge: 110, line: 'は？', desc: '敵全体ATK×120%＋3秒スタン' },
    passive: { desc: '【編成時】被ダメージ-8%', scope: 'party', mods: { dmgReduce: 0.08 } },
    quote: '俺に✝本質✝をつけるな。', desc: '冷笑系を自認。「まあ」を二回言うとき、内心では面白いと思っている。',
  },
  {
    id: 'terachi', name: '寺地星', title: '本質配信の巫女（否定）', rarity: 'SSR', type: '面白', emoji: '🔭', speaker: 'terachi', portrait: PORTRAITS.terachi,
    atk: 26, hp: 300, spd: 1.0, prod: 2.5,
    skill: { name: '本質配信', kind: 'heal', power: 0.45, charge: 110, line: '紙に書いて読みます', desc: '味方全体HP45%回復' },
    passive: { desc: '毎秒本質+20%', scope: 'owned', mods: { prodPct: 0.2 } },
    quote: 'ペットボトルくらいの存在です。', desc: '登録者150人から始めた。固まる秒数の最長記録は15秒。',
  },
  {
    id: 'sato', name: '砂糖東洋', title: '沈黙の観察者', rarity: 'SSR', type: '地理', emoji: '🎮', speaker: 'sato', portrait: PORTRAITS.sato,
    atk: 50, hp: 200, spd: 0.8, prod: 2,
    skill: { name: '一本だけ決めて帰る', kind: 'nuke', power: 6, charge: 130, line: '用は済んだ', desc: '単体にATK×600%' },
    passive: { desc: 'クリック会心率+2%', scope: 'owned', mods: { critChance: 0.02 } },
    quote: '見てない。', desc: '窓の外を見ていないと言い張る。見ている。',
  },
  {
    id: 'itoshizu', name: '糸魚川-静岡構造線ドラゴン', title: '味噌の色を決めた竜', rarity: 'SSR', type: '地理', emoji: '🐉',
    atk: 36, hp: 250, spd: 0.9, prod: 2,
    skill: { name: '地質境界', kind: 'aoe', power: 1.8, charge: 120, line: '東と西で石が違う！', desc: '敵全体にATK×180%' },
    passive: { desc: '【編成時】地理タイプATK+20%', scope: 'party', mods: { typeAtk: { 地理: 0.2 } } },
    quote: 'お前らの朝飯は、我が決めた。', desc: '日本列島を東西に分ける竜。雑煮の餅の形にも口を出す。',
  },
  // ───────── UR ─────────
  {
    id: 'rei', name: '数理零', title: '面白さの王（偏差値85）', rarity: 'UR', type: '面白', emoji: '📐', speaker: 'rei', portrait: PORTRAITS.rei,
    atk: 45, hp: 380, spd: 1.2, prod: 5,
    skill: { name: '面白い', kind: 'buff', power: 1.0, duration: 10, charge: 110, line: '面白いな', desc: '味方全体のATK+100%（10秒）' },
    passive: { desc: '【編成時】部員ATK・HP・毎秒本質 +15%', scope: 'party', mods: { atkPct: 0.15, hpPct: 0.15, prodPct: 0.15 } },
    quote: '家が近いから。', desc: '全科目学年首席。内進を含めて。なぜ理数科にいるのか誰も知らない。本当に家が近いだけ。',
  },
  {
    id: 'heikatsu', name: '塀勝也（ヘイカツ）', title: '地形図の向こう側を見る男', rarity: 'UR', type: '地理', emoji: '🗺️', speaker: 'heikatsu', portrait: PORTRAITS.heikatsu,
    atk: 48, hp: 420, spd: 1.0, prod: 5,
    skill: { name: '窓の外を見る（五秒）', kind: 'stun', power: 3.0, duration: 5, charge: 130, line: '……（口が動く）', desc: '敵全体ATK×300%＋5秒スタン' },
    passive: { desc: '【編成時】地理タイプATK+50%', scope: 'party', mods: { typeAtk: { 地理: 0.5 } } },
    quote: '地面は忘れない。', desc: '地理教師。三年間同じ地図を見せて、見る側が変わるのを待てる。',
  },
  {
    id: 'feikatsu', name: 'フェイカツ', title: '概念', rarity: 'UR', type: '本質', emoji: '🎭', speaker: 'feikatsu',
    atk: 52, hp: 300, spd: 1.1, prod: 5,
    skill: { name: '受験ナビ荒らし', kind: 'multi', power: 1.2, hits: 6, charge: 120, line: '受験生よ、来い。✝', desc: 'ランダムに6回攻撃（ATK×120%）' },
    passive: { desc: 'コーンスープ缶獲得+25%・黄金✝出現+15%', scope: 'owned', mods: { canPct: 0.25, goldenRate: 0.15 } },
    quote: 'フェイカツはフェイカツであって俺じゃない。', desc: '受験情報掲示板に棲息する。中身は両馬（本人は否定）。',
  },
  // ───────── LR ─────────
  {
    id: 'pregen', name: '前-原✝本質✝', title: 'グレートチェーンの頂点', rarity: 'LR', type: '本質', emoji: '☨',
    atk: 70, hp: 700, spd: 1.1, prod: 15,
    skill: { name: '存在しないが、ある', kind: 'aoe', power: 3.0, charge: 120, line: '…………', desc: '敵全体にATK×300%' },
    passive: { desc: '全生産×1.5・クリック力×1.5', scope: 'owned', mods: { prodX: 1.5, clickX: 1.5 } },
    quote: '（概念としてすら存在しない）', desc: '原✝本質✝のさらに前。倉石が発見し、寺地が一瞬で崩壊させた。',
  },
  {
    id: 'jimen', name: '地面', title: '全部を記録するもの', rarity: 'LR', type: '地理', emoji: '🌏',
    atk: 50, hp: 1000, spd: 1.0, prod: 15,
    skill: { name: '地面は忘れない', kind: 'shield', power: 0.6, charge: 120, line: '……（全部記録している）', desc: '味方全体にHP60%のバリア' },
    passive: { desc: '戦闘中の復活+1・地面の記憶獲得+50%', scope: 'owned', mods: { revive: 1, memoryPct: 0.5 } },
    quote: '地面は忘れない。', desc: '地図は人間が作る。地面には限界がない。',
  },
];

export const UNIT_MAP: Record<string, UnitDef> = Object.fromEntries(UNITS.map((u) => [u.id, u]));
