import { describe, it, expect } from 'vitest';
import { nextCourseId, createCourse, sourceSentences, sourceTitle, addCourse, updateCourse } from './courses.js';
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
