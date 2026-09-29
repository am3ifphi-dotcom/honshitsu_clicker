import type { AwakeningStage } from '../types';

export interface UnitAwakeningDef {
  unitId: string;
  stages: AwakeningStage[];
}

export const AWAKENINGS: Record<string, AwakeningStage[]> = {
  ryoma: [
    {
      title: 'ネット荒らしの文法',
      desc: '部員のATK・HP+50%、毎秒本質+100%',
      flavor: '第一層：文脈はあったりなかったりする。二郎系の写真に「この脂の浮き方まじ✝本質✝」。',
      reqStar: 1, reqLevel: 30, costHonshitsu: 1e5, costCans: 20, costCrystals: 5, statMult: 0.5, prodMult: 1.0,
    },
    {
      title: '三重県臣の埋め込み術',
      desc: '部員のATK・HP+80%、毎秒本質+200%',
      flavor: '第二層：合格祈願掲示板、スーパーの肉売り場、天気予報。ありとあらゆる場所に臣民を配置する。',
      reqStar: 3, reqLevel: 60, costHonshitsu: 1e7, costCans: 50, costCrystals: 15, statMult: 0.8, prodMult: 2.0,
    },
    {
      title: 'フェイカツとの融合',
      desc: '部員のATK・HP+120%、毎秒本質+300%',
      flavor: '第三層：「ヘイカツ先生に会いに絶対合格するぞ！✝」。フェイカツは俺であって俺じゃない。',
      reqStar: 5, reqLevel: 100, costHonshitsu: 1e9, costCans: 100, costCrystals: 35, statMult: 1.2, prodMult: 3.0,
    },
    {
      title: '電線と天啓',
      desc: '部員のATK・HP+160%、毎秒本質+500%',
      flavor: '「いま道歩いてたらすごい✝本質✝が降りてきた」。本質は降りてくるものなのか。天啓のように。',
      reqStar: 8, reqLevel: 140, costHonshitsu: 1e12, costCans: 200, costCrystals: 70, statMult: 1.6, prodMult: 5.0,
    },
    {
      title: '✝本質✝の創世主',
      desc: '部員の全ステータス+250%、毎秒本質+1000%、クリティカル倍率+3',
      flavor: '「✝本質✝に教祖はいないよ。元からあった。俺はそれに✝をつけただけだ。」——三年間、漏れ続けた原点。',
      reqStar: 12, reqLevel: 180, costHonshitsu: 1e15, costCans: 400, costCrystals: 150, statMult: 2.5, prodMult: 10.0,
    },
  ],
  mie: [
    {
      title: '「まあ」の一回目',
      desc: '部員HP+60%、被ダメージ-5%',
      flavor: '「いや、だから何が本質なんだよ」。学期中に推定二十回は「は？」と言っている常識人。',
      reqStar: 1, reqLevel: 30, costHonshitsu: 1e5, costCans: 20, costCrystals: 5, statMult: 0.6, prodMult: 1.0,
    },
    {
      title: '冷笑の隙間',
      desc: '部員HP+100%、被ダメージ-8%',
      flavor: '三重が「まあ」を二回言うとき、内心では面白いと思っている。伊崎はそこを正確に突く。',
      reqStar: 3, reqLevel: 60, costHonshitsu: 1e7, costCans: 50, costCrystals: 15, statMult: 1.0, prodMult: 2.0,
    },
    {
      title: '人類共通の記号否定',
      desc: '部員HP+150%、被ダメージ-10%',
      flavor: '「✝は人類共通の記号だから」「人類共通ではない」。どこまでも冷徹に境界線を守る。',
      reqStar: 5, reqLevel: 100, costHonshitsu: 1e9, costCans: 100, costCrystals: 35, statMult: 1.5, prodMult: 3.0,
    },
    {
      title: 'ハモる「は？」',
      desc: '部員HP+200%、敵全体スタン時間+1秒',
      flavor: '三峰瑠衣の「は？」と完全にユニゾンする。「ハモってない」「ハモってたよ」。',
      reqStar: 8, reqLevel: 140, costHonshitsu: 1e12, costCans: 200, costCrystals: 70, statMult: 2.0, prodMult: 5.0,
    },
    {
      title: '認めた日（冷笑の終着点）',
      desc: '部員全能力+250%、被ダメージ-15%、味方全体バリア+30%',
      flavor: '体育館の階段の踊り場。球技大会の二点差のあと、三重は初めて静かに笑った。',
      reqStar: 12, reqLevel: 180, costHonshitsu: 1e15, costCans: 400, costCrystals: 150, statMult: 2.5, prodMult: 10.0,
    },
  ],
  rei: [
    {
      title: '家が近いから（絶対の理由）',
      desc: '全ステータス+80%、毎秒本質+150%',
      flavor: '全科目学年首席。偏差値85。内進を含めて。なぜ理数科にいるのか？「家が近いから」。',
      reqStar: 1, reqLevel: 30, costHonshitsu: 2e5, costCans: 30, costCrystals: 10, statMult: 0.8, prodMult: 1.5,
    },
    {
      title: '今年の抱負「面白い」',
      desc: '全ステータス+120%、毎秒本質+300%',
      flavor: '毎年同じ抱負。ブレない評価軸。零にとって面白いかどうかが唯一の世界の尺度。',
      reqStar: 3, reqLevel: 60, costHonshitsu: 2e7, costCans: 80, costCrystals: 25, statMult: 1.2, prodMult: 3.0,
    },
    {
      title: '二見先生の英語テスト',
      desc: '全ステータス+180%、毎秒本質+500%',
      flavor: '召野が必死に125人抜いたテストでも、トップは当然のように数理零だった。満点。',
      reqStar: 5, reqLevel: 100, costHonshitsu: 2e9, costCans: 150, costCrystals: 50, statMult: 1.8, prodMult: 5.0,
    },
    {
      title: '偏差値85の俯瞰',
      desc: '全ステータス+250%、毎秒本質+800%',
      flavor: '内進棟の壁をものともせず、ただそこに座っている。静かなる知性の怪童。',
      reqStar: 8, reqLevel: 140, costHonshitsu: 2e12, costCans: 300, costCrystals: 100, statMult: 2.5, prodMult: 8.0,
    },
    {
      title: '面白さの王（解脱）',
      desc: '全ステータス+400%、毎秒本質+2000%、全味方ATK+100%',
      flavor: '「面白いな」——零の一言で、B組の全てが肯定される。理数科の最高到達点。',
      reqStar: 12, reqLevel: 180, costHonshitsu: 2e15, costCans: 600, costCrystals: 250, statMult: 4.0, prodMult: 20.0,
    },
  ],
  heikatsu: [
    {
      title: '火曜三限の味噌地政学',
      desc: '部員ATK+80%、地理タイプATK+50%',
      flavor: '「東と西で石が違う。石が違うと土壌が違う。作物が違うと——味噌」。黒板にチョークの粉が舞う。',
      reqStar: 1, reqLevel: 30, costHonshitsu: 2e5, costCans: 30, costCrystals: 10, statMult: 0.8, prodMult: 1.5,
    },
    {
      title: '等高線の間隔',
      desc: '部員ATK+130%、地理タイプATK+80%',
      flavor: '「間隔が狭い＝傾斜が急だ。等高線の線一本に、人の判断が載っている」。',
      reqStar: 3, reqLevel: 60, costHonshitsu: 2e7, costCans: 80, costCrystals: 25, statMult: 1.3, prodMult: 3.0,
    },
    {
      title: '河岸段丘の階段',
      desc: '部員ATK+180%、部員HP+100%',
      flavor: '「時間を掘っていると思ってくれ。一番上の段が一番古い」。三万年の記憶を教室に降臨させる。',
      reqStar: 5, reqLevel: 100, costHonshitsu: 2e9, costCans: 150, costCrystals: 50, statMult: 1.8, prodMult: 5.0,
    },
    {
      title: '窓の外を見る五秒間',
      desc: '部員ATK+250%、スタン効果+2秒',
      flavor: '勝也は地形図から目を離し、窓の外を五秒見つめた。そこには地形図の向こう側が広がっていた。',
      reqStar: 8, reqLevel: 140, costHonshitsu: 2e12, costCans: 300, costCrystals: 100, statMult: 2.5, prodMult: 8.0,
    },
    {
      title: '地面は忘れない（三年の集大成）',
      desc: '部員全能力+350%、地理タイプATK+200%、戦闘不能時全体完全復活',
      flavor: '「地図は人間が作る。地面には限界がない。お前らの三年間を、地面は全部覚えている」。',
      reqStar: 12, reqLevel: 180, costHonshitsu: 2e15, costCans: 600, costCrystals: 250, statMult: 3.5, prodMult: 20.0,
    },
  ],
  terachi: [
    {
      title: 'カス配信始動',
      desc: '毎秒本質+120%、部員HP+50%',
      flavor: '「寺地星のカス配信・第一回。LINEオープンチャット『✝本質✝募集所』に本質を送ってください」。',
      reqStar: 1, reqLevel: 30, costHonshitsu: 1e5, costCans: 20, costCrystals: 5, statMult: 0.5, prodMult: 1.2,
    },
    {
      title: '紙と太マジック',
      desc: '毎秒本質+250%、部員HP+80%',
      flavor: '太いマジックでコピー用紙に書く。書いてカメラに見せる。編集はしない。呼吸のように。',
      reqStar: 3, reqLevel: 60, costHonshitsu: 1e7, costCans: 50, costCrystals: 15, statMult: 0.8, prodMult: 2.5,
    },
    {
      title: '十五秒のフリーズ',
      desc: '毎秒本質+400%、全体回復量+30%',
      flavor: '「前-原✝本質✝」の投稿に十五秒固まる。切り抜きだけで十五万再生。本編は三千再生。',
      reqStar: 5, reqLevel: 100, costHonshitsu: 1e9, costCans: 100, costCrystals: 35, statMult: 1.2, prodMult: 4.0,
    },
    {
      title: '千人の視聴者',
      desc: '毎秒本質+700%、部員生産+300%',
      flavor: '登録者150人から始まった配信が千人に。「ペットボトルくらいの存在です」と言いながら続けた。',
      reqStar: 8, reqLevel: 140, costHonshitsu: 1e12, costCans: 200, costCrystals: 70, statMult: 1.6, prodMult: 7.0,
    },
    {
      title: '星と地面とせいちちゃんねる',
      desc: '毎秒本質+1500%、全味方HP+100%、全生産×2',
      flavor: '「待っててくれてありがとう。✝は一つでいい。」届かないと思っていた言葉が、確かに世界に届いた。',
      reqStar: 12, reqLevel: 180, costHonshitsu: 1e15, costCans: 400, costCrystals: 150, statMult: 2.5, prodMult: 15.0,
    },
  ],
  kuraishi: [
    {
      title: 'ブレザー裏の修正液',
      desc: 'クリック力+50%、部員ATK+50%',
      flavor: 'ブレザーの裏地に修正液で✝本質✝と殴り書き。三重の「は？」をノートに正の字でカウントする。',
      reqStar: 1, reqLevel: 30, costHonshitsu: 1e5, costCans: 20, costCrystals: 5, statMult: 0.5, prodMult: 1.0,
    },
    {
      title: '聖典の編纂',
      desc: 'クリック力+100%、部員ATK+80%',
      flavor: '「四百二十回目です」「俺の『は？』を数えるな」。狂気の記録者が全てをアーカイブする。',
      reqStar: 3, reqLevel: 60, costHonshitsu: 1e7, costCans: 50, costCrystals: 15, statMult: 0.8, prodMult: 2.0,
    },
    {
      title: 'グレートチェーンの提唱',
      desc: 'クリック力+160%、部員ATK+120%',
      flavor: '前-原✝本質✝→原✝本質✝→✝本質✝→亜✝本質✝→非✝本質✝。階層構造の確立。',
      reqStar: 5, reqLevel: 100, costHonshitsu: 1e9, costCans: 100, costCrystals: 35, statMult: 1.2, prodMult: 3.5,
    },
    {
      title: 'だがー！の絶叫',
      desc: 'クリック力+250%、スキル発動ゲージ+20%',
      flavor: '球技大会。「理数科がんばれ！ だがー！」。✝を発音しようとした男の叫び。',
      reqStar: 8, reqLevel: 140, costHonshitsu: 1e12, costCans: 200, costCrystals: 70, statMult: 1.6, prodMult: 5.5,
    },
    {
      title: '✝本質✝の筆頭使徒',
      desc: 'クリック力+500%、全部員ATK+100%、会心率+10%',
      flavor: '教祖のいない✝本質✝に、永遠の信徒として寄り添い続けた倉石の覚醒。',
      reqStar: 12, reqLevel: 180, costHonshitsu: 1e15, costCans: 400, costCrystals: 150, statMult: 2.5, prodMult: 12.0,
    },
  ],
  meshino: [
    {
      title: '英語百二十五人抜き',
      desc: 'ATK+80%、恋愛タイプATK+50%',
      flavor: '動機は不純だった。左手薬指の指輪を見るためだけに英単語帳を擦り切れるまで回した。',
      reqStar: 1, reqLevel: 30, costHonshitsu: 1e5, costCans: 20, costCrystals: 5, statMult: 0.8, prodMult: 1.0,
    },
    {
      title: '左手薬指の封印',
      desc: 'ATK+130%、クリティカル倍率+2',
      flavor: '「人妻は美しい。封印されているからこそ輝く」。召野の美学が研ぎ澄まされる。',
      reqStar: 3, reqLevel: 60, costHonshitsu: 1e7, costCans: 50, costCrystals: 15, statMult: 1.3, prodMult: 2.0,
    },
    {
      title: '心の中の二見先生',
      desc: 'ATK+180%、スキル威力+50%',
      flavor: '球技大会で一人だけ英語の掛け声。「心の中の二見先生が〈Go, Meshino!〉って言ってる」。',
      reqStar: 5, reqLevel: 100, costHonshitsu: 1e9, costCans: 100, costCrystals: 35, statMult: 1.8, prodMult: 3.5,
    },
    {
      title: '玉砕の美学',
      desc: 'ATK+250%、攻撃速度+20%',
      flavor: '「私のためじゃなくて、自分のためにね」。優しい拒絶すらも召野の血肉となった。',
      reqStar: 8, reqLevel: 140, costHonshitsu: 1e12, costCans: 200, costCrystals: 70, statMult: 2.5, prodMult: 5.5,
    },
    {
      title: '純愛の使徒（Great job）',
      desc: 'ATK+400%、単体スキル威力×2、全恋愛タイプATK+100%',
      flavor: '不純から始まった努力が、本物の自立へと昇華した。二見先生の笑顔を胸に前へ進む。',
      reqStar: 12, reqLevel: 180, costHonshitsu: 1e15, costCans: 400, costCrystals: 150, statMult: 4.0, prodMult: 12.0,
    },
  ],
  sakura: [
    {
      title: 'サンプルG-07の観察',
      desc: '毎秒本質+100%、ドロップ率+20%',
      flavor: '内進二年・櫻優。恋愛を物理学としてモデル化し、被験体を二ヶ月観察していた。',
      reqStar: 1, reqLevel: 30, costHonshitsu: 1e5, costCans: 20, costCrystals: 5, statMult: 0.5, prodMult: 1.0,
    },
    {
      title: '近接性の第一法則',
      desc: '毎秒本質+200%、ドロップ率+35%',
      flavor: '「好意は距離の二乗に反比例する」。ノートには数式がびっしりと並んでいた。',
      reqStar: 3, reqLevel: 60, costHonshitsu: 1e7, costCans: 50, costCrystals: 15, statMult: 0.8, prodMult: 2.0,
    },
    {
      title: '消しゴム事象',
      desc: '毎秒本質+350%、SSR以上排出率+1%',
      flavor: '机から落ちた消しゴムを拾う確率的特異点。理論値通りの接触に心拍数が跳ね上がる。',
      reqStar: 5, reqLevel: 100, costHonshitsu: 1e9, costCans: 100, costCrystals: 35, statMult: 1.2, prodMult: 3.5,
    },
    {
      title: '第十四法則の崩壊',
      desc: '毎秒本質+600%、スキルダメージ+100%',
      flavor: '「当事者になると理論は機能しない」。内藤蘭の微笑みによって、全理論が核爆発を起こした。',
      reqStar: 8, reqLevel: 140, costHonshitsu: 1e12, costCans: 200, costCrystals: 70, statMult: 1.6, prodMult: 6.0,
    },
    {
      title: '観測された愛（理論の向こう側）',
      desc: '毎秒本質+1200%、味方全体スキル確率100%発動、アイテムドロップ+50%',
      flavor: '「告白は波動関数の崩壊である」。数式を捨てて言葉を紡ぐ、櫻優の真の到達点。',
      reqStar: 12, reqLevel: 180, costHonshitsu: 1e15, costCans: 400, costCrystals: 150, statMult: 2.5, prodMult: 14.0,
    },
  ],
  sato: [
    {
      title: '電車の車窓（四十分）',
      desc: 'ATK+80%、会心率+3%',
      flavor: '毎朝田舎から電車で通学。窓から見る山と田んぼの向こうに、何億年もの地層を無言で見つめる。',
      reqStar: 1, reqLevel: 30, costHonshitsu: 1e5, costCans: 20, costCrystals: 5, statMult: 0.8, prodMult: 1.0,
    },
    {
      title: '見てない（見ている）',
      desc: 'ATK+140%、会心倍率+2',
      flavor: '窓の外を見ていないと言い張る。見ている。口にしたら負けだと思っている。',
      reqStar: 3, reqLevel: 60, costHonshitsu: 1e7, costCans: 50, costCrystals: 15, statMult: 1.4, prodMult: 2.0,
    },
    {
      title: 'コーンスープの不在定義',
      desc: 'ATK+200%、缶獲得量+25%',
      flavor: '「コーンスープはあるときより、ないときの方が本質である」。寺地の配信に投稿した一文。',
      reqStar: 5, reqLevel: 100, costHonshitsu: 1e9, costCans: 100, costCrystals: 35, statMult: 2.0, prodMult: 3.5,
    },
    {
      title: '三年目の挙手',
      desc: 'ATK+300%、オートクリック+20回/秒',
      flavor: '三学期。勝也の質問に、三年間一度も手を挙げなかった砂糖がすっと右手を挙げた。',
      reqStar: 8, reqLevel: 140, costHonshitsu: 1e12, costCans: 200, costCrystals: 70, statMult: 3.0, prodMult: 6.0,
    },
    {
      title: '一本だけ決めて帰る（沈黙の極致）',
      desc: 'ATK+500%、単体スキル威力×3、会心ダメージ+5倍',
      flavor: '「用は済んだ」。多くを語らず、圧倒的な一撃を叩き込んで静かに席に戻る。',
      reqStar: 12, reqLevel: 180, costHonshitsu: 1e15, costCans: 400, costCrystals: 150, statMult: 5.0, prodMult: 15.0,
    },
  ],
  pregen: [
    {
      title: '概念以前のゆらぎ',
      desc: '全ステータス+100%、全生産×2',
      flavor: '原✝本質✝のさらに前。言葉にすらなっていない原初の震え。',
      reqStar: 1, reqLevel: 40, costHonshitsu: 5e6, costCans: 50, costCrystals: 20, statMult: 1.0, prodMult: 2.0,
    },
    {
      title: '寺地の沈黙',
      desc: '全ステータス+200%、全生産×3',
      flavor: '寺地が十五秒固まった瞬間、配信の向こう側で何かが開いた。',
      reqStar: 3, reqLevel: 80, costHonshitsu: 5e8, costCans: 120, costCrystals: 50, statMult: 2.0, prodMult: 4.0,
    },
    {
      title: 'グレートチェーンの超越',
      desc: '全ステータス+350%、全生産×5',
      flavor: '倉石のピラミッドの頂点から光が漏れる。全てを包含する黒き光。',
      reqStar: 5, reqLevel: 120, costHonshitsu: 5e11, costCans: 250, costCrystals: 100, statMult: 3.5, prodMult: 8.0,
    },
    {
      title: '存在しないが、ある',
      desc: '全ステータス+500%、全生産×10',
      flavor: '桐葉高校の北棟の隅に、それは確かに在る。誰にも観測されずに。',
      reqStar: 8, reqLevel: 160, costHonshitsu: 5e14, costCans: 500, costCrystals: 200, statMult: 5.0, prodMult: 15.0,
    },
    {
      title: '✝真・前-原✝本質✝',
      desc: '全ステータス+1000%、全生産×25、全クリック×10',
      flavor: 'すべての物語の根源。この世に✝がつけられる前の、純粋無垢な✝本質✝。',
      reqStar: 12, reqLevel: 200, costHonshitsu: 5e17, costCans: 1000, costCrystals: 500, statMult: 10.0, prodMult: 50.0,
    },
  ],
};

