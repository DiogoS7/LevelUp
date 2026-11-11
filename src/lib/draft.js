/**
 * Course drafting rules: the shape a draft must have, how its parts are matched to the source sentences,
 * and the offline drafting used for the built-in documents. Pure functions, tested in draft.test.js.
 */
import { sampleDrafts } from '../data/drafts.js';

export const QUIZ_LENGTH = 3;
export const OPTIONS_PER_QUESTION = 4;
export const MIN_SHARED_WORDS = 2;

const STOP = new Set(
  'a an the and or but if then so of to in on at by for with from as is are was were be been being it its this that these those their there they them he she his her you your we our i me my not no do does did can could should would will may might must has have had than which who whom what when where why how all any each more most other some such only own same too very just also about into over after before up down out off again once both few'.split(
    ' ',
  ),
);

/** Lower-case content words with a light plural/tense trim, for comparing an item with its source. */
export function contentWords(text) {
  return new Set(
    String(text ?? '')
      .toLowerCase()
      .replace(/[^a-z0-9%\s-]/g, ' ')
      .split(/[\s-]+/)
      .filter((w) => w.length > 1 && !STOP.has(w))
      .map((w) => w.replace(/(ing|ed|es|s)$/, '') || w),
  );
}

export function sharedWords(a, b) {
  const wa = contentWords(a);
  let n = 0;
  for (const w of contentWords(b)) if (wa.has(w)) n += 1;
  return n;
}

/** Every reviewable part of a draft, in order, with a stable key and the text to check against the source. */
export function draftItems(draft) {
  const items = draft.lesson.points.map((p, i) => ({ key: `lesson-${i}`, kind: 'lesson', label: `Lesson point ${i + 1}`, text: p.text, check: p.text, sources: p.sources }));
  draft.quiz.forEach((q, i) =>
    items.push({ key: `quiz-${i}`, kind: 'quiz', label: `Quiz question ${i + 1}`, text: q.q, check: `${q.q} ${q.options[q.answer]}`, sources: q.sources, question: q }),
  );
  if (draft.practice) {
    const p = draft.practice;
    items.push({ key: 'practice', kind: 'practice', label: 'Practice task', text: p.title, check: `${p.title} ${p.text}`, sources: p.sources, detail: p.text });
  }
  return items;
}

/**
 * Is this item backed by the document? It needs at least one valid sentence number, and enough words in
 * common with those sentences that the citation is believable.
 */
export function sourceCheck(item, sentences) {
  const nums = Array.isArray(item.sources) ? item.sources : [];
  if (!nums.length) return { ok: false, reason: 'No source sentence given' };
  if (nums.some((n) => !Number.isInteger(n) || n < 1 || n > sentences.length)) return { ok: false, reason: 'Points to a sentence that does not exist' };
  const cited = nums.map((n) => sentences[n - 1].text).join(' ');
  if (sharedWords(item.check, cited) < MIN_SHARED_WORDS) return { ok: false, reason: 'Does not match the sentence it points to' };
  return { ok: true };
}

/** Keys of the items that are not in the source. */
export function notInSource(draft, sentences) {
  return draftItems(draft)
    .filter((it) => !sourceCheck(it, sentences).ok)
    .map((it) => it.key);
}

/** Check the shape of a draft before showing it. Returns a list of problems; empty means it is usable. */
export function validateDraft(draft) {
  const problems = [];
  if (!draft || typeof draft !== 'object') return ['The draft is empty.'];
  const points = draft.lesson?.points;
  if (!Array.isArray(points) || points.length < 2) problems.push('The lesson needs at least 2 key points.');
  else if (points.some((p) => typeof p?.text !== 'string' || !p.text.trim() || !Array.isArray(p.sources))) problems.push('Every lesson point needs text and a list of sources.');
  if (!Array.isArray(draft.quiz) || draft.quiz.length !== QUIZ_LENGTH) problems.push(`The quiz needs exactly ${QUIZ_LENGTH} questions.`);
  else
    draft.quiz.forEach((q, i) => {
      if (typeof q?.q !== 'string' || !q.q.trim()) problems.push(`Question ${i + 1} has no text.`);
      if (!Array.isArray(q?.options) || q.options.length !== OPTIONS_PER_QUESTION || q.options.some((o) => typeof o !== 'string' || !o.trim()))
        problems.push(`Question ${i + 1} needs ${OPTIONS_PER_QUESTION} options.`);
      else if (new Set(q.options.map((o) => o.trim().toLowerCase())).size !== q.options.length) problems.push(`Question ${i + 1} repeats an option.`);
      if (!Number.isInteger(q?.answer) || q.answer < 0 || q.answer >= OPTIONS_PER_QUESTION) problems.push(`Question ${i + 1} has no correct answer.`);
      if (!Array.isArray(q?.sources)) problems.push(`Question ${i + 1} needs a list of sources.`);
    });
  const p = draft.practice;
  if (!p || typeof p.title !== 'string' || !p.title.trim() || typeof p.text !== 'string' || !p.text.trim() || !Array.isArray(p.sources)) problems.push('The practice task needs a title, text and sources.');
  return problems;
}

export class DraftError extends Error {
  constructor(message, { needsClaude = false } = {}) {
    super(message);
    this.name = 'DraftError';
    this.needsClaude = needsClaude;
  }
}

export const DRAFT_STEPS = ['Reading the document', 'Writing the lesson', 'Writing the quiz and practice task', 'Matching every part to its source sentence'];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Draft a course. Built-in documents use the prepared output (works offline, no key). Pasted text needs
 * the Claude option, which arrives in v2.1. onStep(i) reports progress through DRAFT_STEPS.
 */
export async function draftCourse(source, { onStep = () => {}, delay = 650 } = {}) {
  for (let i = 0; i < DRAFT_STEPS.length; i += 1) {
    onStep(i);
    await wait(delay);
  }
  if (source.kind !== 'builtin') {
    throw new DraftError('Drafting from your own text needs the Claude option, which is coming in v2.1. For now, try one of the built-in documents.', { needsClaude: true });
  }
  const draft = sampleDrafts[source.docId];
  if (!draft) throw new DraftError('There is no prepared draft for this document.');
  const copy = structuredClone(draft);
  const problems = validateDraft(copy);
  if (problems.length) throw new DraftError(`The draft came back incomplete: ${problems[0]}`);
  return copy;
}
