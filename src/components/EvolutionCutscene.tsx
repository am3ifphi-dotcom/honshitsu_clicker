import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { EVOLUTION_FORMS } from '../game/data/evolutions';
import { UNIT_MAP, getUnitForm } from '../game/data/units';
import EvolutionStageFX from './EvolutionStageFX';
import { sfx } from '../utils/sfx';

const SIGNATURES: Record<string, { words: string[]; seal: string; fragments: string[] }> = {
  inferno: { words: ['これまじ', '✝本質✝。'], seal: '✝', fragments: ['✦', '火', '✝'] },
  afterglow: { words: ['全部、', '繋がってるから。'], seal: '∑', fragments: ['∑', '∫', 'x²', '∴'] },
  starfall: { words: ['三十人に', '届けばいい。'], seal: '✦', fragments: ['✦', '✧', '▱'] },
  contour: { words: ['地面は、', '忘れない。'], seal: '◎', fragments: ['⌁', '＋', '等高線'] },
  'court-pass': { words: ['お前が打つべきだ。', '理屈じゃない。'], seal: '◉', fragments: ['／', '✦', '—'] },
  'phase-break': { words: ['存在しない。', 'だが、ある。'], seal: '☨', fragments: ['NULL', '☨', '存在'] },
  'strata-memory': { words: ['君たちの時間を、', '地面は忘れない。'], seal: '🌏', fragments: ['⌁', '◇', '記憶'] },
};

export default function EvolutionCutscene({ unitId, replay = false, onComplete }: {
  unitId: string; replay?: boolean; onComplete: () => void;
}) {
  const form = EVOLUTION_FORMS[unitId];
  const base = UNIT_MAP[unitId];
  const after = getUnitForm(unitId, true);
  const [beat, setBeat] = useState(0);
  const [run, setRun] = useState(0);
  const done = useRef(false);
  const advanceLock = useRef(0);
  const dialog = useRef<HTMLDivElement>(null);
  const complete = useRef(onComplete);
  complete.current = onComplete;
  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    complete.current();
  }, []);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.focus();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);

  // Reading phases NEVER have timers. Only the cinematic between taps advances itself.
  useEffect(() => {
    if (beat < 2 || beat >= 5) return;
    const duration = beat === 2 ? 1900 : beat === 3 ? 1350 : 3300;
    if (beat === 2) sfx.awaken();
    if (beat === 4) sfx.reveal(5);
    const timer = window.setTimeout(() => setBeat(beat + 1), duration);
    return () => window.clearTimeout(timer);
  }, [beat]);

  const advance = () => {
    const now = performance.now();
    if (now < advanceLock.current || beat > 1) return;
    advanceLock.current = now + 450;
    setBeat(beat + 1);
  };
  const restart = () => {
    done.current = false;
    advanceLock.current = performance.now() + 450;
    setBeat(0);
    setRun(n => n + 1);
  };

  if (!form || !base || !after) return null;
  const theme = SIGNATURES[form.effect];
  const art = (portrait: string | undefined, emoji: string, name: string) => portrait
    ? <img src={portrait} alt={name} draggable={false} />
    : <span className="evolution-glyph" role="img" aria-label={name}>{emoji}</span>;

  return createPortal(
    <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`${form.name}の進化${replay ? '・再鑑賞' : ''}`}
      className={`evolution evolution--${form.effect} evolution--beat-${beat}`}
      style={{ '--accent': form.accent } as CSSProperties}
      onKeyDown={(event) => {
        if ((event.key === 'Enter' || event.key === ' ') && event.target === dialog.current && !event.repeat) {
          event.preventDefault(); advance();
        }
        if (event.key === 'Escape' && replay) { event.stopPropagation(); finish(); }
        if (event.key === 'Tab') {
          const buttons = dialog.current?.querySelectorAll<HTMLButtonElement>('button');
          if (!buttons?.length) return;
          const first = buttons[0], last = buttons[buttons.length - 1];
          if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first.focus(); }
        }
      }}>
      <div key={run} className="evolution-film">
        <div className="evolution-art evolution-art--before">{art(base.portrait, base.emoji, base.name)}</div>
        <div className="evolution-art evolution-art--after">{art(after.portrait, after.emoji, after.name)}</div>
        <div className="evolution-shade" />
        <EvolutionStageFX effect={form.effect} accent={form.accent} beat={beat} />
        <div className="evolution-lens" aria-hidden="true" />
        {beat >= 2 && beat <= 4 && <div className="evolution-closeup" aria-hidden="true">{art(after.portrait, after.emoji, '')}<span>{theme.words[0]}</span></div>}
        <div className="evolution-shockwaves" aria-hidden="true">{[0,1,2].map(i => <i key={i} style={{ '--ring': i } as CSSProperties} />)}</div>
        <div className="evolution-fragments" aria-hidden="true">
          {Array.from({ length: 24 }, (_, i) => <i key={i} style={{ '--i': i, left: `${i * 37 % 100}%`, top: `${i * 23 % 100}%` } as CSSProperties}>{theme.fragments[i % theme.fragments.length]}</i>)}
        </div>
        <div className="evolution-seal" aria-hidden="true">{theme.seal}</div>
        <div className="evolution-wipe" aria-hidden="true" />
        <div className="evolution-impact" aria-hidden="true" />
        <div className="evolution-letterbox evolution-letterbox--top" />
        <div className="evolution-letterbox evolution-letterbox--bottom" />
        <header className="evolution-header"><span>{form.motif}</span><span>LR <b>→</b> EX</span></header>
        <div className="evolution-prologue"><span>{base.name}</span><p>{form.cutsceneNarration}</p></div>
        <div className="evolution-dialogue"><small>{base.name}</small><p>「{form.cutsceneLine}」</p></div>
        <div className="evolution-signature" aria-hidden="true">{theme.words.map((word, i) => <span key={word} style={{ '--line': i } as CSSProperties}>{word}</span>)}</div>
        {beat >= 5 && <div className="evolution-result">
          <div className="evolution-rank">EX<span>本質、その先へ。</span></div>
          <p>{form.title}</p><h2>{form.name}</h2>
          <div className="evolution-actions">
            <button onClick={restart}>もう一度観る</button>
            <button className="evolution-primary" onClick={finish}>{replay ? '鑑賞を終える' : 'この姿で、先へ'} <span>→</span></button>
          </div>
        </div>}
        <footer className="evolution-progress" aria-label="進化演出の進行">{[0, 1, 2, 3, 4, 5].map(n => <i key={n} className={beat >= n ? 'active' : ''} />)}</footer>
      </div>
      {beat <= 1 && <button className="evolution-advance" onClick={advance} aria-label={beat === 0 ? '続きを見る' : '進化を解き放つ'}>
        <span className="evolution-tap"><i />{beat === 0 ? 'タップして、続きを見る' : 'タップして、解き放つ'}<b>→</b></span>
      </button>}
      {beat >= 2 && beat < 5 && <button className="evolution-skip" onClick={() => setBeat(5)}>スキップ ≫</button>}
    </div>, document.body,
  );
}
