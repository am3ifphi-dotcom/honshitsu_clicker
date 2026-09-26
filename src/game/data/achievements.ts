import type { GameData } from '../types';
import type { Derived } from '../formulas';
import { UNITS } from './units';

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  reward: number;
  cond: (s: GameData, d: Derived) => boolean;
}

const maxUnitLevel = (s: GameData) => Object.values(s.units).reduce((a, u) => Math.max(a, u.level), 0);

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'click1', name: '初めての✝本質✝', desc: '✝を1回クリックする', reward: 5, cond: (s) => s.allClicks >= 1 },
  { id: 'click420', name: '四百二十回目です', desc: '累計420回クリック（倉石が数えている）', reward: 10, cond: (s) => s.allClicks >= 420 },
  { id: 'click5000', name: '倉石の記録係', desc: '累計5,000回クリック', reward: 20, cond: (s) => s.allClicks >= 5000 },
  { id: 'click50000', name: '指の✝本質✝', desc: '累計50,000回クリック', reward: 50, cond: (s) => s.allClicks >= 50000 },
  { id: 'hs1', name: '一万の本質', desc: '累計1万の✝本質✝を漏らす', reward: 5, cond: (s) => s.allTimeEarned >= 1e4 },
  { id: 'hs2', name: '一億総✝本質✝', desc: '累計1億の✝本質✝を漏らす', reward: 20, cond: (s) => s.allTimeEarned >= 1e8 },
  { id: 'hs3', name: '一兆の✝', desc: '累計1兆の✝本質✝を漏らす', reward: 50, cond: (s) => s.allTimeEarned >= 1e12 },
  { id: 'hs4', name: '京の都も✝本質✝', desc: '累計1京の✝本質✝を漏らす', reward: 80, cond: (s) => s.allTimeEarned >= 1e16 },
  { id: 'hs5', name: '恒河沙の砂粒', desc: '累計1垓の✝本質✝を漏らす', reward: 120, cond: (s) => s.allTimeEarned >= 1e20 },
  { id: 'dev60', name: '偏差値60の教室', desc: '総合偏差値60に到達', reward: 20, cond: (s) => s.bestDev >= 60 },
  { id: 'dev70', name: '国境を越える者', desc: '総合偏差値70に到達（南棟レベル）', reward: 30, cond: (s) => s.bestDev >= 70 },
  { id: 'dev85', name: '家が近いから', desc: '総合偏差値85に到達（零と同じ）', reward: 50, cond: (s) => s.bestDev >= 85 },
  { id: 'dev100', name: '偏差値の向こう側', desc: '総合偏差値100に到達', reward: 100, cond: (s) => s.bestDev >= 100 },
  { id: 'dev150', name: '測定不能', desc: '総合偏差値150に到達', reward: 200, cond: (s) => s.bestDev >= 150 },
  { id: 'pull1', name: 'コーンスープを捧げし者', desc: '初めて召喚する', reward: 5, cond: (s) => s.pulls >= 1 },
  { id: 'pull100', name: '天井を知る者', desc: '累計100回召喚', reward: 30, cond: (s) => s.pulls >= 100 },
  { id: 'pull500', name: '北棟の天井は低い', desc: '累計500回召喚', reward: 80, cond: (s) => s.pulls >= 500 },
  { id: 'own10', name: 'グループLINE（10人）', desc: '部員を10種類集める', reward: 15, cond: (s) => Object.keys(s.units).length >= 10 },
  { id: 'own25', name: '四十人学級', desc: '部員を25種類集める', reward: 40, cond: (s) => Object.keys(s.units).length >= 25 },
  { id: 'ownall', name: '✝本質✝年鑑・完全版', desc: '全部員をコンプリート', reward: 300, cond: (s) => UNITS.every((u) => s.units[u.id]) },
  { id: 'rei', name: '家が近いので来ました', desc: '数理零を入手', reward: 30, cond: (s) => !!s.units['rei'] },
  { id: 'lr', name: '存在しないが、ある', desc: '✝LR✝の部員を入手', reward: 50, cond: (s) => !!s.units['pregen'] || !!s.units['jimen'] },
  { id: 'star5', name: '同じ地図、五回目', desc: 'いずれかの部員を5凸にする', reward: 40, cond: (s) => Object.values(s.units).some((u) => u.star >= 5) },
  { id: 'lv50', name: 'まだ留年していない', desc: 'いずれかの部員をLv50にする', reward: 20, cond: (s) => maxUnitLevel(s) >= 50 },
  { id: 'lv100', name: '留年しない', desc: 'いずれかの部員をLv100にする', reward: 60, cond: (s) => maxUnitLevel(s) >= 100 },
  { id: 'story1', name: '1年生編・完', desc: 'ストーリー1年生編をクリア', reward: 30, cond: (s) => !!s.story['y1-12'] },
  { id: 'story2', name: '2年生編・完', desc: 'ストーリー2年生編をクリア', reward: 50, cond: (s) => !!s.story['y2-10'] },
  { id: 'story3', name: '二学期に続く', desc: 'ストーリーを全てクリア', reward: 100, cond: (s) => !!s.story['y3-5'] },
  { id: 'nanto', name: '南棟を倒せ', desc: '対抗戦で桐葉高校 南棟に勝利', reward: 50, cond: (s) => !!s.league['s6'] },
  { id: 'league', name: '全国制覇（二学期に続く）', desc: '対抗戦の全12校に勝利', reward: 150, cond: (s) => !!s.league['s12'] },
  { id: 'endless10', name: '全国模試の常連', desc: '全国✝本質✝模試 第10回を突破', reward: 100, cond: (s) => s.endless >= 10 },
  { id: 'reb1', name: '業者のトラック', desc: '初めて卒業（転生）する', reward: 30, cond: (s) => s.rebirths >= 1 },
  { id: 'reb5', name: '地面は忘れない', desc: '5回卒業する', reward: 100, cond: (s) => s.rebirths >= 5 },
  { id: 'reb20', name: '留年ではない。転生だ', desc: '20回卒業する', reward: 300, cond: (s) => s.rebirths >= 20 },
  { id: 'golden10', name: '本質が降りてきた', desc: '黄金✝を10回クリック', reward: 20, cond: (s) => s.goldenClicks >= 10 },
  { id: 'golden100', name: '天啓のように', desc: '黄金✝を100回クリック', reward: 80, cond: (s) => s.goldenClicks >= 100 },
  { id: 'zerocan', name: 'コーンスープの不在', desc: 'コーンスープ缶を0個にする（不在を祝して缶を贈呈）', reward: 10, cond: (s) => s.hadZeroCans },
  { id: 'fac100', name: 'サブ垢百個', desc: '両馬のサブ垢を100個所持', reward: 30, cond: (s) => (s.facilities['subacc'] || 0) >= 100 },
  { id: 'genhon', name: '原✝本質✝の購入者', desc: '原✝本質✝を1つ所持（買えるの？）', reward: 60, cond: (s) => (s.facilities['genhon'] || 0) >= 1 },
  { id: 'lose1', name: 'チャイムに負けた', desc: '戦闘に負ける', reward: 5, cond: (s) => s.battlesLost >= 1 },
  { id: 'win50', name: '論破王', desc: '戦闘に50回勝利', reward: 40, cond: (s) => s.battlesWon >= 50 },
  { id: 'item10', name: '卵焼きうまい', desc: 'アイテムを10回使う', reward: 10, cond: (s) => s.itemsUsed >= 10 },
  { id: 'capstone', name: 'ビルドの✝本質✝', desc: 'スキルツリーの奥義を習得', reward: 20, cond: (s) => ['h6', 'r6', 'o6', 'c6', 'l6'].some((id) => (s.skills[id] || 0) > 0) },
  { id: 'ps1m', name: '毎秒百万の漏洩', desc: '毎秒本質100万に到達', reward: 40, cond: (_s, d) => d.perSecBase >= 1e6 },
];