// 汎用デフォルト覚醒（定義されていない部員用）
export function getUnitAwakenings(unitId: string): AwakeningStage[] {
  if (AWAKENINGS[unitId]) return AWAKENINGS[unitId];
  return [
    {
      title: '本質の片鱗',
      desc: 'ステータス+50%、毎秒本質+100%',
      flavor: '教室の日常から、微かな✝本質✝が漏れ出す。',
      reqStar: 1, reqLevel: 25, costHonshitsu: 5e4, costCans: 15, costCrystals: 3, statMult: 0.5, prodMult: 1.0,
    },
    {
      title: '北棟の共鳴',
      desc: 'ステータス+80%、毎秒本質+200%',
      flavor: '理数科の窓から差し込む光とともに、能力が研ぎ澄まされる。',
      reqStar: 3, reqLevel: 50, costHonshitsu: 5e6, costCans: 40, costCrystals: 10, statMult: 0.8, prodMult: 2.0,
    },
    {
      title: '構造線の目覚め',
      desc: 'ステータス+120%、毎秒本質+350%',
      flavor: '地面の下を通る巨大な地質境界のエネルギーが循環する。',
      reqStar: 5, reqLevel: 80, costHonshitsu: 5e8, costCans: 80, costCrystals: 25, statMult: 1.2, prodMult: 3.5,
    },
    {
      title: '理数科の結束',
      desc: 'ステータス+180%、毎秒本質+600%',
      flavor: '内進棟との見えない壁を越え、確固たる存在感を示す。',
      reqStar: 8, reqLevel: 120, costHonshitsu: 5e11, costCans: 150, costCrystals: 50, statMult: 1.8, prodMult: 6.0,
    },
    {
      title: '✝本質✝の極致',
      desc: 'ステータス+300%、毎秒本質+1200%',
      flavor: '三年間で培われた、何者にも代えがたい「本質」の完成。',
      reqStar: 12, reqLevel: 160, costHonshitsu: 5e14, costCans: 300, costCrystals: 100, statMult: 3.0, prodMult: 12.0,
    },
  ];
}

