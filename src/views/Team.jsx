import { useState } from 'react';
import { LuUsers, LuFlame, LuListChecks, LuRocket, LuDownload, LuCheck, LuUndo2, LuBellRing, LuCircleCheck, LuTriangleAlert, LuCircleAlert } from 'react-icons/lu';
import Card, { CardHeader } from '../components/Card.jsx';
import { Avatar, Chip, Button, Stat, InfoTip, QUEST_ICONS } from '../components/ui.jsx';
import { skills, teams, teamById, adoptionHistory, skillById, categoryById } from '../data/academy.js';
import { skillInsights, launchReadiness, adoption, skillLevel, targetFor, skillsMatrixCsv, teamFindings, levelName, findQuest } from '../lib/game.js';

const STATUS_TONE = { 'Act now': 'critical', 'Keep an eye on': 'demand', 'On track': 'good' };
const FINDING = {
  good: { icon: LuCircleCheck, cls: 'bg-good-soft text-good' },
  warn: { icon: LuTriangleAlert, cls: 'bg-amber-soft text-amber-ink' },
  bad: { icon: LuCircleAlert, cls: 'bg-bad-soft text-bad' },
};
const pct = (v) => `${Math.round(v * 100)}%`;

/** Demand (x) against share of people below target (y). Top-right is "fix first". */
function DemandMatrix({ insights }) {
  const w = 460;
  const h = 260;
  const pad = { l: 44, r: 16, t: 30, b: 36 };
  const x = (d) => pad.l + ((d - 0.5) / 3) * (w - pad.l - pad.r);
  const y = (s) => h - pad.b - s * (h - pad.t - pad.b);
  // Spread skills that share the same demand so their dots don't overlap.
  const seen = {};
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Skills by business demand and share of people below target">
      <rect x={x(2.5)} y={pad.t} width={x(3.5) - x(2.5)} height={y(0.5) - pad.t} rx="10" fill="var(--bad-soft)" fillOpacity="0.6" />
      <text x={x(3.5) - 8} y={pad.t + 14} textAnchor="end" fontSize="11" fill="var(--bad)" fontWeight="700">
        Train here first
      </text>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="var(--line)" />
          <text x={pad.l - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="var(--ink-3)">
            {pct(t)}
          </text>
        </g>
      ))}
      {['Normal need', 'In demand', 'Needed most'].map((label, i) => (
        <text key={label} x={x(i + 1)} y={h - 12} textAnchor="middle" fontSize="10" fill="var(--ink-3)">
          {label}
        </text>
      ))}
      {insights.map((it) => {
        const k = `${it.skill.demand}`;
        seen[k] = (seen[k] ?? 0) + 1;
        const offset = ((seen[k] % 5) - 2) * 14;
        const cx = x(it.skill.demand) + offset;
        const cy = y(it.share);
        const color = categoryById[it.skill.category].color;
        return (
          <g key={it.skill.id}>
            <title>{`${it.skill.name}: ${pct(it.share)} below target`}</title>
            <circle cx={cx} cy={cy} r={6 + it.avgGap * 4} fill={color} fillOpacity="0.35" stroke={color} strokeWidth="1.5" />
          </g>
        );
      })}
    </svg>
  );
}

