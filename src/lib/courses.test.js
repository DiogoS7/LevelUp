import { describe, it, expect } from 'vitest';
import { nextCourseId, createCourse, sourceSentences, sourceTitle, addCourse, updateCourse, reviewSummary, decide, approveCourse, sendBackCourse } from './courses.js';
import { emptyState } from './game.js';
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
