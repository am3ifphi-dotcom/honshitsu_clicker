import { useEffect, useRef } from 'react';
import type { EvolutionEffect } from '../game/types';

/** One bounded canvas for the cinema; icons use lightweight, scalable SVG instead. */
export default function EvolutionStageFX({ effect, accent, beat }: { effect: EvolutionEffect; accent: string; beat: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const phase = useRef(beat);
  const phaseStart = useRef(performance.now());
  useEffect(() => { phase.current = beat; phaseStart.current = performance.now(); }, [beat]);
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext('2d');
    if (!el || !ctx) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let w = 1, h = 1, frame = 0;
    const resize = () => {
      w = el.clientWidth; h = el.clientHeight;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      el.width = w * dpr; el.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(resize); observer.observe(el); resize();
    const random = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (document.hidden) return;
      ctx.clearRect(0, 0, w, h);
      if (reduced.matches) return;
      const t = now / 1000, p = phase.current, age = (now - phaseStart.current) / 1000;
      const power = p === 2 ? 1.5 : p === 3 ? 2.4 : p === 4 ? 1.8 : .55;
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = accent; ctx.fillStyle = accent;
      // Character-specific large-scale geometry, rather than a shared floating-text overlay.
      if (effect === 'contour' || effect === 'strata-memory') {
        for (let j = 0; j < 18; j++) {
          ctx.globalAlpha = .18 + .25 * Math.sin(j / 18 * Math.PI);
          ctx.lineWidth = j % 4 === 0 ? 2.5 : 1;
          ctx.beginPath();
          for (let x = -20; x <= w + 20; x += 12) {
            const y = h * .55 + j * h / 35 + Math.sin(x / w * 10 + j * .32 + t * .5) * h * .09 + Math.cos(x / w * 19 - j * .2) * h * .03;
            if (x === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else if (effect === 'starfall' || effect === 'afterglow') {
        ctx.save(); ctx.translate(w * .5, h * .48); ctx.rotate(t * .08);
        for (let j = 0; j < 4; j++) {
          ctx.globalAlpha = .25; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.ellipse(0, 0, w * (.26 + j * .09), h * (.13 + j * .07), j * .5, t * .1, t * .1 + Math.PI * 1.6); ctx.stroke();
        }
        ctx.restore();
      } else if (effect === 'phase-break') {
        for (let j = 0; j < 10; j++) {
          const y = random(j + Math.floor(t * 5)) * h;
          ctx.globalAlpha = .15; ctx.fillStyle = j % 2 ? '#69eeff' : accent;
          ctx.fillRect(random(j) * w, y, w * random(j + 9), 2 + random(j + 2) * 12);
        }
      }
      // Hundreds of depth-scaled embers, comet trails, chalk motes or court streaks.
      const count = w < 600 ? 100 : 170;
      for (let i = 0; i < count; i++) {
        const r = random(i), depth = .3 + random(i + 1000), speed = .08 + random(i + 2000) * .18;
        let x = r * w, y = (1 - ((t * speed + random(i + 3000)) % 1)) * h;
        const size = (.8 + depth * 2) * (p === 3 ? 2 : 1);
        ctx.globalAlpha = Math.min(.8, depth * .5 * power);
        ctx.fillStyle = i % 4 === 0 ? '#fff4dc' : accent;
        ctx.strokeStyle = ctx.fillStyle;
        if (p === 2 || p === 3) {
          const angle = r * Math.PI * 2;
          const radius = p === 2 ? (1 - ((age * .5 + random(i + 20)) % 1)) : ((age * .9 + random(i + 20)) % 1);
          x = w / 2 + Math.cos(angle) * radius * w * .8;
          y = h / 2 + Math.sin(angle) * radius * h * .8;
          ctx.lineWidth = size * .5;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(angle) * 65 * radius, y + Math.sin(angle) * 65 * radius); ctx.stroke();
        } else if (effect === 'court-pass') {
          x = ((t * depth * .6 + r) % 1) * w * 1.5 - w * .25;
          y = random(i + 30) * h - x * .25;
          ctx.lineWidth = size * .6;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - depth * 100, y + depth * 25); ctx.stroke();
        } else if (effect === 'inferno') {
          x += Math.sin(t * 2 + i) * 35;
          ctx.beginPath(); ctx.ellipse(x, y, size, size * 3, .4, 0, Math.PI * 2); ctx.fill();
        } else if (effect === 'starfall' && i % 5 === 0) {
          ctx.save(); ctx.translate(x, y); ctx.rotate(t * .4 + i);
          ctx.fillRect(-size * 3, -size * 2, size * 6, size * 4); ctx.restore();
        } else {
          ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
          if (i % 6 === 0) { ctx.fillRect(x - size * 4, y, size * 8, .7); ctx.fillRect(x, y - size * 4, .7, size * 8); }
        }
      }
      ctx.globalAlpha = 1;
    };
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [effect, accent]);
  return <canvas ref={canvas} className="evolution-canvas" aria-hidden="true" />;
}
