/**
 * BGM（ループ再生）。
 *
 * 音色は外部アセット（FluidR3 GM soundfont / CC BY 3.0、`src/assets/audio/notes/`）の
 * 単音サンプル。**作曲・編曲・シーケンスはこのゲーム用に自作**している
 * （Aマイナー、72BPM、8小節ループ、Am–F–C–G）。
 *
 * サンプルが1つでも読めなかった場合は BGM を鳴らさずに終了する（無音で壊れない）。
 * 出典・ライセンスは `src/assets/manifest.json` / CREDITS.md を参照。
 */
import { getBgmGain, getContext, getSettings, loadSample, onSettingsChange, play, warm } from './audio';

const BPM = 72;
const BEAT = 60 / BPM;
const GRID = 0.5; // 8分音符ステップ
const LOOP_BEATS = 32; // 8小節
const STEPS = LOOP_BEATS / GRID;

type Ev = { beat: number; key: string; gain: number };

const CHORDS: Record<string, { pad: string[]; bass: string }> = {
  Am: { pad: ['ep1_A2', 'ep1_C3', 'ep1_E3'], bass: 'bass_A1' },
  F: { pad: ['ep1_F2', 'ep1_A2', 'ep1_C3'], bass: 'bass_F1' },
  C: { pad: ['ep1_G2', 'ep1_C3', 'ep1_E3'], bass: 'bass_C2' },
  G: { pad: ['ep1_G2', 'ep1_B2', 'ep1_D3'], bass: 'bass_G1' },
};

const PROGRESSION = ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G'];

/** メロディ（ミュージックボックス）。beat はループ内の位置。 */
const MELODY: Ev[] = [
  { beat: 0, key: 'box_E5', gain: 0.5 },
  { beat: 2.5, key: 'box_G5', gain: 0.42 },
  { beat: 3, key: 'box_A5', gain: 0.5 },
  { beat: 4, key: 'box_G5', gain: 0.46 },
  { beat: 6.5, key: 'box_E5', gain: 0.4 },
  { beat: 7, key: 'box_C5', gain: 0.44 },
  { beat: 8, key: 'box_E5', gain: 0.46 },
  { beat: 9, key: 'box_D5', gain: 0.4 },
  { beat: 10, key: 'box_A4', gain: 0.5 },
  { beat: 12, key: 'box_C5', gain: 0.42 },
  { beat: 14, key: 'box_D5', gain: 0.4 },
  { beat: 16, key: 'box_A5', gain: 0.5 },
  { beat: 18.5, key: 'box_G5', gain: 0.42 },
  { beat: 19, key: 'box_E5', gain: 0.46 },
  { beat: 20, key: 'box_D5', gain: 0.44 },
  { beat: 21.5, key: 'box_E5', gain: 0.4 },
  { beat: 22, key: 'box_G5', gain: 0.44 },
  { beat: 23, key: 'box_A5', gain: 0.48 },
  { beat: 24, key: 'box_E5', gain: 0.46 },
  { beat: 25, key: 'box_G5', gain: 0.4 },
  { beat: 26, key: 'box_A5', gain: 0.48 },
  { beat: 27, key: 'box_G5', gain: 0.42 },
  { beat: 28, key: 'box_D5', gain: 0.46 },
  { beat: 30, key: 'box_C5', gain: 0.44 },
];

const EVENTS: Ev[] = [];
PROGRESSION.forEach((name, bar) => {
  const chord = CHORDS[name];
  const at = bar * 4;
  // 単音サンプルの減衰は 1.2〜1.3s（実測）。1小節=3.33s なので、
  // コードトーンを拍ごとにアルペジオして隙間を埋める（ループ感が出ないように順番をずらす）。
  const order = bar % 2 === 0 ? [0, 1, 2, 1] : [2, 0, 1, 2];
  order.forEach((idx, beat) => EVENTS.push({ beat: at + beat, key: chord.pad[idx], gain: 0.16 + (beat === 0 ? 0.06 : 0) }));
  EVENTS.push({ beat: at, key: chord.bass, gain: 0.42 });
  EVENTS.push({ beat: at + 2, key: chord.bass, gain: 0.3 });
});
EVENTS.push(...MELODY);
EVENTS.sort((a, b) => a.beat - b.beat);

const NOTE_KEYS = [...new Set(EVENTS.map((e) => e.key))].sort();

let timer: number | null = null;
let cursor = 0;
let nextTime = 0;
let running = false;
let starting: Promise<void> | null = null;
let unsubscribe: (() => void) | null = null;

export function isPlaying() {
  return running;
}

export function bgmNotes() {
  return NOTE_KEYS;
}

function scheduleStep(step: number, when: number) {
  const beat = step * GRID;
  const c = getContext();
  if (!c) return;
  for (const ev of EVENTS) {
    if (ev.beat !== beat) continue;
    play(ev.key, { delay: Math.max(0, when - c.currentTime), sfx: false, volume: ev.gain });
  }
}

function tick() {
  const c = getContext();
  if (!c || !running) return;
  while (nextTime < c.currentTime + 0.3) {
    scheduleStep(cursor, nextTime);
    cursor = (cursor + 1) % STEPS;
    nextTime += GRID * BEAT;
  }
}

/** ジングルを鳴らすときに BGM を一時的に下げる。 */
export function duck(factor = 0.45, seconds = 1.6) {
  const g = getBgmGain();
  const c = getContext();
  if (!g || !c) return;
  const s = getSettings();
  const base = s.bgmEnabled && !s.muted ? s.bgm : 0;
  const t = c.currentTime;
  g.gain.cancelScheduledValues(t);
  g.gain.setTargetAtTime(base * factor, t, 0.05);
  g.gain.setTargetAtTime(base, t + seconds, 0.25);
}

async function begin(): Promise<void> {
  const s = getSettings();
  if (!s.bgmEnabled || s.muted) return;
  const c = getContext();
  if (!c) return;

  const buffers = await Promise.all(NOTE_KEYS.map((k) => loadSample(k)));
  if (buffers.some((b) => b === null)) {
    // 音色サンプルが揃わない場合は鳴らさない（無音で動作は続く）
    return;
  }
  if (!running) {
    running = true;
    cursor = 0;
    nextTime = c.currentTime + 0.12;
    timer = window.setInterval(tick, 25);
  }
}

/** タイトルの「はじめに」など、ユーザー操作のあとに呼ぶ。 */
export function startBgm(): Promise<void> {
  if (!starting) {
    starting = begin().finally(() => {
      starting = null;
    });
  }
  if (!unsubscribe) {
    unsubscribe = onSettingsChange((s) => {
      if (!s.bgmEnabled || s.muted) stopBgm();
      else if (!running) void startBgm();
    });
  }
  return starting ?? Promise.resolve();
}

export function stopBgm() {
  running = false;
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
}

/** 読み込みだけ先に済ませておく（無音）。 */
export function preloadBgm(): Promise<void> {
  return warm(NOTE_KEYS).then(() => undefined);
}
