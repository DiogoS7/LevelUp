/**
 * Courses made in the Course studio: creating them, the sentences of their source, and (later steps)
 * reviewing, approving and turning them into quests. Pure functions, tested in courses.test.js.
 */
import { sourceDocById, docText } from '../data/sources.js';
import { splitSentences } from './sentences.js';
import { draftItems, sourceCheck } from './draft.js';

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

/* ------------------------------------------------------------------ review */


/**
 * Everything the review screen needs: each item with its source check and the reviewer's decision,
 * plus whether the course can be approved and, if not, why (in plain words).
 */
export function reviewSummary(course) {
  const sentences = sourceSentences(course.source);
  const items = draftItems(course.draft).map((it) => {
    const check = sourceCheck(it, sentences);
    return { ...it, inSource: check.ok, problem: check.ok ? null : check.reason, decision: course.review?.[it.key] ?? null };
  });
  const decided = items.filter((i) => i.decision).length;
  const kept = (kind) => items.filter((i) => i.kind === kind && i.decision === 'ok').length;
  let reason = null;
  if (decided < items.length) reason = `Mark every part OK or Remove first (${items.length - decided} left).`;
  else if (items.some((i) => !i.inSource && i.decision === 'ok')) reason = 'Something that is not in the source is still marked OK.';
  else if (kept('lesson') < 1) reason = 'Keep at least one lesson point.';
  else if (kept('quiz') < 1) reason = 'Keep at least one quiz question.';
  return { sentences, items, decided, total: items.length, notInSource: items.filter((i) => !i.inSource).length, canApprove: reason === null, reason };
}

/** Mark one part OK or Remove. Anything not in the source can only be removed. */
export function decide(course, key, decision) {
  if (decision !== 'ok' && decision !== 'remove' && decision !== null) return course;
  if (course.status === 'approved') return course;
  const item = reviewSummary(course).items.find((i) => i.key === key);
  if (!item || (decision === 'ok' && !item.inSource)) return course;
  const review = { ...course.review };
  if (decision === null) delete review[key];
  else review[key] = decision;
  return { ...course, review };
}

export function approveCourse(course, by, date) {
  if (course.status === 'approved' || !reviewSummary(course).canApprove) return course;
  return { ...course, status: 'approved', approvedBy: by, approvedAt: date, note: null };
}

export function sendBackCourse(course, note, by) {
  if (course.status === 'approved') return course;
  const text = String(note ?? '').trim();
  if (!text) return course;
  return { ...course, status: 'draft', note: text, noteBy: by };
}

/* ------------------------------------------------------------ live quests */

export const COURSE_QUEST_REWARDS = {
  lesson: { minutes: 5, xp: 40, points: 40 },
  quiz: { minutes: 3, xp: 60, points: 60 },
  roleplay: { minutes: 15, xp: 120, points: 90 },
};

/**
 * Approved courses as quests: a lesson, a quiz and (if kept) a practice task, using only the parts the
 * reviewer marked OK. They are tagged isNew and played with the same rules as every other quest.
 */
export function courseQuests(courses = []) {
  const out = [];
  for (const c of courses) {
    if (c.status !== 'approved') continue;
    const kept = (key) => c.review?.[key] === 'ok';
    const base = { skill: c.skill, isNew: true, courseId: c.id };
    const points = c.draft.lesson.points.filter((_, i) => kept(`lesson-${i}`)).map((p) => p.text);
    if (points.length) out.push({ ...base, ...COURSE_QUEST_REWARDS.lesson, id: `${c.id}-lesson`, type: 'lesson', title: c.draft.lesson.title || c.title, body: points });
    const questions = c.draft.quiz.filter((_, i) => kept(`quiz-${i}`)).map(({ q, options, answer }) => ({ q, options, answer }));
    if (questions.length) out.push({ ...base, ...COURSE_QUEST_REWARDS.quiz, id: `${c.id}-quiz`, type: 'quiz', title: `${c.title}: quiz`, questions });
    if (c.draft.practice && kept('practice'))
      out.push({
        ...base,
        ...COURSE_QUEST_REWARDS.roleplay,
        id: `${c.id}-practice`,
        type: 'roleplay',
        title: c.draft.practice.title,
        body: [c.draft.practice.text, 'Your team lead gives it a quick yes before the XP is added.'],
      });
  }
  return out;
}
