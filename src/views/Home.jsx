import { LuFlame, LuZap, LuTrophy, LuRocket, LuSparkles, LuArrowRight, LuUsers, LuLock, LuMedal } from 'react-icons/lu';
import GlassCard, { CardHeader } from '../components/GlassCard.jsx';
import QuestCard from '../components/QuestCard.jsx';
import { Avatar, Bar, LevelPips, Chip, Button, Stat } from '../components/ui.jsx';
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
      <GlassCard className="p-5 sm:p-6 lg:col-span-8" lift={false}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Avatar id={rep.id} size={64} />
            <span className="absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full bg-gold text-xs font-bold text-[#1a1406] shadow-[0_0_0_3px_#131b30]">
              {level.level}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted">Welcome back, {firstName}</p>
            <h2 className="text-2xl font-semibold tracking-tight">
              Level {level.level} · {level.title}
            </h2>
            <p className="text-xs text-faint">
              {roles[rep.role].label} · {teamById[rep.team].name}
            </p>
          </div>
        </div>
        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="font-semibold text-gold">{rep.xp.toLocaleString('en')} XP</span>
            <span className="text-muted">
              {level.xpToNext} XP to level {level.level + 1}
            </span>
          </div>
          <Bar value={level.progress} height={12} label="Progress to next level" />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat icon={LuFlame} tone="text-[#ff9f5a]" label="Streak" value={`${rep.streak} day${rep.streak === 1 ? '' : 's'}`} sub={rep.streak >= 7 ? 'On fire' : 'Learn today to grow it'} />
          <Stat icon={LuZap} tone="text-gold" label="This week" value={`${rep.weeklyXp} XP`} sub="Resets Monday" />
          <Stat icon={LuTrophy} tone="text-[#a9c1ff]" label="League" value={`#${rank}`} sub={`of ${leagueSize} reps`} />
          <Stat
            icon={LuRocket}
            tone={isLaunchReady(rep) ? 'text-pass' : 'text-fail'}
            label="Lumeva launch"
            value={isLaunchReady(rep) ? 'Ready' : 'Not yet'}
            sub={`${launchDone} of ${LAUNCH_SKILLS.length} launch skills`}
          />
        </div>
      </GlassCard>

      {/* Coach suggestion */}
      <GlassCard className="flex flex-col p-5 lg:col-span-4" delay={0.05}>
        <CardHeader title="Your coach suggests" subtitle="Picked from your gaps and what the business needs now">
          <LuSparkles className="shrink-0 text-gold" size={18} />
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
      </GlassCard>

      {/* Skill gaps */}
      <GlassCard className="p-5 lg:col-span-5" delay={0.1}>
        <CardHeader title="Your biggest gaps" subtitle="Skills below the target for your role">
          <button onClick={() => onTab('skills')} className="text-xs font-semibold text-[#a9c1ff] hover:underline">
            All skills
          </button>
        </CardHeader>
        <div className="mt-4 space-y-2">
          {gaps.length === 0 && <p className="text-sm text-muted">No gaps. You meet every target for your role.</p>}
          {gaps.map(({ skill, level: lvl, target }) => (
            <button
              key={skill.id}
              onClick={() => onOpenSkill(skill.id)}
              className="glass-inset flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-left hover:bg-white/10"
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
      </GlassCard>

      {/* More quests */}
      <GlassCard className="p-5 lg:col-span-7" delay={0.15}>
        <CardHeader title="Today's quests" subtitle="Short, focused and matched to your gaps">
          <button onClick={() => onTab('quests')} className="text-xs font-semibold text-[#a9c1ff] hover:underline">
            Quest board
          </button>
        </CardHeader>
        <div className="mt-4 grid gap-2.5">
          {more.map(({ quest, reason }) => (
            <QuestCard key={quest.id} quest={quest} reason={reason} status={questStatus(state, rep.id, quest.id)} onStart={onStart} />
          ))}
        </div>
      </GlassCard>

      {/* Team challenge */}
      <GlassCard className="p-5 lg:col-span-5" delay={0.2}>
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
        <Bar value={challenge.progress} tone="linear-gradient(90deg,#1f7a80,#4fc3c9)" height={10} className="mt-2" label="Team challenge progress" />
        <p className="mt-3 text-xs text-faint">Every Lumeva quest you finish counts towards the team goal.</p>
      </GlassCard>

      {/* Badges */}
      <GlassCard className="p-5 lg:col-span-7" delay={0.25}>
        <CardHeader title="Badges" subtitle={`${earned} of ${badges.length} earned`}>
          <LuMedal className="shrink-0 text-gold" size={18} />
        </CardHeader>
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-8 lg:grid-cols-4 xl:grid-cols-8">
          {badges.map((b) => (
            <div key={b.id} className="flex flex-col items-center gap-1.5 text-center" title={b.earned ? b.name : `Locked: ${b.hint}`}>
              <span className={`grid size-12 place-items-center rounded-full ${b.earned ? 'medal-earned text-[#1a1406]' : 'medal-locked text-faint'}`}>
                {b.earned ? <LuMedal size={20} /> : <LuLock size={16} />}
              </span>
              <span className={`text-[10.5px] leading-tight ${b.earned ? 'text-ink' : 'text-faint'}`}>{b.name}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
