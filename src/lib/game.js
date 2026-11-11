/**
 * LevelUp game rules: skill levels, gaps, XP levels, recommendations, badges and team insights.
 * Every function here is pure (data in, data out), so the rules are unit-tested without the UI.
 */
import {
  LEVEL_NAMES,
  POINTS_PER_LEVEL,
  MAX_SKILL_LEVEL,
  LAUNCH_SKILLS,
  QUEST_TYPES,
  roles,
  skills as ALL_SKILLS,
  skillById,
  questById,
  quests as ALL_QUESTS,
  teams as ALL_TEAMS,
} from '../data/academy.js';

const MAX_POINTS = MAX_SKILL_LEVEL * POINTS_PER_LEVEL;
export const PASS_RATIO = 2 / 3;
export const PERFECT_QUIZ_BONUS = 20;

/* ------------------------------------------------------------------ skills */

export function skillLevel(points) {
  return Math.min(MAX_SKILL_LEVEL, Math.floor(Math.max(0, points) / POINTS_PER_LEVEL));
}

/** Progress (0–1) towards the next skill level. A maxed skill reports 1. */
export function levelProgress(points) {
  if (points >= MAX_POINTS) return 1;
  return (Math.max(0, points) % POINTS_PER_LEVEL) / POINTS_PER_LEVEL;
}

export const levelName = (level) => LEVEL_NAMES[level] ?? LEVEL_NAMES[0];

export function targetFor(rep, skillId) {
  return roles[rep.role]?.targets[skillId] ?? 0;
}

/** How much a gap matters: bigger gaps in in-demand or mandatory skills come first. */
export function priorityScore(skill, gap) {
  if (gap <= 0) return 0;
  return gap * skill.demand + (skill.mandatory ? 3 : 0);
}

/** One row per skill for a rep: level, target, gap and priority. */
export function skillProfile(rep) {
  return ALL_SKILLS.map((skill) => {
    const points = rep.skills[skill.id] ?? 0;
    const level = skillLevel(points);
    const target = targetFor(rep, skill.id);
    const gap = Math.max(0, target - level);
    return { skill, points, level, target, gap, progress: levelProgress(points), priority: priorityScore(skill, gap) };
  });
}

/** Gaps only, most important first. */
export function topGaps(rep, limit = Infinity) {
  return skillProfile(rep)
    .filter((row) => row.gap > 0)
    .sort((a, b) => b.priority - a.priority || b.gap - a.gap || a.skill.name.localeCompare(b.skill.name))
    .slice(0, limit);
}

/** Share of a rep's skills that meet the role target (0–1). */
export function readiness(rep) {
  const profile = skillProfile(rep);
  return profile.filter((r) => r.gap === 0).length / profile.length;
}

export function isLaunchReady(rep) {
  return LAUNCH_SKILLS.every((id) => skillLevel(rep.skills[id] ?? 0) >= targetFor(rep, id));
}

/* -------------------------------------------------------------- XP levels */

const TITLES = ['Rookie', 'Rookie', 'Explorer', 'Explorer', 'Specialist', 'Specialist', 'Expert', 'Expert', 'Master'];

/** Total XP needed to reach a player level. Level 1 starts at 0; each level needs 150 XP more than the last. */
export function xpForLevel(level) {
  return 75 * (level - 1) * level;
}

export function playerLevel(xp) {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level += 1;
  const start = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return {
    level,
    title: TITLES[Math.min(level, TITLES.length) - 1],
    xpIntoLevel: xp - start,
    xpForNext: next - start,
    xpToNext: next - xp,
    progress: (xp - start) / (next - start),
  };
}

/* -------------------------------------------------------- game state */

/**
 * Session state stored in the browser. Base data never changes; this records what happened on top of it.
 * completed: { [repId]: [{ questId, xp, points }] }, pending: [{ repId, questId, submitted }],
 * perfect: { [repId]: number of perfect quizzes }, courses: courses made in the Course studio (see studio.js).
 */
export function emptyState(pending = []) {
  return { completed: {}, pending: [...pending], perfect: {}, courses: [] };
}

export function questStatus(state, repId, questId) {
  if ((state.completed[repId] ?? []).some((c) => c.questId === questId)) return 'done';
  if (state.pending.some((p) => p.repId === repId && p.questId === questId)) return 'pending';
  return 'open';
}

