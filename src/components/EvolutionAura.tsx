import { useEffect, useRef } from 'react';
import type { ExEffect } from '../game/exFx';
import { prefersReducedMotion, registerFx, renderFxFrame } from '../game/exFx';

interface FxOptions {
  /** 0..1 の強度 */
  power?: number;
  /** false の間は静止画のまま */
  active?: boolean;
  /** 静止画・reduce-motion 時に使う時刻（絵が一番乗る瞬間） */
  staticTime?: number;
  maxDpr?: number;
}

/**
 * canvas を共有FXループへ接続する。
 * ・視界外・非表示・reduce-motion では動かない（= バッテリーとGPUを守る）
 * ・DPR に合わせて解像度を合わせ、ResizeObserver で追従する
 */
export function useFxCanvas(effect: ExEffect, options: FxOptions = {}) {
  const { power = 1, active = true, staticTime = 1.45, maxDpr = 2 } = options;
  const ref = useRef<HTMLCanvasElement>(null);
  const powerRef = useRef(power);
  powerRef.current = power;
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0, dpr = 1;
    const paint = (t: number) => renderFxFrame(effect, ctx, w, h, t, powerRef.current);

    const resize = () => {
      const rect = el.getBoundingClientRect();
      const nw = Math.max(1, Math.round(rect.width || el.clientWidth || 0));
      const nh = Math.max(1, Math.round(rect.height || el.clientHeight || 0));
      const ndpr = Math.min(typeof devicePixelRatio === 'number' ? devicePixelRatio : 1, maxDpr);
      if (nw === w && nh === h && ndpr === dpr) return;
      w = nw; h = nh; dpr = ndpr;
      el.width = Math.max(1, Math.round(w * dpr));
      el.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint(staticTime);
    };

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    if (observer) observer.observe(el);
    resize();

    let unregister: (() => void) | null = null;
    const stop = () => { if (unregister) { unregister(); unregister = null; } };
    const start = () => {
      if (unregister || !activeRef.current || prefersReducedMotion()) return;
      unregister = registerFx((t) => paint(t));
    };

    const io = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver((records) => {
        const visible = records.some((r) => r.isIntersecting);
        if (visible) start(); else stop();
      }, { rootMargin: '160px' })
      : null;
    if (io) io.observe(el); else start();

    const motion = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
    const onMotion = () => { if (motion && motion.matches) { stop(); paint(staticTime); } else start(); };
    if (motion) motion.addEventListener('change', onMotion);

    const onVisibility = () => { if (!document.hidden && activeRef.current) start(); };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      if (observer) observer.disconnect();
      if (io) io.disconnect();
      if (motion) motion.removeEventListener('change', onMotion);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [effect, staticTime, maxDpr]);

  return ref;
}

/**
 * EXアイコンに載る自律運動するFX。
 * 額縁（回転するエネルギーリング）と色グレードはCSS、世界観の動きはcanvas。
 */
export function EvolutionAura({
  effect, active = true, power, className = '',
}: { effect: ExEffect; active?: boolean; power?: number; className?: string }) {
  const ref = useFxCanvas(effect, { active, power: power ?? (active ? 1 : 0.72) });
  return (
    <div className={`ex-fx ex-fx--${effect} ${active ? 'is-active' : ''} ${className}`} aria-hidden="true">
      <canvas ref={ref} className="ex-fx__canvas" />
      <span className="ex-fx__grade" />
      <span className="ex-fx__frame" />
    </div>
  );
}
