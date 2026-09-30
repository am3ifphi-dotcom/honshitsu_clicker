import type { CSSProperties } from 'react';
import type { EvolutionEffect } from '../game/types';
import { useFxCanvas } from './EvolutionAura';

/** 拍に応じた強度。アイコンと同じ描写系のまま、画面全体にスケールする。 */
const BEAT_POWER = [0.34, 0.42, 0.82, 1, 0.92, 0.6];

/** One bounded canvas for the cinema; the same engine that drives the EX icons. */
export default function EvolutionStageFX({ effect, accent, beat }: { effect: EvolutionEffect; accent: string; beat: number }) {
  const power = BEAT_POWER[Math.min(BEAT_POWER.length - 1, Math.max(0, beat))];
  const ref = useFxCanvas(effect, { power, maxDpr: 1.5 });
  return <canvas ref={ref} className="evolution-canvas" aria-hidden="true" style={{ '--accent': accent } as CSSProperties} />;
}
