import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LuHouse,
  LuTarget,
  LuBookOpen,
  LuTrophy,
  LuUsers,
  LuChevronDown,
  LuRotateCcw,
  LuGithub,
  LuZap,
  LuCheck,
  LuSparkles,
  LuMoon,
  LuSun,
  LuCircleHelp,
  LuMedal,
  LuArrowRight,
} from 'react-icons/lu';
import { LogoMark, Avatar, Modal, Button } from './ui.jsx';
import { reps, teamById, roles, company } from '../data/academy.js';
import { playerLevel } from '../lib/game.js';

export const TABS = [
  { id: 'home', label: 'Home', icon: LuHouse },
  { id: 'skills', label: 'My skills', icon: LuTarget },
  { id: 'quests', label: 'Learn', icon: LuBookOpen },
  { id: 'league', label: 'Leaderboard', icon: LuTrophy },
  { id: 'team', label: 'For managers', icon: LuUsers },
];

/** Light/dark toggle. The choice is remembered; until then the app follows the device. */
function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    const set = document.documentElement.dataset.theme;
    return set ? set === 'dark' : window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  });
  const toggle = () => {
    const next = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('levelup-theme', next);
    } catch {
      /* storage blocked */
    }
    setDark(!dark);
  };
  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className="grid size-9 place-items-center rounded-xl border border-line bg-surface text-muted hover:text-ink"
    >
      {dark ? <LuSun size={17} /> : <LuMoon size={17} />}
    </button>
  );
}