// 部員の絆・放課後交流セリフテーブル
export const BOND_VOICES: Record<string, string[]> = {
  ryoma: [
    '今日も漏れてるな。まじ✝本質✝。',
    '二郎食いに行かない？ ニンニク入れようぜ。',
    '三重にちょっかい出すの、俺のライフワークだから。',
    'お前のクリック、いい音するよな。',
    '高校生活って、気づくと終わるらしいぜ。今を漏らそう。',
  ],
  mie: [
    '……何か用か？ 別に暇じゃないけど。',
    '両馬がまた変なこと書いてたら教えろ。通報する。',
    'まあ……お前がいると少しは退屈しないかもな。',
    'コーンスープ？ 飲むなら温かいうちに飲めよ。',
    '……冷笑とか言ってるけど、本当は全部ちゃんと覚えてるよ。',
  ],
  rei: [
    '面白いな、君。',
    '家が近いからここにいるだけだよ。でも、居心地は悪くない。',
    '今年の抱負？ 毎年「面白い」に決まってる。',
    'わからないことがあったら聞いて。面白い解法をあげる。',
    '理数科に来てよかったよ。本当に面白いから。',
  ],
  heikatsu: [
    '地形図を見てごらん。全部そこに書いてある。',
    '地面は忘れない。君が今日努力したこともね。',
    '糸魚川-静岡構造線はロマンだよ。東西の境界線だ。',
    '三年間同じ地図を見せても、見る君の目が変わるんだ。',
    '卒業しても、地面はずっと君の下にある。胸を張れ。',
  ],
  terachi: [
    'あ、配信見てくれたんですか……恥ずかしいな。',
    '紙に書いて読むの、意外と手が疲れるんですよ。',
    'たまにフリーズするの、脳の冷却が追いつかないんです。',
    'ペットボトルくらいの存在でいいと思ってたのに、みんな優しいな。',
    'いつも見ててくれてありがとう。✝は一つで十分です。',
  ],
};

