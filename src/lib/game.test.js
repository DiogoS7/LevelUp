import { describe, it, expect } from 'vitest';
import { reps, quests, teamChallenge, initialPending, skillById, adoptionHistory } from '../data/academy.js';
import {
  skillLevel,
  levelProgress,
  priorityScore,
  skillProfile,
  topGaps,
  isLaunchReady,
  xpForLevel,
  playerLevel,
  emptyState,
  questStatus,
  rewardFor,
  completeQuest,
  approveQuest,
  returnQuest,
  applyProgress,
  recommendQuests,
  badgesFor,
  individualLeague,
  teamLeague,
  skillInsights,
  launchReadiness,
  teamFindings,
  adoption,
  challengeProgress,
  toCsv,
  skillsMatrixCsv,
} from './game.js';

const rep = (overrides = {}) => ({
  id: 'XX', name: 'Test Rep', team: 'lis-n', role: 'rep', xp: 0, weeklyXp: 0, streak: 0, activeDaysAgo: 0,
  skills: Object.fromEntries(Object.keys(skillById).map((id) => [id, 300])),
  ...overrides,
});
const marta = reps.find((r) => r.id === 'MR');
const TODAY = '2026-11-04';

describe('skill levels', () => {
  it('turns points into a level from 0 to 5', () => {
    expect(skillLevel(0)).toBe(0);
    expect(skillLevel(99)).toBe(0);
    expect(skillLevel(100)).toBe(1);
    expect(skillLevel(499)).toBe(4);
    expect(skillLevel(900)).toBe(5);
    expect(skillLevel(-20)).toBe(0);
  });

  it('reports progress inside the current level', () => {
    expect(levelProgress(250)).toBeCloseTo(0.5);
    expect(levelProgress(500)).toBe(1);
  });

  it('ranks gaps in critical and mandatory skills higher', () => {
    expect(priorityScore({ demand: 3 }, 2)).toBe(6);
    expect(priorityScore({ demand: 1, mandatory: true }, 1)).toBe(4);
    expect(priorityScore({ demand: 3 }, 0)).toBe(0);
  });

  it('builds a profile with a gap per skill', () => {
    const profile = skillProfile(rep({ skills: { ...rep().skills, 'sci-lumeva': 120 } }));
    const lumeva = profile.find((r) => r.skill.id === 'sci-lumeva');
    expect(lumeva.level).toBe(1);
    expect(lumeva.target).toBe(3);
    expect(lumeva.gap).toBe(2);
  });

  it('puts the most urgent gap first', () => {
    const gaps = topGaps(marta);
    expect(gaps[0].skill.id).toBe('sci-lumeva');
    expect(gaps.every((g) => g.gap > 0)).toBe(true);
  });

  it('checks launch readiness against every launch skill', () => {
    expect(isLaunchReady(rep())).toBe(true);
    expect(isLaunchReady(rep({ skills: { ...rep().skills, 'eng-objection': 290 } }))).toBe(false);
  });
});

describe('player levels', () => {
  it('needs 150 XP more for each level', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(150);
    expect(xpForLevel(3)).toBe(450);
  });

  it('works out level, title and progress from total XP', () => {
    expect(playerLevel(0).level).toBe(1);
    expect(playerLevel(149).level).toBe(1);
    const p = playerLevel(600);
    expect(p.level).toBe(3);
    expect(p.title).toBe('Explorer');
    expect(p.xpIntoLevel).toBe(150);
    expect(p.xpToNext).toBe(300);
    expect(p.progress).toBeCloseTo(1 / 3);
  });
});