/** Rewards for a quest. Quizzes scale with the score, and a perfect score earns a bonus. */
export function rewardFor(quest, result) {
  if (quest.type !== 'quiz' || !result) return { xp: quest.xp, points: quest.points };
  const ratio = result.score / result.total;
  const perfect = result.score === result.total;
  return {
    xp: Math.round(quest.xp * ratio) + (perfect ? PERFECT_QUIZ_BONUS : 0),
    points: Math.round(quest.points * ratio),
  };
}

export const quizPassed = (result) => result.score / result.total >= PASS_RATIO;

/**
 * Complete (or submit) a quest. Returns { state, outcome } where outcome is
 * 'completed' | 'submitted' | 'failed' | 'already'.
 */
export function completeQuest(state, repId, questId, result, today) {
  const quest = questById[questId];
  if (!quest || questStatus(state, repId, questId) !== 'open') return { state, outcome: 'already' };
  if (quest.type === 'quiz' && result && !quizPassed(result)) return { state, outcome: 'failed' };

  if (QUEST_TYPES[quest.type].approval) {
    return { state: { ...state, pending: [...state.pending, { repId, questId, submitted: today }] }, outcome: 'submitted' };
  }
  const reward = rewardFor(quest, result);
  const perfect = quest.type === 'quiz' && result && result.score === result.total;
  return {
    state: {
      ...state,
      completed: { ...state.completed, [repId]: [...(state.completed[repId] ?? []), { questId, ...reward }] },
      perfect: perfect ? { ...state.perfect, [repId]: (state.perfect[repId] ?? 0) + 1 } : state.perfect,
    },
    outcome: 'completed',
  };
}

/** Team lead approves a submitted role-play or field challenge. */
export function approveQuest(state, repId, questId) {
  const quest = questById[questId];
  if (!state.pending.some((p) => p.repId === repId && p.questId === questId)) return state;
  return {
    ...state,
    pending: state.pending.filter((p) => !(p.repId === repId && p.questId === questId)),
    completed: {
      ...state.completed,
      [repId]: [...(state.completed[repId] ?? []), { questId, xp: quest.xp, points: quest.points }],
    },
  };
}

/** Team lead sends a submission back for another try. */
export function returnQuest(state, repId, questId) {
  return { ...state, pending: state.pending.filter((p) => !(p.repId === repId && p.questId === questId)) };
}

/** Base rep plus everything completed in this session: XP, skill points and streak. */
export function applyProgress(rep, state) {
  const done = state.completed[rep.id] ?? [];
  if (!done.length) return rep;
  const skills = { ...rep.skills };
  let gained = 0;
  for (const { questId, xp, points } of done) {
    const quest = questById[questId];
    skills[quest.skill] = Math.min(MAX_POINTS, (skills[quest.skill] ?? 0) + points);
    gained += xp;
  }
  // Activity today keeps a streak going if the rep was active yesterday, otherwise starts a new one.
  const streak = rep.activeDaysAgo === 0 ? rep.streak : rep.activeDaysAgo === 1 ? rep.streak + 1 : 1;
  return { ...rep, skills, xp: rep.xp + gained, weeklyXp: rep.weeklyXp + gained, streak, activeDaysAgo: 0 };
}

export const applyAll = (reps, state) => reps.map((r) => applyProgress(r, state));

/* --------------------------------------------------------- recommendations */

/** Why a quest is suggested, in plain words. */
export function reasonFor(rep, quest) {
  const skill = skillById[quest.skill];
  const level = skillLevel(rep.skills[skill.id] ?? 0);
  const target = targetFor(rep, skill.id);
  if (level >= target) return `Keeps your ${skill.name.toLowerCase()} sharp. You are already where your role needs you.`;
  const why = skill.mandatory ? ', which everyone must have' : skill.demand >= 3 ? ', a skill the company needs most right now' : skill.demand === 2 ? ', a skill in demand' : '';
  return `Builds ${skill.name}${why}. You are at level ${level}; your role needs ${target}.`;
}

