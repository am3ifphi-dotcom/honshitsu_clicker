#!/usr/bin/env python3
"""外部フォント（npm の @fontsource, SIL OFL 1.1）をゲーム本体に組み込むためのビルドスクリプト。

    pip install fonttools brotli
    npm install
    python3 scripts/build-fonts.py

やっていること
--------------
1. `node_modules/@fontsource/*` の OFL フォント（woff2 サブセット群）を読む。
2. リポジトリ内のソースに実在する文字だけを残し、必要なサブセットを1つに統合して
   `src/assets/fonts/{family}-{weight}.woff2` を書き出す。
   - Google Fonts へのホットリンクだと表示環境のネットワークに依存して表示が壊れるため、
     ライセンス（OFL）が許す範囲でローカル同梱している。
   - 日本語フルセットは 1 ファイル 1MB 前後 × 重み数になるため、使用文字のみに絞る
     （このゲームはテキストがすべてソース内に固定されているので、ソース走査で網羅できる）。
3. `src/assets/fonts/fonts.css`（@font-face 定義）を生成する。
4. 各フォントの OFL ライセンス原本を `src/assets/fonts/licenses/` にコピーする（OFL の再配布条件）。
5. カバーできなかった文字を `fonts.report.json` と標準出力に報告する（隠さない）。

OFL の確認事項
--------------
- 3 ファミリーとも LICENSE 冒頭に Reserved Font Name の宣言がない（標準文言の定義のみ）。
  そのためサブセット化（=Modified Version）後もファミリー名を維持し、OFL 全文を同梱する。
"""
from __future__ import annotations

import json
import shutil
from pathlib import Path

from fontTools import subset
from fontTools.merge import Merger
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
NODE = ROOT / "node_modules"
OUT = ROOT / "src" / "assets" / "fonts"
LIC = OUT / "licenses"

# 表示用 / 本文用 / ストーリー用。重みは実際に使うものだけ。
FAMILIES = [
    {"pkg": "@fontsource/dela-gothic-one", "slug": "dela-gothic-one", "family": "Dela Gothic One", "weights": [400]},
    {"pkg": "@fontsource/m-plus-rounded-1c", "slug": "m-plus-rounded-1c", "family": "M PLUS Rounded 1c", "weights": [400, 500, 700, 800]},
    {"pkg": "@fontsource/shippori-mincho", "slug": "shippori-mincho", "family": "Shippori Mincho", "weights": [600, 700]},
]

SCAN_GLOBS = ["src/**/*.ts", "src/**/*.tsx", "src/**/*.css", "index.html", "gensaku.txt"]

# ソース由来の文字に加えて必ず残すもの（数字・英字・かな・句読点・記号）
ALWAYS = "".join(
    [
        *[chr(c) for c in range(0x20, 0x7F)],  # ASCII
        *[chr(c) for c in range(0x3041, 0x30A0)],  # ひらがな
        *[chr(c) for c in range(0x30A1, 0x3100)],  # カタカナ（・ ー ゛ ゜ 含む）
        *[chr(c) for c in range(0x3000, 0x3040)],  # CJK 句読点（。、「」『』【】…）
        *[chr(c) for c in range(0xFF01, 0xFF5F)],  # 全角英数記号
        "✝✕★☆♪→←↑↓△▲▼▽○◎●◇◆□■※†‡〜～‖∞∫∑≒≠≦≧±×÷Σε",
        "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾₀₁₂₃₄₅₆₇₈₉",
        "　",
    ]
)


def collect_chars() -> set[str]:
    chars = set(ALWAYS)
    for pattern in SCAN_GLOBS:
        for path in ROOT.glob(pattern):
            if "assets/fonts" in str(path):
                continue
            try:
                chars.update(path.read_text(encoding="utf-8"))
            except (UnicodeDecodeError, OSError):
                continue
    for junk in ("\n", "\r", "\t", "\u200d", "\ufeff"):
        chars.discard(junk)
    return chars