describe('quests', () => {
  const quiz = quests.find((q) => q.id === 'Q-LUM-2');
  const lesson = quests.find((q) => q.id === 'Q-LUM-1');
  const roleplay = quests.find((q) => q.id === 'Q-LUM-3');

  it('scales quiz rewards with the score and adds a perfect bonus', () => {
    expect(rewardFor(quiz, { score: 3, total: 3 })).toEqual({ xp: 80, points: 60 });
    expect(rewardFor(quiz, { score: 2, total: 3 })).toEqual({ xp: 40, points: 40 });
    expect(rewardFor(lesson)).toEqual({ xp: 40, points: 40 });
  });

  it('completes a lesson straight away', () => {
    const { state, outcome } = completeQuest(emptyState(), 'MR', lesson.id, null, TODAY);
    expect(outcome).toBe('completed');
    expect(questStatus(state, 'MR', lesson.id)).toBe('done');
  });

  it('does not complete a failed quiz', () => {
    const { state, outcome } = completeQuest(emptyState(), 'MR', quiz.id, { score: 1, total: 3 }, TODAY);
    expect(outcome).toBe('failed');
    expect(questStatus(state, 'MR', quiz.id)).toBe('open');
  });

  it('counts perfect quizzes for the Quiz ace badge', () => {
    const { state } = completeQuest(emptyState(), 'MR', quiz.id, { score: 3, total: 3 }, TODAY);
    expect(state.perfect.MR).toBe(1);
  });

  it('sends role-plays to the team lead, who can approve or return them', () => {
    const submitted = completeQuest(emptyState(), 'MR', roleplay.id, null, TODAY);
    expect(submitted.outcome).toBe('submitted');
    expect(questStatus(submitted.state, 'MR', roleplay.id)).toBe('pending');

    const approved = approveQuest(submitted.state, 'MR', roleplay.id);
    expect(questStatus(approved, 'MR', roleplay.id)).toBe('done');
    expect(approved.pending).toHaveLength(0);

    const returned = returnQuest(submitted.state, 'MR', roleplay.id);
    expect(questStatus(returned, 'MR', roleplay.id)).toBe('open');
  });

  it('ignores a quest that is already done', () => {
    const first = completeQuest(emptyState(), 'MR', lesson.id, null, TODAY);
    expect(completeQuest(first.state, 'MR', lesson.id, null, TODAY).outcome).toBe('already');
  });
});

describe('progress', () => {
  it('adds XP and skill points from completed quests', () => {
    const { state } = completeQuest(emptyState(), 'MR', 'Q-LUM-1', null, TODAY);
    const after = applyProgress(marta, state);
    expect(after.xp).toBe(marta.xp + 40);
    expect(after.weeklyXp).toBe(marta.weeklyXp + 40);
    expect(after.skills['sci-lumeva']).toBe(marta.skills['sci-lumeva'] + 40);
  });

  it('caps skill points at the expert level', () => {
    const r = rep({ skills: { ...rep().skills, 'sci-lumeva': 480 } });
    const { state } = completeQuest(emptyState(), 'XX', 'Q-LUM-1', null, TODAY);
    expect(applyProgress(r, state).skills['sci-lumeva']).toBe(500);
  });

  it('continues a streak from yesterday and restarts an old one', () => {
    const { state } = completeQuest(emptyState(), 'XX', 'Q-LUM-1', null, TODAY);
    expect(applyProgress(rep({ streak: 4, activeDaysAgo: 1 }), state).streak).toBe(5);
    expect(applyProgress(rep({ streak: 4, activeDaysAgo: 5 }), state).streak).toBe(1);
    expect(applyProgress(rep({ streak: 4, activeDaysAgo: 0 }), state).streak).toBe(4);
  });

  it('leaves a rep unchanged when nothing was completed', () => {
    expect(applyProgress(marta, emptyState())).toBe(marta);
  });
});

describe('recommendations', () => {
  it('suggests quests for the biggest important gap first', () => {
    const [first] = recommendQuests(marta, emptyState());
    expect(first.quest.skill).toBe('sci-lumeva');
    expect(first.reason).toContain('Lumeva launch knowledge');
  });

  it('skips quests that are done or waiting for approval', () => {
    let state = completeQuest(emptyState(), 'MR', 'Q-LUM-1', null, TODAY).state;
    state = completeQuest(state, 'MR', 'Q-LUM-3', null, TODAY).state;
    const ids = recommendQuests(marta, state, 50).map((r) => r.quest.id);
    expect(ids).not.toContain('Q-LUM-1');
    expect(ids).not.toContain('Q-LUM-3');
  });
});

