import assert from 'node:assert/strict';
import { createServer } from 'vite';
const memory = new Map();
globalThis.localStorage = { getItem: k => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, v) };
globalThis.window = new EventTarget();
globalThis.Element = class { constructor(editable) { this.editable = editable; } closest() { return this.editable; } };
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { useGame } = await server.ssrLoadModule('/src/game/store.ts');
  const { UNITS } = await server.ssrLoadModule('/src/game/data/units.ts');
  const { EVOLUTION_FORMS } = await server.ssrLoadModule('/src/game/data/evolutions.ts');
  const { computeMods, getMaxStar, levelCap, derive } = await server.ssrLoadModule('/src/game/formulas.ts');
  const { getUnitAwakenings } = await server.ssrLoadModule('/src/game/data/awakening.ts');
  const { NODE_MAP, PRESTIGE_MAP, ULTRA_PRESTIGE_MAP } = await server.ssrLoadModule('/src/game/data/skills.ts');
  window.hdebug.maxEverything();
  const s = useGame.getState(), mods = computeMods(s);
  for (const def of UNITS) {
    assert.equal(s.units[def.id].star, getMaxStar(mods));
    assert.equal(s.units[def.id].level, levelCap(s.units[def.id], mods));
    assert.equal(s.awakening[def.id], getUnitAwakenings(def.id).length);
    assert.equal(s.bonds[def.id].lv, 10);
  }
  for (const id of Object.keys(EVOLUTION_FORMS)) assert.equal(s.evolvedUnits[id], true);
  for (const [field, defs] of [['skills', NODE_MAP], ['prestige', PRESTIGE_MAP], ['ultraPrestige', ULTRA_PRESTIGE_MAP]]) {
    for (const [id, def] of Object.entries(defs)) assert.equal(s[field][id], def.max);
  }
  for (const [key, value] of Object.entries(derive(s))) if (typeof value === 'number') assert.ok(Number.isFinite(value), key);
  const saved = localStorage.getItem('honshitsu-leak-save-v1');
  const backup = localStorage.getItem('honshitsu-leak-save-v1-before-max-everything');
  assert.ok(saved && backup);
  window.hdebug.maxEverything();
  assert.equal(localStorage.getItem('honshitsu-leak-save-v1-before-max-everything'), backup);
  assert.deepEqual(useGame.getState().units, s.units);
  const { installDebugShortcut } = await server.ssrLoadModule('/src/utils/debugShortcut.ts');
  let activated = 0;
  const remove = installDebugShortcut(window, () => activated++);
  const type = (text, extra = {}) => { for (const key of text) { const e = new Event('keydown'); Object.defineProperties(e, Object.fromEntries(Object.entries({ key, ...extra }).map(([k, v]) => [k, { value: v }]))); window.dispatchEvent(e); } };
  type('honshitsu'); assert.equal(activated, 1);
  type('HONSHITSU'); assert.equal(activated, 2);
  type('honshitsu', { target: new Element(true) }); assert.equal(activated, 2);
  type('honshitsu', { isComposing: true }); assert.equal(activated, 2);
  type('honshitsu', { repeat: true }); assert.equal(activated, 2);
  type('honshitsu', { ctrlKey: true }); assert.equal(activated, 2);
  type('honxshitsu'); assert.equal(activated, 2);
  remove(); type('honshitsu'); assert.equal(activated, 2);
  console.log(`PASS: ${UNITS.length} units, ${Object.keys(EVOLUTION_FORMS).length} evolutions, upgrades, finite stats, save/backup, repeat execution, keyboard guards/cleanup`);
} finally { await server.close(); }
