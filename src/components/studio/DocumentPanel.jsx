import { useEffect, useRef } from 'react';

/**
 * A source document shown as numbered sentences. Highlighted sentences are the ones the selected part of
 * the course came from; the first one scrolls into view.
 */
export default function DocumentPanel({ title, meta, sentences, highlight = [], className = '' }) {
  const box = useRef(null);
  const first = highlight[0];
  useEffect(() => {
    if (!first || !box.current) return;
    const el = box.current.querySelector(`[data-n="${first}"]`);
    if (el) box.current.scrollTo({ top: el.offsetTop - box.current.offsetTop - 12, behavior: 'smooth' });
  }, [first]);

  return (
    <div className={`card flex min-h-0 flex-col rounded-2xl ${className}`}>
      <div className="border-b border-line px-5 py-4">
        <div className="text-[13px] font-semibold text-faint">Source document</div>
        <h3 className="font-bold">{title}</h3>
        {meta && <div className="text-[13px] text-muted">{meta}</div>}
      </div>
      <ol ref={box} className="scroll-thin min-h-0 flex-1 space-y-1 overflow-y-auto p-3" aria-label="Sentences in the source document">
        {sentences.length === 0 && <li className="px-2 py-1 text-sm text-faint">The document will appear here, split into numbered sentences.</li>}
        {sentences.map((s) => {
          const on = highlight.includes(s.n);
          return (
            <li
              key={s.n}
              data-n={s.n}
              className={`flex gap-3 rounded-lg px-2 py-1.5 text-[14px] leading-relaxed transition ${on ? 'bg-brand-soft text-ink ring-1 ring-brand/40' : 'text-muted'}`}
            >
              <span className={`mt-0.5 grid h-5 min-w-6 shrink-0 place-items-center rounded-md px-1 text-[11px] font-bold ${on ? 'bg-brand text-on-brand' : 'bg-surface-2 text-faint'}`}>{s.n}</span>
              <span>{s.text}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
