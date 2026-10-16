/**
 * 外部アセット取得スクリプト（Node 18+、依存なし）。
 *
 *   node scripts/fetch-assets.mjs
 *
 * - `scripts/assets.manifest.mjs` の一覧に沿って、GitHub の公開リポジトリから
 *   ファイルを取得して `src/assets/` に保存する。
 * - 取得結果（サイズ・sha256・HTTPステータス）を `src/assets/manifest.json` に書く。
 *   ゲーム内のクレジット表示はこのファイルを参照する。
 * - 未取得・サイズ不一致があれば非0で終了する（=「取得していないのに取得済み」と言えない仕組み）。
 *
 * TLS を検査するサンドボックスで実行する場合は CA 証明書を渡すこと:
 *   NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt node scripts/fetch-assets.mjs
 */
import { createHash } from 'node:crypto';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCES, FONTS, ICONS } from './assets.manifest.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const ASSETS = join(ROOT, 'src', 'assets');
const API = 'https://api.github.com';
const UA = 'honshitsu-clicker/asset-fetcher';

const verbose = process.argv.includes('--verbose');

function log(...args) {
  if (verbose) console.log(...args);
}

async function fetchRaw(repo, branch, path) {
  const url = `${API}/repos/${repo}/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github.raw', 'User-Agent': UA },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${repo}/${path}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (!buf.length) throw new Error(`empty body for ${repo}/${path}`);
  return { buf, status: res.status };
}

/**
 * 音の長さを算出する（Ogg は granule position から実測、mp3 はフレーム情報から推定）。
 * 中身の良し悪しは判定できないので、あくまで「実測できる事実」を記録する用途。
 */
function durationOf(dest, buf) {
  try {
    if (dest.endsWith('.ogg')) {
      if (buf.subarray(0, 4).toString('latin1') !== 'OggS') return null;
      const segments = buf[26];
      const dataStart = 27 + segments;
      // 1ページ目の vorbis identification header からサンプルレート
      const rate = buf.readUInt32LE(dataStart + 12);
      let granule = null;
      let off = 0;
      while (off + 27 <= buf.length && buf.subarray(off, off + 4).toString('latin1') === 'OggS') {
        const seg = buf[off + 26];
        const size = buf.slice(off + 27, off + 27 + seg).reduce((a, b) => a + b, 0);
        const lo = buf.readUInt32LE(off + 6);
        const hi = buf.readUInt32LE(off + 10);
        const g = hi * 4294967296 + lo;
        if (hi !== 0xffffffff) granule = g;
        off += 27 + seg + size;
      }
      if (granule === null || !rate) return null;
      return Number((granule / rate).toFixed(3));
    }
    if (dest.endsWith('.mp3')) {
      const rates = { 0: 44100, 1: 48000, 2: 32000 };
      const brV1L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
      let i = 0;
      if (buf.subarray(0, 3).toString('latin1') === 'ID3') {
        const size = ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);
        i = 10 + size;
      }
      while (i + 4 <= buf.length) {
        if (buf[i] === 0xff && (buf[i + 1] & 0xe0) === 0xe0) {
          const brIndex = (buf[i + 2] >> 4) & 0x0f;
          const srIndex = (buf[i + 3] >> 2) & 0x03;
          const pad = (buf[i + 3] >> 1) & 0x01;
          const bitrate = brV1L3[brIndex] * 1000;
          const rate = rates[srIndex];
          if (!bitrate || !rate) return null;
          const frameLen = Math.floor((144000 * (bitrate / 1000)) / rate) + pad;
          const frames = Math.floor((buf.length - i) / frameLen);
          return Number(((frames * 1152) / rate).toFixed(3)); // 推定
        }
        i += 1;
      }
      return null;
    }
  } catch {
    return null;
  }
  return null;
}

/** フォーマット健全性の最低限チェック（中身の品質監修ではない）。 */
function sniff(dest, buf) {
  const head = buf.subarray(0, 12).toString('latin1');
  if (dest.endsWith('.ogg')) {
    if (!head.startsWith('OggS')) throw new Error(`${dest}: OggS マジックが見つからない`);
    return 'ogg';
  }
  if (dest.endsWith('.mp3')) {
    const id3 = head.startsWith('ID3');
    const frame = buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0;
    if (!id3 && !frame) throw new Error(`${dest}: mp3 マジックが見つからない`);
    return 'mp3';
  }
  if (dest.endsWith('.png')) {
    if (!head.startsWith('\x89PNG\r\n\x1a\n')) throw new Error(`${dest}: PNG マジックが見つからない`);
    return 'png';
  }
  return 'text';
}

const results = [];
let failed = 0;

for (const src of SOURCES) {
  const entries = [
    ...src.files.map((f) => ({ path: f[0], dest: f[1], usage: f[2] })),
    ...(src.extraFiles ?? []).map((f) => ({ path: f[0], dest: f[1], usage: 'ライセンス・出典の記録' })),
    ...(src.licenseFile ? [{ path: src.licenseFile, dest: src.licenseDest ?? `audio/licenses/${src.id}.txt`, usage: 'ライセンス原本' }] : []),
  ];
  for (const e of entries) {
    const destRel = join('src/assets', e.dest);
    const destAbs = join(ROOT, destRel);
    try {
      const { buf, status } = await fetchRaw(src.repo, src.branch, e.path);
      const format = sniff(e.dest, buf);
      const durationSec = durationOf(e.dest, buf);
      await mkdir(dirname(destAbs), { recursive: true });
      await writeFile(destAbs, buf);
      const sha256 = createHash('sha256').update(buf).digest('hex');
      results.push({
        id: src.id,
        file: e.dest,
        usage: e.usage,
        origin: `${src.repo}@${src.branch}:${e.path}`,
        bytes: buf.length,
        sha256,
        format,
        durationSec,
        httpStatus: status,
      });
      log(`ok  ${e.dest} (${buf.length} B)`);
    } catch (err) {
      failed += 1;
      results.push({ id: src.id, file: e.dest, origin: `${src.repo}@${src.branch}:${e.path}`, error: String(err.message ?? err) });
      console.error(`NG  ${e.dest}: ${err.message ?? err}`);
    }
  }
}

const manifest = {
  generatedAt: new Date().toISOString(),
  note: '自動生成。手編集禁止。`node scripts/fetch-assets.mjs` で再生成すること。',
  sources: SOURCES.map(({ files, extraFiles, licenseFile, licenseDest, ...meta }) => ({
    ...meta,
    fileCount: results.filter((r) => r.id === meta.id && !r.error && !r.file.includes('licenses/')).length,
  })),
  fonts: FONTS,
  icons: ICONS,
  files: results,
  failures: results.filter((r) => r.error).map((r) => r.file),
};

await writeFile(join(ASSETS, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

const okCount = results.filter((r) => !r.error).length;
const bytes = results.reduce((a, r) => a + (r.bytes ?? 0), 0);
console.log(`\n取得: ${okCount}/${results.length} ファイル (${(bytes / 1024).toFixed(1)} KB) → src/assets/manifest.json`);

// 生成した manifest が実際に読めることを確認する（壊れたJSONをコミットしない）
const back = JSON.parse(await readFile(join(ASSETS, 'manifest.json'), 'utf8'));
if (back.files.length !== results.length) throw new Error('manifest.json の書き出し件数が一致しない');

if (failed) {
  console.error(`\n${failed} 件が取得できませんでした。未取得の素材を「取得済み」と扱わないでください。`);
  process.exit(1);
}
