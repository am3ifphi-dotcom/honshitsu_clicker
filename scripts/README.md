# Regression checks

- `npm test`: typecheck（`tsc --noEmit`）→ `test:debug` → `test:audio` をまとめて実行。
- `node scripts/test-debug.mjs`: full-upgrade command, caps, evolution flags, save backup and keyboard shortcut guards.
- `node scripts/test-audio.mjs`: 外部アセット（Kenney / FluidR3 / フォント）の実在確認、`src/utils/audio.ts`・`sfx.ts`・`bgm.ts` を
  モックした AudioContext 上で実際に動かして、サンプル発音・ミュート・合成音フォールバック・BGM シーケンスを検証する。
- `node scripts/test-render.mjs`: `react-dom/server` で App / タイトル / ヘッダー / クリッカー / 音設定 / クレジットを描画し、
  外部アセットの import（フォント CSS・ogg・mp3・PNG・JSON マニフェスト）込みで落ちないことを確認する。
- `npm run test:evolution`: real Chromium checks for manual reading pauses, double-tap guard, cinematic progression, replay, skip cancellation, completion, mobile controls, all seven forms and reduced-motion controls.

For the browser check, run `npx playwright install chromium`, start `npm run dev` in another terminal, then run `npm run test:evolution`. The default test URL is `http://localhost:5173`; override with `TEST_BASE_URL`. To use an existing Chromium binary set `CHROMIUM_EXECUTABLE_PATH`.

The browser fixture (`scripts/fixtures/evolution.html`) mounts the cutscene in isolation, never loads the game store, and does not modify saves. Screenshots are written to the OS temporary directory, not the repository.

# External assets

外部アセット（効果音・ジングル・BGM 音色・パーティクル画像・フォント）の取得と組み込みは以下で行う。
出典・作者・ライセンス・加工の有無は **`CREDITS.md`**（自動生成）と `src/assets/manifest.json`（取得記録）を参照。

```bash
npm run assets:fetch     # GitHub の公開リポジトリから取得 → src/assets/ と src/assets/manifest.json
npm run assets:fonts     # @fontsource（OFL）を使用文字だけサブセット化 → src/assets/fonts/（要: pip install fonttools brotli）
npm run assets:credits   # CREDITS.md を再生成
```

- `scripts/assets.manifest.mjs`: 素材一覧（出典・作者・ライセンス・用途）の single source of truth。
- `scripts/fetch-assets.mjs`: 取得・形式チェック（OggS / mp3 / PNG マジック）・長さの実測・sha256 記録。1件でも失敗すると非0終了。
- TLS を検査する環境では `NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt` を付ける。
- ゲーム内のクレジット表示（ヘッダー ⚙ → 使用素材）は `src/assets/manifest.json` を読むので、実体とズレない。
