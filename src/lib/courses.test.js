import { describe, it, expect } from 'vitest';
import { nextCourseId, createCourse, sourceSentences, sourceTitle, addCourse, updateCourse, reviewSummary, decide, approveCourse, sendBackCourse, courseQuests, editItem } from './courses.js';
import { emptyState, allQuests, findQuest, recommendQuests, completeQuest, applyProgress, applyAll, challengeProgress, skillInsights, approveQuest, questStatus } from './game.js';
import { reps, teamChallenge } from '../data/academy.js';
import { sampleDrafts } from '../data/drafts.js';

const lumeva = { kind: 'builtin', docId: 'lumeva-leaflet' };
const make = (courses = []) =>
  createCourse(courses, { title: 'x', skill: 'sci-lumeva', source: lumeva, draft: structuredClone(sampleDrafts['lumeva-leaflet']), by: 'Beatriz Lima', date: '2026-11-11' });

describe('creating courses', () => {
  it('numbers courses C1, C2 and so on', () => {
    expect(nextCourseId([])).toBe('C1');
    expect(nextCourseId([{ id: 'C1' }, { id: 'C7' }])).toBe('C8');
  });
  it('starts as an unreviewed draft named after the draft title', () => {
    const c = make();
    expect(c).toMatchObject({ id: 'C1', title: 'Lumeva in practice', status: 'draft', review: {}, createdBy: 'Beatriz Lima', approvedBy: null });
  });
  it('reads the sentences and title of built-in and pasted sources', () => {
    expect(sourceSentences(lumeva)).toHaveLength(13);
    expect(sourceTitle(lumeva)).toBe('Lumeva product leaflet for the sales team');
    const pasted = { kind: 'pasted', title: 'Mine', text: 'One. Two.' };
    expect(sourceSentences(pasted)).toHaveLength(2);
    expect(sourceTitle(pasted)).toBe('Mine');
  });
  it('adds and updates courses in the saved state without touching the rest', () => {
    const s0 = emptyState();
    const s1 = addCourse(s0, make());
    expect(s1.courses).toHaveLength(1);
    expect(s0.courses).toHaveLength(0);
    const s2 = updateCourse(s1, 'C1', { note: 'hi' });
    expect(s2.courses[0].note).toBe('hi');
    expect(s1.courses[0].note).toBeNull();
  });
});

describe('reviewing a draft', () => {
  const allOk = (c) => reviewSummary(c).items.reduce((acc, it) => decide(acc, it.key, it.inSource ? 'ok' : 'remove'), c);

  it('shows every part with its source check and flags what is not in the source', () => {
    const r = reviewSummary(make());
    expect(r.total).toBe(10);
    expect(r.notInSource).toBe(1);
    expect(r.items.find((i) => i.key === 'lesson-4')).toMatchObject({ inSource: false, problem: 'No source sentence given' });
    expect(r.canApprove).toBe(false);
    expect(r.reason).toContain('10 left');
  });

  it('only lets something outside the source be removed', () => {
    const c = make();
    expect(decide(c, 'lesson-4', 'ok')).toBe(c);
    expect(decide(c, 'lesson-4', 'remove').review['lesson-4']).toBe('remove');
    expect(decide(decide(c, 'quiz-0', 'ok'), 'quiz-0', null).review).toEqual({});
    expect(decide(c, 'nope', 'ok')).toBe(c);
  });

  it('can be approved once every part is decided, keeping at least one point and one question', () => {
    const c = allOk(make());
    expect(reviewSummary(c).canApprove).toBe(true);
    const noQuiz = ['quiz-0', 'quiz-1', 'quiz-2'].reduce((acc, k) => decide(acc, k, 'remove'), c);
    expect(reviewSummary(noQuiz).reason).toBe('Keep at least one quiz question.');
  });

  it('records who approved it and when', () => {
    const c = approveCourse(allOk(make()), 'Rui Costa', '2026-11-11');
    expect(c).toMatchObject({ status: 'approved', approvedBy: 'Rui Costa', approvedAt: '2026-11-11', note: null });
    expect(decide(c, 'quiz-0', 'remove')).toBe(c);
  });

  it('will not approve an unfinished review', () => {
    const c = make();
    expect(approveCourse(c, 'Rui Costa', '2026-11-11')).toBe(c);
  });

  it('sends a draft back with a note, which is required', () => {
    const c = make();
    expect(sendBackCourse(c, '  ', 'Rui Costa')).toBe(c);
    expect(sendBackCourse(c, 'Check the dosing point', 'Rui Costa')).toMatchObject({ status: 'draft', note: 'Check the dosing point', noteBy: 'Rui Costa' });
  });
});

