/**
 * 音声のコア（AudioContext・音量設定・サンプル読み込み）。
 *
 * 素材はすべて外部アセット（Kenney / FluidR3 GM）で、`scripts/fetch-assets.mjs` が
 * `src/assets/audio/` に取得したもの。出典とライセンスは `src/assets/manifest.json` と
 * CREDITS.md を参照。
 *
 * - AudioContext が無い環境（SSR・古いブラウザ）では全 API が no-op になる。
 * - サンプルの取得・デコードに失敗しても例外を投げず、`play()` が false を返す
 *   （呼び出し側は WebAudio 合成音にフォールバックする）。
 */

/** sfx: 効果音 / jingle: 短いジングル / note: BGM用の単音サンプル */
const SFX_FILES = import.meta.glob<string>('../assets/audio/sfx/*.ogg', { eager: true, import: 'default' });
const JINGLE_FILES = import.meta.glob<string>('../assets/audio/jingles/*.ogg', { eager: true, import: 'default' });
const NOTE_FILES = import.meta.glob<string>('../assets/audio/notes/*.mp3', { eager: true, import: 'default' });

function keyOf(path: string) {
  return path.slice(path.lastIndexOf('/') + 1).replace(/\.(ogg|mp3|wav)$/i, '');
}

export const SAMPLES: Record<string, string> = {};
for (const [path, url] of Object.entries({ ...SFX_FILES, ...JINGLE_FILES, ...NOTE_FILES })) {
  SAMPLES[keyOf(path)] = url;
}

export const SAMPLE_KEYS = Object.keys(SAMPLES).sort();

const SETTINGS_KEY = 'honshitsu-audio-settings-v1';

export interface AudioSettings {
  muted: boolean;
  master: number; // 0..1
  sfx: number; // 0..1
  bgm: number; // 0..1
  bgmEnabled: boolean;
}

export const DEFAULT_SETTINGS: AudioSettings = {
  muted: false,
  master: 0.85,
  sfx: 0.9,
  bgm: 0.45,
  bgmEnabled: true,
};

type Listener = (s: AudioSettings) => void;

let settings: AudioSettings = { ...DEFAULT_SETTINGS };
const listeners = new Set<Listener>();

function readSettings(): AudioSettings {
  try {
    if (typeof localStorage === 'undefined') return { ...DEFAULT_SETTINGS };
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    return {
      muted: typeof parsed.muted === 'boolean' ? parsed.muted : DEFAULT_SETTINGS.muted,
      master: clamp01(typeof parsed.master === 'number' ? parsed.master : DEFAULT_SETTINGS.master),
      sfx: clamp01(typeof parsed.sfx === 'number' ? parsed.sfx : DEFAULT_SETTINGS.sfx),
      bgm: clamp01(typeof parsed.bgm === 'number' ? parsed.bgm : DEFAULT_SETTINGS.bgm),
      bgmEnabled: typeof parsed.bgmEnabled === 'boolean' ? parsed.bgmEnabled : DEFAULT_SETTINGS.bgmEnabled,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0));
}

let loaded = false;
function ensureSettings() {
  if (loaded) return;
  loaded = true;
  settings = readSettings();
}

export function getSettings(): AudioSettings {
  ensureSettings();
  return { ...settings };
}

export function setSettings(patch: Partial<AudioSettings>): AudioSettings {
  ensureSettings();
  settings = { ...settings, ...patch };
  settings.master = clamp01(settings.master);
  settings.sfx = clamp01(settings.sfx);
  settings.bgm = clamp01(settings.bgm);
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* 保存できなくても動作は続ける */
  }
  applyGains();
  for (const l of listeners) l({ ...settings });
  return { ...settings };
}

