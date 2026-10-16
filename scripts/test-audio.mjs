/**
 * 外部アセット（音声・フォント）の結合チェック。
 *
 *   node scripts/test-audio.mjs
 *
 * ブラウザを使えない環境でも「実際にそのコードが走る」ことを確かめるため、
 * AudioContext / fetch / localStorage をモックしたうえで Vite の SSR ローダーから
 * 本物のモジュール（src/utils/audio.ts, sfx.ts, bgm.ts）を読み込んで実行する。
 *
 * 確認していること
 *  - src/assets/ に取得した全ファイルが実在し、manifest.json の失敗件数が 0 であること
 *  - サンプル名→URL の登録が 効果音/ジングル/BGM音色 の3種そろっていること
 *  - 未取得時は WebAudio 合成音にフォールバックし、取得後はサンプルが鳴ること
 *  - ミュート時に何も鳴らないこと（フォールバック音も出ないこと）
 *  - BGM が全音色をロードし、シーケンサが実際にノートを発音すること
 *  - fonts.css の @font-face が参照する woff2 がすべて実在すること
 */
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* ------------------------------------------------------------- 静的アセットの確認 */
const manifest = JSON.parse(readFileSync(join(ROOT, 'src/assets/manifest.json'), 'utf8'));
assert.deepEqual(manifest.failures, [], 'manifest.json に取得失敗が残っている');
for (const f of manifest.files) {
  assert.ok(existsSync(join(ROOT, 'src/assets', f.file)), `未取得: ${f.file}`);
  assert.ok((f.bytes ?? 0) > 0, `サイズ0: ${f.file}`);
}
const fontsCss = readFileSync(join(ROOT, 'src/assets/fonts/fonts.css'), 'utf8');
const fontUrls = [...fontsCss.matchAll(/url\('\.\/([^']+)'\)/g)].map((m) => m[1]);
assert.ok(fontUrls.length >= 7, 'fonts.css の @font-face が足りない');
for (const u of fontUrls) assert.ok(existsSync(join(ROOT, 'src/assets/fonts', u)), `フォント実体がない: ${u}`);
for (const fam of ['Dela Gothic One', 'M PLUS Rounded 1c', 'Shippori Mincho']) {
  assert.ok(fontsCss.includes(`font-family: '${fam}'`), `@font-face に ${fam} がない`);
}
console.log(`assets: ${manifest.files.length} ファイル実在 / フォント ${fontUrls.length} 面`);

/* ------------------------------------------------------------------- モック環境 */
const started = []; // { name, when, gain }
const oscillators = [];
const intervals = [];
let currentTime = 0;

function param(value = 0) {
  return {
    value,
    setValueAtTime(v) { this.value = v; return this; },
    linearRampToValueAtTime() { return this; },
    exponentialRampToValueAtTime() { return this; },
    setTargetAtTime(v) { this.value = v; return this; },
    cancelScheduledValues() { return this; },
  };
}

class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.sampleRate = 44100;
    this.destination = { connect: () => this.destination, disconnect() {} };
  }
  get currentTime() { return currentTime; }
  resume() { this.state = 'running'; return Promise.resolve(); }
  createGain() {
    const node = { gain: param(1), connect: (d) => d, disconnect() {} };
    return node;
  }
  createBufferSource() {
    const src = {
      buffer: null,
      playbackRate: param(1),
      loop: false,
      onended: null,
      connect: (d) => d,
      disconnect() {},
      start(when = 0) {
        // ゲインは直前の createGain で設定された値を使う（テスト用に記録）
        started.push({ name: this.buffer?.name ?? '?', when, gain: lastGain });
      },
      stop() {},
    };
    return src;
  }
  createOscillator() {
    const o = {
      type: 'sine',
      frequency: param(440),
      connect: (d) => d,
      disconnect() {},
      start(when = 0) { oscillators.push({ type: this.type, when }); },
      stop() {},
    };
    return o;
  }
  createBiquadFilter() {
    return { type: 'lowpass', Q: param(1), frequency: param(350), connect: (d) => d, disconnect() {} };
  }
  createBuffer(ch, len, rate) {
    const data = new Float32Array(len);
    return { getChannelData: () => data, length: len, sampleRate: rate, duration: len / rate };
  }
  decodeAudioData(data, ok) {
    const buf = { name: data.__name, duration: 1.5, length: 66150, sampleRate: 44100, numberOfChannels: 1 };
    if (typeof ok === 'function') ok(buf);
    return Promise.resolve(buf);
  }
}

let lastGain = 1;

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

globalThis.window = {
  AudioContext: MockAudioContext,
  setInterval: (fn, ms) => { const id = intervals.length; intervals.push({ fn, ms, alive: true }); return id; },
  clearInterval: (id) => { if (intervals[id]) intervals[id].alive = false; },
  addEventListener() {},
  removeEventListener() {},
};

// サンプル取得は「本物の URL 文字列」を受け取り、ファイル名つきのダミー配列を返す
globalThis.fetch = async (url) => {
  const name = String(url).split('/').pop();
  const ab = new ArrayBuffer(16);
  ab.__name = name.replace(/\.(ogg|mp3)$/i, '');
  return { ok: true, status: 200, arrayBuffer: async () => ab };
};

