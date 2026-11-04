import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LuHouse,
  LuTarget,
  LuSwords,
  LuTrophy,
  LuLayoutDashboard,
  LuChevronDown,
  LuRotateCcw,
  LuGithub,
  LuZap,
  LuFlame,
  LuCheck,
  LuSparkles,
} from 'react-icons/lu';
import { LogoMark, Avatar, Modal, Button } from './ui.jsx';
import { reps, teamById, roles, company } from '../data/academy.js';
import { playerLevel } from '../lib/game.js';

export const TABS = [
  { id: 'home', label: 'My journey', icon: LuHouse },
  { id: 'skills', label: 'My skills', icon: LuTarget },
  { id: 'quests', label: 'Quests', icon: LuSwords },
  { id: 'league', label: 'Leaderboard', icon: LuTrophy },
  { id: 'team', label: 'Team insights', icon: LuLayoutDashboard },
];

export function TopBar({ rep, onRep, onReset, tab }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    const close = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  const level = playerLevel(rep.xp);
  const title = TABS.find((t) => t.id === tab)?.label;

  return (
    <header className="glass sticky top-3 z-30 flex items-center gap-3 rounded-[22px] px-3 py-2.5 sm:px-4">
      <LogoMark size={34} />
      <div className="mr-auto min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold tracking-tight">LevelUp</span>
          <span className="hidden truncate text-sm text-muted sm:inline">· {title}</span>
        </div>
        <div className="hidden truncate text-[11px] text-faint sm:block">
          {company.name} · {company.unit}
        </div>
      </div>

      <div className="hidden items-center gap-3 text-sm md:flex">
        <span className="flex items-center gap-1 font-semibold text-gold" title="Total XP">
          <LuZap size={15} /> {rep.xp.toLocaleString('en')}
        </span>
        <span className="flex items-center gap-1 font-semibold text-[#ff9f5a]" title="Learning streak">
          <LuFlame size={15} className={rep.streak ? 'flicker' : ''} /> {rep.streak}
        </span>
      </div>

      <div ref={box} className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="menu"
          className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition hover:bg-white/10"
        >
          <Avatar id={rep.id} size={32} />
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-sm font-semibold">{rep.name}</span>
            <span className="block text-[11px] text-muted">
              Level {level.level} · {teamById[rep.team].name}
            </span>
          </span>
          <LuChevronDown size={15} className="text-muted" />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              role="menu"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="glass absolute right-0 mt-2 w-72 rounded-2xl bg-[#111a2e]/95 p-2"
            >
              <div className="px-2 pt-1 pb-2 text-[11px] tracking-wide text-faint uppercase">Play as (demo)</div>
              <div className="scroll-glass max-h-80 overflow-y-auto">
                {reps.map((r) => (
                  <button
                    key={r.id}
                    role="menuitem"
                    onClick={() => {
                      onRep(r.id);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left hover:bg-white/10"
                  >
                    <Avatar id={r.id} size={26} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{r.name}</span>
                      <span className="block text-[11px] text-muted">
                        {roles[r.role].label} · {teamById[r.team].name}
                      </span>
                    </span>
                    {r.id === rep.id && <LuCheck size={15} className="text-gold" />}
                  </button>
                ))}
              </div>
              <div className="mt-1 border-t border-white/10 pt-1">
                <button
                  role="menuitem"
                  onClick={() => {
                    onReset();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-sm text-muted hover:bg-white/10 hover:text-ink"
                >
                  <LuRotateCcw size={15} /> Reset demo progress
                </button>
                <a
                  role="menuitem"
                  href="https://github.com/DiogoS7/LevelUp"
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-sm text-muted hover:bg-white/10 hover:text-ink"
                >
                  <LuGithub size={15} /> Source code
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

/** Vertical glass dock on desktop, floating bottom bar on phones. */
export function SideDock({ tab, onTab, pendingCount }) {
  return (
    <nav
      aria-label="Main"
      className="glass fixed bottom-3.5 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 rounded-full p-1.5 md:sticky md:top-28 md:bottom-auto md:left-auto md:mt-2 md:translate-x-0 md:flex-col md:self-start md:px-[7px] md:py-2.5"
    >
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          data-tip={label}
          aria-label={label}
          aria-current={tab === id ? 'page' : undefined}
          onClick={() => onTab(id)}
          className={`dock-btn relative grid size-10 place-items-center rounded-full transition ${
            tab === id ? 'bg-white text-[#0f1524]' : 'text-muted hover:bg-white/15 hover:text-ink'
          }`}
        >
          <Icon size={17} />
          {id === 'team' && pendingCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-gold text-[9px] font-bold text-[#1a1406]">
              {pendingCount}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}

/** Stack of short-lived notifications in the corner. */
export function Toasts({ toasts }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed top-20 right-3 z-[60] flex w-[min(340px,calc(100vw-24px))] flex-col gap-2 md:top-24">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            className="glass flex items-center gap-3 rounded-2xl bg-[#111a2e]/90 px-4 py-3"
          >
            <span className={`grid size-8 shrink-0 place-items-center rounded-full ${t.tone === 'gold' ? 'medal-earned text-[#1a1406]' : 'glass-inset text-[#a9c1ff]'}`}>
              {t.tone === 'gold' ? <LuZap size={15} /> : <LuSparkles size={15} />}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{t.title}</span>
              {t.text && <span className="block text-xs text-muted">{t.text}</span>}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

const CONFETTI_COLORS = ['#f2c879', '#5b86f0', '#8b7bff', '#4fc3c9', '#f08bb4', '#4ade80'];

/** Celebration when a rep reaches a new player level. */
export function LevelUpModal({ celebration, onClose }) {
  return (
    <Modal open={Boolean(celebration)} onClose={onClose} title="Level up!">
      {celebration && (
        <div className="relative overflow-hidden py-2 text-center">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {Array.from({ length: 28 }, (_, i) => (
              <span
                key={i}
                className="confetti"
                style={{
                  left: `${(i * 37) % 100}%`,
                  background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                  animationDelay: `${(i % 7) * 0.08}s`,
                }}
              />
            ))}
          </div>
          <div className="medal-earned mx-auto grid size-24 place-items-center rounded-full text-4xl font-bold text-[#1a1406]">{celebration.level}</div>
          <h3 className="mt-4 text-xl font-semibold">You reached level {celebration.level}</h3>
          <p className="mt-1 text-sm text-muted">Title unlocked: {celebration.title}. Keep the streak going.</p>
          <Button className="mt-5" onClick={onClose}>
            Keep going
          </Button>
        </div>
      )}
    </Modal>
  );
}