export function onSettingsChange(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

/* ---------------------------------------------------------------- AudioContext */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let bgmGain: GainNode | null = null;
let broken = false;

export function getContext(): AudioContext | null {
  if (broken) return null;
  const existing = ctx;
  if (existing) {
    if (existing.state === 'suspended') void existing.resume();
    return existing;
  }
  try {
    if (typeof window === 'undefined') return null;
    const w = window as unknown as {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const Ctor = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) {
      broken = true;
      return null;
    }
    const c = new Ctor();
    const mg = c.createGain();
    const sg = c.createGain();
    const bg = c.createGain();
    sg.connect(mg);
    bg.connect(mg);
    mg.connect(c.destination);
    ctx = c;
    masterGain = mg;
    sfxGain = sg;
    bgmGain = bg;
    applyGains();
    if (c.state === 'suspended') void c.resume();
    return c;
  } catch {
    broken = true;
    return null;
  }
}

export function getBgmGain(): GainNode | null {
  getContext();
  return bgmGain;
}

/** WebAudio 合成音（フォールバック用）を流すバス。ミュート設定が効くように master 経由にする。 */
export function sfxBus(): AudioNode | null {
  getContext();
  return sfxGain;
}

export function isSilent(): boolean {
  ensureSettings();
  return settings.muted || getContext() === null;
}


function applyGains() {
  if (!ctx || !masterGain || !sfxGain || !bgmGain) return;
  ensureSettings();
  const t = ctx.currentTime;
  masterGain.gain.setTargetAtTime(settings.muted ? 0 : settings.master, t, 0.02);
  sfxGain.gain.setTargetAtTime(settings.sfx, t, 0.02);
  bgmGain.gain.setTargetAtTime(settings.bgmEnabled ? settings.bgm : 0, t, 0.05);
}

/** 最初のユーザー操作で呼ぶ（自動再生ポリシー対応）。 */
export function unlockAudio(): boolean {
  const c = getContext();
  if (!c) return false;
  applyGains();
  return c.state === 'running';
}

/* ------------------------------------------------------------------ サンプル */

const buffers = new Map<string, AudioBuffer>();
const pending = new Map<string, Promise<AudioBuffer | null>>();
const failed = new Set<string>();

export function hasSample(name: string) {
  return Boolean(SAMPLES[name]);
}

export function getBuffer(name: string): AudioBuffer | null {
  return buffers.get(name) ?? null;
}

export function isFailed(name: string) {
  return failed.has(name);
}

export function audioStats() {
  return {
    total: SAMPLE_KEYS.length,
    decoded: buffers.size,
    failed: [...failed].sort(),
    contextState: ctx?.state ?? 'none',
  };
}

export function loadSample(name: string): Promise<AudioBuffer | null> {
  const url = SAMPLES[name];
  if (!url) {
    failed.add(name);
    return Promise.resolve(null);
  }
  const cached = buffers.get(name);
  if (cached) return Promise.resolve(cached);
  const inflight = pending.get(name);
  if (inflight) return inflight;

  const c = getContext();
  if (!c) return Promise.resolve(null);

  const task = (async (): Promise<AudioBuffer | null> => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.arrayBuffer();
      const buffer = await new Promise<AudioBuffer>((resolve, reject) => {
        // decodeAudioData のコールバック形式は古い Safari 用
        const maybe = c.decodeAudioData(data, resolve, reject) as unknown;
        if (maybe && typeof (maybe as Promise<AudioBuffer>).then === 'function') {
          (maybe as Promise<AudioBuffer>).then(resolve, reject);
        }
      });
      if (!buffer) throw new Error('empty buffer');
      buffers.set(name, buffer);
      return buffer;
    } catch {
      failed.add(name);
      return null;
    } finally {
      pending.delete(name);
    }
  })();

  pending.set(name, task);
  return task;
}

/** よく使う音を先にデコードしておく（タイトル画面の操作後などに呼ぶ）。 */
export async function warm(names: string[]): Promise<void> {
  await Promise.all(names.filter((n) => SAMPLES[n] && !buffers.has(n)).map((n) => loadSample(n)));
}

export interface PlayOptions {
  volume?: number;
  rate?: number;
  delay?: number;
  /** BGM ではなく SFX バスに流す（既定）。false で BGM バス。 */
  sfx?: boolean;
  /** 発音位置のランダム揺らぎ（連打時に同じ音が重ならないようにする） */
  jitter?: number;
}

/**
 * サンプルを鳴らす。鳴らせなかった場合は false（呼び出し側でフォールバック可能）。
 */
export function play(name: string, opts: PlayOptions = {}): boolean {
  const c = getContext();
  if (!c) return false;
  ensureSettings();
  if (settings.muted) return false;
  const buffer = buffers.get(name);
  if (!buffer) {
    void loadSample(name);
    return false;
  }
  try {
    const when = c.currentTime + (opts.delay ?? 0) + 0.005;
    const src = c.createBufferSource();
    src.buffer = buffer;
    const base = opts.rate ?? 1;
    const jitter = opts.jitter ?? 0;
    src.playbackRate.value = base * (jitter ? 1 + (Math.random() * 2 - 1) * jitter : 1);
    const g = c.createGain();
    g.gain.value = opts.volume ?? 1;
    src.connect(g);
    g.connect(opts.sfx === false ? (bgmGain ?? c.destination) : (sfxGain ?? c.destination));
    src.start(when);
    src.onended = () => {
      try {
        src.disconnect();
        g.disconnect();
      } catch {
        /* noop */
      }
    };
    return true;
  } catch {
    return false;
  }
}

/** 複数のサンプルをまとめて鳴らす（レイヤー）。1つでも鳴れば true。 */
export function playLayer(layers: { name: string; opts?: PlayOptions }[]): boolean {
  let ok = false;
  for (const l of layers) ok = play(l.name, l.opts) || ok;
  return ok;
}
