import { useEffect, useId, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LuX, LuBookOpen, LuCircleHelp, LuMic, LuMapPin, LuHandshake } from 'react-icons/lu';
import { reps } from '../data/academy.js';

const repById = Object.fromEntries(reps.map((r) => [r.id, r]));

/** LevelUp mark: a violet hexagon badge with a white arrow climbing a step. */
export function LogoMark({ size = 36, className = '' }) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-hex`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7b5cf0" />
          <stop offset="1" stopColor="#4a2fc0" />
        </linearGradient>
      </defs>
      <path d="M32 3 57 17.5v29L32 61 7 46.5v-29z" fill={`url(#${id}-hex)`} />
      <path d="M18 44h10v-9h10v-9" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 17h7v7" fill="none" stroke="#ffc94d" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38 26 47 17" stroke="#ffc94d" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

/** Initials avatar with a gradient per rep. */
export function Avatar({ id, size = 28, className = '' }) {
  const rep = repById[id];
  const [from, to] = rep?.hue ?? ['#9ca3af', '#4b5563'];
  return (
    <span
      title={rep?.name ?? id}
      className={`inline-grid shrink-0 place-items-center rounded-full font-bold text-white shadow-[0_0_0_2px_#fff,0_2px_6px_rgba(28,26,51,0.18)] ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(9, size * 0.36), background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {id}
    </span>
  );
}

/** Thin progress bar. `tone` is any CSS colour; omit it for the gold XP style. */
export function Bar({ value, tone, height = 8, label, className = '' }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
      className={`overflow-hidden rounded-full bg-ink/8 ${className}`}
      style={{ height }}
    >
      <div className={`h-full rounded-full ${tone ? 'bar-fill' : 'xp-fill'}`} style={{ width: `${pct}%`, background: tone }} />
    </div>
  );
}

/** Five level pips with a marker on the target level. */
export function LevelPips({ level, target, color = '#5b3fd6', size = 10 }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Level ${level} of 5, target ${target}`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= level;
        const isTarget = n === target;
        const missing = !filled && n <= target;
        return (
          <span
            key={n}
            className="rounded-[3px] transition-colors"
            style={{
              width: size * 1.6,
              height: size,
              background: filled ? color : missing ? 'rgb(220 61 67 / 0.16)' : 'rgb(28 26 51 / 0.07)',
              boxShadow: isTarget ? '0 0 0 1.5px #fff, 0 0 0 3px rgb(28 26 51 / 0.55)' : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

export function Chip({ children, tone = 'default', className = '' }) {
  const tones = {
    default: 'bg-ink/5 text-muted border-ink/10',
    critical: 'bg-[#dc3d43]/8 text-fail border-[#dc3d43]/25',
    demand: 'bg-[#f5a524]/12 text-gold border-[#f5a524]/35',
    mandatory: 'bg-brand-soft text-brand border-brand/25',
    good: 'bg-[#15924a]/8 text-pass border-[#15924a]/25',
    info: 'bg-brand-soft text-brand border-brand/20',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export const QUEST_ICONS = { lesson: LuBookOpen, quiz: LuCircleHelp, roleplay: LuMic, field: LuMapPin, coaching: LuHandshake };

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
          className="fixed inset-0 z-50 grid place-items-center bg-[#1c1a33]/35 p-3 backdrop-blur-[3px]"
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
            transition={{ duration: 0.25 }}
            className={`card max-h-[90vh] w-full overflow-y-auto rounded-3xl p-5 outline-none sm:p-6 ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-ink/5 hover:text-ink">
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
    primary: 'bg-brand text-white hover:bg-[#4a2fc0] font-semibold shadow-[0_6px_16px_-6px_rgb(91_63_214_/_0.7)]',
    secondary: 'bg-white text-ink hover:bg-ink/5 border border-ink/12',
    ghost: 'text-muted hover:text-ink hover:bg-ink/5',
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Small "label / value" stat used in hero and KPI cards. */
export function Stat({ icon: Icon, label, value, sub, tone = 'text-ink' }) {
  return (
    <div className="flex items-center gap-3">
      {Icon && (
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-soft">
          <Icon size={18} className={tone} />
        </span>
      )}
      <div className="min-w-0">
        <div className="text-xs text-muted">{label}</div>
        <div className="text-lg leading-tight font-semibold">{value}</div>
        {sub && <div className="truncate text-xs text-muted">{sub}</div>}
      </div>
    </div>
  );
}
