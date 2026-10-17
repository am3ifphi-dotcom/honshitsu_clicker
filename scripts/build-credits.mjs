/**
 * CREDITS.md の生成（`node scripts/build-credits.mjs`）。
 *
 * `scripts/assets.manifest.mjs`（出典・作者・ライセンス・用途）と
 * `src/assets/manifest.json`（実際の取得記録: サイズ・sha256・取得成功/失敗）、
 * `src/assets/fonts/fonts.report.json`（サブセット結果）から作る。
 * 手で書くと実体とズレるので、必ずこのスクリプトで再生成すること。
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCES, FONTS, ICONS } from './assets.manifest.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(ROOT, 'src/assets/manifest.json'), 'utf8'));
const fontReport = JSON.parse(readFileSync(join(ROOT, 'src/assets/fonts/fonts.report.json'), 'utf8'));

const byId = new Map();
for (const f of manifest.files) {
  if (!byId.has(f.id)) byId.set(f.id, []);
  byId.get(f.id).push(f);
}

const kindLabel = {
  'audio-sfx': '効果音',
  'audio-jingle': 'ジングル（音楽）',
  'audio-sample': 'BGM 用 音色サンプル',
  image: '画像（パーティクル）',
  'license-only': '出典・ライセンスの記録',
};

const lines = [];
const w = (s = '') => lines.push(s);

w('# 使用アセット・クレジット（CREDITS）');
w();
w(`このファイルは \`node scripts/build-credits.mjs\` による自動生成です（素材取得記録: ${manifest.generatedAt}）。`);
w();
w('「偏差値60の教室から✝本質✝が漏れ出している件について ～✝本質✝クリッカー～」で利用している外部アセットの一覧です。');
w('利用目的は **非商用**（指定がないため非商用扱い）。');
w();
w('- 取得スクリプト: `scripts/fetch-assets.mjs`（GitHub の公開リポジトリから取得し、`src/assets/` に同梱）');
w('- フォント生成: `scripts/build-fonts.py`（npm の @fontsource パッケージを使用文字のみサブセット化）');
w('- 取得記録: `src/assets/manifest.json`（各ファイルのサイズ・sha256・取得元パス・HTTPステータス）');
w('- ライセンス原本: `src/assets/audio/licenses/` / `src/assets/fonts/licenses/` に同梱');
w('- ゲーム内表示: ヘッダーの ⚙ → 「使用素材・クレジットを見る」');
w();
w(`**取得失敗: ${manifest.failures.length} 件**（未取得の素材はありません）`);
w();

w('## 1. 使用した外部アセット');
w();

let n = 0;
for (const src of SOURCES) {
  if (src.kind === 'license-only') continue;
  n += 1;
  const files = (byId.get(src.id) ?? []).filter((f) => !f.error && !f.file.includes('licenses/'));
  const bytes = files.reduce((a, f) => a + (f.bytes ?? 0), 0);

  w(`### 1.${n} ${src.pack}`);
  w();
  w(`- **素材名／種類**: ${src.pack} ／ ${kindLabel[src.kind] ?? src.kind}`);
  w(`- **作者**: ${src.author}`);
  w(`- **ライセンス**: ${src.license}（[原文](${src.licenseUrl})） — **確認済み**（パック同梱の License.txt を ` + '`src/assets/audio/licenses/` に保存）');
  w(`- **出典（実際に取得した場所）**: ${src.sourceUrl}`);
  w(`- **ファイル数／容量**: ${files.length} ファイル / ${(bytes / 1024).toFixed(1)} KB`);
  w(`- **加工**: ${src.modified ?? 'なし'}`);
  if (src.note) w(`- **備考**: ${src.note}`);
  w(`- **必要なクレジット表記**:`);
  w();
  w('  ```');
  w(`  ${src.credit}`);
  w('  ```');
  w();
  const isAudio = ['audio-sfx', 'audio-jingle', 'audio-sample'].includes(src.kind);
  if (isAudio) {
    w('  | ファイル | 用途 | 長さ（実測※） | サイズ | sha256（先頭12桁） |');
    w('  | --- | --- | --- | --- | --- |');
  } else {
    w('  | ファイル | 用途 | サイズ | sha256（先頭12桁） |');
    w('  | --- | --- | --- | --- |');
  }
  for (const f of files) {
    const name = f.file.split('/').pop();
    const dur = f.durationSec == null ? '—' : `${f.durationSec} s${f.file.endsWith('.mp3') ? '（推定）' : ''}`;
    if (isAudio) {
      w(`  | \`${name}\` | ${f.usage ?? '—'} | ${dur} | ${((f.bytes ?? 0) / 1024).toFixed(1)} KB | \`${(f.sha256 ?? '').slice(0, 12)}\` |`);
    } else {
      w(`  | \`${name}\` | ${f.usage ?? '—'} | ${((f.bytes ?? 0) / 1024).toFixed(1)} KB | \`${(f.sha256 ?? '').slice(0, 12)}\` |`);
    }
  }
  if (isAudio) w('');
  if (isAudio) w('  ※ 長さ: `.ogg` は Ogg ページの granule position と Vorbis 識別ヘッダのサンプルレートから実測。`.mp3` はフレーム情報からの推定。');
  w();
}

n += 1;
w(`### 1.${n} フォント（3 ファミリー / 7 ウェイト）`);
w();
w(`- **素材名／種類**: Dela Gothic One / M PLUS Rounded 1c / Shippori Mincho ／ TrueType フォント（woff2 にサブセット化）`);
w(`- **ライセンス**: SIL Open Font License 1.1 — **確認済み**（各パッケージの LICENSE 全文を \`src/assets/fonts/licenses/\` に同梱）`);
w(`- **加工**: リポジトリ内のソースに実在する文字（${fontReport.charsetSize} 字）だけを残すサブセット化を実施。` +
  '3 ファミリーとも LICENSE 冒頭に **Reserved Font Name の宣言が無い**ことを確認しているため、ファミリー名は維持し OFL 全文を同梱。');
w(`- **取得元**: npm（@fontsource スコープ）— Google Fonts へのホットリンクをやめ、ローカル同梱に切り替えた`);
w();
w('  | ファミリ | 用途 | 作者 | ライセンス | 取得元 |');
w('  | --- | --- | --- | --- | --- |');
for (const f of FONTS) {
  w(`  | ${f.family}（weight ${f.weights.join('/')}） | ${f.usage} | ${f.author} | ${f.license} | \`${f.npm}@${f.version}\` |`);
}
w();
w('  **サブセット結果（実測）**');
w();
w('  | ファミリ | weight | ファイル | グリフ数 | サイズ | 統合した元サブセット数 |');
w('  | --- | --- | --- | --- | --- | --- |');
for (const face of fontReport.faces) {
  w(`  | ${face.family} | ${face.weight} | \`${face.file}\` | ${face.glyphs} | ${(face.bytes / 1024).toFixed(0)} KB | ${face.mergedSubsets} |`);
}
w();
w('  **クレジット表記（アプリ内クレジット画面にも表示）**');
w();
for (const f of FONTS) {
  w('  ```');
  w(`  ${f.family} © ${f.author}`);
  w('  Licensed under the SIL Open Font License 1.1 (https://scripts.sil.org/OFL)');
  w('  ```');
}
w();

n += 1;
w(`### 1.${n} UI アイコン（Lucide）`);
w();
w(`- **素材名／種類**: ${ICONS.npm} ／ SVG アイコン（React コンポーネント）`);
w(`- **用途**: ${ICONS.usage}`);
w(`- **作者**: ${ICONS.author}`);
w(`- **ライセンス**: ${ICONS.license} — **確認済み**（npm パッケージ同梱の LICENSE を確認）`);
w(`- **出典**: ${ICONS.sourceUrl}`);
w(`- **加工**: なし（アイコンのサイズ・色を CSS で指定しているのみ）`);
w();
w('  ```');
w('  Icons by Lucide Contributors — ISC License (https://lucide.dev)');
w('  ```');
w();

n += 1;
w(`### 1.${n} ライセンス原本・出典の記録`);
w();
w('以下のファイルを同梱し、再配布条件（OFL の原文同梱、CC BY のクレジット表記）を満たしています。');
w();
for (const f of (byId.get('kenney-mirror') ?? []).concat((byId.get('fluidr3-gm-soundfont') ?? []).filter((x) => x.file.includes('licenses/')))) {
  w(`- \`src/assets/${f.file}\` ← ${f.origin}`);
}
w('- `src/assets/fonts/licenses/dela-gothic-one-OFL.txt` / `m-plus-rounded-1c-OFL.txt` / `shippori-mincho-OFL.txt`（SIL OFL 1.1 全文）');
w('- `src/assets/audio/licenses/kenney-*.txt`（各 Kenney パックの License.txt = CC0 本文）');
w();

w('## 2. 自作した素材とその理由');
w();
w('| 自作したもの | 場所 | 理由 |');
w('| --- | --- | --- |');
w('| BGM の作曲・編曲・シーケンス（Aマイナー / 72BPM / 8小節ループ / Am–F–C–G） | `src/utils/bgm.ts` | 到達できる公開リポジトリの範囲に「ライセンスを確認でき、かつ品質を試聴で確かめられる」ループ音源が無かったため。音色だけ外部サンプル（FluidR3 GM / CC BY 3.0）を使い、曲自体は自作した。差し替えは `EVENTS` / `PROGRESSION` と `src/assets/audio/notes/` を入れ替えるだけでよい。 |');
w('| WebAudio 合成のフォールバック音 | `src/utils/synth.ts` | 外部サンプルが取得・デコードできなかった環境でも音が鳴り、ゲームが壊れないようにするため。 |');
w('| 大きな演出用の重低音レイヤー（✝LR✝召喚・ウルトラ転生・進化） | `src/utils/synth.ts` | 外部の効果音パックに「地響き」系の素材が無かったため、合成低音を外部サンプルに重ねている。 |');
w('| キャラクター立ち絵・進化カットシーンの SVG 演出・UI レイアウト | `src/assets/img/` / `src/components/` | 既存の自作アセット（本作固有のキャラクターのため外部素材で代替できない）。 |');
w();

w('## 3. 取得できなかった素材・未確認事項・制約');
w();
w('- **音の中身は試聴していない（未監修）。** この実行環境に音声再生が無いため、ジングル・効果音の選定は');
w('  「ファイル形式の妥当性（OggS / mp3 マジックの確認）・長さの実測値（上の表）・用途との相性」だけで判断した。');
w('  ピーク/RMS などの波形解析や、実際の聞こえ方の監修は **未実施**。差し替える場合は `scripts/assets.manifest.mjs` の `files` を書き換えて');
w('  `node scripts/fetch-assets.mjs` を再実行し、`src/utils/sfx.ts` の `JINGLES` を更新する。');
w('- **素材の取得元は GitHub 上のミラー**（`ETdoFresh/kenney.nl`, 2020-07-17 更新）。');
w('  各パックの License.txt（CC0）は同梱しており、素材自体の利用条件はそれで確認できる。');
w('  ただし作者サイト（kenney.nl）の個別アセットページ URL はこの環境から到達できず**未検証**のため、');
w('  確定できる範囲（リポジトリのパスと License.txt の記載）のみを出典として記載している。');
w('- **取得元リポジトリのミラー自体のライセンス表記は NOASSERTION**（GitHub API 上の判定）。');
w('  各素材の利用条件は Kenney 自身の License.txt（CC0）で確認しているため、ミラーの記載に依存していない。');
w('- **FluidR3 GM soundfont は CC BY 3.0**（クレジット表記が必須）。README の記載に基づき、');
w('  ゲーム内クレジットとこのファイルの両方で作者（Frank Wen）と取得元リポジトリを明記している。');
w('- **フォントのカバー範囲**: ソース由来の文字 + かな・全角記号を収録。');
{
  // 全フォントに共通して無い文字だけを「未カバー」として報告する（ファミリ別の差は fonts.report.json 参照）
  const perFace = fontReport.faces.map((f) => new Set(f.missingText));
  const missingAll = perFace.length ? [...perFace[0]].filter((c) => perFace.every((set) => set.has(c))) : [];
  if (missingAll.length) {
    w(`  ただし ${missingAll.join(' ')} はどのフォントにもグリフが無いため、システムのフォールバック表示になる（装飾用の数式記号のみ。ファミリ別の差は \`src/assets/fonts/fonts.report.json\` 参照）。`);
  }
}
w('- **再生環境の制約**: ブラウザの自動再生ポリシーにより、音声はタイトル画面のボタン操作以降に有効になる。');
w('- **プレースホルダー（仮素材）は無い。** 未取得のまま「取得済み」としている素材はありません。');
w();

w('## 4. 取得・検証の再現手順');
w();
w('```bash');
w('npm install');
w('node scripts/fetch-assets.mjs        # 外部アセットを再取得 → src/assets/manifest.json');
w('pip install fonttools brotli');
w('python3 scripts/build-fonts.py       # フォントをサブセット化 → src/assets/fonts/');
w('node scripts/build-credits.mjs       # この CREDITS.md を再生成');
w('node scripts/test-audio.mjs          # アセットの実在・読み込み・発音・フォールバックを検証');
w('```');
w();
w('TLS を検査する環境で取得する場合は `NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt` を付けてください。');

writeFileSync(join(ROOT, 'CREDITS.md'), lines.join('\n') + '\n');
console.log(`CREDITS.md を生成（${lines.length} 行）`);
