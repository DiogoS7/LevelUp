/**
 * Courses made in the Course studio: creating them, the sentences of their source, and (later steps)
 * reviewing, approving and turning them into quests. Pure functions, tested in courses.test.js.
 */
import { sourceDocById, docText } from '../data/sources.js';
import { splitSentences } from './sentences.js';

export function nextCourseId(courses) {
  const max = courses.reduce((m, c) => Math.max(m, Number(String(c.id).replace(/\D/g, '')) || 0), 0);
  return `C${max + 1}`;
}

/** A new draft course. `source` is { kind: 'builtin', docId } or { kind: 'pasted', title, text }. */
export function createCourse(courses, { title, skill, source, draft, by, date }) {
  return {
    id: nextCourseId(courses),
    title: draft.title || title,
    skill,
    source,
    draft,
    review: {},
    status: 'draft',
    note: null,
    createdBy: by,
    createdAt: date,
    approvedBy: null,
    approvedAt: null,
  };
}

export function sourceTitle(source) {
  return source.kind === 'builtin' ? sourceDocById[source.docId]?.title : source.title;
}

export function sourceSentences(source) {
  const text = source.kind === 'builtin' ? docText(sourceDocById[source.docId]) : source.text;
  return splitSentences(text);
}

export const addCourse = (state, course) => ({ ...state, courses: [...(state.courses ?? []), course] });
export const updateCourse = (state, id, change) => ({ ...state, courses: state.courses.map((c) => (c.id === id ? { ...c, ...change } : c)) });