def glyph_set(path: Path) -> set[int]:
    font = TTFont(path, lazy=True)
    try:
        return set(font.getBestCmap().keys())
    finally:
        font.close()


def main() -> None:
    chars = collect_chars()
    codepoints = {ord(c) for c in chars}
    print(f"ソースから収集した文字数: {len(chars)}")

    OUT.mkdir(parents=True, exist_ok=True)
    LIC.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*.woff2"):
        old.unlink()

    faces: list[str] = []
    report: list[dict[str, object]] = []

    for fam in FAMILIES:
        pkg_dir = NODE / fam["pkg"]
        files_dir = pkg_dir / "files"
        if not files_dir.is_dir():
            raise SystemExit(f"{fam['pkg']} が見つかりません。先に `npm install` を実行してください。")

        shutil.copy(pkg_dir / "LICENSE", LIC / f"{fam['slug']}-OFL.txt")

        for weight in fam["weights"]:
            candidates = sorted(files_dir.glob(f"{fam['slug']}-*-{weight}-normal.woff2"))
            if not candidates:
                raise SystemExit(f"{fam['slug']} の weight {weight} が見つかりません")

            used: list[Path] = []
            covered: set[int] = set()
            for path in candidates:
                glyphs = glyph_set(path)
                if glyphs & codepoints:
                    used.append(path)
                    covered |= glyphs

            merged = Merger().merge([str(p) for p in used])
            options = subset.Options()
            options.flavor = "woff2"
            options.desubroutinize = True
            options.drop_tables += ["DSIG"]
            options.layout_features = ["*"]
            subsetter = subset.Subsetter(options=options)
            subsetter.populate(unicodes=[c for c in codepoints if c in covered])
            subsetter.subset(merged)
            merged.flavor = "woff2"
            out_path = OUT / f"{fam['slug']}-{weight}.woff2"
            merged.save(out_path)

            have = glyph_set(out_path)
            missing = sorted(chr(c) for c in codepoints - have if c <= 0x2100)
            symbols = sorted(chr(c) for c in codepoints - have if c > 0x2100)

            faces.append(
                "\n".join(
                    [
                        f"/* {fam['family']} {weight} — {len(have)} glyphs, subsetted from {fam['pkg']} (SIL OFL 1.1) */",
                        "@font-face {",
                        f"  font-family: '{fam['family']}';",
                        "  font-style: normal;",
                        f"  font-weight: {weight};",
                        "  font-display: swap;",
                        f"  src: url('./{out_path.name}') format('woff2');",
                        "}",
                    ]
                )
            )
            report.append(
                {
                    "family": fam["family"],
                    "npm": fam["pkg"],
                    "weight": weight,
                    "file": out_path.name,
                    "bytes": out_path.stat().st_size,
                    "glyphs": len(have),
                    "mergedSubsets": len(used),
                    "missingText": missing,
                    "missingSymbols": symbols,
                }
            )
            flag = f"  ! 未カバー: {''.join(missing)}" if missing else ""
            print(
                f"  {fam['family']} {weight}: {len(have)}字 / {out_path.stat().st_size // 1024} KB"
                f"（{len(used)} サブセットを統合）{flag}"
            )

    header = [
        "/* 自動生成: python3 scripts/build-fonts.py — 手編集禁止 */",
        "/* 出典・ライセンス: src/assets/fonts/licenses/ と CREDITS.md（すべて SIL Open Font License 1.1） */",
    ]
    (OUT / "fonts.css").write_text("\n\n".join(header + faces) + "\n", encoding="utf-8")
    (OUT / "fonts.report.json").write_text(
        json.dumps({"charsetSize": len(chars), "faces": report}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    total = sum(p.stat().st_size for p in OUT.glob("*.woff2"))
    print(f"書き出し: {len(list(OUT.glob('*.woff2')))} ファイル / {total / 1024 / 1024:.2f} MB → src/assets/fonts/")


if __name__ == "__main__":
    main()
