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
  { id: 'home', label: 'My journey', short: 'Journey', icon: LuHouse, subtitle: 'Your level, your gaps and what to learn next' },
  { id: 'skills', label: 'My skills', short: 'Skills', icon: LuTarget, subtitle: 'Every skill against the target for your role' },
  { id: 'quests', label: 'Quests', short: 'Quests', icon: LuSwords, subtitle: 'Short lessons, quizzes and challenges, best first' },
  { id: 'league', label: 'Leaderboard', short: 'League', icon: LuTrophy, subtitle: 'This week’s league for people and teams' },
  { id: 'team', label: 'Team insights', short: 'Team', icon: LuLayoutDashboard, subtitle: 'For team leads and L&D: gaps, demand and adoption' },
];

/** Left sidebar with labelled navigation on desktop; a bottom tab bar on phones. */
export function Sidebar({ tab, onTab, pendingCount, onReset }) {
  return (
    <>
      <aside className="card fixed inset-y-3 left-3 z-20 hidden w-60 flex-col rounded-3xl p-4 md:flex">
        <div className="flex items-center gap-2.5 px-1">
          <LogoMark size={38} />
          <div>
            <div className="text-xl leading-none font-bold tracking-tight">LevelUp</div>
            <div className="mt-1 text-[11px] text-muted">{company.name}</div>
          </div>
        </div>
        <nav aria-label="Main" className="mt-7 flex flex-col gap-1">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => onTab(id)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] transition ${
                  active ? 'bg-brand-soft font-semibold text-brand' : 'text-muted hover:bg-ink/5 hover:text-ink'
                }`}
              >
                {active && <span className="absolute top-2 bottom-2 -left-4 w-1 rounded-r-full bg-brand" />}
                <Icon size={18} />
                <span className="flex-1">{label}</span>
                {id === 'team' && pendingCount > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-amber text-[11px] font-bold text-[#4a2a00]">{pendingCount}</span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl bg-gradient-to-br from-[#5b3fd6] to-[#8b5cf6] p-4 text-white">
          <LuSparkles size={18} />
          <p className="mt-2 text-sm leading-snug font-medium">Learn a little every day. Small quests add up to big skills.</p>
        </div>
        <div className="mt-3 flex flex-col gap-0.5 text-[13px]">
          <button onClick={onReset} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-muted hover:bg-ink/5 hover:text-ink">
            <LuRotateCcw size={14} /> Reset demo progress
          </button>
          <a href="https://github.com/DiogoS7/LevelUp" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-muted hover:bg-ink/5 hover:text-ink">
            <LuGithub size={14} /> Source code
          </a>
        </div>
      </aside>

      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-ink/10 bg-white/95 px-1 pt-1.5 pb-[max(6px,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        {TABS.map(({ id, short, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => onTab(id)}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1 text-[11px] ${active ? 'font-semibold text-brand' : 'text-muted'}`}
            >
              <span className={`grid h-7 w-12 place-items-center rounded-full ${active ? 'bg-brand-soft' : ''}`}>
                <Icon size={18} />
              </span>
              {short}
              {id === 'team' && pendingCount > 0 && (
                <span className="absolute top-0 right-[22%] grid size-4 place-items-center rounded-full bg-amber text-[9px] font-bold text-[#4a2a00]">{pendingCount}</span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}

/** Page header: title on the left, XP, streak and the "play as" menu on the right. */
export function PageHeader({ rep, onRep, onReset, tab }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    const close = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  const level = playerLevel(rep.xp);
  const current = TABS.find((t) => t.id === tab);

  return (
    <header className="flex items-center gap-3 py-2">
      <div className="flex items-center gap-2.5 md:hidden">
        <LogoMark size={32} />
      </div>
      <div className="mr-auto min-w-0">
        <h1 className="truncate text-xl font-bold tracking-tight sm:text-[26px]">{current?.label}</h1>
        <p className="hidden truncate text-sm text-muted sm:block">{current?.subtitle}</p>
      </div>

      <div className="hidden items-center gap-2 lg:flex">
        <span className="flex items-center gap-1.5 rounded-full border border-[#f5a524]/30 bg-[#fff6e5] px-3 py-1.5 text-sm font-semibold text-gold" title="Total XP">
          <LuZap size={15} /> {rep.xp.toLocaleString('en')} XP
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-[#f0642e]/25 bg-[#fff0ea] px-3 py-1.5 text-sm font-semibold text-flame" title="Learning streak">
          <LuFlame size={15} className={rep.streak ? 'flicker' : ''} /> {rep.streak} day streak
        </span>
      </div>

      <div ref={box} className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="menu"
          className="card flex items-center gap-2 rounded-full py-1 pr-3 pl-1 transition hover:border-brand/30"
        >
          <Avatar id={rep.id} size={34} />
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
              className="card absolute right-0 z-40 mt-2 w-72 rounded-2xl p-2"
            >
              <div className="px-2 pt-1 pb-2 text-xs font-semibold text-muted">Play as (demo)</div>
              <div className="scroll-thin max-h-80 overflow-y-auto">
                {reps.map((r) => (
                  <button
                    key={r.id}
                    role="menuitem"
                    onClick={() => {
                      onRep(r.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left ${r.id === rep.id ? 'bg-brand-soft' : 'hover:bg-ink/5'}`}
                  >
                    <Avatar id={r.id} size={26} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{r.name}</span>
                      <span className="block text-[11px] text-muted">
                        {roles[r.role].label} · {teamById[r.team].name}
                      </span>
                    </span>
                    {r.id === rep.id && <LuCheck size={15} className="text-brand" />}
                  </button>
                ))}
              </div>
              <div className="mt-1 border-t border-ink/10 pt-1 md:hidden">
                <button
                  role="menuitem"
                  onClick={() => {
                    onReset();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-sm text-muted hover:bg-ink/5 hover:text-ink"
                >
                  <LuRotateCcw size={15} /> Reset demo progress
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

/** Stack of short-lived notifications. */
export function Toasts({ toasts }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed right-3 bottom-20 z-[60] flex w-[min(340px,calc(100vw-24px))] flex-col gap-2 md:top-5 md:bottom-auto">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="card flex items-center gap-3 rounded-2xl px-4 py-3"
          >
            <span className={`hex grid size-9 shrink-0 place-items-center ${t.tone === 'gold' ? 'medal-earned' : 'bg-brand text-white'}`}>
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

const CONFETTI_COLORS = ['#f5a524', '#5b3fd6', '#8b5cf6', '#0e9a9a', '#e0457b', '#15924a'];

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
          <div className="hex medal-earned mx-auto grid size-24 place-items-center text-4xl font-bold">{celebration.level}</div>
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