function AdoptionChart() {
  const w = 460;
  const h = 170;
  const pad = { l: 12, r: 12, t: 18, b: 26 };
  const maxQ = Math.max(...adoptionHistory.map((d) => d.quests));
  const step = (w - pad.l - pad.r) / adoptionHistory.length;
  const bx = (i) => pad.l + i * step + step * 0.2;
  const ly = (v) => h - pad.b - v * (h - pad.t - pad.b);
  const line = adoptionHistory.map((d, i) => `${bx(i) + step * 0.3},${ly(d.activeRate)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Weekly active people and quests completed over the last 8 weeks">
      {adoptionHistory.map((d, i) => {
        const bh = (d.quests / maxQ) * (h - pad.t - pad.b) * 0.8;
        return (
          <g key={d.week}>
            <title>{`${d.week}: ${pct(d.activeRate)} active, ${d.quests} quests`}</title>
            <rect x={bx(i)} y={h - pad.b - bh} width={step * 0.6} height={bh} rx="5" fill="var(--brand)" fillOpacity="0.2" />
            <text x={bx(i) + step * 0.3} y={h - 8} textAnchor="middle" fontSize="10" fill="var(--ink-3)">
              {d.week}
            </text>
          </g>
        );
      })}
      <polyline points={line} fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinejoin="round" />
      {adoptionHistory.map((d, i) => (
        <circle key={d.week} cx={bx(i) + step * 0.3} cy={ly(d.activeRate)} r="3.5" fill="var(--amber)" />
      ))}
      <text x={bx(adoptionHistory.length - 1) + step * 0.3} y={ly(adoptionHistory.at(-1).activeRate) - 10} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--amber-ink)">
        {pct(adoptionHistory.at(-1).activeRate)}
      </text>
    </svg>
  );
}

const heatClass = (gap) => `heat-${Math.min(gap, 2)}`;

export default function Team({ reps, state, onApprove, onReturn, onNudge }) {
  const [teamId, setTeamId] = useState('all');
  const group = teamId === 'all' ? reps : reps.filter((r) => r.team === teamId);
  const insights = skillInsights(group);
  const adopt = adoption(group, state, teamId === 'all' ? adoptionHistory.at(-1).quests : 0);
  const ready = launchReadiness(group);
  const pending = state.pending.filter((p) => group.some((r) => r.id === p.repId));
  const repName = Object.fromEntries(reps.map((r) => [r.id, r.name]));

  const download = () => {
    const csv = skillsMatrixCsv(group, (id) => teamById[id].name);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `levelup-skills-matrix-${teamId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const findings = teamFindings(group, state, teamId === 'all' ? adoptionHistory : []);

  return (
    <div className="grid grid-cols-1 gap-4">
      <section className="pt-2 pb-2">
        <span className="inline-block rounded-full bg-brand-soft px-3 py-1 text-[13px] font-semibold text-brand">For team leads and Learning &amp; Development</span>
        <h1 className="mt-4 max-w-3xl text-[34px] leading-[1.08] font-extrabold tracking-tight sm:text-5xl">
          What does the team <span className="text-brand">need to learn?</span>
        </h1>
        <p className="mt-3 max-w-2xl text-[17px] text-muted">
          Every quest is linked to a skill, so all that learning adds up to a live picture of the team: where the gaps are, who is ready for the launch and who has stopped learning.
        </p>
      </section>

      <Card className="flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="flex flex-wrap gap-1.5">
          {[{ id: 'all', name: 'All teams' }, ...teams].map((t) => (
            <button
              key={t.id}
              onClick={() => setTeamId(t.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${teamId === t.id ? 'bg-brand text-on-brand' : 'text-muted hover:bg-surface-2 hover:text-ink'}`}
            >
              {t.name}
            </button>
          ))}
        </div>
        <Button variant="secondary" onClick={download} className="py-1.5 text-xs">
          <LuDownload size={14} /> Download as a spreadsheet (CSV)
        </Button>
      </Card>

      <section aria-label="What we found" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {findings.map((f) => {
          const { icon: Icon, cls } = FINDING[f.tone];
          return (
            <Card key={f.title} className="flex gap-3 p-4">
              <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${cls}`}>
                <Icon size={18} />
              </span>
              <span>
                <span className="block font-bold">{f.title}</span>
                <span className="block text-sm text-muted">{f.text}</span>
              </span>
            </Card>
          );
        })}
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          { icon: LuUsers, tone: 'brand', label: 'Learned this week', value: pct(adopt.activeRate), hint: `${adopt.active} of ${adopt.total} people`, tip: 'People who finished at least one quest in the last 7 days.' },
          { icon: LuFlame, tone: 'flame', label: 'Average streak', value: `${adopt.avgStreak.toFixed(1)} days`, hint: 'Days in a row with learning', tip: 'How many days in a row people learn, on average. Higher means the habit is sticking.' },
          { icon: LuListChecks, tone: 'amber', label: 'Quests this week', value: adopt.questsThisWeek, hint: 'Lessons, quizzes and tasks' },
          { icon: LuRocket, tone: ready >= 0.5 ? 'good' : 'bad', label: 'Ready for the launch', value: pct(ready), hint: 'All 3 launch skills at the needed level', tip: 'Lumeva, a new medicine, launches in early 2027. Ready means launch knowledge, clinical data and objection handling are all at the level the role needs.' },
        ].map((k, i) => (
          <Card key={k.label} className="p-5" delay={0.04 * i}>
            <Stat {...k} />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="p-5 lg:col-span-7">
          <CardHeader title="Which skills to train first" subtitle="Each bubble is a skill. Higher up = more people are missing it. Further right = the company needs it more. Bigger = a bigger gap." />
          <DemandMatrix insights={insights} />
        </Card>
        <Card className="p-5 lg:col-span-5" delay={0.05}>
          <CardHeader title="Training priorities" subtitle="The skills where training will help the most" />
          <ol className="mt-3 space-y-1.5">
            {insights.slice(0, 6).map((it, i) => (
              <li key={it.skill.id} className="card-inset flex items-center gap-3 rounded-xl px-3 py-2.5">
                <span className="w-4 text-xs font-semibold text-muted">{i + 1}</span>
                <span className="size-2 shrink-0 rounded-full" style={{ background: categoryById[it.skill.category].color }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{it.skill.name}</span>
                  <span className="block text-[11px] text-muted">
                    {it.below} of {group.length} below the level they need · {it.levelsToGo} level{it.levelsToGo === 1 ? '' : 's'} to go in total
                  </span>
                </span>
                <Chip tone={STATUS_TONE[it.status]}>{it.status}</Chip>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card className="p-5">
        <CardHeader title="Everyone’s skills at a glance" subtitle="Each number is a level from 0 to 5. Green means at the level the role needs; amber is 1 short; red is 2 or more short.">
          <div className="hidden items-center gap-3 text-[11px] text-muted sm:flex">
            {[
              [0, 'On track'],
              [1, '1 short'],
              [2, '2+ short'],
            ].map(([g, label]) => (
              <span key={g} className="flex items-center gap-1.5">
                <span className={`size-3 rounded ${heatClass(g)}`} /> {label}
              </span>
            ))}
          </div>
        </CardHeader>
        <div className="scroll-thin mt-4 overflow-x-auto">
          <table className="w-full border-separate border-spacing-1 text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-0 bg-surface px-2 text-left font-medium text-muted">Person</th>
                {skills.map((s) => (
                  <th key={s.id} className="h-28 w-11 min-w-11 align-bottom font-medium text-muted">
                    <span className="mx-auto block w-4 rotate-180 text-left whitespace-nowrap [writing-mode:vertical-rl]">{s.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {group.map((rep) => (
                <tr key={rep.id}>
                  <td className="sticky left-0 z-10 bg-surface pr-2">
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <Avatar id={rep.id} size={22} /> {rep.name}
                    </span>
                  </td>
                  {skills.map((s) => {
                    const level = skillLevel(rep.skills[s.id]);
                    const target = targetFor(rep, s.id);
                    const gap = Math.max(0, target - level);
                    return (
                      <td
                        key={s.id}
                        tabIndex={0}
                        title={`${rep.name} · ${s.name}: ${levelName(level)} (level ${level}), needs level ${target}`}
                        className={`heat-cell h-8 rounded-md text-center font-semibold ${heatClass(gap)}`}
                      >
                        {level}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="p-5 lg:col-span-5">
          <CardHeader title="Are people using it?" subtitle="Last 8 weeks, whole field force">
            <span className="flex items-center gap-3 text-[11px] text-muted">
              <span className="flex items-center gap-1">
                <span className="h-0.5 w-3 bg-amber" /> % who learned
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2.5 rounded-sm bg-brand/25" /> Quests done
              </span>
            </span>
          </CardHeader>
          <div className="mt-3">
            <AdoptionChart />
          </div>
        </Card>

        <Card className="p-5 lg:col-span-4" delay={0.05}>
          <CardHeader title="Waiting for your review" subtitle="Practice tasks need a quick yes from a team lead before the points are added" />
          <div className="mt-3 space-y-2">
            {pending.length === 0 && <p className="text-sm text-muted">Nothing to review. All caught up.</p>}
            {pending.map((p) => {
              const quest = findQuest(state, p.questId);
              if (!quest) return null;
              const Icon = QUEST_ICONS[quest.type];
              return (
                <div key={`${p.repId}-${p.questId}`} className="card-inset rounded-xl p-3">
                  <div className="flex items-start gap-2.5">
                    <Avatar id={p.repId} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{quest.title}</div>
                      <div className="flex items-center gap-1 text-[11px] text-muted">
                        <Icon size={11} /> {repName[p.repId]} · {skillById[quest.skill].name}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2.5 flex gap-2">
                    <Button className="flex-1 py-1.5 text-xs" onClick={() => onApprove(p.repId, p.questId)}>
                      <LuCheck size={14} /> Approve +{quest.xp} XP
                    </Button>
                    <Button variant="secondary" className="py-1.5 text-xs" onClick={() => onReturn(p.repId, p.questId)}>
                      <LuUndo2 size={14} /> Send back
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-3" delay={0.1}>
          <CardHeader title="Could use a nudge" subtitle="No learning in over a week" />
          <div className="mt-3 space-y-2">
            {adopt.inactive.length === 0 && <p className="text-sm text-muted">Everyone learned this week.</p>}
            {adopt.inactive.map((r) => (
              <div key={r.id} className="card-inset flex items-center gap-2.5 rounded-xl p-2.5">
                <Avatar id={r.id} size={28} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{r.name}</div>
                  <div className="text-[12px] text-muted">Last learned {r.activeDaysAgo} days ago</div>
                </div>
                <button onClick={() => onNudge(r)} aria-label={`Nudge ${r.name}`} className="grid size-8 place-items-center rounded-full text-amber-ink hover:bg-surface-2">
                  <LuBellRing size={15} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
