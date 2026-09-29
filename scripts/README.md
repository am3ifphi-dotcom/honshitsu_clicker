# Regression checks

- `node scripts/test-debug.mjs`: full-upgrade command, caps, evolution flags, save backup and keyboard shortcut guards.
- `npm run test:evolution`: real Chromium checks for manual reading pauses, double-tap guard, cinematic progression, replay, skip cancellation, completion, mobile controls, all seven forms and reduced-motion controls.

For the browser check, run `npx playwright install chromium`, start `npm run dev` in another terminal, then run `npm run test:evolution`. The default test URL is `http://localhost:5173`; override with `TEST_BASE_URL`. To use an existing Chromium binary set `CHROMIUM_EXECUTABLE_PATH`.

The browser fixture (`scripts/fixtures/evolution.html`) mounts the cutscene in isolation, never loads the game store, and does not modify saves. Screenshots are written to the OS temporary directory, not the repository.
