import { useMemo, useState } from 'react';
import { LuFileText, LuClipboardPaste, LuSparkles, LuCircleCheck } from 'react-icons/lu';
import Card from '../Card.jsx';
import { Button } from '../ui.jsx';
import DocumentPanel from './DocumentPanel.jsx';
import { sourceDocs, docText } from '../../data/sources.js';
import { skills, categories } from '../../data/academy.js';
import { splitSentences, countWords, MAX_WORDS } from '../../lib/sentences.js';

/**
 * Step 1 of a new course: pick a built-in document or paste your own text, choose the skill it trains,
 * and read it as numbered sentences. Calls onDraft({ source, skill, title }) when the user is ready.
 */
export default function SourceStep({ onDraft, onCancel }) {
  const [choice, setChoice] = useState(sourceDocs[0].id);
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [skill, setSkill] = useState(sourceDocs[0].skill);

  const doc = sourceDocs.find((d) => d.id === choice);
  const text = doc ? docText(doc) : pasteText;
  const sentences = useMemo(() => splitSentences(text), [text]);
  const words = countWords(pasteText);
  const tooLong = !doc && words > MAX_WORDS;
  const ready = doc ? true : sentences.length >= 3 && !tooLong && pasteTitle.trim().length > 0;

  const pick = (id) => {
    setChoice(id);
    const d = sourceDocs.find((x) => x.id === id);
    if (d) setSkill(d.skill);
  };

  const option = (id, Icon, title, sub) => (
    <button
      key={id}
      onClick={() => pick(id)}
      aria-pressed={choice === id}
      className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition ${choice === id ? 'border-brand bg-brand-soft' : 'border-line bg-surface hover:border-brand/40'}`}
    >
      <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${choice === id ? 'bg-brand text-on-brand' : 'bg-surface-2 text-muted'}`}>
        <Icon size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{title}</span>
        <span className="block text-[13px] text-muted">{sub}</span>
      </span>
      {choice === id && <LuCircleCheck size={18} className="mt-1 shrink-0 text-brand" />}
    </button>
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <Card className="p-5 sm:p-6 lg:col-span-2">
        <h2 className="text-lg font-bold">1. Choose a source</h2>
        <p className="mt-1 text-sm text-muted">The course will only use what is in this document.</p>
        <div className="mt-4 space-y-2">
          {sourceDocs.map((d) => option(d.id, LuFileText, d.title, `${d.kind} · ${d.paragraphs.flat().length} sentences`))}
          {option('paste', LuClipboardPaste, 'Paste your own text', `Up to about ${MAX_WORDS.toLocaleString('en')} words`)}
        </div>

        {!doc && (
          <div className="mt-4 space-y-2">
            <label className="block text-sm font-semibold" htmlFor="paste-title">
              Title
            </label>
            <input
              id="paste-title"
              value={pasteTitle}
              onChange={(e) => setPasteTitle(e.target.value)}
              placeholder="e.g. Remote visit guidelines"
              className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
            />
            <label className="block pt-1 text-sm font-semibold" htmlFor="paste-text">
              Text
            </label>
            <textarea
              id="paste-text"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={8}
              placeholder="Paste approved material here."
              className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
            />
            <p className={`text-[13px] ${tooLong ? 'font-semibold text-bad' : 'text-faint'}`}>
              {words.toLocaleString('en')} / {MAX_WORDS.toLocaleString('en')} words{tooLong ? ': please shorten it.' : ''}
            </p>
          </div>
        )}

        <label className="mt-5 block text-sm font-semibold" htmlFor="course-skill">
          2. Which skill does it train?
        </label>
        <select id="course-skill" value={skill} onChange={(e) => setSkill(e.target.value)} className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm">
          {categories.map((c) => (
            <optgroup key={c.id} label={c.label}>
              {skills
                .filter((s) => s.category === c.id)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button disabled={!ready} onClick={() => onDraft({ source: doc ? { kind: 'builtin', docId: doc.id } : { kind: 'pasted', title: pasteTitle.trim(), text: pasteText }, skill, title: doc ? doc.title : pasteTitle.trim() })}>
            <LuSparkles size={16} /> Draft course
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </Card>

      <DocumentPanel
        className="max-h-[640px] lg:col-span-3"
        title={doc ? doc.title : pasteTitle || 'Your text'}
        meta={doc ? `${doc.owner} · made-up demo document` : `${sentences.length} sentences`}
        sentences={sentences}
      />
    </div>
  );
}
