import { useMemo, useState } from 'react';
import { ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { Modal } from './ui';
import manifest from '../assets/manifest.json';
import fontsReport from '../assets/fonts/fonts.report.json';
import { SAMPLE_KEYS, audioStats } from '../utils/audio';

interface SourceMeta {
  id: string;
  kind: string;
  pack: string;
  author: string;
  license: string;
  licenseUrl: string;
  credit: string;
  repo: string;
  sourceUrl: string;
  modified?: string;
  note?: string;
  fileCount: number;
}
interface FontMeta {
  id: string;
  family: string;
  npm: string;
  version: string;
  weights: number[];
  usage: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  reservedFontName: string;
}
interface IconMeta {
  id: string;
  npm: string;
  usage: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
}
interface FileMeta {
  id: string;
  file: string;
  usage?: string;
  origin: string;
  bytes?: number;
  sha256?: string;
  format?: string;
  httpStatus?: number;
  error?: string;
}
interface ManifestShape {
  generatedAt: string;
  sources: SourceMeta[];
  fonts: FontMeta[];
  icons: IconMeta;
  files: FileMeta[];
  failures: string[];
}

const DATA = manifest as unknown as ManifestShape;
const FONT_REPORT = fontsReport as unknown as { charsetSize: number; faces: { family: string; weight: number; file: string; bytes: number; glyphs: number; missingText: string[] }[] };

const KIND_LABEL: Record<string, string> = {
  'audio-sfx': '効果音',
  'audio-jingle': 'ジングル',
  'audio-sample': 'BGM音色サンプル',
  image: '画像',
  'license-only': '出典の記録',
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2 text-xs leading-relaxed">
      <span className="w-16 shrink-0 text-slate-500">{label}</span>
      <span className="min-w-0 flex-1 text-slate-200">{children}</span>
    </div>
  );
}

function SourceCard({ src }: { src: SourceMeta }) {
  const [open, setOpen] = useState(false);
  const files = DATA.files.filter((f) => f.id === src.id && !f.error);
  const failed = DATA.files.filter((f) => f.id === src.id && f.error);
  const bytes = files.reduce((a, f) => a + (f.bytes ?? 0), 0);
  const usable = files.filter((f) => !f.file.includes('licenses/'));

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-purple-100">{src.pack}</div>
          <div className="text-[11px] text-slate-400">
            {KIND_LABEL[src.kind] ?? src.kind} ／ {usable.length} ファイル（{(bytes / 1024).toFixed(0)} KB）
          </div>
        </div>
        <span className="shrink-0 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-200">{src.license}</span>
      </div>

      <div className="mt-2 space-y-1">
        <Row label="作者">{src.author}</Row>
        <Row label="出典">
          <a className="inline-flex items-center gap-1 break-all text-sky-300 underline decoration-dotted hover:text-sky-200" href={src.sourceUrl} target="_blank" rel="noreferrer">
            {src.sourceUrl}
            <ExternalLink size={11} />
          </a>
        </Row>
        <Row label="クレジット">
          <span className="font-mono text-[11px] text-amber-100">{src.credit}</span>
        </Row>
        <Row label="加工">{src.modified ?? 'なし'}</Row>
        {src.note && <Row label="備考"><span className="text-amber-200/90">{src.note}</span></Row>}
      </div>

      {usable.length > 0 && (
        <button onClick={() => setOpen((o) => !o)} className="mt-2 flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200">
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          ファイル別の用途（{usable.length}）
        </button>
      )}
      {open && (
        <ul className="mt-1 space-y-0.5 rounded-lg bg-black/30 p-2">
          {usable.map((f) => (
            <li key={f.file} className="flex flex-wrap gap-x-2 text-[10px] leading-relaxed">
              <span className="font-mono text-slate-400">{f.file.split('/').pop()}</span>
              <span className="text-slate-200">{f.usage ?? '—'}</span>
              <span className="text-slate-500">{((f.bytes ?? 0) / 1024).toFixed(1)}KB</span>
            </li>
          ))}
        </ul>
      )}
      {failed.length > 0 && (
        <div className="mt-2 rounded bg-rose-500/20 px-2 py-1 text-[11px] text-rose-200">
          取得失敗: {failed.map((f) => f.file).join(', ')}
        </div>
      )}
    </div>
  );
}

