import { LuZap, LuClock, LuCheck, LuHourglass, LuPlay } from 'react-icons/lu';
import { QUEST_TYPES, skillById, categoryById } from '../data/academy.js';
import { Chip, QUEST_ICONS } from './ui.jsx';

/** A quest tile. `status` is open, pending or done. `reason` explains why it is suggested. */
export default function QuestCard({ quest, status = 'open', reason, onStart, compact = false }) {
  const Icon = QUEST_ICONS[quest.type];
  const skill = skillById[quest.skill];
  const color = categoryById[skill.category].color;
  const done = status === 'done';
  const pending = status === 'pending';
  return (
    <button
      onClick={() => !done && !pending && onStart(quest)}
      disabled={done || pending}
      className={`group card-inset flex w-full items-start gap-3 rounded-2xl p-3.5 text-left transition ${
        done || pending ? 'cursor-default opacity-70' : 'hover:border-brand/40 hover:bg-surface-2'
      }`}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl" style={{ background: `${color}26`, color }}>
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="text-sm leading-snug font-semibold">
            {quest.title}
            {quest.isNew && (
              <Chip tone="info" className="ml-1.5 align-middle">
                New
              </Chip>
            )}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-amber-ink">
            <LuZap size={12} /> {quest.xp}
          </span>
        </span>
        <span className="mt-0.5 block text-xs text-muted">
          {QUEST_TYPES[quest.type].label} · {skill.name}
        </span>
        {reason && !compact && <span className="mt-2 block text-xs leading-relaxed text-muted">{reason}</span>}
        <span className="mt-2 flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] text-faint">
            <LuClock size={11} /> {quest.minutes} min
          </span>
          {done && (
            <Chip tone="good">
              <LuCheck size={11} /> Done
            </Chip>
          )}
          {pending && (
            <Chip tone="demand">
              <LuHourglass size={11} /> Waiting for review
            </Chip>
          )}
          {!done && !pending && (
            <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-brand opacity-0 transition group-hover:opacity-100 max-md:opacity-100">
              <LuPlay size={11} /> Start
            </span>
          )}
        </span>
      </span>
    </button>
  );
}
