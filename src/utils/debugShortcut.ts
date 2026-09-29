/** Production websites do not enable the typing shortcut; local files/dev previews do. */
export function isLocalDebugEnvironment() {
  return import.meta.env.DEV || location.protocol === 'file:' ||
    ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
}

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
    if (event.key.length !== 1) { buffer = ''; return; }
    buffer = (buffer + event.key.toLowerCase()).slice(-sequence.length);
    if (buffer === sequence) { buffer = ''; activate(); }
  };
  target.addEventListener('keydown', onKey);
  return () => target.removeEventListener('keydown', onKey);
}