export default function CreditsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const stats = useMemo(() => audioStats(), [open]);
  const sources = DATA.sources.filter((s) => s.kind !== 'license-only');
  const licenseOnly = DATA.sources.filter((s) => s.kind === 'license-only');

  return (
    <Modal open={open} onClose={onClose} wide title="使用素材・クレジット">
      <p className="text-xs leading-relaxed text-slate-300">
        このゲームのフォント・効果音・ジングル・BGM音色・パーティクル画像は外部のフリー素材を利用しています。
        ライセンス原本は <span className="font-mono">src/assets/fonts/licenses/</span> と <span className="font-mono">src/assets/audio/licenses/</span> に同梱し、
        取得記録（サイズ・sha256・取得元パス）は <span className="font-mono">src/assets/manifest.json</span> に保存しています。
      </p>
      <p className="mt-1 text-[11px] text-slate-400">
        利用目的: 非商用（指定なしのため非商用扱い）。再配布が必要なライセンス（OFL の原文同梱、CC BY のクレジット表記）は条件を満たしています。
      </p>

      <h4 className="mt-4 mb-2 font-display text-sm text-purple-200">■ フォント（SIL Open Font License 1.1）</h4>
      <div className="space-y-2">
        {DATA.fonts.map((f) => {
          const faces = FONT_REPORT.faces.filter((x) => x.family === f.family);
          return (
            <div key={f.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-bold text-purple-100">{f.family}</div>
                <span className="shrink-0 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-200">OFL-1.1</span>
              </div>
              <div className="mt-2 space-y-1">
                <Row label="用途">{f.usage}（weight {f.weights.join(' / ')}）</Row>
                <Row label="作者">{f.author}</Row>
                <Row label="取得元">
                  <a className="inline-flex items-center gap-1 break-all text-sky-300 underline decoration-dotted" href={f.sourceUrl} target="_blank" rel="noreferrer">
                    {f.npm}@{f.version}（npm）
                    <ExternalLink size={11} />
                  </a>
                </Row>
                <Row label="加工">
                  使用文字のみ残すサブセット化を実施（{faces.map((x) => `${x.weight}:${x.glyphs}字/${(x.bytes / 1024).toFixed(0)}KB`).join('、')}）。
                  Reserved Font Name の宣言がないことを LICENSE で確認済み。OFL 全文を同梱。
                </Row>
                <Row label="クレジット">
                  <span className="font-mono text-[11px] text-amber-100">
                    {f.family} © {f.author} — Licensed under the SIL Open Font License 1.1
                  </span>
                </Row>
              </div>
            </div>
          );
        })}
      </div>

      <h4 className="mt-4 mb-2 font-display text-sm text-purple-200">■ 音声・画像</h4>
      <div className="space-y-2">
        {sources.map((s) => (
          <SourceCard key={s.id} src={s} />
        ))}
      </div>

      <h4 className="mt-4 mb-2 font-display text-sm text-purple-200">■ アイコン</h4>
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm font-bold text-purple-100">Lucide（{DATA.icons.npm}）</div>
          <span className="shrink-0 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-200">ISC</span>
        </div>
        <div className="mt-2 space-y-1">
          <Row label="用途">{DATA.icons.usage}</Row>
          <Row label="作者">{DATA.icons.author}</Row>
          <Row label="出典">
            <a className="inline-flex items-center gap-1 break-all text-sky-300 underline decoration-dotted" href={DATA.icons.sourceUrl} target="_blank" rel="noreferrer">
              {DATA.icons.sourceUrl}
              <ExternalLink size={11} />
            </a>
          </Row>
          <Row label="クレジット">
            <span className="font-mono text-[11px] text-amber-100">Icons by Lucide Contributors — ISC License</span>
          </Row>
        </div>
      </div>

      <h4 className="mt-4 mb-2 font-display text-sm text-purple-200">■ 自作した素材とその理由</h4>
      <ul className="list-inside list-disc space-y-1 text-xs leading-relaxed text-slate-300">
        <li>
          <b>BGM の作曲・編曲・シーケンス</b>（Aマイナー / 72BPM / 8小節ループ）。
          到達できる範囲に「ライセンスを確認できて、かつ品質を試聴で確かめられる」ループ音源が無かったため、
          音色だけ外部サンプル（FluidR3 GM / CC BY 3.0）を使い、曲は自作した。差し替える場合は <span className="font-mono">src/utils/bgm.ts</span> の
          <span className="font-mono"> EVENTS / PROGRESSION</span> と <span className="font-mono">src/assets/audio/notes/</span> を入れ替える。
        </li>
        <li>
          <b>WebAudio 合成のフォールバック音</b>（<span className="font-mono">src/utils/synth.ts</span>）。
          外部サンプルが読み込めなかったときも音が鳴るようにするための保険。
        </li>
        <li>キャラクター立ち絵・進化カットシーンの SVG 演出・UI レイアウト（既存の自作アセット）。</li>
      </ul>

      <h4 className="mt-4 mb-2 font-display text-sm text-purple-200">■ 確認できていないこと・制約</h4>
      <ul className="list-inside list-disc space-y-1 text-xs leading-relaxed text-slate-300">
        <li>
          <b>音の中身は試聴していない。</b>この環境には音声再生が無いため、ジングル・効果音の選定は
          ファイル形式の妥当性（OggS/mp3 マジック）・長さ・ピーク/RMS の計測値と用途の相性で行った。
          実際の聞こえ方の監修は未実施（要差し替え判断）。
        </li>
        <li>
          Kenney 素材の取得元は GitHub 上のミラー（{licenseOnly.map((s) => s.repo).join(', ')}）。
          ミラー自体の再配布条件は各パックの License.txt（CC0）に従う。作者サイトの個別ページURLは未検証のため記載していない。
        </li>
        <li>
          フォントのカバー範囲: ソースに実在する文字 {FONT_REPORT.charsetSize} 字を含む {FONT_REPORT.faces[0]?.glyphs ?? 0} 字を収録。
          {FONT_REPORT.faces.some((f) => f.missingText.length > 0) && (
            <>
              一部の装飾記号（{[...new Set(FONT_REPORT.faces.flatMap((f) => f.missingText))].join(' ')}）はフォント側に存在しないためシステムのフォールバック表示になる。
            </>
          )}
        </li>
        <li>読み込み状況: サンプル {SAMPLE_KEYS.length} 件中 {stats.decoded} 件デコード済み／失敗 {stats.failed.length} 件（AudioContext: {stats.contextState}）。</li>
      </ul>

      <p className="mt-4 text-[11px] text-slate-500">
        素材の取得記録: {DATA.generatedAt} ／ 取得失敗 {DATA.failures.length} 件 ／ 詳細はリポジトリの CREDITS.md
      </p>
    </Modal>
  );
}
