/**
 * 「honshitsu」と打つと全回収（maxEverything）できる隠しコマンド。
 * 開発サーバー・localhost・file://・本番ビルド、どの環境でも有効。
 * 入力中（IME・テキスト欄・修飾キー）は誤爆しないようにガードする。
 */
export function installDebugShortcut(target: Window, activate: () => void) {
  const sequence = 'honshitsu';
  let buffer = '';
  const onKey = (event: KeyboardEvent) => {
    const el = event.target instanceof Element ? event.target : null;
    if (event.isComposing || event.repeat || event.ctrlKey || event.metaKey || event.altKey ||
        el?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]')) {
      buffer = '';
      return;
    }
    // 1文字キーのみ拾う（Enter や Tab ではリセット）
    if (typeof event.key !== 'string' || event.key.length !== 1) { buffer = ''; return; }
    buffer = (buffer + event.key.toLowerCase()).slice(-sequence.length);
    if (buffer === sequence) { buffer = ''; activate(); }
  };
  // capture フェーズで拾うと、どの要素にフォーカスがあっても確実に動く
  target.addEventListener('keydown', onKey, { capture: true });
  return () => target.removeEventListener('keydown', onKey, { capture: true });
}