describe('approved courses become quests', () => {
  const approved = () => {
    let c = make();
    for (const it of reviewSummary(c).items) c = decide(c, it.key, it.inSource ? 'ok' : 'remove');
    return approveCourse(c, 'Beatriz Lima', '2026-11-11');
  };

  it('gives nothing for drafts', () => {
    expect(courseQuests([make()])).toEqual([]);
  });

  it('turns an approved course into a lesson, a quiz and a practice task, all tagged New', () => {
    const q = courseQuests([approved()]);
    expect(q.map((x) => x.id)).toEqual(['C1-lesson', 'C1-quiz', 'C1-practice']);
    expect(q.every((x) => x.isNew && x.skill === 'sci-lumeva')).toBe(true);
    expect(q[0].body).toHaveLength(5);
    expect(q[0].body.join(' ')).not.toContain('dislike taking tablets');
    expect(q[1].questions).toHaveLength(3);
    expect(q[2].type).toBe('roleplay');
  });

  it('leaves out removed parts', () => {
    let c = make();
    for (const it of reviewSummary(c).items) c = decide(c, it.key, it.inSource && it.key !== 'quiz-1' && it.key !== 'practice' ? 'ok' : 'remove');
    c = approveCourse(c, 'Rui Costa', '2026-11-11');
    const q = courseQuests([c]);
    expect(q.map((x) => x.id)).toEqual(['C1-lesson', 'C1-quiz']);
    expect(q[1].questions.map((x) => x.q)).toEqual(['Who is Lumeva for?', 'A patient missed a dose. What should they do?']);
  });

  it('plays with the v1 rules: XP, skill progress, team goal and recommendations', () => {
    const state = addCourse(emptyState(), approved());
    const marta = reps.find((r) => r.id === 'MR');
    expect(allQuests(state).length).toBe(allQuests(emptyState()).length + 3);
    expect(findQuest(state, 'C1-quiz').title).toBe('Lumeva in practice: quiz');
    expect(recommendQuests(marta, state, 1)[0].quest.courseId).toBe('C1');

    const { state: next, outcome } = completeQuest(state, 'MR', 'C1-quiz', { score: 3, total: 3 }, '2026-11-11');
    expect(outcome).toBe('completed');
    const after = applyProgress(marta, next);
    expect(after.skills['sci-lumeva']).toBe(marta.skills['sci-lumeva'] + 60);
    expect(after.xp).toBe(marta.xp + 80);
    expect(challengeProgress(teamChallenge, next).done).toBe(teamChallenge.baseDone + 1);

    const gap = (st) => skillInsights(applyAll(reps, st)).find((i) => i.skill.id === 'sci-lumeva').levelsToGo;
    expect(gap(next)).toBe(gap(state) - 1);
  });

  it('sends a course practice task to the team lead like any other', () => {
    const state = addCourse(emptyState(), approved());
    const { state: next, outcome } = completeQuest(state, 'MR', 'C1-practice', null, '2026-11-11');
    expect(outcome).toBe('submitted');
    expect(questStatus(approveQuest(next, 'MR', 'C1-practice'), 'MR', 'C1-practice')).toBe('done');
  });
});

describe('editing a draft', () => {
  it('changes the wording, keeps the source and marks it Edited', () => {
    const c = decide(make(), 'lesson-0', 'ok');
    const e = editItem(c, 'lesson-0', { text: '  Lumeva is a  monthly injection that lowers LDL cholesterol. ' });
    expect(e.draft.lesson.points[0]).toEqual({ text: 'Lumeva is a monthly injection that lowers LDL cholesterol.', sources: [1] });
    expect(e.edited).toEqual({ 'lesson-0': true });
    expect(e.review['lesson-0']).toBeUndefined();
    const item = reviewSummary(e).items[0];
    expect(item).toMatchObject({ edited: true, inSource: true });
    expect(c.draft.lesson.points[0].text).toBe('Lumeva is a once-monthly injection that lowers LDL cholesterol.');
  });

  it('edits a question, its options and the correct answer', () => {
    const e = editItem(make(), 'quiz-1', { q: 'Most common side effect?', options: ['Headache', 'A mild reaction where the injection was given', 'Muscle pain', 'Feeling tired'], answer: 1 });
    expect(e.draft.quiz[1]).toMatchObject({ q: 'Most common side effect?', answer: 1, sources: [6, 7] });
    expect(e.draft.quiz[1].options[3]).toBe('Feeling tired');
  });

  it('edits the practice task', () => {
    expect(editItem(make(), 'practice', { title: 'Two-minute Lumeva pitch' }).draft.practice.title).toBe('Two-minute Lumeva pitch');
  });

  it('ignores empty, repeated or unchanged edits, and approved courses', () => {
    const c = make();
    expect(editItem(c, 'lesson-0', { text: '  ' })).toBe(c);
    expect(editItem(c, 'lesson-0', { text: c.draft.lesson.points[0].text })).toBe(c);
    expect(editItem(c, 'quiz-0', { options: ['a', 'a', 'b', 'c'] })).toBe(c);
    expect(editItem(c, 'quiz-0', { answer: 7 })).toBe(c);
    expect(editItem(c, 'nope-1', { text: 'x' })).toBe(c);
    const approved = { ...c, status: 'approved' };
    expect(editItem(approved, 'lesson-0', { text: 'new' })).toBe(approved);
  });

  it('keeps edits through approval and into the quests', () => {
    let c = editItem(make(), 'lesson-0', { text: 'Lumeva: one injection a month to lower LDL cholesterol.' });
    for (const it of reviewSummary(c).items) c = decide(c, it.key, it.inSource ? 'ok' : 'remove');
    c = approveCourse(c, 'Rui Costa', '2026-11-11');
    expect(c.status).toBe('approved');
    expect(courseQuests([c])[0].body[0]).toBe('Lumeva: one injection a month to lower LDL cholesterol.');
  });
});
