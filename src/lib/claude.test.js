import { describe, it, expect } from 'vitest';
import { buildDraftPrompt, parseDraftResponse, requestDraft, maskKey, CLAUDE_URL, CLAUDE_MODEL } from './claude.js';
import { draftCourse, validateDraft, notInSource } from './draft.js';
import { splitSentences } from './sentences.js';
import { sampleDrafts } from '../data/drafts.js';

const text = 'Keep remote visits short, about 10 to 15 minutes. Share one visual at a time. Always send an approved recap email afterwards. Ask a question every few minutes.';
const sentences = splitSentences(text);
const reply = (draft, status = 200) => async (url, init) => {
  reply.last = { url, init };
  return { ok: status < 300, status, json: async () => ({ content: [{ type: 'thinking', thinking: '…' }, { type: 'text', text: '```json\n' + JSON.stringify(draft) + '\n```' }] }) };
};
const goodDraft = {
  title: 'Remote visits',
  lesson: { title: 'Remote visits', points: [{ text: 'Keep remote visits short, about 10 to 15 minutes.', sources: [1] }, { text: 'Always send an approved recap email afterwards.', sources: [3] }] },
  quiz: [
    { q: 'How long should a remote visit be?', options: ['About 10 to 15 minutes', 'An hour', 'Two minutes', 'As long as possible'], answer: 0, sources: [1] },
    { q: 'How many visuals should you share at a time?', options: ['One visual at a time', 'All of them', 'None', 'Three'], answer: 0, sources: [2] },
    { q: 'What do you send afterwards?', options: ['An approved recap email', 'A text message', 'Nothing', 'A price list'], answer: 0, sources: [3] },
  ],
  practice: { title: 'Run a short remote visit', text: 'Run a short remote visit, share one visual at a time and send an approved recap email.', sources: [1, 2, 3] },
};

describe('asking Claude', () => {
  it('gives Claude only the numbered document and asks it to cite sentences', () => {
    const { system, user } = buildDraftPrompt({ sentences, skillName: 'Omnichannel engagement', title: 'Remote visits' });
    expect(system).toContain('ONLY the source document');
    expect(user).toContain('[2] Share one visual at a time.');
    expect(user).toContain('exactly 3 questions');
    expect(user).toContain('Omnichannel engagement');
  });

  it('reads the JSON out of a reply, even inside a code block', () => {
    const d = parseDraftResponse('Here you go:\n```json\n' + JSON.stringify(goodDraft) + '\n```');
    expect(validateDraft(d)).toEqual([]);
    expect(d.quiz[0].sources).toEqual([1]);
  });

  it('turns a reply it cannot read into a plain message', () => {
    expect(() => parseDraftResponse('Sorry, I cannot help.')).toThrow('not with a course');
    expect(() => parseDraftResponse('{ not json }')).toThrow('could not be read');
  });

  it('tidies sources and missing parts so the review can flag them', () => {
    const d = parseDraftResponse(JSON.stringify({ ...goodDraft, lesson: { points: [{ text: 'x', sources: ['2', 'a'] }, { text: 'y' }] } }));
    expect(d.lesson.points).toEqual([{ text: 'x', sources: [2] }, { text: 'y', sources: [] }]);
  });

  it('sends the key only in the request to the Claude API, and reads text blocks only', async () => {
    const d = await requestDraft({ key: 'sk-ant-test', sentences, skillName: 's', title: 't', fetchImpl: reply(goodDraft) });
    expect(reply.last.url).toBe(CLAUDE_URL);
    expect(reply.last.init.headers['x-api-key']).toBe('sk-ant-test');
    expect(reply.last.init.headers['anthropic-dangerous-direct-browser-access']).toBe('true');
    expect(JSON.parse(reply.last.init.body).model).toBe(CLAUDE_MODEL);
    expect(reply.last.init.body).not.toContain('sk-ant-test');
    expect(d.title).toBe('Remote visits');
  });

  it('explains a rejected key, a busy service and a network failure', async () => {
    await expect(requestDraft({ key: 'k', sentences, skillName: 's', title: 't', fetchImpl: reply(goodDraft, 401) })).rejects.toThrow('did not accept your API key');
    await expect(requestDraft({ key: 'k', sentences, skillName: 's', title: 't', fetchImpl: reply(goodDraft, 529) })).rejects.toThrow('busy');
    const offline = async () => {
      throw new Error('net');
    };
    await expect(requestDraft({ key: 'k', sentences, skillName: 's', title: 't', fetchImpl: offline })).rejects.toThrow('Could not reach Claude');
  });

  it('masks a key for display', () => {
    expect(maskKey('sk-ant-api03-abcdefghijklmnop')).toBe('sk-ant-…mnop');
    expect(maskKey('')).toBe('');
  });
});

describe('drafting pasted text with Claude', () => {
  const source = { kind: 'pasted', title: 'Remote visits', text };

  it('drafts with a key, and anything without a valid source is flagged in review', async () => {
    const bad = structuredClone(goodDraft);
    bad.lesson.points.push({ text: 'Offer a free lunch to every doctor.', sources: [] });
    const d = await draftCourse(source, { delay: 0, key: 'k', skillName: 's', sentences, fetchImpl: reply(bad) });
    expect(notInSource(d, sentences)).toEqual(['lesson-2']);
  });

  it('rejects a draft with the wrong shape in plain words', async () => {
    const bad = { ...goodDraft, quiz: goodDraft.quiz.slice(0, 2) };
    await expect(draftCourse(source, { delay: 0, key: 'k', skillName: 's', sentences, fetchImpl: reply(bad) })).rejects.toThrow('exactly 3 questions');
  });

  it('keeps built-in documents offline even with a key', async () => {
    const never = async () => {
      throw new Error('should not be called');
    };
    const d = await draftCourse({ kind: 'builtin', docId: 'lumeva-leaflet' }, { delay: 0, key: 'k', fetchImpl: never });
    expect(d.title).toBe(sampleDrafts['lumeva-leaflet'].title);
  });
});
