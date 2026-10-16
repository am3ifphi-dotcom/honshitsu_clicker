# 使用アセット・クレジット（CREDITS）

このファイルは `node scripts/build-credits.mjs` による自動生成です（素材取得記録: 2026-10-16T17:14:27.334Z）。

「偏差値60の教室から✝本質✝が漏れ出している件について ～✝本質✝クリッカー～」で利用している外部アセットの一覧です。
利用目的は **非商用**（指定がないため非商用扱い）。

- 取得スクリプト: `scripts/fetch-assets.mjs`（GitHub の公開リポジトリから取得し、`src/assets/` に同梱）
- フォント生成: `scripts/build-fonts.py`（npm の @fontsource パッケージを使用文字のみサブセット化）
- 取得記録: `src/assets/manifest.json`（各ファイルのサイズ・sha256・取得元パス・HTTPステータス）
- ライセンス原本: `src/assets/audio/licenses/` / `src/assets/fonts/licenses/` に同梱
- ゲーム内表示: ヘッダーの ⚙ → 「使用素材・クレジットを見る」

**取得失敗: 0 件**（未取得の素材はありません）

## 1. 使用した外部アセット

### 1.1 Interface Sounds (1.0)

- **素材名／種類**: Interface Sounds (1.0) ／ 効果音
- **作者**: Kenney (www.kenney.nl)
- **ライセンス**: CC0 1.0 Universal（[原文](https://creativecommons.org/publicdomain/zero/1.0/)） — **確認済み**（パック同梱の License.txt を `src/assets/audio/licenses/` に保存）
- **出典（実際に取得した場所）**: https://github.com/ETdoFresh/kenney.nl/tree/master/kenney_interfacesounds
- **ファイル数／容量**: 17 ファイル / 140.4 KB
- **加工**: なし（無加工・ファイル名のみ用途別に保持）
- **必要なクレジット表記**:

  ```
  Interface Sounds 1.0 by Kenney (www.kenney.nl) — CC0 1.0
  ```

  | ファイル | 用途 | 長さ（実測※） | サイズ | sha256（先頭12桁） |
  | --- | --- | --- | --- | --- |
  | `click_002.ogg` | ✝タップ（通常クリック。impactSoft と重ねて使用） | 0.01 s | 4.2 KB | `adcd1f4adc35` |
  | `click_004.ogg` | UIクリック（汎用ボタン） | 0.01 s | 4.4 KB | `09e2c1b643b7` |
  | `select_004.ogg` | 召喚マシン（ガチャプール）の切り替え | 0.383 s | 6.7 KB | `eb6cb435f3f2` |
  | `confirmation_001.ogg` | ストーリー進行の決定・SSR召喚の成功 | 0.29 s | 8.8 KB | `063564703b60` |
  | `error_004.ogg` | 編成不足・転生できない等のエラー | 0.103 s | 6.2 KB | `0b574cea597d` |
  | `pluck_002.ogg` | ✝クリティカル✝（まじ✝本質✝） | 0.165 s | 6.8 KB | `c977fe249ff4` |
  | `drop_003.ogg` | アイテム取得・グループLINEの新着通知 | 0.191 s | 6.1 KB | `43d086d50f90` |
  | `glass_004.ogg` | ✝本質結晶✝の獲得・SSR召喚のきらめき | 0.692 s | 8.1 KB | `2379b58f953e` |
  | `open_003.ogg` | モーダルを開く | 0.314 s | 14.7 KB | `bcdca6b5c9c3` |
  | `close_002.ogg` | モーダルを閉じる | 0.314 s | 14.4 KB | `bc4279d2bb2b` |
  | `maximize_004.ogg` | 部員のレベルアップ | 0.418 s | 17.3 KB | `59c7a24b204b` |
  | `glitch_003.ogg` | ✝LR✝系のグリッチ演出 | 0.01 s | 4.8 KB | `d55e0c64aee9` |
  | `switch_003.ogg` | タブ切り替え | 0.5 s | 9.4 KB | `ca12dd32103f` |
  | `tick_002.ogg` | ボタンへのホバー（rollover2 と重ねて使用） | 0.023 s | 4.4 KB | `869442f54214` |
  | `toggle_002.ogg` | 設定のON/OFF | 0.139 s | 7.9 KB | `1f564f5520cf` |
  | `question_002.ogg` | 遊べる章が増えたときのお知らせ | 0.333 s | 9.2 KB | `46056f10c70d` |
  | `back_002.ogg` | ストーリーのスキップ／戻る操作 | 0.07 s | 6.9 KB | `61581c58194e` |

  ※ 長さ: `.ogg` は Ogg ページの granule position と Vorbis 識別ヘッダのサンプルレートから実測。`.mp3` はフレーム情報からの推定。

### 1.2 Impact Sounds (1.0)

- **素材名／種類**: Impact Sounds (1.0) ／ 効果音
- **作者**: Kenney (www.kenney.nl)
- **ライセンス**: CC0 1.0 Universal（[原文](https://creativecommons.org/publicdomain/zero/1.0/)） — **確認済み**（パック同梱の License.txt を `src/assets/audio/licenses/` に保存）
- **出典（実際に取得した場所）**: https://github.com/ETdoFresh/kenney.nl/tree/master/kenney_impactsounds
- **ファイル数／容量**: 9 ファイル / 83.6 KB
- **加工**: なし（無加工）
- **必要なクレジット表記**:

  ```
  Impact Sounds 1.0 by Kenney (www.kenney.nl) — CC0 1.0
  ```

  | ファイル | 用途 | 長さ（実測※） | サイズ | sha256（先頭12桁） |
  | --- | --- | --- | --- | --- |
  | `impactBell_heavy_000.ogg` | 覚醒・進化・ウルトラ転生の鐘 | 1.48 s | 13.6 KB | `94b8bb5f2d43` |
  | `impactPunch_heavy_000.ogg` | 対抗戦：BOSSへの打撃・ウルトラ転生の衝撃 | 0.649 s | 11.3 KB | `b33a8f14068a` |
  | `impactPunch_medium_002.ogg` | 対抗戦：敵への通常打撃 | 0.541 s | 10.2 KB | `6492f9ccbc8d` |
  | `impactMetal_heavy_000.ogg` | 召喚（ガチャ）レバー | 0.168 s | 6.0 KB | `e07045693e4a` |
  | `impactPlate_medium_001.ogg` | コーンスープ缶が落ちる音 | 0.616 s | 11.2 KB | `68ba7701b71e` |
  | `impactSoft_medium_000.ogg` | ✝タップの打感（click_002 と重ねる）／早退 | 0.118 s | 5.2 KB | `7d3ba0bb5e60` |
  | `impactWood_medium_000.ogg` | 対抗戦：味方が受ける打撃 | 0.333 s | 6.4 KB | `1723a9fd2510` |
  | `impactMining_002.ogg` | ウルトラ転生（超越）の衝撃 | 0.805 s | 11.0 KB | `059558ec7511` |
  | `impactGlass_heavy_001.ogg` | ✝クリティカル✝・✝本質結晶✝の獲得 | 0.429 s | 8.7 KB | `58686e0e5626` |

  ※ 長さ: `.ogg` は Ogg ページの granule position と Vorbis 識別ヘッダのサンプルレートから実測。`.mp3` はフレーム情報からの推定。

### 1.3 RPG Audio

- **素材名／種類**: RPG Audio ／ 効果音
- **作者**: Kenney Vleugels (Kenney.nl)
- **ライセンス**: CC0 1.0 Universal（[原文](https://creativecommons.org/publicdomain/zero/1.0/)） — **確認済み**（パック同梱の License.txt を `src/assets/audio/licenses/` に保存）
- **出典（実際に取得した場所）**: https://github.com/ETdoFresh/kenney.nl/tree/master/kenney_rpgaudio
- **ファイル数／容量**: 6 ファイル / 92.4 KB
- **加工**: なし（無加工）
- **必要なクレジット表記**:

  ```
  RPG Audio by Kenney (www.kenney.nl) — CC0 1.0
  ```

  | ファイル | 用途 | 長さ（実測※） | サイズ | sha256（先頭12桁） |
  | --- | --- | --- | --- | --- |
  | `handleCoins.ogg` | ショップ購入・100連召喚の清算 | 0.846 s | 24.8 KB | `8a91f969e932` |
  | `bookOpen.ogg` | ストーリー開始 | 0.154 s | 8.1 KB | `953390534377` |
  | `bookFlip2.ogg` | ストーリーのページ送り | 0.43 s | 12.1 KB | `3409042acbfa` |
  | `doorOpen_1.ogg` | タイトル→教室に入る | 0.919 s | 22.3 KB | `4ab93bab9652` |
  | `metalLatch.ogg` | 装備の付け外し | 0.261 s | 10.0 KB | `ba9ba60b172b` |
  | `knifeSlice.ogg` | 対抗戦：クリティカル | 0.6 s | 15.2 KB | `4cd96dc630be` |

  ※ 長さ: `.ogg` は Ogg ページの granule position と Vorbis 識別ヘッダのサンプルレートから実測。`.mp3` はフレーム情報からの推定。

### 1.4 UI Audio（UI SFX Set）

- **素材名／種類**: UI Audio（UI SFX Set） ／ 効果音
- **作者**: Kenney Vleugels (Kenney.nl)
- **ライセンス**: CC0 1.0 Universal（[原文](https://creativecommons.org/publicdomain/zero/1.0/)） — **確認済み**（パック同梱の License.txt を `src/assets/audio/licenses/` に保存）
- **出典（実際に取得した場所）**: https://github.com/ETdoFresh/kenney.nl/tree/master/kenney_uiaudio
- **ファイル数／容量**: 2 ファイル / 9.0 KB
- **加工**: なし（無加工）
- **必要なクレジット表記**:

  ```
  UI Audio by Kenney (www.kenney.nl) — CC0 1.0
  ```

  | ファイル | 用途 | 長さ（実測※） | サイズ | sha256（先頭12桁） |
  | --- | --- | --- | --- | --- |
  | `rollover2.ogg` | ボタンへのホバー（PCのみ・60ms間引き） | 0.057 s | 4.6 KB | `d0bc0fcba496` |
  | `switch13.ogg` | 召喚マシンのスイッチ音 | 0.028 s | 4.4 KB | `54d1e63b9072` |

  ※ 長さ: `.ogg` は Ogg ページの granule position と Vorbis 識別ヘッダのサンプルレートから実測。`.mp3` はフレーム情報からの推定。

### 1.5 Music Jingles

- **素材名／種類**: Music Jingles ／ ジングル（音楽）
- **作者**: Kenney Vleugels (Kenney.nl)
- **ライセンス**: CC0 1.0 Universal（[原文](https://creativecommons.org/publicdomain/zero/1.0/)） — **確認済み**（パック同梱の License.txt を `src/assets/audio/licenses/` に保存）
- **出典（実際に取得した場所）**: https://github.com/ETdoFresh/kenney.nl/tree/master/kenney_musicjingles
- **ファイル数／容量**: 7 ファイル / 137.6 KB
- **加工**: なし（無加工。使用箇所のみ選定）
- **備考**: 音の選定は本環境で試聴できないため、波形の長さ・ピーク・RMSの計測値と用途の相性で判断した（試聴による監修は未実施）。
- **必要なクレジット表記**:

  ```
  Music Jingles by Kenney (www.kenney.nl) — CC0 1.0
  ```

  | ファイル | 用途 | 長さ（実測※） | サイズ | sha256（先頭12桁） |
  | --- | --- | --- | --- | --- |
  | `jingles_NES05.ogg` | 実績解除のジングル | 0.906 s | 20.9 KB | `f488e856ca7e` |
  | `jingles_HIT11.ogg` | ✝UR✝/✝LR✝召喚のファンファーレ | 0.959 s | 17.5 KB | `40d6f3fb9222` |
  | `jingles_HIT03.ogg` | 対抗戦：勝利 | 0.746 s | 13.6 KB | `889d4c2b76c7` |
  | `jingles_SAX13.ogg` | 対抗戦：敗北 | 0.781 s | 15.3 KB | `9a7d20a4e7d3` |
  | `jingles_PIZZI07.ogg` | 出席カード（ログインボーナス） | 1.324 s | 18.7 KB | `91870588924e` |
  | `jingles_SAX07.ogg` | 卒業（転生） | 1.74 s | 30.2 KB | `241c8570fbde` |
  | `jingles_STEEL02.ogg` | 進化カットシーンの締め | 1.387 s | 21.4 KB | `891c2b48d358` |

  ※ 長さ: `.ogg` は Ogg ページの granule position と Vorbis 識別ヘッダのサンプルレートから実測。`.mp3` はフレーム情報からの推定。

### 1.6 Particle Pack (1.1)

- **素材名／種類**: Particle Pack (1.1) ／ 画像（パーティクル）
- **作者**: Kenney Vleugels (Kenney.nl)／フィルタテンプレート: Indigo Ray, Craig Nisbet, Zoltan Erdokovy, Heliagon, ThreeDee, Killst4r, Tim2501
- **ライセンス**: CC0 1.0 Universal（[原文](https://creativecommons.org/publicdomain/zero/1.0/)） — **確認済み**（パック同梱の License.txt を `src/assets/audio/licenses/` に保存）
- **出典（実際に取得した場所）**: https://github.com/ETdoFresh/kenney.nl/tree/master/particlePack_1.1
- **ファイル数／容量**: 6 ファイル / 408.1 KB
- **加工**: なし（透過PNGをそのまま使用。CSSの filter / blend-mode で色調を全体に合わせている）
- **必要なクレジット表記**:

  ```
  Particle Pack 1.1 by Kenney (www.kenney.nl) — CC0 1.0
  ```

  | ファイル | 用途 | サイズ | sha256（先頭12桁） |
  | --- | --- | --- | --- |
  | `star_01.png` | ✝タップ時のきらめき | 41.1 KB | `3ba3999c944a` |
  | `star_05.png` | ✝タップ時のきらめき（大） | 60.8 KB | `1e8ab968178e` |
  | `spark_01.png` | クリティカルのスパーク | 92.8 KB | `5902da3a324c` |
  | `magic_01.png` | ✝本質✝オーラ・召喚演出 | 79.8 KB | `398479ea280c` |
  | `light_01.png` | 進化・覚醒の光 | 91.3 KB | `caedcc5df5bc` |
  | `circle_02.png` | リップル（波紋） | 42.4 KB | `8a2112a6a561` |

### 1.7 FluidR3 GM soundfont（midi-js-soundfonts でmp3化したもの）

- **素材名／種類**: FluidR3 GM soundfont（midi-js-soundfonts でmp3化したもの） ／ BGM 用 音色サンプル
- **作者**: Frank Wen（FluidR3 GM）／mp3化: Benjamin Gleitzman（gleitz/midi-js-soundfonts）
- **ライセンス**: CC BY 3.0（サウンドフォント本体）／リポジトリは MIT（[原文](https://creativecommons.org/licenses/by/3.0/us/)） — **確認済み**（パック同梱の License.txt を `src/assets/audio/licenses/` に保存）
- **出典（実際に取得した場所）**: https://github.com/gleitz/midi-js-soundfonts/tree/gh-pages/FluidR3_GM
- **ファイル数／容量**: 17 ファイル / 289.0 KB
- **加工**: 単音サンプルをそのまま使用。ピッチ・音量・エンベロープはコード側で調整（ファイル自体は無加工）。作曲・編曲は自作。
- **必要なクレジット表記**:

  ```
  BGMの音色サンプル: FluidR3 GM soundfont by Frank Wen — CC BY 3.0（https://github.com/gleitz/midi-js-soundfonts 経由で取得、リポジトリは MIT）
  ```

  | ファイル | 用途 | 長さ（実測※） | サイズ | sha256（先頭12桁） |
  | --- | --- | --- | --- | --- |
  | `ep1_A2.mp3` | BGM：エレクトリックピアノ A2 | 1.272 s（推定） | 20.2 KB | `6909423acd14` |
  | `ep1_B2.mp3` | BGM：エレクトリックピアノ B2 | 1.248 s（推定） | 19.7 KB | `eed0dc528afe` |
  | `ep1_C3.mp3` | BGM：エレクトリックピアノ C3 | 1.272 s（推定） | 20.0 KB | `3173362ab63b` |
  | `ep1_D3.mp3` | BGM：エレクトリックピアノ D3 | 1.272 s（推定） | 19.9 KB | `86482b62afb3` |
  | `ep1_E3.mp3` | BGM：エレクトリックピアノ E3 | 1.248 s（推定） | 19.8 KB | `b45782ad1a89` |
  | `ep1_F2.mp3` | BGM：エレクトリックピアノ F2 | 1.296 s（推定） | 20.6 KB | `26c7f2268ac8` |
  | `ep1_G2.mp3` | BGM：エレクトリックピアノ G2 | 1.272 s（推定） | 20.2 KB | `06d0c21da5d4` |
  | `bass_A1.mp3` | BGM：ベース A1 | 0.888 s（推定） | 14.0 KB | `6e9d3dee6b42` |
  | `bass_C2.mp3` | BGM：ベース C2 | 0.864 s（推定） | 13.8 KB | `eed6669bde07` |
  | `bass_F1.mp3` | BGM：ベース F1 | 0.936 s（推定） | 14.7 KB | `7093ea854377` |
  | `bass_G1.mp3` | BGM：ベース G1 | 0.888 s（推定） | 14.0 KB | `03bbb958f050` |
  | `box_A4.mp3` | BGM：ミュージックボックス A4 | 0.96 s（推定） | 15.2 KB | `f476a8f2cc5a` |
  | `box_C5.mp3` | BGM：ミュージックボックス C5 | 0.96 s（推定） | 15.3 KB | `da6f2cfd5f24` |
  | `box_D5.mp3` | BGM：ミュージックボックス D5 | 1.008 s（推定） | 15.8 KB | `ecddb16bea2b` |
  | `box_E5.mp3` | BGM：ミュージックボックス E5 | 1.008 s（推定） | 15.9 KB | `63f7160d6321` |
  | `box_G5.mp3` | BGM：ミュージックボックス G5 | 0.96 s（推定） | 15.2 KB | `498c37842747` |
  | `box_A5.mp3` | BGM：ミュージックボックス A5 | 0.936 s（推定） | 14.7 KB | `034b0c4378ec` |

  ※ 長さ: `.ogg` は Ogg ページの granule position と Vorbis 識別ヘッダのサンプルレートから実測。`.mp3` はフレーム情報からの推定。

### 1.8 フォント（3 ファミリー / 7 ウェイト）

- **素材名／種類**: Dela Gothic One / M PLUS Rounded 1c / Shippori Mincho ／ TrueType フォント（woff2 にサブセット化）
- **ライセンス**: SIL Open Font License 1.1 — **確認済み**（各パッケージの LICENSE 全文を `src/assets/fonts/licenses/` に同梱）
- **加工**: リポジトリ内のソースに実在する文字（1958 字）だけを残すサブセット化を実施。3 ファミリーとも LICENSE 冒頭に **Reserved Font Name の宣言が無い**ことを確認しているため、ファミリー名は維持し OFL 全文を同梱。
- **取得元**: npm（@fontsource スコープ）— Google Fonts へのホットリンクをやめ、ローカル同梱に切り替えた

  | ファミリ | 用途 | 作者 | ライセンス | 取得元 |
  | --- | --- | --- | --- | --- |
  | Dela Gothic One（weight 400） | 見出し・ロゴ・数値（表示用フォント） | The Dela Gothic Project Authors (https://github.com/syakuzen/DelaGothic) | SIL Open Font License 1.1 | `@fontsource/dela-gothic-one@5.3.0` |
  | M PLUS Rounded 1c（weight 400/500/700/800） | 本文・UI全体 | The Rounded M+ Project Authors | SIL Open Font License 1.1 | `@fontsource/m-plus-rounded-1c@5.3.0` |
  | Shippori Mincho（weight 600/700） | ストーリー・会話の地の文（明朝で小説風に） | The Shippori Mincho Project Authors (https://github.com/fontdasu/ShipporiMincho) | SIL Open Font License 1.1 | `@fontsource/shippori-mincho@5.3.0` |

  **サブセット結果（実測）**

  | ファミリ | weight | ファイル | グリフ数 | サイズ | 統合した元サブセット数 |
  | --- | --- | --- | --- | --- | --- |
  | Dela Gothic One | 400 | `dela-gothic-one-400.woff2` | 1707 | 215 KB | 124 |
  | M PLUS Rounded 1c | 400 | `m-plus-rounded-1c-400.woff2` | 1728 | 283 KB | 127 |
  | M PLUS Rounded 1c | 500 | `m-plus-rounded-1c-500.woff2` | 1728 | 286 KB | 127 |
  | M PLUS Rounded 1c | 700 | `m-plus-rounded-1c-700.woff2` | 1728 | 303 KB | 127 |
  | M PLUS Rounded 1c | 800 | `m-plus-rounded-1c-800.woff2` | 1728 | 309 KB | 127 |
  | Shippori Mincho | 600 | `shippori-mincho-600.woff2` | 1690 | 303 KB | 123 |
  | Shippori Mincho | 700 | `shippori-mincho-700.woff2` | 1690 | 308 KB | 123 |

  **クレジット表記（アプリ内クレジット画面にも表示）**

  ```
  Dela Gothic One © The Dela Gothic Project Authors (https://github.com/syakuzen/DelaGothic)
  Licensed under the SIL Open Font License 1.1 (https://scripts.sil.org/OFL)
  ```
  ```
  M PLUS Rounded 1c © The Rounded M+ Project Authors
  Licensed under the SIL Open Font License 1.1 (https://scripts.sil.org/OFL)
  ```
  ```
  Shippori Mincho © The Shippori Mincho Project Authors (https://github.com/fontdasu/ShipporiMincho)
  Licensed under the SIL Open Font License 1.1 (https://scripts.sil.org/OFL)
  ```

### 1.9 UI アイコン（Lucide）

- **素材名／種類**: lucide-react ／ SVG アイコン（React コンポーネント）
- **用途**: UIアイコン（設定・音量・クレジット・タブ補助など）
- **作者**: Lucide Contributors
- **ライセンス**: ISC License — **確認済み**（npm パッケージ同梱の LICENSE を確認）
- **出典**: https://registry.npmjs.org/lucide-react
- **加工**: なし（アイコンのサイズ・色を CSS で指定しているのみ）

  ```
  Icons by Lucide Contributors — ISC License (https://lucide.dev)
  ```

### 1.10 ライセンス原本・出典の記録

以下のファイルを同梱し、再配布条件（OFL の原文同梱、CC BY のクレジット表記）を満たしています。

- `src/assets/audio/licenses/kenney-mirror-README.md` ← ETdoFresh/kenney.nl@master:README.md
- `src/assets/audio/licenses/midi-js-soundfonts-README.md` ← gleitz/midi-js-soundfonts@gh-pages:README.md
- `src/assets/audio/licenses/fluidr3-gm-soundfont.txt` ← gleitz/midi-js-soundfonts@gh-pages:LICENSE.txt
- `src/assets/fonts/licenses/dela-gothic-one-OFL.txt` / `m-plus-rounded-1c-OFL.txt` / `shippori-mincho-OFL.txt`（SIL OFL 1.1 全文）
- `src/assets/audio/licenses/kenney-*.txt`（各 Kenney パックの License.txt = CC0 本文）

## 2. 自作した素材とその理由

| 自作したもの | 場所 | 理由 |
| --- | --- | --- |
| BGM の作曲・編曲・シーケンス（Aマイナー / 72BPM / 8小節ループ / Am–F–C–G） | `src/utils/bgm.ts` | 到達できる公開リポジトリの範囲に「ライセンスを確認でき、かつ品質を試聴で確かめられる」ループ音源が無かったため。音色だけ外部サンプル（FluidR3 GM / CC BY 3.0）を使い、曲自体は自作した。差し替えは `EVENTS` / `PROGRESSION` と `src/assets/audio/notes/` を入れ替えるだけでよい。 |
| WebAudio 合成のフォールバック音 | `src/utils/synth.ts` | 外部サンプルが取得・デコードできなかった環境でも音が鳴り、ゲームが壊れないようにするため。 |
| 大きな演出用の重低音レイヤー（✝LR✝召喚・ウルトラ転生・進化） | `src/utils/synth.ts` | 外部の効果音パックに「地響き」系の素材が無かったため、合成低音を外部サンプルに重ねている。 |
| キャラクター立ち絵・進化カットシーンの SVG 演出・UI レイアウト | `src/assets/img/` / `src/components/` | 既存の自作アセット（本作固有のキャラクターのため外部素材で代替できない）。 |

## 3. 取得できなかった素材・未確認事項・制約

- **音の中身は試聴していない（未監修）。** この実行環境に音声再生が無いため、ジングル・効果音の選定は
  「ファイル形式の妥当性（OggS / mp3 マジックの確認）・長さの実測値（上の表）・用途との相性」だけで判断した。
  ピーク/RMS などの波形解析や、実際の聞こえ方の監修は **未実施**。差し替える場合は `scripts/assets.manifest.mjs` の `files` を書き換えて
  `node scripts/fetch-assets.mjs` を再実行し、`src/utils/sfx.ts` の `JINGLES` を更新する。
- **素材の取得元は GitHub 上のミラー**（`ETdoFresh/kenney.nl`, 2020-07-17 更新）。
  各パックの License.txt（CC0）は同梱しており、素材自体の利用条件はそれで確認できる。
  ただし作者サイト（kenney.nl）の個別アセットページ URL はこの環境から到達できず**未検証**のため、
  確定できる範囲（リポジトリのパスと License.txt の記載）のみを出典として記載している。
- **取得元リポジトリのミラー自体のライセンス表記は NOASSERTION**（GitHub API 上の判定）。
  各素材の利用条件は Kenney 自身の License.txt（CC0）で確認しているため、ミラーの記載に依存していない。
- **FluidR3 GM soundfont は CC BY 3.0**（クレジット表記が必須）。README の記載に基づき、
  ゲーム内クレジットとこのファイルの両方で作者（Frank Wen）と取得元リポジトリを明記している。
- **フォントのカバー範囲**: ソース由来の文字 + かな・全角記号を収録。
  ただし ᵢ ⁰ ⁵ ⁶ ⁷ ⁸ ⁹ ⁺ ⁻ ⁼ ⁽ ⁾ ₀ ₁ ₂ ₃ ₄ ₅ ₆ ₇ ₈ ₉ はどのフォントにもグリフが無いため、システムのフォールバック表示になる（装飾用の数式記号のみ。ファミリ別の差は `src/assets/fonts/fonts.report.json` 参照）。
- **再生環境の制約**: ブラウザの自動再生ポリシーにより、音声はタイトル画面のボタン操作以降に有効になる。
- **プレースホルダー（仮素材）は無い。** 未取得のまま「取得済み」としている素材はありません。

## 4. 取得・検証の再現手順

```bash
npm install
node scripts/fetch-assets.mjs        # 外部アセットを再取得 → src/assets/manifest.json
pip install fonttools brotli
python3 scripts/build-fonts.py       # フォントをサブセット化 → src/assets/fonts/
node scripts/build-credits.mjs       # この CREDITS.md を再生成
node scripts/test-audio.mjs          # アセットの実在・読み込み・発音・フォールバックを検証
```

TLS を検査する環境で取得する場合は `NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt` を付けてください。
