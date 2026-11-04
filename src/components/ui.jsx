import { useEffect, useId, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LuX, LuBookOpen, LuCircleHelp, LuMic, LuMapPin, LuHandshake } from 'react-icons/lu';
import { reps } from '../data/academy.js';

const repById = Object.fromEntries(reps.map((r) => [r.id, r]));

/** LevelUp mark: a blue ring with two gold chevrons climbing out of it. */
export function LogoMark({ size = 36, className = '' }) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-ring`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a9c1ff" />
          <stop offset="1" stopColor="#3a62d8" />
        </linearGradient>
      </defs>
      <path d="M44 13.5A21 21 0 1 0 53 32" fill="none" stroke={`url(#${id}-ring)`} strokeWidth="6" strokeLinecap="round" />
      <path d="M22 40 32 30 42 40" fill="none" stroke="#f2c879" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 28 32 18 42 28" fill="none" stroke="#f2c879" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
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
      className={`inline-grid shrink-0 place-items-center rounded-full font-bold text-white shadow-[0_0_0_1.5px_rgba(255,255,255,0.28),0_2px_6px_rgba(0,0,0,0.25)] ${className}`}
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
      className={`overflow-hidden rounded-full bg-white/10 ${className}`}
      style={{ height }}
    >
      <div className={`h-full rounded-full ${tone ? 'bar-fill' : 'xp-fill'}`} style={{ width: `${pct}%`, background: tone }} />
    </div>
  );
}

/** Five level pips with a marker on the target level. */
export function LevelPips({ level, target, color = '#5b86f0', size = 10 }) {
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
              background: filled ? color : missing ? 'rgb(255 143 143 / 0.18)' : 'rgb(255 255 255 / 0.08)',
              boxShadow: isTarget ? '0 0 0 1.5px rgb(245 243 240 / 0.8)' : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

export function Chip({ children, tone = 'default', className = '' }) {
  const tones = {
    default: 'bg-white/8 text-muted border-white/12',
    critical: 'bg-[#ff8f8f]/12 text-fail border-[#ff8f8f]/30',
    demand: 'bg-[#e6b25c]/12 text-gold border-[#e6b25c]/30',
    mandatory: 'bg-[#8b7bff]/14 text-[#b9b0ff] border-[#8b7bff]/30',
    good: 'bg-[#4ade80]/12 text-pass border-[#4ade80]/30',
    info: 'bg-[#5b86f0]/14 text-[#a9c1ff] border-[#5b86f0]/30',
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
          className="fixed inset-0 z-50 grid place-items-center bg-[#05080f]/60 p-3 backdrop-blur-sm"
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
            className={`glass max-h-[90vh] w-full overflow-y-auto rounded-[22px] bg-[#111a2e]/90 p-5 outline-none sm:p-6 ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-white/10 hover:text-ink">
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
    primary: 'bg-gold text-[#1a1406] hover:bg-[#ffd994] font-semibold',
    secondary: 'bg-white/10 text-ink hover:bg-white/16 border border-white/14',
    ghost: 'text-muted hover:text-ink hover:bg-white/8',
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]} ${className}`}
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
        <span className="glass-inset grid size-10 shrink-0 place-items-center rounded-xl">
          <Icon size={18} className={tone} />
        </span>
      )}
      <div className="min-w-0">
        <div className="text-[11px] tracking-wide text-faint uppercase">{label}</div>
        <div className="text-lg leading-tight font-semibold">{value}</div>
        {sub && <div className="truncate text-xs text-muted">{sub}</div>}
      </div>
    </div>
  );
}
