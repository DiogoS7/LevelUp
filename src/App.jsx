import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Sidebar, PageHeader, Toasts, LevelUpModal, TABS } from './components/Chrome.jsx';
import QuestPlayer from './components/QuestPlayer.jsx';
import SkillDetail from './components/SkillDetail.jsx';
import Home from './views/Home.jsx';
import Skills from './views/Skills.jsx';
import Quests from './views/Quests.jsx';
import Leaderboard from './views/Leaderboard.jsx';
import Team from './views/Team.jsx';
import { reps as baseReps, DEFAULT_REP, initialPending, company, questById, skillById, skills } from './data/academy.js';
import {
  emptyState,
  completeQuest,
  approveQuest,
  returnQuest,
  applyAll,
  badgesFor,
  individualLeague,
  playerLevel,
  skillLevel,
} from './lib/game.js';

const STORAGE_KEY = 'levelup:v1';

// Browser storage can be missing or blocked (private mode, embedded frames), so every access is guarded.
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.game?.completed && saved.game.pending && saved.game.perfect) return saved;
  } catch {
    /* fall through to defaults */
  }
  return null;
}
function save(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* progress just won't survive a reload */
  }
}

const tabFromHash = () => {
  const id = window.location.hash.replace('#', '');
  return TABS.some((t) => t.id === id) ? id : 'home';
};

export default function App() {
  const saved = useRef(load()).current;
  const [repId, setRepId] = useState(saved?.repId && baseReps.some((r) => r.id === saved.repId) ? saved.repId : DEFAULT_REP);
  const [game, setGame] = useState(saved?.game ?? emptyState(initialPending));
  const [tab, setTab] = useState(tabFromHash);
  const [activeQuest, setActiveQuest] = useState(null);
  const [openSkill, setOpenSkill] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [celebration, setCelebration] = useState(null);

  useEffect(() => save({ repId, game }), [repId, game]);
  useEffect(() => {
    const onHash = () => setTab(tabFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const reps = useMemo(() => applyAll(baseReps, game), [game]);
  const rep = reps.find((r) => r.id === repId);
  const badges = useMemo(() => badgesFor(rep, game), [rep, game]);
  const league = individualLeague(reps);
  const rank = league.find((row) => row.rep.id === repId).rank;

  const toast = useCallback((title, text, tone = 'gold') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((list) => [...list, { id, title, text, tone }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3800);
  }, []);

  const goTo = (id) => {
    setTab(id);
    window.history.replaceState(null, '', `#${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** Compare a rep before and after an update and announce what changed. */
  const announce = (before, after, nextGame) => {
    const gained = after.xp - before.xp;
    if (gained > 0 && after.id === repId) {
      const oldLevel = playerLevel(before.xp);
      const newLevel = playerLevel(after.xp);
      if (newLevel.level > oldLevel.level) setCelebration({ level: newLevel.level, title: newLevel.title });
    }
    for (const s of skills) {
      const was = skillLevel(before.skills[s.id]);
      const now = skillLevel(after.skills[s.id]);
      if (now > was) toast(`${skillById[s.id].name} → level ${now}`, after.id === repId ? 'Skill level up!' : `${after.name} levelled up`, 'blue');
    }
    if (after.id === repId) {
      const had = new Set(badgesFor(before, game).filter((b) => b.earned).map((b) => b.id));
      badgesFor(after, nextGame)
        .filter((b) => b.earned && !had.has(b.id))
        .forEach((b) => toast(`Badge unlocked: ${b.name}`, b.hint, 'gold'));
    }
  };

  const finishQuest = (result) => {
    const quest = activeQuest;
    const { state: next, outcome } = completeQuest(game, repId, quest.id, result, company.asOf);
    setActiveQuest(null);
    if (outcome === 'submitted') {
      setGame(next);
      toast('Sent for review', `Your team lead will review "${quest.title}".`, 'blue');
      return;
    }
    if (outcome !== 'completed') return;
    const after = applyAll([baseReps.find((r) => r.id === repId)], next)[0];
    const earnedXp = next.completed[repId].at(-1).xp;
    setGame(next);
    toast(`+${earnedXp} XP`, quest.title, 'gold');
    announce(rep, after, next);
  };

  const approve = (forRep, questId) => {
    const next = approveQuest(game, forRep, questId);
    const before = reps.find((r) => r.id === forRep);
    const after = applyAll([baseReps.find((r) => r.id === forRep)], next)[0];
    setGame(next);
    toast('Approved', `${before.name} earns ${questById[questId].xp} XP for "${questById[questId].title}".`, 'gold');
    announce(before, after, next);
  };

  const sendBack = (forRep, questId) => {
    setGame(returnQuest(game, forRep, questId));
    toast('Sent back with feedback', `${baseReps.find((r) => r.id === forRep).name} can try "${questById[questId].title}" again.`, 'blue');
  };

  const reset = () => {
    setGame(emptyState(initialPending));
    toast('Demo reset', 'All progress from this browser was cleared.', 'blue');
  };

  const startQuest = (quest) => {
    setOpenSkill(null);
    setActiveQuest(quest);
  };

  let view;
  if (tab === 'skills') view = <Skills rep={rep} onOpenSkill={setOpenSkill} />;
  else if (tab === 'quests') view = <Quests rep={rep} state={game} onStart={startQuest} />;
  else if (tab === 'league') view = <Leaderboard reps={reps} currentId={repId} />;
  else if (tab === 'team')
    view = <Team reps={reps} state={game} onApprove={approve} onReturn={sendBack} onNudge={(r) => toast('Nudge sent', `${r.name} got a friendly reminder and a 5-minute quest.`, 'blue')} />;
  else
    view = (
      <Home
        rep={rep}
        state={game}
        rank={rank}
        leagueSize={league.length}
        badges={badges}
        onStart={startQuest}
        onTab={goTo}
        onOpenSkill={setOpenSkill}
      />
    );

  return (
    <>
      <div className="backdrop" aria-hidden="true" />
      <Sidebar tab={tab} onTab={goTo} pendingCount={game.pending.length} onReset={reset} />
      <div className="relative z-10 px-3 pt-2 pb-24 sm:px-5 md:ml-64 md:pb-10 md:pl-4 lg:pr-6">
        <div className="mx-auto max-w-[1280px]">
          <PageHeader rep={rep} onRep={setRepId} onReset={reset} tab={tab} />
          <main className="mt-4 min-w-0" key={`${tab}-${repId}`}>
            {view}
            <footer className="mt-8 text-center text-xs text-faint">
              LevelUp · a portfolio project by Diogo Santos · {company.name} and all data are fictional
            </footer>
          </main>
        </div>
      </div>
      <QuestPlayer quest={activeQuest} onClose={() => setActiveQuest(null)} onFinish={finishQuest} />
      <SkillDetail skillId={openSkill} rep={rep} reps={reps} state={game} onClose={() => setOpenSkill(null)} onStart={startQuest} />
      <LevelUpModal celebration={celebration} onClose={() => setCelebration(null)} />
      <Toasts toasts={toasts} />
    </>
  );
}
