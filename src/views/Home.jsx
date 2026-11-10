import { useState } from 'react';
import { LuFlame, LuTrophy, LuRocket, LuArrowRight, LuUsers, LuLock, LuMedal, LuStar, LuClock, LuZap } from 'react-icons/lu';
import Card, { CardHeader } from '../components/Card.jsx';
import QuestCard from '../components/QuestCard.jsx';
import { Bar, LevelPips, Button, Stat, DemandChip, QUEST_ICONS } from '../components/ui.jsx';
import { teamById, teamChallenge, categoryById, roles, company, LAUNCH_SKILLS, QUEST_TYPES } from '../data/academy.js';
import { playerLevel, topGaps, recommendQuests, isLaunchReady, challengeProgress, questStatus, levelName, skillLevel, targetFor } from '../lib/game.js';

export default function Home({ rep, state, rank, leagueSize, badges, onStart, onTab, onOpenSkill }) {
  const level = playerLevel(rep.xp);
  const gaps = topGaps(rep, 4);
  const [next, ...more] = recommendQuests(rep, state, 4);
  const challenge = challengeProgress(teamChallenge, state);
  const earned = badges.filter((b) => b.earned).length;
  const firstName = rep.name.split(' ')[0];
  const launchDone = LAUNCH_SKILLS.filter((id) => skillLevel(rep.skills[id]) >= targetFor(rep, id)).length;
  const NextIcon = next ? QUEST_ICONS[next.quest.type] : null;
  const [picked, setPicked] = useState(null);
  const shownBadge = badges.find((b) => b.id === picked) ?? badges.find((b) => !b.earned) ?? badges[0];

  return (
    <div className="space-y-6">
      {/* Hero: one clear next step */}
      <section className="pt-2">
        <span className="inline-block rounded-full bg-brand-soft px-3 py-1 text-[13px] font-semibold text-brand">
          {company.name} · {roles[rep.role].label} · {teamById[rep.team].name}
        </span>
        <h1 className="mt-4 max-w-3xl text-[34px] leading-[1.08] font-extrabold tracking-tight sm:text-5xl">
          Hi {firstName}, here&apos;s <span className="text-brand">what to learn next.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-[17px] text-muted">
          We picked it from the skills your role needs and what the company needs most right now. It takes a few minutes.
        </p>

        {next ? (
          <Card className="mt-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand text-on-brand">
              <NextIcon size={26} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-[13px] text-faint">
                <span>{QUEST_TYPES[next.quest.type].label}</span>·
                <span className="flex items-center gap-1">
                  <LuClock size={13} /> {next.quest.minutes} min
                </span>
                ·
                <span className="flex items-center gap-1 font-semibold text-amber-ink">
                  <LuZap size={13} /> {next.quest.xp} XP
                </span>
              </div>
              <h2 className="mt-1 text-xl font-bold">{next.quest.title}</h2>
              <p className="mt-0.5 text-sm text-muted">{next.reason}</p>
            </div>
            <Button className="shrink-0 px-6 py-3 text-[15px]" onClick={() => onStart(next.quest)}>
              Start now <LuArrowRight size={16} />
            </Button>
          </Card>
        ) : (
          <Card className="mt-6 p-6 text-muted">You have finished every quest. Impressive.</Card>
        )}
      </section>

      {/* Four simple numbers */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card className="p-5">
          <Stat
            icon={LuStar}
            value={`Level ${level.level}`}
            label={level.title}
            tip="You earn XP (points) for every quest. Collect enough and you move up a level."
            hint={`${level.xpToNext} XP to level ${level.level + 1}`}
          />
          <Bar value={level.progress} className="mt-3" label="Progress to next level" />
        </Card>
        <Card className="p-5" delay={0.04}>
          <Stat
            icon={LuFlame}
            tone="flame"
            value={`${rep.streak} day${rep.streak === 1 ? '' : 's'}`}
            label="Learning streak"
            tip="Days in a row with at least one quest. Learn something today to keep it going."
            hint={rep.streak >= 7 ? 'On fire, keep it up' : 'Learn today to grow it'}
          />
        </Card>
        <Card className="p-5" delay={0.08}>
          <Stat
            icon={LuTrophy}
            tone="amber"
            value={`#${rank}`}
            label="This week"
            tip="Your place on this week's leaderboard. Everyone starts again at zero every Monday."
            hint={`of ${leagueSize} people · ${rep.weeklyXp} XP`}
          />
        </Card>
        <Card className="p-5" delay={0.12}>
          <Stat
            icon={LuRocket}
            tone={isLaunchReady(rep) ? 'good' : 'bad'}
            value={`${launchDone} of ${LAUNCH_SKILLS.length}`}
            valueClass={isLaunchReady(rep) ? 'text-good' : ''}
            label="Launch skills ready"
            tip="Lumeva, a new medicine, launches in early 2027. These three skills decide whether you are ready for it."
            hint={isLaunchReady(rep) ? 'Ready for Lumeva' : 'Needed for the Lumeva launch'}
          />
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <CardHeader title="Skills to work on" subtitle="Where you are below the level your role needs">
            <button onClick={() => onTab('skills')} className="shrink-0 text-sm font-semibold text-brand hover:underline">
              All skills
            </button>
          </CardHeader>
          <div className="mt-4 space-y-2">
            {gaps.length === 0 && <p className="text-sm text-muted">Nothing to work on. You meet every level your role needs.</p>}
            {gaps.map(({ skill, level: lvl, target }) => (
              <button
                key={skill.id}
                onClick={() => onOpenSkill(skill.id)}
                className="card-inset flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left hover:border-brand/40"
              >
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{skill.name}</span>
                    <DemandChip skill={skill} />
                  </span>
                  <span className="mt-0.5 block text-[13px] text-muted">
                    You: {levelName(lvl)} · Needed: {levelName(target)}
                  </span>
                </span>
                <LevelPips level={lvl} target={target} color={categoryById[skill.category].color} size={8} />
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5 sm:p-6" delay={0.05}>
          <CardHeader title="More quests for you" subtitle="Short, and matched to the skills above">
            <button onClick={() => onTab('quests')} className="shrink-0 text-sm font-semibold text-brand hover:underline">
              See all
            </button>
          </CardHeader>
          <div className="mt-4 grid gap-2.5">
            {more.map(({ quest }) => (
              <QuestCard key={quest.id} quest={quest} status={questStatus(state, rep.id, quest.id)} onStart={onStart} />
            ))}
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="p-5 sm:p-6 lg:col-span-2">
          <CardHeader title={`Team goal: ${teamChallenge.title}`} subtitle="Everyone in the field force, together · ends 30 Nov">
            <LuUsers className="shrink-0 text-teal" size={20} />
          </CardHeader>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-4xl font-extrabold tracking-tight">
              {challenge.done}
              <span className="text-lg font-semibold text-faint"> / {challenge.goal} quests</span>
            </span>
            <span className="font-bold text-teal">{Math.round(challenge.progress * 100)}%</span>
          </div>
          <Bar value={challenge.progress} tone="var(--teal)" height={10} className="mt-2" label="Team goal progress" />
          <p className="mt-3 text-sm text-muted">Every Lumeva quest you finish counts towards it.</p>
        </Card>

        <Card className="p-5 sm:p-6 lg:col-span-3" delay={0.05}>
          <CardHeader title="Your badges" subtitle={`${earned} of ${badges.length} earned. Tap one to see how to get it.`}>
            <LuMedal className="shrink-0 text-amber" size={20} />
          </CardHeader>
          <div className="mt-5 grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-8 lg:grid-cols-4 xl:grid-cols-8">
            {badges.map((b) => (
              <button
                key={b.id}
                onClick={() => setPicked(b.id)}
                aria-pressed={shownBadge.id === b.id}
                className={`flex flex-col items-center gap-2 rounded-xl p-1.5 text-center ${shownBadge.id === b.id ? 'bg-surface-2' : 'hover:bg-surface-2'}`}
              >
                <span className={`grid size-12 place-items-center rounded-full ${b.earned ? 'medal-earned' : 'medal-locked'}`}>
                  {b.earned ? <LuMedal size={20} /> : <LuLock size={15} />}
                </span>
                <span className={`text-[12px] leading-tight ${b.earned ? 'font-semibold' : 'text-faint'}`}>{b.name}</span>
              </button>
            ))}
          </div>
          <p className="card-inset mt-4 rounded-xl px-4 py-2.5 text-sm" aria-live="polite">
            <b>{shownBadge.name}:</b> <span className="text-muted">{shownBadge.earned ? `Earned! ${shownBadge.hint}` : shownBadge.hint}</span>
          </p>
        </Card>
      </section>
    </div>
  );
}
