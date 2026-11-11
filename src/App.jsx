import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TopNav, Footer, WelcomeGuide, Toasts, LevelUpModal, TABS, tabsFor, homeFor } from './components/Chrome.jsx';
import QuestPlayer from './components/QuestPlayer.jsx';
import SkillDetail from './components/SkillDetail.jsx';
import Home from './views/Home.jsx';
import Skills from './views/Skills.jsx';
import Quests from './views/Quests.jsx';
import Leaderboard from './views/Leaderboard.jsx';
import Team from './views/Team.jsx';
import Studio from './views/Studio.jsx';
import { createCourse, addCourse, updateCourse, decide, approveCourse, sendBackCourse } from './lib/courses.js';
import { reps as baseReps, DEFAULT_REP, initialPending, company, skillById, skills, personById, isStaff } from './data/academy.js';
import {
  emptyState,
  findQuest,
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
const today = () => new Date().toISOString().slice(0, 10);
const SEEN_KEY = 'levelup-welcome-seen';

function seenWelcome() {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

// Browser storage can be missing or blocked (private mode, embedded frames), so every access is guarded.
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.game?.completed && saved.game.pending && saved.game.perfect) {
      // Progress saved by v1 has no courses yet.
      return { ...saved, game: { ...saved.game, courses: saved.game.courses ?? [] } };
    }
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
  return TABS.some((t) => t.id === id) ? id : null;
};

export default function App() {
  const saved = useRef(load()).current;
  const [repId, setRepId] = useState(saved?.repId && personById[saved.repId] ? saved.repId : DEFAULT_REP);
  const [game, setGame] = useState(saved?.game ?? emptyState(initialPending));
  const [requestedTab, setTab] = useState(tabFromHash);
  const [activeQuest, setActiveQuest] = useState(null);
  const [openSkill, setOpenSkill] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [celebration, setCelebration] = useState(null);
  const [guide, setGuide] = useState(() => !seenWelcome());

  const closeGuide = useCallback(() => {
    setGuide(false);
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* fine: the guide shows again next visit */
    }
  }, []);

  useEffect(() => save({ repId, game }), [repId, game]);
  useEffect(() => {
    const onHash = () => setTab(tabFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const staffView = isStaff(repId);
  // A page this viewer can't open (e.g. the Course studio for a rep) falls back to their first page.
  const tab = tabsFor(staffView).some((t) => t.id === requestedTab) ? requestedTab : homeFor(staffView);
  useEffect(() => {
    if (window.location.hash !== `#${tab}`) window.history.replaceState(null, '', `#${tab}`);
  }, [tab]);

  const reps = useMemo(() => applyAll(baseReps, game), [game]);
  const viewer = staffView ? personById[repId] : reps.find((r) => r.id === repId);
  const rep = staffView ? null : viewer;
  const badges = useMemo(() => (rep ? badgesFor(rep, game) : []), [rep, game]);
  const league = individualLeague(reps);
  const rank = rep ? league.find((row) => row.rep.id === repId).rank : null;

  const toast = useCallback((title, text, tone = 'gold') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((list) => [...list, { id, title, text, tone }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3800);
  }, []);

  // Bumped on every menu click, so choosing the page you're on starts it fresh (e.g. back to the studio list).
  const [visit, setVisit] = useState(0);
  const goTo = (id) => {
    setTab(id);
    setVisit((v) => v + 1);
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
      toast('Sent to your team lead', `They will give "${quest.title}" a quick look.`, 'blue');
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
    toast('Approved', `${before.name} earns ${findQuest(game, questId).xp} XP for "${findQuest(game, questId).title}".`, 'gold');
    announce(before, after, next);
  };

  const sendBack = (forRep, questId) => {
    setGame(returnQuest(game, forRep, questId));
    toast('Sent back with feedback', `${baseReps.find((r) => r.id === forRep).name} can try "${findQuest(game, questId).title}" again.`, 'blue');
  };

  const reset = () => {
    setGame(emptyState(initialPending));
    toast('Started again', 'All demo progress in this browser was cleared.', 'blue');
  };

  const changeCourse = (id, fn) => setGame((g) => updateCourse(g, id, fn(g.courses.find((c) => c.id === id))));

  /** Save a freshly drafted course and return its id. */
  const createDraft = (request, draft) => {
    const course = createCourse(game.courses, { ...request, draft, by: viewer.name, date: today() });
    setGame((g) => addCourse(g, course));
    toast('Draft saved', `“${course.title}” is waiting for a review.`, 'blue');
    return course.id;
  };

  const startQuest = (quest) => {
    setOpenSkill(null);
    setActiveQuest(quest);
  };

  let view;
  if (tab === 'skills') view = <Skills rep={rep} onOpenSkill={setOpenSkill} />;
  else if (tab === 'quests') view = <Quests rep={rep} state={game} onStart={startQuest} />;
  else if (tab === 'league') view = <Leaderboard reps={reps} currentId={repId} />;
  else if (tab === 'studio') view = (
      <Studio
        viewer={viewer}
        state={game}
        onCreate={createDraft}
        onDecide={(id, key, d) => changeCourse(id, (c) => decide(c, key, d))}
        onApprove={(id) => {
          changeCourse(id, (c) => approveCourse(c, viewer.name, today()));
          toast('Course approved', 'It is live in Learn for every rep, tagged New.', 'gold');
        }}
        onSendBack={(id, note) => {
          changeCourse(id, (c) => sendBackCourse(c, note, viewer.name));
          toast('Kept as a draft', 'Your note is saved with the course.', 'blue');
        }}
      />
    );
  else if (tab === 'team')
    view = <Team reps={reps} state={game} onApprove={approve} onReturn={sendBack} onNudge={(r) => toast('Reminder sent', `${r.name} got a friendly nudge and a 5-minute quest.`, 'blue')} />;
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
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2">
        Skip to content
      </a>
      <TopNav tab={tab} onTab={goTo} rep={viewer} staffView={staffView} onRep={setRepId} onReset={reset} onHelp={() => setGuide(true)} pendingCount={game.pending.length} />
      <main id="main" className="mx-auto max-w-[1200px] px-4 pt-6 pb-4 sm:px-6" key={`${tab}-${repId}-${visit}`}>
        {view}
      </main>
      <div className="pb-20 md:pb-0">
        <Footer onReset={reset} />
      </div>
      <QuestPlayer quest={activeQuest} onClose={() => setActiveQuest(null)} onFinish={finishQuest} />
      {rep && <SkillDetail skillId={openSkill} rep={rep} reps={reps} state={game} onClose={() => setOpenSkill(null)} onStart={startQuest} />}
      <LevelUpModal celebration={celebration} onClose={() => setCelebration(null)} />
      <WelcomeGuide open={guide} onClose={closeGuide} viewer={viewer} staffView={staffView} />
      <Toasts toasts={toasts} />
    </>
  );
}
