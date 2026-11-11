import { describe, it, expect } from 'vitest';
import { recordAttempt, quizInsights, wrongText, insightsCsv, seeded, simulateTeam } from './insights.js';
import { createCourse, addCourse, reviewSummary, decide, approveCourse } from './courses.js';
import { emptyState, completeQuest, applyAll, skillInsights } from './game.js';
import { reps } from '../data/academy.js';
import { sampleDrafts } from '../data/drafts.js';

function withCourse() {
  let c = createCourse([], { title: 'x', skill: 'sci-lumeva', source: { kind: 'builtin', docId: 'lumeva-leaflet' }, draft: structuredClone(sampleDrafts['lumeva-leaflet']), by: 'Beatriz Lima', date: '2026-11-11' });
  for (const it of reviewSummary(c).items) c = decide(c, it.key, it.inSource ? 'ok' : 'remove');
  return addCourse(emptyState(), approveCourse(c, 'Beatriz Lima', '2026-11-11'));
}
const attempt = (state, repId, answers) => {
  const score = answers.filter((a, i) => a === [0, 1, 2][i]).length;
  let s = recordAttempt(state, { repId, questId: 'C1-quiz', answers, score, total: 3, date: '2026-11-11' });
  if (score >= 2) s = completeQuest(s, repId, 'C1-quiz', { score, total: 3 }, '2026-11-11').state;
  return s;
};

describe('quiz insights', () => {
  it('starts empty but lists every approved course quiz', () => {
    const [it0] = quizInsights(withCourse(), reps);
    expect(it0).toMatchObject({ takers: 0, finished: 0, people: 12, avgScore: null });
    expect(it0.questions).toHaveLength(3);
    expect(wrongText(it0.questions[0])).toBe('Nobody has answered it yet');
  });

  it('counts first attempts, finishers and the average score, most-missed question first', () => {
    let s = withCourse();
    s = attempt(s, 'MR', [0, 1, 2]); // 3/3
    s = attempt(s, 'JA', [0, 0, 2]); // 2/3, misses question 2
    s = attempt(s, 'SC', [1, 0, 2]); // 1/3, fails
    s = attempt(s, 'SC', [0, 1, 2]); // second try is ignored for the insights
    const [it0] = quizInsights(s, reps);
    expect(it0.takers).toBe(3);
    expect(it0.finished).toBe(3);
    expect(it0.avgScore).toBeCloseTo(6 / 9);
    expect(it0.questions[0]).toMatchObject({ index: 1, wrong: 2, takers: 3 });
    expect(wrongText(it0.questions[0])).toBe('2 of 3 got this wrong');
    expect(wrongText(it0.questions.at(-1))).toBe('Everyone got this right (3 of 3)');
  });

  it('exports one row per question', () => {
    const csv = insightsCsv(quizInsights(attempt(withCourse(), 'MR', [0, 0, 2]), reps)).split('\n');
    expect(csv).toHaveLength(4);
    expect(csv[1]).toContain('What was the most common side effect?');
    expect(csv[1]).toContain('100%');
  });
});

describe('simulating the team (demo)', () => {
  it('is repeatable', () => {
    expect(seeded('MR:1')).toBe(seeded('MR:1'));
    expect(seeded('MR:1')).not.toBe(seeded('MR:2'));
  });

  it('has everyone who has not tried yet take the quiz once, with the normal rules', () => {
    const s0 = attempt(withCourse(), 'MR', [0, 1, 2]);
    const s1 = simulateTeam(s0, 'C1-quiz', reps, '2026-11-11');
    const [it0] = quizInsights(s1, reps);
    expect(it0.takers).toBe(12);
    expect(s1.attempts.filter((a) => a.repId === 'MR')).toHaveLength(1);
    expect(it0.finished).toBeGreaterThan(0);
    expect(it0.questions[0].share).toBeGreaterThanOrEqual(it0.questions.at(-1).share);
    const gap = (st) => skillInsights(applyAll(reps, st)).find((i) => i.skill.id === 'sci-lumeva').levelsToGo;
    expect(gap(s1)).toBeLessThan(gap(s0));
    expect(simulateTeam(s1, 'C1-quiz', reps, '2026-11-11')).toBe(s1);
    expect(simulateTeam(s1, 'nope', reps, '2026-11-11')).toBe(s1);
  });
});