/** Open quests ranked by how much they help this rep close important gaps. */
export function recommendQuests(rep, state, limit = 3) {
  const profile = Object.fromEntries(skillProfile(rep).map((r) => [r.skill.id, r]));
  return ALL_QUESTS.filter((q) => questStatus(state, rep.id, q.id) === 'open')
    .map((quest) => {
      const row = profile[quest.skill];
      const score = row.priority > 0 ? row.priority : row.skill.demand * 0.1;
      return { quest, score, reason: reasonFor(rep, quest) };
    })
    .sort((a, b) => b.score - a.score || a.quest.minutes - b.quest.minutes || b.quest.xp - a.quest.xp)
    .slice(0, limit);
}

/* ------------------------------------------------------------------ badges */

export const BADGES = [
  { id: 'first-steps', name: 'First steps', hint: 'Complete a quest in LevelUp.', test: (r, s) => (s.completed[r.id] ?? []).length > 0 },
  { id: 'on-fire', name: 'On fire', hint: 'Keep a 7-day learning streak.', test: (r) => r.streak >= 7 },
  { id: 'quiz-ace', name: 'Quiz ace', hint: 'Get every answer right in a quiz.', test: (r, s) => (s.perfect[r.id] ?? 0) > 0 },
  { id: 'launch-ready', name: 'Launch ready', hint: 'Reach your target in all Lumeva launch skills.', test: (r) => isLaunchReady(r) },
  { id: 'ai-pioneer', name: 'AI pioneer', hint: 'Reach your target in AI-assisted visit preparation.', test: (r) => skillLevel(r.skills['ai-assistant']) >= targetFor(r, 'ai-assistant') },
  { id: 'clean-record', name: 'Compliance champion', hint: 'Reach your target in Compliant promotion.', test: (r) => skillLevel(r.skills['cmp-ethics']) >= targetFor(r, 'cmp-ethics') },
  { id: 'team-player', name: 'Team player', hint: 'Complete a peer coaching quest.', test: (r, s) => (s.completed[r.id] ?? []).some((c) => questById[c.questId].type === 'coaching') },
  { id: 'specialist', name: 'Specialist', hint: 'Reach player level 5.', test: (r) => playerLevel(r.xp).level >= 5 },
];

export function badgesFor(rep, state) {
  return BADGES.map((b) => ({ ...b, earned: Boolean(b.test(rep, state)) }));
}

/* ------------------------------------------------------------- leaderboard */

export function individualLeague(reps) {
  return [...reps]
    .sort((a, b) => b.weeklyXp - a.weeklyXp || b.streak - a.streak || a.name.localeCompare(b.name))
    .map((rep, i) => ({ rep, rank: i + 1 }));
}

