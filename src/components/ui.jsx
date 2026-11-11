import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LuX, LuBookOpen, LuCircleHelp, LuMic, LuMapPin, LuHandshake } from 'react-icons/lu';
import { personById } from '../data/academy.js';

/** LevelUp mark: a violet medal on a ribbon with a gold star. */
export function LogoMark({ size = 36, className = '' }) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-m`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8466f5" />
          <stop offset="1" stopColor="#5534cf" />
        </linearGradient>
      </defs>
      <path d="M21 3h9l6.5 15h-9z" fill="#8f74f7" />
      <path d="M43 3h-9l-6.5 15h9z" fill="#5534cf" />
      <circle cx="32" cy="39" r="22" fill={`url(#${id}-m)`} />
      <circle cx="32" cy="39" r="16.5" fill="none" stroke="#fff" strokeOpacity="0.28" strokeWidth="2" />
      <path d="M32 27l3.6 7.6 8.2 1-6 5.7 1.6 8.2L32 45.5l-7.4 4 1.6-8.2-6-5.7 8.2-1z" fill="#ffc23d" />
    </svg>
  );
}

/** Initials avatar with a gradient per rep. */
export function Avatar({ id, size = 28, className = '' }) {
  const rep = personById[id];
  const [from, to] = rep?.hue ?? ['#9ca3af', '#4b5563'];
  return (
    <span
      title={rep?.name ?? id}
      className={`inline-grid shrink-0 place-items-center rounded-full font-bold text-white ring-2 ring-surface ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(9, size * 0.36), background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {id}
    </span>
  );
}

/** Thin progress bar. `tone` is any CSS colour; omit it for the amber XP style. */
export function Bar({ value, tone, height = 8, label, className = '' }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
      className={`overflow-hidden rounded-full bg-surface-2 ${className}`}
      style={{ height }}
    >
      <div className={`h-full rounded-full ${tone ? 'bar-fill' : 'xp-fill'}`} style={{ width: `${pct}%`, background: tone }} />
    </div>
  );
}

/** Five level blocks; the outlined one is the level the role needs, red-tinted blocks are the gap. */
export function LevelPips({ level, target, color = 'var(--brand)', size = 10 }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Level ${level} of 5. Your role needs level ${target}.`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= level;
        const missing = !filled && n <= target;
        return (
          <span
            key={n}
            className="rounded-[4px]"
            style={{
              width: size * 1.7,
              height: size,
              background: filled ? color : missing ? 'var(--bad-soft)' : 'var(--line)',
              border: missing ? '1.5px dashed var(--bad)' : '1.5px solid transparent',
              opacity: !filled && !missing ? 0.7 : 1,
            }}
          />
        );
      })}
    </div>
  );
}

export function Chip({ children, tone = 'default', className = '' }) {
  const tones = {
    default: 'bg-surface-2 text-muted',
    critical: 'bg-bad-soft text-bad',
    demand: 'bg-amber-soft text-amber-ink',
    mandatory: 'bg-brand-soft text-brand',
    good: 'bg-good-soft text-good',
    info: 'bg-brand-soft text-brand',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${tones[tone]} ${className}`}>{children}</span>
  );
}

/** The three demand labels, in plain words. */
export function DemandChip({ skill }) {
  if (skill.mandatory) return <Chip tone="mandatory">Required</Chip>;
  if (skill.demand >= 3) return <Chip tone="critical">Needed most</Chip>;
  if (skill.demand === 2) return <Chip tone="demand">In demand</Chip>;
  return null;
}

export const QUEST_ICONS = { lesson: LuBookOpen, quiz: LuCircleHelp, roleplay: LuMic, field: LuMapPin, coaching: LuHandshake };

/** A small "?" that explains a term in plain words, on hover, focus or tap. */
export function InfoTip({ children, label = 'What does this mean?' }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  return (
    <span ref={box} className="relative inline-flex align-middle" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="grid size-[18px] place-items-center rounded-full bg-surface-2 text-[11px] font-bold text-faint hover:text-brand"
      >
        ?
      </button>
      {open && (
        <span role="tooltip" className="card absolute top-6 left-1/2 z-50 w-60 -translate-x-1/2 rounded-xl px-3 py-2 text-left text-[13px] leading-snug font-normal text-muted">
          {children}
        </span>
      )}
    </span>
  );
}

/** Accessible modal: closes on Escape and on backdrop click, and moves focus into the dialog. */
export function Modal({ open, onClose, title, children, wide = false }) {
  const panel = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    panel.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.22 }}
            className={`card max-h-[90vh] w-full overflow-y-auto rounded-2xl p-5 outline-none sm:p-6 ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="grid size-8 shrink-0 place-items-center rounded-full text-faint hover:bg-surface-2 hover:text-ink">
                <LuX size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Button({ children, variant = 'primary', className = '', ...rest }) {
  const styles = {
    primary: 'bg-brand text-on-brand hover:bg-brand-strong font-semibold',
    secondary: 'bg-surface text-ink hover:bg-surface-2 border border-line font-medium',
    ghost: 'text-muted hover:text-ink hover:bg-surface-2',
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

const STAT_TONES = {
  brand: 'bg-brand-soft text-brand',
  amber: 'bg-amber-soft text-amber-ink',
  flame: 'bg-flame-soft text-flame',
  good: 'bg-good-soft text-good',
  bad: 'bg-bad-soft text-bad',
};

/** Icon, big number, label and a hint, like Ledger's stat cards. */
export function Stat({ icon: Icon, tone = 'brand', value, label, hint, tip, valueClass = '' }) {
  return (
    <div>
      {Icon && (
        <span className={`grid size-9 place-items-center rounded-xl ${STAT_TONES[tone]}`}>
          <Icon size={18} />
        </span>
      )}
      <div className={`mt-3 text-[28px] leading-none font-extrabold tracking-tight ${valueClass}`}>{value}</div>
      <div className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold">
        {label}
        {tip && <InfoTip>{tip}</InfoTip>}
      </div>
      {hint && <div className="text-[13px] text-faint">{hint}</div>}
    </div>
  );
}