// ✝本質結晶交換所のアイテム一覧
export interface CrystalShopEntry {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  costCrystals: number;
  rewardKind: 'item' | 'cans' | 'ticket' | 'starUp';
  rewardItemId?: string;
  amount: number;
}

// 交換から再召喚しても増殖しない価格に設定。標準召喚の重複結晶は最大6/回、
// 500缶からは割引込みで最大144回（最大864結晶）なので、各交換は必ず純減になる。
export const CRYSTAL_SHOP: CrystalShopEntry[] = [
  {
    id: 'cs_map',
    name: '同じ地図（真作）',
    emoji: '🗺️',
    desc: '部員の限界突破（凸★）を直接+1する万能地図',
    costCrystals: 50,
    rewardKind: 'item',
    rewardItemId: 'mapcopy',
    amount: 1,
  },
  {
    id: 'cs_tickets10',
    name: '召喚チケット×10',
    emoji: '🎫',
    desc: '自販機を10回引けるチケット束',
    costCrystals: 70,
    rewardKind: 'ticket',
    amount: 10,
  },
  {
    id: 'cs_tickets100',
    name: '召喚チケット超特大パック×100',
    emoji: '🎫',
    desc: '100連召喚が一気に引けるお得なチケット束',
    costCrystals: 650,
    rewardKind: 'ticket',
    amount: 100,
  },
  {
    id: 'cs_soup500',
    name: 'コーンスープ大缶詰（500缶）',
    emoji: '🥫',
    desc: '北棟の自販機から抽出された濃厚スープ500缶',
    costCrystals: 900,
    rewardKind: 'cans',
    amount: 500,
  },
  {
    id: 'cs_gyuu5',
    name: '学食の牛乳×5',
    emoji: '🥛',
    desc: '部員のレベルを+3する牛乳5本セット',
    costCrystals: 15,
    rewardKind: 'item',
    rewardItemId: 'gyuu',
    amount: 5,
  },
  {
    id: 'cs_core1',
    name: '構造線の破片（核+1）',
    emoji: '🌌',
    desc: 'ウルトラ転生で使用する「構造線の核」を直接1個獲得',
    costCrystals: 100,
    rewardKind: 'item',
    rewardItemId: 'core_item',
    amount: 1,
  },
];
