import { useState } from 'react';
import { LuCheck, LuX, LuTriangleAlert, LuCircleCheck, LuUndo2, LuBookOpen, LuCircleHelp, LuMic, LuShieldCheck } from 'react-icons/lu';
import Card from '../Card.jsx';
import { Button, Chip } from '../ui.jsx';
import DocumentPanel from './DocumentPanel.jsx';
import { reviewSummary, sourceTitle, courseQuests } from '../../lib/courses.js';
import { skillById } from '../../data/academy.js';

const KIND_ICON = { lesson: LuBookOpen, quiz: LuCircleHelp, practice: LuMic };

function Item({ item, sentences, selected, onSelect, onDecide, locked }) {
  const Icon = KIND_ICON[item.kind];
  const tone = item.decision === 'ok' ? 'border-good/50' : item.decision === 'remove' ? 'border-line opacity-60' : selected ? 'border-brand' : 'border-line';
  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect())}
        aria-pressed={selected}
        className={`rounded-xl border bg-surface p-4 transition ${tone} ${selected ? 'ring-2 ring-brand/30' : 'hover:border-brand/40'}`}
      >
        <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-faint">
          <Icon size={13} /> {item.label}
          {item.inSource ? (
            <span className="font-normal">· from sentence {item.sources.join(', ')}</span>
          ) : (
            <Chip tone="critical">
              <LuTriangleAlert size={11} /> Not in the source
            </Chip>
          )}
        </div>
        <p className={`mt-1.5 text-[15px] ${item.decision === 'remove' ? 'line-through' : ''}`}>{item.text}</p>
        {item.kind === 'quiz' && (
          <ul className="mt-2 space-y-1 text-[13px]">
            {item.question.options.map((o, i) => (
              <li key={o} className={`flex items-start gap-1.5 ${i === item.question.answer ? 'font-semibold text-good' : 'text-muted'}`}>
                {i === item.question.answer ? <LuCheck size={14} className="mt-0.5 shrink-0" /> : <span className="w-3.5 shrink-0" />}
                {o}
              </li>
            ))}
          </ul>
        )}
        {item.kind === 'practice' && <p className="mt-1 text-[13px] text-muted">{item.detail}</p>}
        {!item.inSource && <p className="mt-2 text-[13px] text-bad">{item.problem}. It can only be removed.</p>}
        {item.inSource && (
          <blockquote className="mt-2 rounded-lg border-l-2 border-brand bg-brand-soft px-3 py-1.5 text-[13px] text-muted lg:hidden">
            {item.sources.map((n) => (
              <span key={n} className="block">
                <b className="text-brand">{n}.</b> {sentences[n - 1]?.text}
              </span>
            ))}
          </blockquote>
        )}

        {!locked && (
          <div className="mt-3 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              disabled={!item.inSource}
              onClick={() => onDecide(item.decision === 'ok' ? null : 'ok')}
              aria-pressed={item.decision === 'ok'}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-35 ${
                item.decision === 'ok' ? 'bg-good text-on-brand' : 'bg-good-soft text-good hover:brightness-95'
              }`}
            >
              <LuCheck size={14} /> OK
            </button>
            <button
              onClick={() => onDecide(item.decision === 'remove' ? null : 'remove')}
              aria-pressed={item.decision === 'remove'}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                item.decision === 'remove' ? 'bg-bad text-on-brand' : 'bg-bad-soft text-bad hover:brightness-95'
              }`}
            >
              <LuX size={14} /> Remove
            </button>
          </div>
        )}
        {locked && item.decision && (
          <div className="mt-2">
            <Chip tone={item.decision === 'ok' ? 'good' : 'default'}>{item.decision === 'ok' ? 'Kept' : 'Removed'}</Chip>
          </div>
        )}
      </div>
    </li>
  );
}

/**
 * Step 3: check every part of the draft against the document. Each part is marked OK or Remove; parts
 * with no matching source sentence can only be removed. Approve publishes it; Send back keeps it as a draft
 * with a note.
 */
export default function ReviewStep({ course, viewer, onDecide, onApprove, onSendBack }) {
  const summary = reviewSummary(course);
  const [selected, setSelected] = useState(summary.items[0]?.key);
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState('');
  const locked = course.status === 'approved';
  const current = summary.items.find((i) => i.key === selected);

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <Chip tone={locked ? 'good' : 'demand'}>{locked ? 'Approved' : 'Draft'}</Chip>
            Trains {skillById[course.skill].name} · from “{sourceTitle(course.source)}”
          </div>
          {locked ? (
            <p className="mt-2 flex items-center gap-1.5 font-semibold text-good">
              <LuCircleCheck size={17} /> Approved by {course.approvedBy} on {course.approvedAt}
            </p>
          ) : null}
          {locked ? (
            <p className="mt-1 text-sm text-muted">
              Live in Learn as {courseQuests([course]).length} new quests: {courseQuests([course]).map((q) => q.title).join(' · ')}
            </p>
          ) : (
            <p className="mt-2 font-semibold">
              {summary.decided} of {summary.total} checked
              {summary.notInSource > 0 && <span className="text-bad"> · {summary.notInSource} not in the source</span>}
            </p>
          )}
          {!locked && course.note && (
            <p className="mt-2 rounded-lg bg-amber-soft px-3 py-1.5 text-sm">
              <b>Sent back{course.noteBy ? ` by ${course.noteBy}` : ''}:</b> {course.note}
            </p>
          )}
          {!locked && !summary.canApprove && <p className="mt-1 text-[13px] text-faint">{summary.reason}</p>}
        </div>
        {!locked && (
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setSending((s) => !s)}>
              <LuUndo2 size={15} /> Send back
            </Button>
            <Button disabled={!summary.canApprove} onClick={onApprove} title={summary.reason ?? undefined}>
              <LuShieldCheck size={16} /> Approve
            </Button>
          </div>
        )}
      </Card>

      {sending && !locked && (
        <Card className="p-5">
          <label htmlFor="send-back-note" className="block font-semibold">
            What needs to change?
          </label>
          <textarea
            id="send-back-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="e.g. Check the dosing question against the leaflet."
            className="mt-2 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
          />
          <div className="mt-3 flex gap-2">
            <Button
              disabled={!note.trim()}
              onClick={() => {
                onSendBack(note);
                setSending(false);
                setNote('');
              }}
            >
              Keep as draft with this note
            </Button>
            <Button variant="ghost" onClick={() => setSending(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ol className="space-y-2.5" aria-label="Parts of the course">
          {summary.items.map((item) => (
            <Item key={item.key} item={item} sentences={summary.sentences} locked={locked} selected={item.key === selected} onSelect={() => setSelected(item.key)} onDecide={(d) => (setSelected(item.key), onDecide(item.key, d))} />
          ))}
        </ol>
        <div className="lg:sticky lg:top-20 lg:self-start">
          <DocumentPanel
            className="max-h-[70vh]"
            title={sourceTitle(course.source)}
            meta={current ? (current.inSource ? `${current.label} comes from the highlighted sentence${current.sources.length > 1 ? 's' : ''}.` : `${current.label} has no matching sentence here.`) : null}
            sentences={summary.sentences}
            highlight={current?.inSource ? current.sources : []}
          />
          <p className="mt-2 px-1 text-[13px] text-faint">Viewing as {viewer.name}. Approving records your name and today&apos;s date.</p>
        </div>
      </div>
    </div>
  );
}
