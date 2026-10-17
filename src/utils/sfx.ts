/**
 * 効果音・ジングルの統一 API。
 *
 * 実体は外部アセット（Kenney の CC0 パック）で、`src/assets/audio/` に同梱している。
 * 出典・作者・ライセンスは `src/assets/manifest.json` / CREDITS.md を参照。
 *
 * サンプルがまだデコードされていない／取得に失敗した場合は `src/utils/synth.ts` の
 * WebAudio 合成音にフォールバックするので、素材が欠けてもゲームは壊れない。
 */
import { getContext, getBuffer, isSilent, play, warm, type PlayOptions } from './audio';
import { duck } from './bgm';
import * as synth from './synth';

type Layer = { name: string; opts?: PlayOptions };

/** 1つでも鳴れば true。全部失敗した場合のみ合成音を鳴らす。 */
function emit(layers: Layer[], fallback?: () => void, ducking = 0): boolean {
  if (isSilent()) return false;
  let ok = false;
  for (const l of layers) {
    if (play(l.name, l.opts)) ok = true;
  }
  if (ok && ducking) duck(ducking, 1.8);
  if (!ok && fallback) fallback();
  return ok;
}

/** 合成音レイヤー（重い演出で外部サンプルに重ねる）。 */
function layerSynth(fn: (c: AudioContext, when: number) => void, delay = 0) {
  const c = getContext();
  if (!c) return;
  fn(c, c.currentTime + 0.02 + delay);
}

export const JINGLES = {
  achievement: 'jingles_NES05',
  ultraReveal: 'jingles_HIT11',
  victory: 'jingles_HIT03',
  defeat: 'jingles_SAX13',
  login: 'jingles_PIZZI07',
  rebirth: 'jingles_SAX07',
  evolution: 'jingles_STEEL02',
} as const;

/** 起動直後・タイトル開始後に呼ぶと、よく使う音がカクつかない。 */
export function preload(): void {
  if (isSilent()) return;
  void warm([
    'click_002',
    'click_004',
    'select_004',
    'confirmation_001',
    'error_004',
    'pluck_002',
    'switch_003',
    'impactMetal_heavy_000',
    'impactPlate_medium_001',
    'handleCoins',
    'maximize_004',
    'impactBell_heavy_000',
    JINGLES.ultraReveal,
  ]);
}

