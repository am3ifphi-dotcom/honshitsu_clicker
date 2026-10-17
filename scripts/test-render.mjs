/**
 * 描画スモークテスト（ブラウザ不要）。
 *
 *   node scripts/test-render.mjs
 *
 * AudioContext / localStorage をモックしたうえで、Vite の SSR ローダーから本物の
 * コンポーネントを読み込み、`react-dom/server` で描画する。
 * 「外部アセット（フォント CSS・音声・画像・アイコン・JSON マニフェスト）を import した結果、
 *   画面が落ちないこと」を確かめるのが目的。
 */
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';

const memory = new Map();
globalThis.localStorage = {
  getItem: (k) => (memory.has(k) ? memory.get(k) : null),
  setItem: (k, v) => memory.set(k, String(v)),
  removeItem: (k) => memory.delete(k),
};
globalThis.window = new EventTarget();
globalThis.window.innerWidth = 1280;

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true } });
try {
  const el = React.createElement;

  const App = (await server.ssrLoadModule('/src/App.tsx')).default;
  const appHtml = renderToString(el(App));
  assert.ok(appHtml.length > 2000, `App の描画結果が短すぎる: ${appHtml.length}`);
  assert.ok(appHtml.includes('✝本質✝'), 'タイトルテキストが出ていない');
  assert.ok(!appHtml.includes('fonts.googleapis.com'), 'Google Fonts ホットリンクが残っている');

  const TitleScreen = (await server.ssrLoadModule('/src/components/TitleScreen.tsx')).default;
  const titleHtml = renderToString(el(TitleScreen, { onStart() {}, hasSave: false, onCredits() {} }));
  assert.ok(titleHtml.includes('使用素材'), 'タイトルにクレジット導線がない');
  assert.ok(titleHtml.includes('音あり'), 'タイトルに音量トグルがない');

  const CreditsModal = (await server.ssrLoadModule('/src/components/CreditsModal.tsx')).default;
  const creditsHtml = renderToString(el(CreditsModal, { open: true, onClose() {} }));
  assert.ok(creditsHtml.includes('Kenney'), 'クレジットに作者名がない');
  assert.ok(creditsHtml.includes('CC0 1.0 Universal'), 'クレジットにライセンスがない');
  assert.ok(creditsHtml.includes('SIL Open Font License 1.1'), 'クレジットにフォントのライセンスがない');
  assert.ok(creditsHtml.includes('FluidR3 GM'), 'クレジットに BGM 音色の出典がない');
  assert.ok(creditsHtml.includes('試聴していない'), '未確認事項の記載がない');

  const AudioSettingsModal = (await server.ssrLoadModule('/src/components/AudioSettingsModal.tsx')).default;
  const settingsHtml = renderToString(el(AudioSettingsModal, { open: true, onClose() {}, onCredits() {} }));
  assert.equal((settingsHtml.match(/type="range"/g) ?? []).length, 3, '音量スライダーが3本ない');

  const Header = (await server.ssrLoadModule('/src/components/Header.tsx')).default;
  const headerHtml = renderToString(el(Header));
  assert.ok(headerHtml.includes('音の設定'), 'ヘッダーに音の設定ボタンがない');
  assert.ok(headerHtml.includes('<svg'), 'Lucide アイコンが描画されていない');

  const ClickerTab = (await server.ssrLoadModule('/src/components/ClickerTab.tsx')).default;
  const clickerHtml = renderToString(el(ClickerTab));
  assert.ok(clickerHtml.includes('mix-blend-screen'), 'パーティクル素材が描画されていない');

  console.log('PASS: App / タイトル / ヘッダー / クリッカー / 音設定 / クレジット の描画（外部アセット import 込み）');
} finally {
  await server.close();
}