describe('badges', () => {
  it('awards badges from the rep and the session', () => {
    const { state } = completeQuest(emptyState(), 'MR', 'Q-LUM-2', { score: 3, total: 3 }, TODAY);
    const earned = badgesFor(applyProgress(marta, state), state).filter((b) => b.earned).map((b) => b.id);
    expect(earned).toContain('first-steps');
    expect(earned).toContain('quiz-ace');
    expect(earned).not.toContain('launch-ready');
  });
});

describe('leaderboards', () => {
  it('ranks people by weekly XP', () => {
    const league = individualLeague(reps);
    expect(league[0].rep.id).toBe('AL');
    expect(league[0].rank).toBe(1);
    expect(league).toHaveLength(reps.length);
  });

  it('ranks teams by average XP per person', () => {
    const league = teamLeague([
      rep({ id: 'A', team: 'lis-n', weeklyXp: 300 }),
      rep({ id: 'B', team: 'lis-n', weeklyXp: 100 }),
      rep({ id: 'C', team: 'porto', weeklyXp: 250 }),
    ]);
    expect(league[0].team.id).toBe('porto');
    expect(league[0].average).toBe(250);
    expect(league[1].average).toBe(200);
  });
});

describe('team insights', () => {
  it('flags in-demand skills most people lack as critical', () => {
    const insights = skillInsights(reps);
    const lumeva = insights.find((i) => i.skill.id === 'sci-lumeva');
    expect(lumeva.status).toBe('Act now');
    expect(insights[0].urgency).toBeGreaterThanOrEqual(insights[insights.length - 1].urgency);
  });

  it('measures launch readiness as a share of reps', () => {
    expect(launchReadiness([rep(), rep({ skills: { ...rep().skills, 'sci-lumeva': 0 } })])).toBeCloseTo(0.5);
    expect(launchReadiness([])).toBe(0);
  });

  it('measures adoption from activity in the last 7 days', () => {
    const a = adoption([rep({ activeDaysAgo: 0, streak: 4 }), rep({ activeDaysAgo: 9, streak: 0 })], emptyState(), 10);
    expect(a.activeRate).toBeCloseTo(0.5);
    expect(a.avgStreak).toBe(2);
    expect(a.questsThisWeek).toBe(10);
    expect(a.inactive).toHaveLength(1);
  });

  it('writes plain-language findings for managers', () => {
    const findings = teamFindings(reps, emptyState(), adoptionHistory);
    expect(findings).toHaveLength(4);
    expect(findings[0].title).toBe('Lumeva launch knowledge is the biggest gap');
    expect(findings[1].title).toContain('ready for the Lumeva launch');
    expect(findings[3].text).toContain('Pedro');
    expect(teamFindings([], emptyState())).toEqual([]);
  });

  it('counts launch quests towards the team challenge', () => {
    const { state } = completeQuest(emptyState(initialPending), 'MR', 'Q-LUM-1', null, TODAY);
    expect(challengeProgress(teamChallenge, state).done).toBe(teamChallenge.baseDone + 1);
  });
});

describe('csv export', () => {
  it('quotes cells that contain commas or quotes', () => {
    expect(toCsv(['a', 'b'], [['x, y', 'say "hi"']])).toBe('a,b\n"x, y","say ""hi"""');
  });

  it('exports one row per rep with level/target per skill', () => {
    const lines = skillsMatrixCsv(reps).split('\n');
    expect(lines).toHaveLength(reps.length + 1);
    expect(lines[1]).toContain('Marta Ribeiro');
    expect(lines[1]).toContain('1/3');
  });
});
