import type { ConsumableEffect, EnemyDef, GameData, SkillKind } from './types';
import { derive, unitStats, devToPower } from './formulas';
import { UNIT_MAP } from './data/units';
import { fmt } from './format';

export interface BSkill {
  name: string;
  kind: SkillKind;
  power: number;
  duration: number;
  hits: number;
  line: string;
}

export interface Fighter {
  uid: string;
  side: 'ally' | 'enemy';
  unitId?: string;
  name: string;
  emoji: string;
  maxHp: number;
  hp: number;
  atk: number;
  spd: number;
  crit: number;
  timer: number;
  gauge: number;
  gaugeMax: number;
  gaugeRate: number;
  gaugeHit: number;
  skill?: BSkill;
  stun: number;
  shield: number;
  alive: boolean;
  boss: boolean;
  hitAt: number;
  taunt: number;
}

export interface FloatText {
  id: number;
  uid: string;
  text: string;
  color: string;
  t0: number;
  big: boolean;
  dx: number;
}

export interface CutIn {
  name: string;
  skill: string;
  line: string;
  emoji: string;
  unitId?: string;
  side: 'ally' | 'enemy';
  until: number;
}

export interface BState {
  allies: Fighter[];
  enemies: Fighter[];
  time: number;
  limit: number;
  over: null | 'win' | 'lose';
  overReason: string;
  log: string[];
  floats: FloatText[];
  target: string | null;
  allyBuff: { mult: number; until: number };
  enemyBuff: { mult: number; until: number };
  reviveLeft: number;
  dmgReduce: number;
  dmgX: number;
  berserk: boolean;
  tapDmg: number;
  tapCrit: number;
  tapCritMult: number;
  autoSkill: boolean;
  cutin: CutIn | null;
  taps: number;
}

export const BALANCE = { enemyAtk: 1.6, enemyHp: 2.2, tap: 0.22 };

let fid = 0;
const now = () => performance.now();
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const TAP_WORDS = ['✝', 'まじ✝本質✝', 'は？', '面白い', 'うるさい', '✝本質✝', '自己対話', '見てない', '草', 'まあ'];

export function createBattle(s: GameData, rec: number, enemies: EnemyDef[]): BState {
  const d = derive(s);
  const m = d.m;
  const allies: Fighter[] = [];
  s.party.forEach((id, i) => {
    if (!id) return;
    const def = UNIT_MAP[id];
    const u = s.units[id];
    if (!def || !u) return;
    const st = unitStats(def, u, m, s);
    allies.push({
      uid: 'a' + i,
      side: 'ally',
      unitId: id,
      name: def.name,
      emoji: def.emoji,
      maxHp: st.hp,
      hp: st.hp,
      atk: st.atk,
      spd: st.spd,
      crit: st.crit,
      timer: rnd(0.2, 1.0),
      gauge: 0,
      gaugeMax: def.skill.charge,
      gaugeRate: 5 * (1 + st.gaugePct),
      gaugeHit: 10 * (1 + st.gaugePct),
      skill: { name: def.skill.name, kind: def.skill.kind, power: def.skill.power, duration: def.skill.duration ?? 0, hits: def.skill.hits ?? 1, line: def.skill.line },
      stun: 0,
      shield: st.hp * m.shieldPct,
      alive: true,
      boss: false,
      hitAt: 0,
      taunt: def.type === '冷笑' ? 2.2 : 1,
    });
  });
  const P = devToPower(rec);
  const sumW = enemies.reduce((a, e) => a + e.w, 0) || 1;
  const foes: Fighter[] = enemies.map((e, i) => {
    const p = (P * e.w) / sumW;
    const atk = (p / 4) * (e.boss ? 0.9 : 1) * BALANCE.enemyAtk;
    const hp = 2 * p * (e.boss ? 1.2 : 1) * BALANCE.enemyHp;
    return {
      uid: 'e' + i,
      side: 'enemy',
      name: e.name,
      emoji: e.emoji,
      maxHp: hp,
      hp,
      atk,
      spd: e.spd ?? 1,
      crit: 0.03,
      timer: rnd(0.8, 2.0),
      gauge: 0,
      gaugeMax: 100,
      gaugeRate: e.skill ? 6 * (1 - Math.min(0.8, m.enemyGaugeSlow)) : 0,
      gaugeHit: e.skill ? 5 * (1 - Math.min(0.8, m.enemyGaugeSlow)) : 0,
      skill: e.skill ? { name: e.skill.name, kind: e.skill.kind, power: e.skill.power, duration: e.skill.duration ?? 0, hits: 1, line: e.skill.line } : undefined,
      stun: 0,
      shield: 0,
      alive: true,
      boss: !!e.boss,
      hitAt: 0,
      taunt: 1,
    };
  });
  const avgAtk = allies.length ? allies.reduce((a, f) => a + f.atk, 0) / allies.length : 1;
  const clickMul = (1 + m.clickPct) * m.clickX;
  return {
    allies,
    enemies: foes,
    time: 0,
    limit: 90,
    over: null,
    overReason: '',
    log: ['戦闘開始！ 敵をタップして✝本質✝を叩き込め'],
    floats: [],
    target: null,
    allyBuff: { mult: 1, until: 0 },
    enemyBuff: { mult: 1, until: 0 },
    reviveLeft: m.revive,
    dmgReduce: Math.min(0.75, m.dmgReduce),
    dmgX: m.dmgX,
    berserk: m.berserk > 0,
    tapDmg: avgAtk * BALANCE.tap * (1 + Math.log10(1 + clickMul)),
    tapCrit: Math.min(0.6, m.critChance),
    tapCritMult: Math.max(2, Math.min(8, m.critMult * 0.5)),
    autoSkill: true,
    cutin: null,
    taps: 0,
  };
}

