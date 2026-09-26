// 召喚演出用の効果音（WebAudio合成・外部ファイル不要）
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const W = window as unknown as {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      };
      const Ctor = W.AudioContext ?? W.webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function noiseBuffer(c: AudioContext, seconds: number) {
  const buf = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * seconds)), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function amp(c: AudioContext, when: number, peak: number, attack: number, decay: number) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(peak, when + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, when + attack + decay);
  return g;
}

function boom(c: AudioContext, when: number, volume = 0.5) {
  // 低音の衝撃波
  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(150, when);
  o.frequency.exponentialRampToValueAtTime(36, when + 0.55);
  const g = amp(c, when, volume, 0.008, 0.6);
  o.connect(g).connect(c.destination);
  o.start(when);
  o.stop(when + 0.7);
  // 破裂ノイズ
  const n = c.createBufferSource();
  n.buffer = noiseBuffer(c, 0.35);
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.setValueAtTime(2400, when);
  f.frequency.exponentialRampToValueAtTime(180, when + 0.3);
  const ng = amp(c, when, volume * 0.65, 0.005, 0.3);
  n.connect(f).connect(ng).connect(c.destination);
  n.start(when);
  n.stop(when + 0.4);
}

function riser(c: AudioContext, when: number, volume = 0.3) {
  // 盛り上げのうなり
  const o = c.createOscillator();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(180, when);
  o.frequency.exponentialRampToValueAtTime(920, when + 0.62);
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 6;
  f.frequency.setValueAtTime(320, when);
  f.frequency.exponentialRampToValueAtTime(2200, when + 0.62);
  const g = amp(c, when, volume, 0.28, 0.36);
  o.connect(f).connect(g).connect(c.destination);
  o.start(when);
  o.stop(when + 0.75);
}

function shimmer(c: AudioContext, when: number, volume = 0.22) {
  // キラキラ（アルペジオ）
  const notes = [1046.5, 1318.5, 1568, 2093, 2637];
  notes.forEach((hz, i) => {
    const t = when + i * 0.085;
    const o = c.createOscillator();
    o.type = 'triangle';
    o.frequency.value = hz;
    const g = amp(c, t, volume * (1 - i * 0.13), 0.006, 0.5);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.55);
  });
}

function glitchBlips(c: AudioContext, when: number, volume = 0.2) {
  // LR用の崩壊音
  for (let i = 0; i < 4; i++) {
    const t = when + i * 0.07;
    const o = c.createOscillator();
    o.type = i % 2 ? 'square' : 'sawtooth';
    o.frequency.setValueAtTime(120 + Math.random() * 900, t);
    o.frequency.exponentialRampToValueAtTime(60 + Math.random() * 200, t + 0.06);
    const g = amp(c, t, volume, 0.003, 0.055);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.08);
  }
  const n = c.createBufferSource();
  n.buffer = noiseBuffer(c, 0.18);
  const ng = amp(c, when, volume * 0.5, 0.01, 0.16);
  n.connect(ng).connect(c.destination);
  n.start(when);
  n.stop(when + 0.2);
}

function deep(c: AudioContext, when: number, volume = 0.4) {
  // 「地面は忘れない」みたいな重低音
  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(58, when);
  o.frequency.exponentialRampToValueAtTime(30, when + 1.1);
  const g = amp(c, when, volume, 0.02, 1.2);
  o.connect(g).connect(c.destination);
  o.start(when);
  o.stop(when + 1.35);
}

export const sfx = {
  /** rank: 3=SSR 4=UR 5=LR */
  reveal(rank: number) {
    const c = getCtx();
    if (!c) return;
    const t = c.currentTime + 0.02;
    try {
      riser(c, t, rank >= 4 ? 0.32 : 0.22);
      boom(c, t + 0.58, rank >= 5 ? 0.62 : rank >= 4 ? 0.55 : 0.45);
      if (rank >= 5) {
        glitchBlips(c, t + 0.56, 0.26);
        deep(c, t + 0.6, 0.5);
        shimmer(c, t + 1.05, 0.14);
      } else if (rank >= 4) {
        shimmer(c, t + 1.0, 0.26);
        deep(c, t + 0.62, 0.3);
      } else {
        shimmer(c, t + 1.0, 0.2);
      }
    } catch {
      /* 無音でも演出は続行 */
    }
  },
  tap() {
    const c = getCtx();
    if (!c) return;
    try {
      const t = c.currentTime + 0.01;
      const o = c.createOscillator();
      o.type = 'triangle';
      o.frequency.value = 660;
      const g = amp(c, t, 0.12, 0.004, 0.12);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + 0.16);
    } catch {
      /* noop */
    }
  },
  crit() {
    const c = getCtx();
    if (!c) return;
    try {
      const t = c.currentTime + 0.01;
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(440, t);
      o.frequency.exponentialRampToValueAtTime(1320, t + 0.15);
      const g = amp(c, t, 0.2, 0.005, 0.2);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + 0.22);
    } catch {
      /* noop */
    }
  },
  gacon() {
    const c = getCtx();
    if (!c) return;
    try {
      const t = c.currentTime + 0.01;
      // レバー引く音＆金属音
      const o1 = c.createOscillator();
      o1.type = 'triangle';
      o1.frequency.setValueAtTime(180, t);
      o1.frequency.exponentialRampToValueAtTime(60, t + 0.18);
      const g1 = amp(c, t, 0.35, 0.01, 0.2);
      o1.connect(g1).connect(c.destination);
      o1.start(t);
      o1.stop(t + 0.25);

      // 缶が落ちてゴトッと当たる音
      const t2 = t + 0.12;
      const n = c.createBufferSource();
      n.buffer = noiseBuffer(c, 0.2);
      const f = c.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.setValueAtTime(450, t2);
      f.Q.value = 4;
      const ng = amp(c, t2, 0.4, 0.008, 0.25);
      n.connect(f).connect(ng).connect(c.destination);
      n.start(t2);
      n.stop(t2 + 0.3);
    } catch {
      /* noop */
    }
  },
  hundred() {
    const c = getCtx();
    if (!c) return;
    try {
      const t = c.currentTime + 0.01;
      for (let i = 0; i < 5; i++) {
        const ti = t + i * 0.05;
        const o = c.createOscillator();
        o.type = 'triangle';
        o.frequency.value = 500 + i * 150;
        const g = amp(c, ti, 0.15, 0.005, 0.1);
        o.connect(g).connect(c.destination);
        o.start(ti);
        o.stop(ti + 0.12);
      }
      boom(c, t + 0.3, 0.45);
    } catch {
      /* noop */
    }
  },
  awaken() {
    const c = getCtx();
    if (!c) return;
    try {
      const t = c.currentTime + 0.01;
      riser(c, t, 0.3);
      shimmer(c, t + 0.4, 0.35);
      boom(c, t + 0.5, 0.4);
    } catch {
      /* noop */
    }
  },
  ultra() {
    const c = getCtx();
    if (!c) return;
    try {
      const t = c.currentTime + 0.02;
      deep(c, t, 0.6);
      boom(c, t + 0.4, 0.7);
      glitchBlips(c, t + 0.7, 0.4);
      riser(c, t + 1.2, 0.4);
      boom(c, t + 1.8, 0.8);
      shimmer(c, t + 2.2, 0.4);
    } catch {
      /* noop */
    }
  },
};
