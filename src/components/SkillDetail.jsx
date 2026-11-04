import { LuTrendingUp } from 'react-icons/lu';
import { Modal, LevelPips, Chip, Bar } from './ui.jsx';
import QuestCard from './QuestCard.jsx';
import { skillById, categoryById, quests } from '../data/academy.js';
import { skillLevel, targetFor, levelProgress, levelName, questStatus } from '../lib/game.js';

/** Everything about one skill for one rep: level, why it matters, how colleagues compare, and the quests that build it. */
export default function SkillDetail({ skillId, rep, reps, state, onClose, onStart }) {
  const skill = skillId ? skillById[skillId] : null;
  return (
    <Modal open={Boolean(skill)} onClose={onClose} title={skill?.name ?? ''} wide>
      {skill && <Body skill={skill} rep={rep} reps={reps} state={state} onStart={onStart} />}
    </Modal>
  );
}

function Body({ skill, rep, reps, state, onStart }) {
  const points = rep.skills[skill.id];
  const level = skillLevel(points);
  const target = targetFor(rep, skill.id);
  const color = categoryById[skill.category].color;
  const atTarget = reps.filter((r) => skillLevel(r.skills[skill.id]) >= targetFor(r, skill.id)).length;
  const related = quests.filter((q) => q.skill === skill.id);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Chip>
          <span className="size-2 rounded-full" style={{ background: color }} /> {categoryById[skill.category].label}
        </Chip>
        {skill.demand >= 3 && <Chip tone="critical">Critical demand</Chip>}
        {skill.demand === 2 && <Chip tone="demand">In demand</Chip>}
        {skill.mandatory && <Chip tone="mandatory">Mandatory</Chip>}
      </div>
      <p className="mt-3 text-sm text-ink/85">{skill.description}</p>
      {skill.reason && (
        <p className="mt-3 flex gap-2 rounded-xl border border-[#e6b25c]/25 bg-[#e6b25c]/8 px-3.5 py-2.5 text-sm text-ink/90">
          <LuTrendingUp className="mt-0.5 shrink-0 text-gold" size={16} />
          <span>
            <b className="text-gold">Why it matters now:</b> {skill.reason}
          </span>
        </p>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="glass-inset rounded-xl p-4">
          <div className="text-[11px] tracking-wide text-faint uppercase">Your level</div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="text-lg font-semibold">
              {level} · {levelName(level)}
            </span>
            <LevelPips level={level} target={target} color={color} />
          </div>
          <div className="mt-3 text-xs text-muted">
            {level >= target ? 'At target for your role.' : `Target: ${target} · ${levelName(target)}`}
          </div>
          {level < 5 && (
            <>
              <Bar value={levelProgress(points)} tone={color} className="mt-2" height={6} label="Progress to next level" />
              <div className="mt-1 text-[11px] text-faint">{100 - (points % 100)} skill points to level {level + 1}</div>
            </>
          )}
        </div>
        <div className="glass-inset rounded-xl p-4">
          <div className="text-[11px] tracking-wide text-faint uppercase">Across the field force</div>
          <div className="mt-1 text-lg font-semibold">
            {atTarget} of {reps.length} at target
          </div>
          <Bar value={atTarget / reps.length} tone="linear-gradient(90deg,#1f7a80,#4fc3c9)" className="mt-3" height={6} label="Colleagues at target" />
          <div className="mt-2 text-xs text-muted">
            {atTarget / reps.length < 0.5 ? 'Most colleagues are still building this skill too.' : 'Most colleagues already meet the target.'}
          </div>
        </div>
      </div>

      <h3 className="mt-5 mb-2 text-sm font-semibold">Quests that build this skill</h3>
      <div className="grid gap-2">
        {related.map((q) => (
          <QuestCard key={q.id} quest={q} status={questStatus(state, rep.id, q.id)} onStart={onStart} compact />
        ))}
      </div>
    </div>
  );
}