function addLog(b: BState, msg: string) {
  b.log = [msg, ...b.log].slice(0, 4);
}

function pushFloat(b: BState, uid: string, text: string, color: string, big: boolean) {
  b.floats.push({ id: ++fid, uid, text, color, t0: now(), big, dx: rnd(-18, 18) });
  if (b.floats.length > 50) b.floats.shift();
}

function pickEnemyTarget(b: BState): Fighter | undefined {
  if (b.target) {
    const t = b.enemies.find((e) => e.uid === b.target && e.alive);
    if (t) return t;
    b.target = null;
  }
  return b.enemies.find((e) => e.alive);
}

function pickAllyTarget(b: BState): Fighter | undefined {
  const alive = b.allies.filter((a) => a.alive);
  if (!alive.length) return undefined;
  const total = alive.reduce((a, f) => a + f.taunt, 0);
  let r = Math.random() * total;
  for (const f of alive) {
    r -= f.taunt;
    if (r <= 0) return f;
  }
  return alive[0];
}

function allyMult(b: BState, f: Fighter) {
  let m = b.dmgX;
  if (b.allyBuff.until > b.time) m *= b.allyBuff.mult;
  if (b.berserk && f.hp < f.maxHp * 0.5) m *= 2;
  return m;
}

function enemyMult(b: BState) {
  return b.enemyBuff.until > b.time ? b.enemyBuff.mult : 1;
}

function checkEnd(b: BState) {
  if (b.over) return;
  if (b.enemies.every((e) => !e.alive)) {
    b.over = 'win';
    b.overReason = '✝本質✝の勝利！ 全員論破した';
  } else if (b.allies.every((a) => !a.alive)) {
    b.over = 'lose';
    b.overReason = '全員早退した……';
  }
}

function damage(b: BState, tgt: Fighter, raw: number, color: string, big = false) {
  if (!tgt.alive) return;
  let dmg = raw;
  if (tgt.side === 'ally') dmg *= 1 - b.dmgReduce;
  if (tgt.shield > 0) {
    const a = Math.min(tgt.shield, dmg);
    tgt.shield -= a;
    dmg -= a;
  }
  tgt.hp -= dmg;
  tgt.hitAt = now();
  pushFloat(b, tgt.uid, fmt(Math.max(1, raw)), color, big);
  if (tgt.hp <= 0) {
    tgt.hp = 0;
    tgt.alive = false;
    if (tgt.side === 'ally') {
      if (b.reviveLeft > 0) {
        b.reviveLeft--;
        tgt.alive = true;
        tgt.hp = tgt.maxHp * 0.5;
        addLog(b, `地面は忘れない！ ${tgt.name}が復活した`);
        pushFloat(b, tgt.uid, '復活！', '#34d399', true);
      } else {
        addLog(b, `${tgt.name}は早退した`);
      }
    } else {
      addLog(b, `${tgt.name}を論破した！`);
    }
    checkEnd(b);
  }
}