/* ------------------------------------------------------------------------- 実行 */
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true } });
try {
  const audio = await server.ssrLoadModule('/src/utils/audio.ts');

  // サンプル登録: 効果音34 + ジングル7 + BGM音色17 = 58
  const sfxCount = audio.SAMPLE_KEYS.filter((k) => !k.startsWith('jingles_') && !/^(ep1|bass|box)_/.test(k)).length;
  const jingleCount = audio.SAMPLE_KEYS.filter((k) => k.startsWith('jingles_')).length;
  const noteCount = audio.SAMPLE_KEYS.filter((k) => /^(ep1|bass|box)_/.test(k)).length;
  assert.equal(sfxCount, 34, `効果音の数が合わない: ${sfxCount}`);
  assert.equal(jingleCount, 7, `ジングルの数が合わない: ${jingleCount}`);
  assert.equal(noteCount, 17, `BGM音色の数が合わない: ${noteCount}`);
  for (const [k, v] of Object.entries(audio.SAMPLES)) assert.ok(typeof v === 'string' && v.length > 0, `URL が空: ${k}`);

  const { sfx } = await server.ssrLoadModule('/src/utils/sfx.ts');
  const bgm = await server.ssrLoadModule('/src/utils/bgm.ts');

  // --- 1. サンプル未取得 → 合成音にフォールバックする
  started.length = 0; oscillators.length = 0;
  sfx.tap();
  assert.equal(started.length, 0, '未取得なのにサンプルが発音された');
  assert.ok(oscillators.length > 0, '未取得時に合成音のフォールバックが鳴らない');

  // --- 2. サンプルを取得 → サンプルが鳴る
  await audio.warm([
    'click_002', 'impactSoft_medium_000', 'pluck_002', 'impactGlass_heavy_001',
    'impactMetal_heavy_000', 'impactPlate_medium_001', 'switch13',
    'jingles_NES05', 'jingles_HIT11', 'confirmation_001', 'glass_004',
  ]);
  started.length = 0; oscillators.length = 0;
  sfx.tap();
  assert.deepEqual(
    started.map((s) => s.name).sort(),
    ['click_002', 'impactSoft_medium_000'].sort(),
    'タップ音がサンプルになっていない',
  );

  started.length = 0;
  sfx.gacon();
  assert.deepEqual(started.map((s) => s.name).sort(), ['impactMetal_heavy_000', 'impactPlate_medium_001', 'switch13'].sort(), '召喚音がレイヤーされていない');

  started.length = 0; oscillators.length = 0;
  sfx.achievement();
  assert.deepEqual(started.map((s) => s.name), ['jingles_NES05'], '実績ジングルが鳴らない');

  started.length = 0; oscillators.length = 0;
  sfx.reveal(4);
  assert.ok(started.some((s) => s.name === 'jingles_HIT11'), 'UR召喚でジングルが鳴らない');
  assert.ok(started.some((s) => s.name === 'confirmation_001' || oscillators.length > 0), 'UR召喚の盛り上げが無い');

  // --- 3. ミュート中はサンプルも合成音も鳴らない
  audio.setSettings({ muted: true });
  started.length = 0; oscillators.length = 0;
  sfx.tap();
  sfx.achievement();
  assert.equal(started.length, 0, 'ミュート中にサンプルが鳴った');
  assert.equal(oscillators.length, 0, 'ミュート中に合成音が鳴った');
  audio.setSettings({ muted: false });

  // --- 4. BGM: 全音色をロードしてシーケンサが発音する
  assert.deepEqual(bgm.bgmNotes().length, 17, 'BGM の音色数が合わない');
  await bgm.startBgm();
  assert.equal(audio.getBuffer('ep1_A2') !== null, true, 'BGM 音色がロードされていない');
  assert.equal(intervals.filter((i) => i.alive).length, 1, 'BGM スケジューラが起動していない');

  const timer = intervals.find((i) => i.alive);

  // 1小節目（Am）: パッド + ベース + メロディが同時に鳴る
  started.length = 0;
  currentTime = 1.0; // 先読み窓を進める
  timer.fn();
  const first = started.map((s) => s.name);
  assert.ok(first.includes('ep1_A2'), `1小節目の Am コードが鳴らない: ${first.join(',')}`);
  assert.ok(first.includes('bass_A1'), 'ベースが鳴らない');
  assert.ok(first.includes('box_E5'), 'メロディが鳴らない');

  // 8小節（1ループ）ぶん回して、用意した17音色がすべて使われることを確認する
  started.length = 0;
  for (let i = 0; i < 220; i += 1) {
    currentTime += 0.2;
    timer.fn();
  }
  const names = started.map((s) => s.name);
  const unique = new Set(names);
  assert.ok(names.length > 60, `ループ内の発音数が少ない: ${names.length}`);
  assert.equal(unique.size, 17, `使われていない音色がある（${unique.size}/17）: ${[...unique].sort().join(',')}`);
  assert.ok(names.filter((x) => x.startsWith('ep1_')).length > 24, `パッドのアルペジオが足りない: ${names.length}`);

  bgm.stopBgm();
  assert.equal(intervals.filter((i) => i.alive).length, 0, 'stopBgm で止まらない');

  // --- 5. 音量設定は localStorage に保存される
  audio.setSettings({ master: 0.5, bgm: 0.2 });
  assert.equal(JSON.parse(store.get('honshitsu-audio-settings-v1')).master, 0.5, '音量が保存されない');

  const stats = audio.audioStats();
  assert.equal(stats.failed.length, 0, `ロード失敗がある: ${stats.failed.join(',')}`);
  console.log(`audio: 効果音${sfxCount} / ジングル${jingleCount} / BGM音色${noteCount}, デコード済み ${stats.decoded}, フォールバック確認済み`);
  console.log('PASS: 外部アセットの実在・読み込み・発音・ミュート・フォールバック・BGMシーケンス');
} finally {
  await server.close();
}