export const sfx = {
  preload,

  /* ---------------------------------------------------------- クリッカー */
  tap() {
    // click_002 は 0.01s と非常に短いため、impactSoft（0.12s）を重ねて打感を出す
    emit(
      [
        { name: 'click_002', opts: { volume: 0.5, jitter: 0.04 } },
        { name: 'impactSoft_medium_000', opts: { volume: 0.32, jitter: 0.05 } },
      ],
      synth.tap,
    );
  },
  crit() {
    emit(
      [
        { name: 'pluck_002', opts: { volume: 0.7 } },
        { name: 'impactGlass_heavy_001', opts: { volume: 0.22, delay: 0.02 } },
      ],
      synth.crit,
    );
  },

  /* ---------------------------------------------------------- UI 全般 */
  ui() {
    emit([{ name: 'click_004', opts: { volume: 0.4 } }], synth.tap);
  },
  hover() {
    emit([
      { name: 'rollover2', opts: { volume: 0.16 } },
      { name: 'tick_002', opts: { volume: 0.12 } },
    ]);
  },
  select() {
    emit([{ name: 'select_004', opts: { volume: 0.45 } }]);
  },
  confirm() {
    emit([{ name: 'confirmation_001', opts: { volume: 0.5 } }]);
  },
  success() {
    emit([{ name: 'maximize_004', opts: { volume: 0.5 } }]);
  },
  error() {
    emit([{ name: 'error_004', opts: { volume: 0.42 } }]);
  },
  tab() {
    emit([{ name: 'switch_003', opts: { volume: 0.4 } }]);
  },
  toggle() {
    emit([{ name: 'toggle_002', opts: { volume: 0.45 } }]);
  },
  back() {
    emit([{ name: 'back_002', opts: { volume: 0.4 } }]);
  },
  open() {
    emit([{ name: 'open_003', opts: { volume: 0.3 } }]);
  },
  close() {
    emit([{ name: 'close_002', opts: { volume: 0.3 } }]);
  },
  notify() {
    // グループLINE の新着。0.02s の tick では埋もれるので 0.19s の drop を使う
    emit([{ name: 'drop_003', opts: { volume: 0.4, jitter: 0.03 } }]);
  },
  notice() {
    emit([{ name: 'question_002', opts: { volume: 0.4 } }]);
  },

  /* ---------------------------------------------------------- 通貨・アイテム */
  coin() {
    emit([{ name: 'handleCoins', opts: { volume: 0.5 } }]);
  },
  crystal() {
    emit([
      { name: 'glass_004', opts: { volume: 0.5 } },
      { name: 'impactGlass_heavy_001', opts: { volume: 0.3, delay: 0.04 } },
    ]);
  },
  item() {
    emit([{ name: 'drop_003', opts: { volume: 0.5 } }]);
  },
  can() {
    emit([{ name: 'impactPlate_medium_001', opts: { volume: 0.55 } }]);
  },
  equip() {
    emit([{ name: 'metalLatch', opts: { volume: 0.5 } }]);
  },

  /* ---------------------------------------------------------- ストーリー・演出 */
  door() {
    emit([{ name: 'doorOpen_1', opts: { volume: 0.5 } }]);
  },
  story() {
    emit([{ name: 'bookOpen', opts: { volume: 0.45 } }]);
  },
  page() {
    emit([{ name: 'bookFlip2', opts: { volume: 0.45 } }]);
  },

  /* ---------------------------------------------------------- 対抗戦 */
  hit() {
    emit([{ name: 'impactPunch_medium_002', opts: { volume: 0.5, jitter: 0.05 } }]);
  },
  /** 反撃・ガードなど「木の机に当たる」系の軽い打撃 */
  block() {
    emit([{ name: 'impactWood_medium_000', opts: { volume: 0.45, jitter: 0.05 } }]);
  },
  soft() {
    emit([{ name: 'impactSoft_medium_000', opts: { volume: 0.35, jitter: 0.05 } }]);
  },
  hitHeavy() {
    emit([{ name: 'impactPunch_heavy_000', opts: { volume: 0.65, jitter: 0.04 } }]);
  },
  slash() {
    emit([
      { name: 'knifeSlice', opts: { volume: 0.45 } },
      { name: 'impactPunch_medium_002', opts: { volume: 0.35, delay: 0.03 } },
    ]);
  },
  win() {
    emit([{ name: JINGLES.victory, opts: { volume: 0.7 } }], undefined, 0.35);
  },
  lose() {
    emit([{ name: JINGLES.defeat, opts: { volume: 0.65 } }], undefined, 0.35);
  },

  /* ---------------------------------------------------------- ジングル */
  achievement() {
    emit([{ name: JINGLES.achievement, opts: { volume: 0.6 } }], undefined, 0.45);
  },
  login() {
    emit([{ name: JINGLES.login, opts: { volume: 0.6 } }], undefined, 0.45);
  },
  rebirthJingle() {
    emit([{ name: JINGLES.rebirth, opts: { volume: 0.7 } }], undefined, 0.4);
  },
  evolutionJingle() {
    emit([{ name: JINGLES.evolution, opts: { volume: 0.65 } }], undefined, 0.4);
  },

  /* ---------------------------------------------------------- 大きな演出（既存 API 互換） */
  /** 召喚マシン（缶が落ちてくる） */
  gacon() {
    emit(
      [
        { name: 'impactMetal_heavy_000', opts: { volume: 0.6 } },
        { name: 'impactPlate_medium_001', opts: { volume: 0.55, delay: 0.16 } },
        { name: 'switch13', opts: { volume: 0.3, delay: 0.02 } },
      ],
      synth.gacon,
    );
  },
  hundred() {
    emit(
      [
        { name: 'impactMetal_heavy_000', opts: { volume: 0.6 } },
        { name: 'handleCoins', opts: { volume: 0.6, delay: 0.12 } },
        { name: 'confirmation_001', opts: { volume: 0.55, delay: 0.3 } },
        { name: 'impactPlate_medium_001', opts: { volume: 0.4, delay: 0.2 } },
      ],
      synth.hundred,
    );
  },
  awaken() {
    emit([{ name: 'impactBell_heavy_000', opts: { volume: 0.65 } }], synth.awaken);
    layerSynth((c, t) => synth.riser(c, t - 0.02, 0.22));
  },
  ultra() {
    emit(
      [
        { name: 'impactMining_002', opts: { volume: 0.7 } },
        { name: 'glitch_003', opts: { volume: 0.4, delay: 0.35 } },
        { name: 'impactBell_heavy_000', opts: { volume: 0.5, delay: 0.5 } },
        { name: 'impactPunch_heavy_000', opts: { volume: 0.6, delay: 0.9 } },
      ],
      synth.ultra,
    );
    layerSynth((c, t) => synth.deep(c, t, 0.5));
    layerSynth((c, t) => synth.boom(c, t + 0.9, 0.5), 0.9);
  },
  /** rank: 3=SSR 4=UR 5=LR */
  reveal(rank: number) {
    if (isSilent()) return;
    const c = getContext();
    if (!c) return;
    const jingle = JINGLES.ultraReveal;
    const hasJingle = getBuffer(jingle) !== null;

    if (rank >= 4 && hasJingle) {
      // 盛り上げ（合成）→ 開放の瞬間に外部ジングル
      layerSynth((cc, t) => synth.riser(cc, t, rank >= 5 ? 0.34 : 0.28));
      play('glitch_003', { volume: rank >= 5 ? 0.5 : 0, delay: 0.56 });
      play(jingle, { volume: rank >= 5 ? 0.85 : 0.75, delay: 0.58 });
      layerSynth((cc, t) => synth.boom(cc, t + 0.58, rank >= 5 ? 0.5 : 0.4), 0);
      layerSynth((cc, t) => synth.deep(cc, t + 0.6, rank >= 5 ? 0.45 : 0.25));
      layerSynth((cc, t) => synth.shimmer(cc, t + 1.0, rank >= 5 ? 0.16 : 0.24), 0);
      return;
    }

    if (rank >= 3) {
      const ok = emit([
        { name: 'confirmation_001', opts: { volume: 0.5, delay: 0.58 } },
        { name: 'glass_004', opts: { volume: 0.4, delay: 0.6 } },
      ]);
      layerSynth((cc, t) => synth.riser(cc, t, 0.22));
      layerSynth((cc, t) => synth.shimmer(cc, t + 1.0, 0.2));
      if (!ok) synth.reveal(rank);
      return;
    }

    synth.reveal(rank);
  },
};
