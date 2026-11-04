import { LuFlame, LuZap, LuTrophy, LuRocket, LuSparkles, LuArrowRight, LuUsers, LuLock, LuMedal } from 'react-icons/lu';
import Card, { CardHeader } from '../components/Card.jsx';
import QuestCard from '../components/QuestCard.jsx';
import { Avatar, Bar, LevelPips, Chip, Button } from '../components/ui.jsx';
import { teamById, teamChallenge, categoryById, roles, LAUNCH_SKILLS } from '../data/academy.js';
import { playerLevel, topGaps, recommendQuests, isLaunchReady, challengeProgress, questStatus, levelName, skillLevel, targetFor } from '../lib/game.js';

export default function Home({ rep, state, rank, leagueSize, badges, onStart, onTab, onOpenSkill }) {
  const level = playerLevel(rep.xp);
  const gaps = topGaps(rep, 4);
  const [suggested, ...more] = recommendQuests(rep, state, 4);
  const challenge = challengeProgress(teamChallenge, state);
  const earned = badges.filter((b) => b.earned).length;
  const firstName = rep.name.split(' ')[0];
  const launchDone = LAUNCH_SKILLS.filter((id) => skillLevel(rep.skills[id]) >= targetFor(rep, id)).length;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* Hero */}
      <Card
        className="relative overflow-hidden p-5 text-white sm:p-6 lg:col-span-8"
        style={{ background: 'linear-gradient(135deg, #4a2fc0 0%, #6d47e8 55%, #8b5cf6 100%)', border: 'none' }}
      >
        <svg className="pointer-events-none absolute -top-10 -right-8 w-64 opacity-[0.13]" viewBox="0 0 100 100" aria-hidden="true">
          <path d="M50 2 92 26v48L50 98 8 74V26z" fill="none" stroke="#fff" strokeWidth="6" />
          <path d="M50 26 71 38v24L50 74 29 62V38z" fill="#fff" />
        </svg>
        <div className="relative flex flex-wrap items-center gap-4">
          <div className="hex medal-earned grid size-[76px] shrink-0 place-items-center">
            <span className="text-center leading-none">
              <span className="block text-[10px] font-semibold tracking-wider uppercase">Level</span>
              <span className="block text-3xl font-bold">{level.level}</span>
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white/75">Welcome back, {firstName}</p>
            <h2 className="text-[28px] leading-tight font-bold tracking-tight">{level.title}</h2>
            <p className="text-[13px] text-white/70">
              {roles[rep.role].label} · {teamById[rep.team].name}
            </p>
          </div>
          <span className="hidden sm:block">
            <Avatar id={rep.id} size={52} />
          </span>
        </div>
        <div className="relative mt-5">
          <div className="mb-1.5 flex justify-between text-[13px]">
            <span className="font-semibold">{rep.xp.toLocaleString('en')} XP</span>
            <span className="text-white/75">
              {level.xpToNext} XP to level {level.level + 1}
            </span>
          </div>
          <div className="h-3.5 overflow-hidden rounded-full bg-white/20" role="progressbar" aria-label="Progress to next level" aria-valuenow={Math.round(level.progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div className="xp-fill h-full rounded-full" style={{ width: `${Math.round(level.progress * 100)}%` }} />
          </div>
        </div>
        <div className="relative mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {[
            { icon: LuFlame, label: 'Streak', value: `${rep.streak} day${rep.streak === 1 ? '' : 's'}`, sub: rep.streak >= 7 ? 'On fire' : 'Learn today to grow it' },
            { icon: LuZap, label: 'This week', value: `${rep.weeklyXp} XP`, sub: 'Resets Monday' },
            { icon: LuTrophy, label: 'League', value: `#${rank}`, sub: `of ${leagueSize} reps` },
            { icon: LuRocket, label: 'Lumeva launch', value: isLaunchReady(rep) ? 'Ready' : 'Not yet', sub: `${launchDone} of ${LAUNCH_SKILLS.length} launch skills` },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="rounded-2xl bg-white/12 p-3 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-xs text-white/75">
                <Icon size={14} /> {label}
              </div>
              <div className="mt-1 text-lg leading-tight font-semibold">{value}</div>
              <div className="truncate text-[11px] text-white/65">{sub}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Coach suggestion */}
      <Card className="flex flex-col p-5 lg:col-span-4" delay={0.05}>
        <CardHeader title="Your coach suggests" subtitle="Picked from your gaps and what the business needs now">
          <LuSparkles className="shrink-0 text-brand" size={18} />
        </CardHeader>
        {suggested ? (
          <div className="mt-4 flex flex-1 flex-col">
            <QuestCard quest={suggested.quest} reason={suggested.reason} onStart={onStart} />
            <Button className="mt-4 self-start" onClick={() => onStart(suggested.quest)}>
              Start quest <LuArrowRight size={15} />
            </Button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">You have completed every quest. Impressive.</p>
        )}
      </Card>

      {/* Skill gaps */}
      <Card className="p-5 lg:col-span-5" delay={0.1}>
        <CardHeader title="Your biggest gaps" subtitle="Skills below the target for your role">
          <button onClick={() => onTab('skills')} className="text-xs font-semibold text-brand hover:underline">
            All skills
          </button>
        </CardHeader>
        <div className="mt-4 space-y-2">
          {gaps.length === 0 && <p className="text-sm text-muted">No gaps. You meet every target for your role.</p>}
          {gaps.map(({ skill, level: lvl, target }) => (
            <button
              key={skill.id}
              onClick={() => onOpenSkill(skill.id)}
              className="card-inset flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-left hover:bg-ink/5"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{skill.name}</span>
                <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
                  {levelName(lvl)} → {levelName(target)}
                  {skill.demand >= 3 && <Chip tone="critical">Critical</Chip>}
                  {skill.demand === 2 && <Chip tone="demand">In demand</Chip>}
                  {skill.mandatory && <Chip tone="mandatory">Mandatory</Chip>}
                </span>
              </span>
              <LevelPips level={lvl} target={target} color={categoryById[skill.category].color} size={8} />
            </button>
          ))}
        </div>
      </Card>

      {/* More quests */}
      <Card className="p-5 lg:col-span-7" delay={0.15}>
        <CardHeader title="Today's quests" subtitle="Short, focused and matched to your gaps">
          <button onClick={() => onTab('quests')} className="text-xs font-semibold text-brand hover:underline">
            Quest board
          </button>
        </CardHeader>
        <div className="mt-4 grid gap-2.5">
          {more.map(({ quest, reason }) => (
            <QuestCard key={quest.id} quest={quest} reason={reason} status={questStatus(state, rep.id, quest.id)} onStart={onStart} />
          ))}
        </div>
      </Card>

      {/* Team challenge */}
      <Card className="p-5 lg:col-span-5" delay={0.2}>
        <CardHeader title={teamChallenge.title} subtitle="Field force challenge · ends 30 Nov">
          <LuUsers className="shrink-0 text-teal" size={18} />
        </CardHeader>
        <p className="mt-3 text-sm text-muted">{teamChallenge.description}</p>
        <div className="mt-4 flex items-end justify-between">
          <span className="text-3xl font-semibold">
            {challenge.done}
            <span className="text-base text-muted"> / {challenge.goal}</span>
          </span>
          <span className="text-sm font-semibold text-teal">{Math.round(challenge.progress * 100)}%</span>
        </div>
        <Bar value={challenge.progress} tone="linear-gradient(90deg,#0e9a9a,#2cc5b8)" height={10} className="mt-2" label="Team challenge progress" />
        <p className="mt-3 text-xs text-faint">Every Lumeva quest you finish counts towards the team goal.</p>
      </Card>

      {/* Badges */}
      <Card className="p-5 lg:col-span-7" delay={0.25}>
        <CardHeader title="Badges" subtitle={`${earned} of ${badges.length} earned`}>
          <LuMedal className="shrink-0 text-gold" size={18} />
        </CardHeader>
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-8 lg:grid-cols-4 xl:grid-cols-8">
          {badges.map((b) => (
            <div key={b.id} className="flex flex-col items-center gap-1.5 text-center" title={b.earned ? b.name : `Locked: ${b.hint}`}>
              <span className={`hex grid size-12 place-items-center ${b.earned ? 'medal-earned' : 'medal-locked'}`}>
                {b.earned ? <LuMedal size={20} /> : <LuLock size={16} />}
              </span>
              <span className={`text-[10.5px] leading-tight ${b.earned ? 'text-ink' : 'text-faint'}`}>{b.name}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
