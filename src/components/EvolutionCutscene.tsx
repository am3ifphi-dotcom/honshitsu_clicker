import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { EVOLUTION_FORMS } from '../game/data/evolutions';
import { UNIT_MAP, getUnitForm } from '../game/data/units';
import { sfx } from '../utils/sfx';

const FX_GLYPHS: Record<string, string[]> = {
  inferno: ['✝', '🔥', '北極', '辛', '本質'],
  afterglow: ['∑', 'x²', '面白い', '放課後', '∴'],
  starfall: ['✦', '★', '星', '地面', 'LIVE'],
  contour: ['〰', '⌁', '等高線', '地層', '記憶'],
  'court-pass': ['●', 'PASS', '信頼', '理屈じゃない', '✦'],
  'phase-break': ['☨', '※', '存在', '前-原', '□'],
  'strata-memory': ['🌋', '地層', '記録', '地面', '✦'],
};

function Art({ portrait, emoji, name, className = '' }: { portrait?: string; emoji: string; name: string; className?: string }) {
  const mediaClass = `evo-cut__art-media ${className}`.trim();
  return portrait ? (
    <img src={portrait} alt={name} className={mediaClass} draggable={false} />
  ) : (
    <div className={`${mediaClass} evo-cut__glyph`} aria-label={name}>{emoji}</div>
  );
}

export default function EvolutionCutscene({ unitId, onComplete }: { unitId: string; onComplete: () => void }) {
  const form = EVOLUTION_FORMS[unitId];
  const base = UNIT_MAP[unitId];
  const after = getUnitForm(unitId, true);
  const [beat, setBeat] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const doneRef = useRef(false);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setFinishing(true);
    window.setTimeout(() => completeRef.current(), 420);
  }, []);

  const particles = useMemo(() => {
    const glyphs = FX_GLYPHS[form?.effect ?? 'phase-break'] ?? ['✦', '✝', '本質'];
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${(i * 37 + 11) % 100}%`,
      delay: `${((i * 13) % 47) / 10}s`,
      duration: `${6 + ((i * 17) % 50) / 10}s`,
      size: 10 + ((i * 23) % 25),
      glyph: glyphs[i % glyphs.length],
    }));
  }, [form?.effect]);

  useEffect(() => {
    doneRef.current = false;
    setBeat(0);
    setFinishing(false);
    sfx.ultra();
    const timers = [
      window.setTimeout(() => setBeat(1), 1300),
      window.setTimeout(() => setBeat(2), 3600),
      window.setTimeout(() => {
        setBeat(3);
        sfx.reveal(5);
      }, 6350),
      window.setTimeout(() => setBeat(4), 8500),
      window.setTimeout(() => finish(), 14500),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [unitId, finish]);

  if (!form || !base || !after) return null;

  const style = { '--evo-accent': form.accent } as CSSProperties;
  const revealed = beat >= 3;

  return (
    <div className={`evo-cut evo-cut--${form.effect} ${revealed ? 'is-revealed' : ''} ${finishing ? 'is-finishing' : ''}`} style={style} role="dialog" aria-modal="true" aria-label={`${form.name}への進化演出`}>
      <div className="evo-cut__backdrop" />
      <div className="evo-cut__grid" />
      <div className="evo-cut__contours" />
      <div className="evo-cut__rays" />
      <div className="evo-cut__particles" aria-hidden="true">
        {particles.map((p) => (
          <span key={p.id} className="evo-cut__particle" style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration, fontSize: p.size }}>
            {p.glyph}
          </span>
        ))}
      </div>
      <div className={`evo-cut__flash ${revealed ? 'is-on' : ''}`} />

      <div className="evo-cut__frame">
        <div className="evo-cut__eyebrow">
          <span>CHARACTER EVOLUTION</span>
          <span className="evo-cut__status"><i /> EX / AWAKENING SEQUENCE</span>
        </div>

        <div className={`evo-cut__motif ${beat >= 1 ? 'is-active' : ''}`} aria-hidden="true">
          <span>{form.motif}</span>
          <span className="evo-cut__motif-line" />
          <span>LR → EX</span>
        </div>

        <div className={`evo-cut__stage ${revealed ? 'is-revealed' : ''}`}>
          <div className="evo-cut__orbit evo-cut__orbit--one" />
          <div className="evo-cut__orbit evo-cut__orbit--two" />
          <div className="evo-cut__seal">✦</div>
          <div className="evo-cut__art evo-cut__art--before">
            <Art portrait={base.portrait} emoji={base.emoji} name={base.name} />
          </div>
          <div className="evo-cut__art evo-cut__art--after">
            <Art portrait={after.portrait} emoji={after.emoji} name={after.name} />
          </div>
          <div className="evo-cut__stage-label evo-cut__stage-label--before">{base.name}<small>BEFORE / LR</small></div>
          <div className="evo-cut__stage-label evo-cut__stage-label--after">{form.name}<small>AFTER / EX</small></div>
        </div>

        <div className="evo-cut__copy">
          <div className={`evo-cut__narration ${beat >= 1 ? 'is-visible' : ''}`}>{form.cutsceneNarration}</div>
          <div className={`evo-cut__quote ${beat >= 2 ? 'is-visible' : ''}`}>
            <span className="evo-cut__quote-mark">“</span>
            <p>{form.cutsceneLine}</p>
            <span className="evo-cut__quote-rule" />
          </div>
          <div className={`evo-cut__name ${beat >= 4 ? 'is-visible' : ''}`}>
            <span>EX / {form.title}</span>
            <strong>{form.name}</strong>
          </div>
        </div>

        <div className="evo-cut__footer">
          <div className="evo-cut__timeline" aria-label="進化演出の進行">
            {[0, 1, 2, 3, 4].map((n) => <i key={n} className={beat >= n ? 'is-lit' : ''} />)}
          </div>
          <div className="evo-cut__footer-row">
            <span>{beat < 4 ? '共鳴中……' : '新たな姿が定着した'}</span>
            {beat >= 4 && <button type="button" onClick={finish} className="evo-cut__finish">EX進化を確定する <b>↗</b></button>}
          </div>
        </div>
      </div>
    </div>
  );
}