function basicAttack(b: BState, f: Fighter) {
  if (f.side === 'ally') {
    const tgt = pickEnemyTarget(b);
    if (!tgt) return;
    const crit = Math.random() < f.crit;
    const dmg = f.atk * rnd(0.9, 1.1) * allyMult(b, f) * (crit ? 2 : 1);
    damage(b, tgt, dmg, crit ? '#fde047' : '#ffffff', crit);
  } else {
    const tgt = pickAllyTarget(b);
    if (!tgt) return;
    const crit = Math.random() < f.crit;
    const dmg = f.atk * rnd(0.9, 1.1) * enemyMult(b) * (crit ? 1.8 : 1);
    damage(b, tgt, dmg, '#f87171', crit);
  }
  if (f.skill) f.gauge = Math.min(f.gaugeMax, f.gauge + f.gaugeHit);
}

export function useSkill(b: BState, f: Fighter): boolean {
  const sk = f.skill;
  if (!sk || !f.alive || f.stun > 0 || f.gauge < f.gaugeMax || b.over) return false;
  f.gauge = 0;
  b.cutin = { name: f.name, skill: sk.name, line: sk.line, emoji: f.emoji, unitId: f.unitId, side: f.side, until: now() + 1300 };
  addLog(b, `${f.name}「${sk.line}」→ ${sk.name}！`);
  if (f.side === 'ally') {
    const m = allyMult(b, f);
    const foes = b.enemies.filter((e) => e.alive);
    switch (sk.kind) {
      case 'nuke': {
        const t = pickEnemyTarget(b);
        if (t) damage(b, t, f.atk * sk.power * m, '#fbbf24', true);
        break;
      }
      case 'aoe':
        foes.forEach((e) => damage(b, e, f.atk * sk.power * m, '#c084fc', true));
        break;
      case 'multi':
        for (let i = 0; i < sk.hits; i++) {
          const alive = b.enemies.filter((e) => e.alive);
          if (!alive.length) break;
          damage(b, alive[Math.floor(Math.random() * alive.length)], f.atk * sk.power * m, '#f0abfc', false);
        }
        break;
      case 'heal':
        b.allies
          .filter((a) => a.alive)
          .forEach((a) => {
            const h = a.maxHp * sk.power;
            a.hp = Math.min(a.maxHp, a.hp + h);
            pushFloat(b, a.uid, '+' + fmt(h), '#4ade80', false);
          });
        break;
      case 'shield':
        b.allies
          .filter((a) => a.alive)
          .forEach((a) => {
            a.shield += a.maxHp * sk.power;
            pushFloat(b, a.uid, 'バリア', '#67e8f9', false);
          });
        break;
      case 'buff':
        b.allyBuff = { mult: 1 + sk.power, until: b.time + (sk.duration || 8) };
        b.allies.forEach((a) => {
          if (a.alive) pushFloat(b, a.uid, 'ATK UP', '#fb923c', false);
        });
        break;
      case 'stun':
        foes.forEach((e) => {
          e.stun = Math.max(e.stun, sk.duration || 2);
          if (sk.power > 0) damage(b, e, f.atk * sk.power * m, '#93c5fd', true);
          else pushFloat(b, e.uid, 'スタン', '#93c5fd', true);
        });
        break;
      case 'gamble':
        if (Math.random() < 0.5) {
          addLog(b, '観測成功！ 波動関数が収束した！');
          foes.forEach((e) => damage(b, e, f.atk * sk.power * m, '#f472b6', true));
        } else {
          addLog(b, '……滑った。何も起きなかった');
          pushFloat(b, f.uid, '滑った', '#94a3b8', true);
        }
        break;
    }
  } else {
    const m = enemyMult(b);
    const allies = b.allies.filter((a) => a.alive);
    switch (sk.kind) {
      case 'aoe':
        allies.forEach((a) => damage(b, a, f.atk * sk.power * m, '#f87171', true));
        break;
      case 'nuke': {
        const t = pickAllyTarget(b);
        if (t) damage(b, t, f.atk * sk.power * m, '#ef4444', true);
        break;
      }
      case 'stun': {
        const t = pickAllyTarget(b);
        if (t) {
          t.stun = Math.max(t.stun, sk.duration || 1.5);
          pushFloat(b, t.uid, 'スタン', '#a5b4fc', true);
          if (sk.power > 0) damage(b, t, f.atk * sk.power * m, '#f87171', false);
        }
        break;
      }
      case 'heal':
        b.enemies
          .filter((e) => e.alive)
          .forEach((e) => {
            const h = e.maxHp * sk.power;
            e.hp = Math.min(e.maxHp, e.hp + h);
            pushFloat(b, e.uid, '+' + fmt(h), '#4ade80', false);
          });
        break;
      case 'buff':
        b.enemyBuff = { mult: 1 + sk.power, until: b.time + (sk.duration || 8) };
        b.enemies.forEach((e) => {
          if (e.alive) pushFloat(b, e.uid, 'ATK UP', '#fb923c', false);
        });
        break;
      default:
        break;
    }
  }
  return true;
}