/** "Viewing as" menu: pick any of the demo reps. */
function RepMenu({ rep, onRep, onReset }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    const close = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  const level = playerLevel(rep.xp);
  return (
    <div ref={box} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-xl border border-line bg-surface py-1 pr-2.5 pl-1 hover:bg-surface-2"
      >
        <Avatar id={rep.id} size={28} />
        <span className="hidden text-left leading-tight lg:block">
          <span className="block text-[13px] font-semibold">{rep.name}</span>
          <span className="block text-[11px] text-faint">Level {level.level}</span>
        </span>
        <LuChevronDown size={15} className="text-faint" />
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
            <div className="px-2 pt-1 pb-2 text-xs text-faint">
              <b className="text-muted">Try it as anyone.</b> Pick a person to see LevelUp through their eyes.
            </div>
            <div className="scroll-thin max-h-80 overflow-y-auto">
              {reps.map((r) => (
                <button
                  key={r.id}
                  role="menuitem"
                  onClick={() => {
                    onRep(r.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left ${r.id === rep.id ? 'bg-brand-soft' : 'hover:bg-surface-2'}`}
                >
                  <Avatar id={r.id} size={26} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{r.name}</span>
                    <span className="block text-[11px] text-faint">
                      {roles[r.role].label} · {teamById[r.team].name}
                    </span>
                  </span>
                  {r.id === rep.id && <LuCheck size={15} className="text-brand" />}
                </button>
              ))}
            </div>
            <div className="mt-1 border-t border-line pt-1">
              <button
                role="menuitem"
                onClick={() => {
                  onReset();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-sm text-muted hover:bg-surface-2 hover:text-ink"
              >
                <LuRotateCcw size={15} /> Start the demo again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Sticky top bar like Ledger's: logo, plain-word menu, help, theme and the person you're viewing as. */
export function TopNav({ tab, onTab, rep, onRep, onReset, onHelp, pendingCount }) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-3 px-4 sm:px-6">
          <button onClick={() => onTab('home')} className="mr-auto flex items-center gap-2 md:mr-4" aria-label="LevelUp home">
            <LogoMark size={32} />
            <span className="text-lg font-extrabold tracking-tight">LevelUp</span>
          </button>
          <nav aria-label="Main" className="mr-auto hidden items-center gap-1 md:flex">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => onTab(id)}
                aria-current={tab === id ? 'page' : undefined}
                className={`relative rounded-lg px-3 py-2 text-sm transition ${tab === id ? 'bg-brand-soft font-semibold text-brand' : 'text-muted hover:text-ink'}`}
              >
                {label}
                {id === 'team' && pendingCount > 0 && (
                  <span className="ml-1.5 inline-grid size-[18px] place-items-center rounded-full bg-amber text-[10px] font-bold text-[#4a2a00]">{pendingCount}</span>
                )}
              </button>
            ))}
          </nav>
          <button onClick={onHelp} className="hidden items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm text-muted hover:text-ink sm:flex">
            <LuCircleHelp size={17} /> How it works
          </button>
          <button onClick={onHelp} aria-label="How it works" className="grid size-9 place-items-center rounded-xl text-muted sm:hidden">
            <LuCircleHelp size={18} />
          </button>
          <ThemeToggle />
          <RepMenu rep={rep} onRep={onRep} onReset={onReset} />
        </div>
      </header>

      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface/95 px-1 pt-1.5 pb-[max(6px,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => onTab(id)}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1 text-[11px] ${active ? 'font-semibold text-brand' : 'text-faint'}`}
            >
              <span className={`grid h-7 w-12 place-items-center rounded-full ${active ? 'bg-brand-soft' : ''}`}>
                <Icon size={18} />
              </span>
              {id === 'team' ? 'Managers' : label}
              {id === 'team' && pendingCount > 0 && (
                <span className="absolute top-0 right-[18%] grid size-4 place-items-center rounded-full bg-amber text-[9px] font-bold text-[#4a2a00]">{pendingCount}</span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}

export function Footer({ onReset }) {
  return (
    <footer className="mx-auto mt-14 flex max-w-[1200px] flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-6 text-[13px] text-faint sm:px-6">
      <span>
        LevelUp · a portfolio project by Diogo Santos. {company.name} and everyone in it are made up.
      </span>
      <span className="flex items-center gap-4">
        <button onClick={onReset} className="flex items-center gap-1.5 hover:text-ink">
          <LuRotateCcw size={14} /> Start again
        </button>
        <a href="https://github.com/DiogoS7/LevelUp" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-ink">
          <LuGithub size={14} /> Code
        </a>
      </span>
    </footer>
  );
}

const GUIDE = [
  {
    icon: LuTarget,
    title: 'See what to learn',
    text: 'Every skill has a level from 0 to 5, and your role needs a certain level. LevelUp shows where you fall short, starting with what the company needs most right now.',
  },
  {
    icon: LuBookOpen,
    title: 'Learn in a few minutes',
    text: 'Quests are short: a 5-minute lesson, a 3-question quiz or a quick practice task. Each one makes a skill stronger.',
  },
  {
    icon: LuMedal,
    title: 'Earn points and badges',
    text: 'You get XP (points) for every quest, keep a streak by learning every day, win badges and climb the weekly leaderboard.',
  },
  {
    icon: LuUsers,
    title: 'Managers see the big picture',
    text: 'Team leads see which skills the team is missing, who is ready for the next launch and who could use a nudge.',
  },
];

/** First-visit guide. Can be reopened any time from "How it works". */
export function WelcomeGuide({ open, onClose, firstName }) {
  return (
    <Modal open={open} onClose={onClose} title="Welcome to LevelUp" wide>
      <p className="-mt-2 text-[15px] text-muted">
        LevelUp helps a sales team learn the skills that matter, a few minutes at a time, and makes it feel like a game. Here is how it works:
      </p>
      <ol className="mt-5 grid gap-3 sm:grid-cols-2">
        {GUIDE.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="card-inset rounded-2xl p-4">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand">
                <Icon size={16} />
              </span>
              <span className="text-[13px] font-semibold text-faint">Step {i + 1}</span>
            </div>
            <h3 className="mt-2.5 font-bold">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-[13px] text-faint">
        This is a demo. You are viewing it as {firstName}, a sales rep at the made-up {company.name}. Use the menu in the top right to switch person. Your progress stays in this browser only.
      </p>
      <div className="mt-5 flex justify-end">
        <Button onClick={onClose}>
          Let&apos;s start <LuArrowRight size={15} />
        </Button>
      </div>
    </Modal>
  );
}

/** Stack of short-lived notifications. */
export function Toasts({ toasts }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed right-3 bottom-20 z-[60] flex w-[min(340px,calc(100vw-24px))] flex-col gap-2 md:top-20 md:bottom-auto">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="card flex items-center gap-3 rounded-2xl px-4 py-3"
          >
            <span className={`grid size-9 shrink-0 place-items-center rounded-full ${t.tone === 'gold' ? 'medal-earned' : 'bg-brand text-on-brand'}`}>
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

const CONFETTI_COLORS = ['#f5a524', '#6d4ae6', '#9b84ff', '#0e8f8f', '#e0457b', '#11804a'];

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
          <div className="medal-earned mx-auto grid size-24 place-items-center rounded-full text-4xl font-extrabold">{celebration.level}</div>
          <h3 className="mt-4 text-xl font-bold">You reached level {celebration.level}</h3>
          <p className="mt-1 text-sm text-muted">New title: {celebration.title}. Keep learning a little every day.</p>
          <Button className="mt-5" onClick={onClose}>
            Keep going
          </Button>
        </div>
      )}
    </Modal>
  );
}
