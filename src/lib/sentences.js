/**
 * Splitting a source document into numbered sentences, so every part of a course can point to the exact
 * sentence it came from. Pure functions, tested in sentences.test.js.
 */

export const MAX_WORDS = 3000;

// Abbreviations that end in a full stop but don't end a sentence.
const ABBREVIATIONS = ['dr', 'mr', 'mrs', 'ms', 'prof', 'e.g', 'i.e', 'etc', 'vs', 'approx', 'no', 'fig'];

export function countWords(text) {
  const words = String(text ?? '').trim().match(/\S+/g);
  return words ? words.length : 0;
}

/**
 * Split text into sentences. Paragraph breaks and bullet lines always end a sentence; inside a paragraph a
 * sentence ends at . ! or ? (optionally followed by a closing quote or bracket) before a new capitalised word.
 * Returns [{ n, text }] numbered from 1.
 */
export function splitSentences(text) {
  const blocks = String(text ?? '')
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n|\n(?=\s*(?:[-*•]|\d+[.)])\s)/)
    .map((b) => b.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const sentences = [];
  for (const block of blocks) {
    let start = 0;
    const re = /[.!?]["'”’)\]]*(?=\s+["'“‘(]?[A-Z0-9])/g;
    let m;
    while ((m = re.exec(block))) {
      const end = m.index + m[0].length;
      const before = block.slice(start, m.index).split(/\s+/).pop().toLowerCase();
      if (m[0][0] === '.' && ABBREVIATIONS.includes(before.replace(/\.$/, ''))) continue;
      if (m[0][0] === '.' && /^[A-Z]$/i.test(before)) continue; // initials like "J. Silva"
      sentences.push(block.slice(start, end).trim());
      start = end;
    }
    const rest = block.slice(start).trim();
    if (rest) sentences.push(rest);
  }
  return sentences.map((t, i) => ({ n: i + 1, text: t }));
}
