import { describe, it, expect } from 'vitest';
import { contentWords, sharedWords, draftItems, sourceCheck, notInSource, validateDraft, draftCourse, DraftError, DRAFT_STEPS } from './draft.js';
import { splitSentences } from './sentences.js';
import { sourceDocById, docText } from '../data/sources.js';
import { sampleDrafts } from '../data/drafts.js';

const sentencesOf = (id) => splitSentences(docText(sourceDocById[id]));
const good = () => structuredClone(sampleDrafts['lumeva-leaflet']);

describe('matching words', () => {
  it('ignores small words, case and punctuation', () => {
    expect([...contentWords('The Statin, and THE statins!')]).toEqual(['statin']);
  });
  it('counts content words two texts share', () => {
    expect(sharedWords('Lumeva does not replace the statin', 'It is added and does not replace their statin.')).toBe(2);
  });
});

describe('the shape of a draft', () => {
  it('accepts every prepared draft', () => {
    for (const d of Object.values(sampleDrafts)) expect(validateDraft(d)).toEqual([]);
  });
  it('needs exactly 3 questions with 4 options and one correct answer', () => {
    const d = good();
    d.quiz.pop();
    expect(validateDraft(d)[0]).toContain('exactly 3 questions');
    const e = good();
    e.quiz[1].options = ['a', 'b', 'c'];
    e.quiz[2].answer = 4;
    expect(validateDraft(e)).toEqual(['Question 2 needs 4 options.', 'Question 3 has no correct answer.']);
  });
  it('rejects repeated options, an empty lesson and a missing practice task', () => {
    const d = good();
    d.quiz[0].options[1] = d.quiz[0].options[0];
    d.lesson.points = [];
    delete d.practice;
    const problems = validateDraft(d);
    expect(problems).toContain('Question 1 repeats an option.');
    expect(problems).toContain('The lesson needs at least 2 key points.');
    expect(problems).toContain('The practice task needs a title, text and sources.');
    expect(validateDraft(null)).toEqual(['The draft is empty.']);
  });
});

describe('linking to the source', () => {
  it('lists lesson points, questions and the practice task with stable keys', () => {
    const keys = draftItems(good()).map((i) => i.key);
    expect(keys).toEqual(['lesson-0', 'lesson-1', 'lesson-2', 'lesson-3', 'lesson-4', 'lesson-5', 'quiz-0', 'quiz-1', 'quiz-2', 'practice']);
  });
  it('flags exactly the planted unsourced point in each prepared draft', () => {
    expect(notInSource(sampleDrafts['lumeva-leaflet'], sentencesOf('lumeva-leaflet'))).toEqual(['lesson-4']);
    expect(notInSource(sampleDrafts['objections-guide'], sentencesOf('objections-guide'))).toEqual(['lesson-4']);
  });
  it('flags a missing, impossible or mismatched source', () => {
    const s = sentencesOf('lumeva-leaflet');
    const item = { check: 'The pen can be kept at room temperature for 30 days', sources: [10] };
    expect(sourceCheck(item, s).ok).toBe(true);
    expect(sourceCheck({ ...item, sources: [] }, s).reason).toBe('No source sentence given');
    expect(sourceCheck({ ...item, sources: [99] }, s).reason).toBe('Points to a sentence that does not exist');
    expect(sourceCheck({ ...item, sources: [1] }, s).reason).toBe('Does not match the sentence it points to');
  });
});

describe('drafting', () => {
  it('drafts a built-in document offline and reports every step', async () => {
    const steps = [];
    const d = await draftCourse({ kind: 'builtin', docId: 'objections-guide' }, { onStep: (i) => steps.push(i), delay: 0 });
    expect(steps).toEqual(DRAFT_STEPS.map((_, i) => i));
    expect(d.quiz).toHaveLength(3);
    d.quiz[0].q = 'changed';
    expect(sampleDrafts['objections-guide'].quiz[0].q).not.toBe('changed');
  });
  it('explains that pasted text needs the Claude option', async () => {
    await expect(draftCourse({ kind: 'pasted', text: 'x' }, { delay: 0 })).rejects.toThrow('Claude option');
  });
  it('fails clearly for an unknown document', async () => {
    let err;
    try {
      await draftCourse({ kind: 'builtin', docId: 'nope' }, { delay: 0 });
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(DraftError);
    expect(err.needsClaude).toBe(false);
  });
});