export function stepBattle(b: BState, dt: number) {
  const t = now();
  if (b.floats.length) b.floats = b.floats.filter((f) => t - f.t0 < 950);
  if (b.cutin && b.cutin.until < t) b.cutin = null;
  if (b.over) return;
  b.time += dt;
  if (b.time >= b.limit) {
    b.over = 'lose';
    b.overReason = 'キーンコーンカーンコーン……チャイムが鳴った（時間切れ）';
    return;
  }
  for (const f of [...b.allies, ...b.enemies]) {
    if (!f.alive) continue;
    if (f.stun > 0) {
      f.stun -= dt;
      continue;
    }
    if (f.skill) f.gauge = Math.min(f.gaugeMax, f.gauge + f.gaugeRate * dt);
    f.timer -= dt * f.spd;
    if (f.timer <= 0) {
      f.timer += 2;
      basicAttack(b, f);
      if (b.over) return;
    }
    if (f.skill && f.gauge >= f.gaugeMax && (f.side === 'enemy' || b.autoSkill)) {
      useSkill(b, f);
      if (b.over) return;
    }
  }
}

export function tap(b: BState, uid?: string) {
  if (b.over) return;
  if (uid) {
    const e = b.enemies.find((x) => x.uid === uid && x.alive);
    if (e) b.target = uid;
  }
  const tgt = pickEnemyTarget(b);
  if (!tgt) return;
  const crit = Math.random() < b.tapCrit;
  const buff = b.allyBuff.until > b.time ? b.allyBuff.mult : 1;
  const dmg = b.tapDmg * (crit ? b.tapCritMult : 1) * buff * b.dmgX;
  b.taps++;
  damage(b, tgt, dmg, crit ? '#fde047' : '#e9d5ff', crit);
  if (crit || Math.random() < 0.1) pushFloat(b, tgt.uid, TAP_WORDS[Math.floor(Math.random() * TAP_WORDS.length)], '#c4b5fd', false);
  b.allies.forEach((a) => {
    if (a.alive && a.skill) a.gauge = Math.min(a.gaugeMax, a.gauge + 1.5);
  });
}

export function applyItem(b: BState, e: ConsumableEffect): boolean {
  if (b.over) return false;
  switch (e.kind) {
    case 'healAll':
      b.allies
        .filter((a) => a.alive)
        .forEach((a) => {
          const h = a.maxHp * e.pct;
          a.hp = Math.min(a.maxHp, a.hp + h);
          pushFloat(b, a.uid, '+' + fmt(h), '#4ade80', true);
        });
      addLog(b, 'ホットコーンスープで回復した！（奇跡の補充）');
      return true;
    case 'atkBuff':
      b.allyBuff = { mult: Math.max(b.allyBuff.until > b.time ? b.allyBuff.mult : 1, e.mult), until: b.time + e.duration };
      b.allies.forEach((a) => {
        if (a.alive) pushFloat(b, a.uid, '全マシ！', '#fb923c', true);
      });
      addLog(b, '二郎系でATKが上がった！ この脂の浮き方まじ✝本質✝');
      return true;
    case 'reviveOne': {
      const dead = b.allies.find((a) => !a.alive);
      const tgt = dead ?? [...b.allies].filter((a) => a.alive).sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp)[0];
      if (!tgt) return false;
      tgt.alive = true;
      tgt.hp = tgt.maxHp;
      pushFloat(b, tgt.uid, dead ? '復活！' : '全快！', '#34d399', true);
      addLog(b, `${tgt.name}「母親の卵焼きまじ✝本質✝」`);
      return true;
    }
    case 'gaugeFull':
      b.allies.forEach((a) => {
        if (a.alive && a.skill) a.gauge = a.gaugeMax;
      });
      addLog(b, '充電完了！ 全員のスキルが使える');
      return true;
    case 'enemyDmg': {
      const alive = b.allies.filter((a) => a.alive);
      const avg = alive.length ? alive.reduce((x, a) => x + a.atk, 0) / alive.length : 1;
      b.enemies.filter((x) => x.alive).forEach((x) => damage(b, x, avg * e.mult * b.dmgX, '#fb7185', true));
      addLog(b, '赤福を投げた！ 三重県の名物（本物）');
      return true;
    }
    default:
      return false;
  }
}