/** Teams are ranked on average weekly XP per person, so team size doesn't decide the winner. */
export function teamLeague(reps, teams = ALL_TEAMS) {
  return teams
    .map((team) => {
      const members = reps.filter((r) => r.team === team.id);
      const total = members.reduce((sum, r) => sum + r.weeklyXp, 0);
      return { team, members, total, average: members.length ? Math.round(total / members.length) : 0 };
    })
    .sort((a, b) => b.average - a.average)
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

/* ------------------------------------------------------------ team insights */

/** Per skill across a group: how many people are below target, the average gap and how urgent it is. */
export function skillInsights(reps) {
  return ALL_SKILLS.map((skill) => {
    const rows = reps.map((rep) => {
      const level = skillLevel(rep.skills[skill.id] ?? 0);
      return { level, gap: Math.max(0, targetFor(rep, skill.id) - level) };
    });
    const below = rows.filter((r) => r.gap > 0).length;
    const share = reps.length ? below / reps.length : 0;
    const avgGap = reps.length ? rows.reduce((s, r) => s + r.gap, 0) / reps.length : 0;
    const avgLevel = reps.length ? rows.reduce((s, r) => s + r.level, 0) / reps.length : 0;
    const urgency = Math.round((skill.demand * avgGap + (skill.mandatory && below ? 1 : 0)) * 10) / 10;
    let status = 'On track';
    if ((skill.demand >= 3 || skill.mandatory) && share >= 0.5) status = 'Act now';
    else if (share >= 0.34 || (skill.mandatory && below > 0)) status = 'Keep an eye on';
    return { skill, below, share, avgGap, avgLevel, urgency, status };
  }).sort((a, b) => b.urgency - a.urgency || b.share - a.share);
}

export function launchReadiness(reps) {
  if (!reps.length) return 0;
  return reps.filter(isLaunchReady).length / reps.length;
}

/** Adoption: who learned this week, average streak, and quests completed this week. */
export function adoption(reps, state, baseQuestsThisWeek = 0) {
  const active = reps.filter((r) => r.activeDaysAgo <= 6).length;
  const sessionQuests = Object.values(state.completed).reduce((s, list) => s + list.length, 0);
  return {
    activeRate: reps.length ? active / reps.length : 0,
    active,
    total: reps.length,
    avgStreak: reps.length ? reps.reduce((s, r) => s + r.streak, 0) / reps.length : 0,
    questsThisWeek: baseQuestsThisWeek + sessionQuests,
    inactive: reps.filter((r) => r.activeDaysAgo > 6),
  };
}

export function challengeProgress(challenge, state) {
  const extra = Object.values(state.completed)
    .flat()
    .filter((c) => questById[c.questId].skill === challenge.skill).length;
  const done = challenge.baseDone + extra;
  return { done, goal: challenge.goal, progress: Math.min(1, done / challenge.goal) };
}

/**
 * The headlines for a manager, in plain words: biggest gap, launch readiness, adoption and who needs a nudge.
 * Each finding has a tone (good, warn, bad) and one short sentence.
 */
export function teamFindings(reps, state, history = []) {
  if (!reps.length) return [];
  const findings = [];
  const insights = skillInsights(reps);
  const top = insights[0];
  if (top && top.below > 0) {
    findings.push({
      tone: top.status === 'Act now' ? 'bad' : 'warn',
      title: `${top.skill.name} is the biggest gap`,
      text: `${top.below} of ${reps.length} people are below the level their role needs.${top.skill.reason ? ` ${top.skill.reason}` : ''}`,
    });
  }
  const ready = reps.filter(isLaunchReady).length;
  findings.push({
    tone: ready / reps.length >= 0.75 ? 'good' : ready / reps.length >= 0.4 ? 'warn' : 'bad',
    title: `${ready} of ${reps.length} are ready for the Lumeva launch`,
    text: 'Ready means at the needed level in launch knowledge, clinical data and objection handling.',
  });
  const a = adoption(reps, state);
  if (history.length >= 2) {
    const first = history[0].activeRate;
    const last = history.at(-1).activeRate;
    findings.push({
      tone: last >= first ? 'good' : 'warn',
      title: `${Math.round(a.activeRate * 100)}% learned something this week`,
      text: `Up from ${Math.round(first * 100)}% ${history.length} weeks ago. Short quests and streaks keep people coming back.`,
    });
  } else {
    findings.push({ tone: a.activeRate >= 0.75 ? 'good' : 'warn', title: `${Math.round(a.activeRate * 100)}% learned something this week`, text: 'Counts everyone with at least one quest in the last 7 days.' });
  }
  if (a.inactive.length) {
    const names = a.inactive.map((r) => r.name.split(' ')[0]);
    findings.push({
      tone: 'warn',
      title: `${a.inactive.length} ${a.inactive.length === 1 ? 'person needs' : 'people need'} a nudge`,
      text: `${names.join(' and ')} ${a.inactive.length === 1 ? 'has' : 'have'} not learned anything in over a week.`,
    });
  } else {
    findings.push({ tone: 'good', title: 'Everyone is learning', text: 'Nobody has been away for more than a week.' });
  }
  return findings;
}

/* -------------------------------------------------------------------- csv */

function cell(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(header, rows) {
  return [header, ...rows].map((r) => r.map(cell).join(',')).join('\n');
}

/** Skills matrix export: one row per rep, level/target for every skill. */
export function skillsMatrixCsv(reps, teamName = (id) => id) {
  const header = ['Rep', 'Team', 'Role', ...ALL_SKILLS.map((s) => s.name), 'Gaps', 'Launch ready'];
  const rows = reps.map((rep) => {
    const profile = skillProfile(rep);
    return [
      rep.name,
      teamName(rep.team),
      roles[rep.role].label,
      ...profile.map((r) => `${r.level}/${r.target}`),
      profile.filter((r) => r.gap > 0).length,
      isLaunchReady(rep) ? 'Yes' : 'No',
    ];
  });
  return toCsv(header, rows);
}
