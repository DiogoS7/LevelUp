import { useState } from 'react';
import { LuPlus, LuFileText, LuCircleCheck, LuPencilLine, LuShieldCheck, LuSparkles, LuBookOpen, LuArrowLeft } from 'react-icons/lu';
import Card, { CardHeader } from '../components/Card.jsx';
import { Button, Chip } from '../components/ui.jsx';
import { skillById } from '../data/academy.js';
import SourceStep from '../components/studio/SourceStep.jsx';

const STEPS = [
  { icon: LuFileText, title: 'Pick a source', text: 'Start from approved company material, like a product leaflet or a field guide.' },
  { icon: LuSparkles, title: 'Let AI draft it', text: 'LevelUp drafts a 5-minute lesson, a 3-question quiz and a practice task from it.' },
  { icon: LuShieldCheck, title: 'Check it against the source', text: 'Every point shows the sentence it came from. Keep what is right, remove the rest.' },
  { icon: LuBookOpen, title: 'Approve and it goes live', text: 'Approved courses appear in Learn as new quests, and count towards the game.' },
];

function CourseRow({ course, onOpen }) {
  const approved = course.status === 'approved';
  return (
    <button onClick={() => onOpen(course.id)} className="card-inset flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left hover:border-brand/40">
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${approved ? 'bg-good-soft text-good' : 'bg-amber-soft text-amber-ink'}`}>
        {approved ? <LuCircleCheck size={18} /> : <LuPencilLine size={18} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{course.title}</span>
        <span className="block truncate text-[13px] text-muted">
          {skillById[course.skill].name} ·{' '}
          {approved ? `Approved by ${course.approvedBy} on ${course.approvedAt}` : course.note ? `Sent back: “${course.note}”` : `Draft by ${course.createdBy}`}
        </span>
      </span>
      <Chip tone={approved ? 'good' : 'demand'}>{approved ? 'Live in Learn' : 'Draft'}</Chip>
    </button>
  );
}

/** Course studio: managers and L&D turn a source document into a course, review it and publish it as quests. */
/** Progress through the builder: 1 Source, 2 Draft, 3 Review. */
function Stepper({ step }) {
  const steps = ['Source', 'Draft', 'Review'];
  return (
    <ol className="flex items-center gap-2 text-sm" aria-label="Steps">
      {steps.map((label, i) => {
        const n = i + 1;
        const state = n < step ? 'done' : n === step ? 'now' : 'later';
        return (
          <li key={label} className="flex items-center gap-2" aria-current={state === 'now' ? 'step' : undefined}>
            <span
              className={`grid size-6 place-items-center rounded-full text-xs font-bold ${state === 'later' ? 'bg-surface-2 text-faint' : 'bg-brand text-on-brand'}`}
            >
              {n}
            </span>
            <span className={state === 'now' ? 'font-semibold' : 'text-muted'}>{label}</span>
            {n < steps.length && <span className="mx-1 h-px w-6 bg-line" />}
          </li>
        );
      })}
    </ol>
  );
}

export default function Studio({ viewer, state, onDraft, onOpen = () => {} }) {
  const [mode, setMode] = useState('list');
  const courses = state.courses ?? [];

  if (mode === 'new') {
    return (
      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button onClick={() => setMode('list')} className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
            <LuArrowLeft size={15} /> Course studio
          </button>
          <Stepper step={1} />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">New course</h1>
        <SourceStep onDraft={onDraft} onCancel={() => setMode('list')} />
      </div>
    );
  }
  const drafts = courses.filter((c) => c.status !== 'approved');
  const live = courses.filter((c) => c.status === 'approved');

  return (
    <div className="grid grid-cols-1 gap-4">
      <section className="pt-2 pb-2">
        <span className="inline-block rounded-full bg-brand-soft px-3 py-1 text-[13px] font-semibold text-brand">
          Course studio · for managers and Learning &amp; Development
        </span>
        <h1 className="mt-4 max-w-3xl text-[34px] leading-[1.08] font-extrabold tracking-tight sm:text-5xl">
          Turn a document into <span className="text-brand">training in minutes.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-[17px] text-muted">
          AI drafts the course, you check every part of it against the source, and once you approve it the reps can play it straight away as a quest.
        </p>
        <Button className="mt-6 px-6 py-3 text-[15px]" onClick={() => setMode('new')}>
          <LuPlus size={17} /> New course
        </Button>
      </section>

      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="card rounded-2xl p-4">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand">
                <Icon size={16} />
              </span>
              <span className="text-[13px] font-semibold text-faint">Step {i + 1}</span>
            </div>
            <h3 className="mt-2.5 font-bold">{title}</h3>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <CardHeader title="Drafts" subtitle="Waiting for a review before anyone can see them" />
          <div className="mt-4 space-y-2">
            {drafts.length === 0 && <p className="card-inset rounded-xl px-4 py-3 text-sm text-muted">No drafts yet. Press New course to make one.</p>}
            {drafts.map((c) => (
              <CourseRow key={c.id} course={c} onOpen={onOpen} />
            ))}
          </div>
        </Card>
        <Card className="p-5 sm:p-6" delay={0.05}>
          <CardHeader title="Approved" subtitle="Live in Learn for every rep" />
          <div className="mt-4 space-y-2">
            {live.length === 0 && <p className="card-inset rounded-xl px-4 py-3 text-sm text-muted">Nothing approved yet.</p>}
            {live.map((c) => (
              <CourseRow key={c.id} course={c} onOpen={onOpen} />
            ))}
          </div>
        </Card>
      </div>
      <p className="text-[13px] text-faint">Signed in as {viewer.name}, {viewer.title}. Courses you make are saved in this browser only.</p>
    </div>
  );
}
