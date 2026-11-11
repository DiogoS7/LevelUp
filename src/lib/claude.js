/**
 * Optional: draft courses from pasted text with Claude, using the visitor's own API key.
 * The key is kept only in this browser (localStorage) and is sent only to api.anthropic.com. The demo never
 * ships a key. Prompt building and response parsing are pure functions, tested in claude.test.js.
 */
import { DraftError } from './draft-error.js';

const KEY_STORAGE = 'levelup-claude-key';
export const CLAUDE_MODEL = 'claude-sonnet-5-5';
export const CLAUDE_URL = 'https://api.anthropic.com/v1/messages';

export function getKey() {
  try {
    return localStorage.getItem(KEY_STORAGE) || '';
  } catch {
    return '';
  }
}
export function setKey(key) {
  try {
    if (key) localStorage.setItem(KEY_STORAGE, key.trim());
    else localStorage.removeItem(KEY_STORAGE);
  } catch {
    /* storage blocked: the key just isn't remembered */
  }
}
export const maskKey = (key) => (key ? `${key.slice(0, 7)}…${key.slice(-4)}` : '');

/** The instructions and the numbered document. Claude may only use these sentences and must cite them. */
export function buildDraftPrompt({ sentences, skillName, title }) {
  const system = [
    'You write short training courses for a pharmaceutical field sales team, using ONLY the source document you are given.',
    'Never add facts, numbers, claims or advice that are not in the document. If something is not in the document, leave it out.',
    'Every lesson point, quiz question and the practice task must list the numbers of the source sentences it is based on.',
    'Reply with JSON only, no other text.',
  ].join(' ');
  const shape = `{
  "title": "short course title",
  "lesson": { "title": "same or similar title", "points": [ { "text": "one key point in plain words", "sources": [1] } ] },
  "quiz": [ { "q": "question", "options": ["A", "B", "C", "D"], "answer": 0, "sources": [2] } ],
  "practice": { "title": "short practice task title", "text": "what to practise and how", "sources": [3] }
}`;
  const user = [
    `Make a course called something like "${title}" that trains the skill "${skillName}".`,
    'Rules:',
    '- The lesson has 3 to 6 key points, short enough to read in about 5 minutes.',
    '- The quiz has exactly 3 questions, each with exactly 4 different options and exactly one correct answer ("answer" is the index 0-3).',
    '- The practice task is a short role-play or real-world task a sales rep can do this week.',
    '- "sources" lists the sentence numbers (from the document below) that each item is based on.',
    `Return this JSON shape:\n${shape}`,
    'Source document, one numbered sentence per line:',
    sentences.map((s) => `[${s.n}] ${s.text}`).join('\n'),
  ].join('\n');
  return { system, user };
}

/** Pull the JSON out of Claude's reply and tidy it into a draft. Throws a DraftError a person can read. */
export function parseDraftResponse(text) {
  const raw = String(text ?? '').replace(/```(?:json)?/gi, '');
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) throw new DraftError('Claude replied, but not with a course. Please try again.');
  let data;
  try {
    data = JSON.parse(raw.slice(start, end + 1));
  } catch {
    throw new DraftError('Claude replied, but the course could not be read. Please try again.');
  }
  const nums = (v) => (Array.isArray(v) ? v.map(Number).filter(Number.isInteger) : []);
  const str = (v) => (typeof v === 'string' ? v.trim() : '');
  return {
    title: str(data.title) || str(data.lesson?.title),
    lesson: {
      title: str(data.lesson?.title) || str(data.title),
      points: (Array.isArray(data.lesson?.points) ? data.lesson.points : []).map((p) => ({ text: str(p?.text), sources: nums(p?.sources) })),
    },
    quiz: (Array.isArray(data.quiz) ? data.quiz : []).map((q) => ({
      q: str(q?.q),
      options: Array.isArray(q?.options) ? q.options.map(str) : [],
      answer: Number(q?.answer),
      sources: nums(q?.sources),
    })),
    practice: data.practice ? { title: str(data.practice.title), text: str(data.practice.text), sources: nums(data.practice.sources) } : undefined,
  };
}

/** Ask Claude for a draft. Only text blocks of the reply are read. */
export async function requestDraft({ key, sentences, skillName, title, fetchImpl = globalThis.fetch }) {
  const { system, user } = buildDraftPrompt({ sentences, skillName, title });
  let res;
  try {
    res = await fetchImpl(CLAUDE_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 4000, system, messages: [{ role: 'user', content: user }] }),
    });
  } catch {
    throw new DraftError('Could not reach Claude. Check your internet connection and try again.');
  }
  if (res.status === 401 || res.status === 403) throw new DraftError('Claude did not accept your API key. Check it in the Claude connection settings.');
  if (res.status === 429 || res.status === 529) throw new DraftError('Claude is busy right now. Wait a moment and try again.');
  if (!res.ok) throw new DraftError(`Claude could not draft the course (error ${res.status}). Please try again.`);
  const body = await res.json();
  const text = (body.content ?? [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n');
  return parseDraftResponse(text);
}
