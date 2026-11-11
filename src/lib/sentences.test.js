import { describe, it, expect } from 'vitest';
import { splitSentences, countWords } from './sentences.js';
import { sourceDocs, docText } from '../data/sources.js';

describe('splitting a document into sentences', () => {
  it('numbers sentences from 1', () => {
    const s = splitSentences('First one. Second one! Is this the third? Yes.');
    expect(s.map((x) => x.n)).toEqual([1, 2, 3, 4]);
    expect(s[2].text).toBe('Is this the third?');
  });

  it('keeps abbreviations and initials inside a sentence', () => {
    const s = splitSentences('Ask Dr. Silva about it. Then call J. Costa e.g. tomorrow.');
    expect(s).toHaveLength(2);
    expect(s[0].text).toBe('Ask Dr. Silva about it.');
  });

  it('ends a sentence at a closing quote', () => {
    const s = splitSentences('He said "my patients are fine." Ask how many are above target.');
    expect(s).toHaveLength(2);
    expect(s[0].text).toBe('He said "my patients are fine."');
  });

  it('treats paragraphs and bullet lines as separate sentences', () => {
    const s = splitSentences('Intro line\n\nSecond paragraph.\n- A bullet\n- Another bullet');
    expect(s.map((x) => x.text)).toEqual(['Intro line', 'Second paragraph.', 'A bullet', 'Another bullet']);
  });

  it('does not split decimals or percentages', () => {
    expect(splitSentences('LDL fell by 52.5% after 24 weeks. Good.')).toHaveLength(2);
  });

  it('returns nothing for empty text', () => {
    expect(splitSentences('   ')).toEqual([]);
    expect(splitSentences(undefined)).toEqual([]);
  });

  it('splits every built-in document exactly into its written sentences', () => {
    for (const doc of sourceDocs) {
      const expected = doc.paragraphs.flat();
      expect(splitSentences(docText(doc)).map((x) => x.text)).toEqual(expected);
    }
  });
});

describe('counting words', () => {
  it('counts words separated by any whitespace', () => {
    expect(countWords('  one two\nthree\tfour ')).toBe(4);
    expect(countWords('')).toBe(0);
  });
});
