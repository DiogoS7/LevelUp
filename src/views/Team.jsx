import { useState } from 'react';
import { LuUsers, LuFlame, LuListChecks, LuRocket, LuDownload, LuCheck, LuUndo2, LuBellRing } from 'react-icons/lu';
import GlassCard, { CardHeader } from '../components/GlassCard.jsx';
import { Avatar, Chip, Button, Stat, QUEST_ICONS } from '../components/ui.jsx';
import { skills, teams, teamById, adoptionHistory, questById, skillById, categoryById } from '../data/academy.js';
import { skillInsights, launchReadiness, adoption, skillLevel, targetFor, skillsMatrixCsv } from '../lib/game.js';

const STATUS_TONE = { Critical: 'critical', Watch: 'demand', Healthy: 'good' };
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
      <rect x={x(2.5)} y={pad.t} width={x(3.5) - x(2.5)} height={y(0.5) - pad.t} rx="10" fill="rgb(255 143 143 / 0.08)" />
      <text x={x(3.5) - 8} y={pad.t + 14} textAnchor="end" fontSize="10" fill="#ff8f8f" fontWeight="600">
        FIX FIRST
      </text>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="rgb(255 255 255 / 0.06)" />
          <text x={pad.l - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="rgb(245 243 240 / 0.4)">
            {pct(t)}
          </text>
        </g>
      ))}
      {['Baseline', 'High', 'Critical'].map((label, i) => (
        <text key={label} x={x(i + 1)} y={h - 12} textAnchor="middle" fontSize="10" fill="rgb(245 243 240 / 0.5)">
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
            <rect x={bx(i)} y={h - pad.b - bh} width={step * 0.6} height={bh} rx="5" fill="rgb(91 134 240 / 0.3)" />
            <text x={bx(i) + step * 0.3} y={h - 8} textAnchor="middle" fontSize="10" fill="rgb(245 243 240 / 0.45)">
              {d.week}
            </text>
          </g>
        );
      })}
      <polyline points={line} fill="none" stroke="#f2c879" strokeWidth="2.5" strokeLinejoin="round" />
      {adoptionHistory.map((d, i) => (
        <circle key={d.week} cx={bx(i) + step * 0.3} cy={ly(d.activeRate)} r="3.5" fill="#f2c879" />
      ))}
      <text x={bx(adoptionHistory.length - 1) + step * 0.3} y={ly(adoptionHistory.at(-1).activeRate) - 10} textAnchor="middle" fontSize="11" fontWeight="600" fill="#f2c879">
        {pct(adoptionHistory.at(-1).activeRate)}
      </text>
    </svg>
  );
}

function heatColor(gap) {
  if (gap === 0) return 'rgb(74 222 128 / 0.22)';
  if (gap === 1) return 'rgb(230 178 92 / 0.32)';
  return 'rgb(255 143 143 / 0.4)';
}

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

  return (
    <div className="grid grid-cols-1 gap-4">
      <GlassCard className="flex flex-wrap items-center justify-between gap-3 p-3" lift={false}>
        <div className="flex flex-wrap gap-1.5">
          {[{ id: 'all', name: 'All teams' }, ...teams].map((t) => (
            <button
              key={t.id}
              onClick={() => setTeamId(t.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${teamId === t.id ? 'bg-white text-[#0f1524]' : 'text-muted hover:bg-white/10 hover:text-ink'}`}
            >
              {t.name}
            </button>
          ))}
        </div>
        <Button variant="secondary" onClick={download} className="py-1.5 text-xs">
          <LuDownload size={14} /> Export skills matrix (CSV)
        </Button>
      </GlassCard>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: LuUsers, tone: 'text-[#a9c1ff]', label: 'Active this week', value: pct(adopt.activeRate), sub: `${adopt.active} of ${adopt.total} people` },
          { icon: LuFlame, tone: 'text-[#ff9f5a]', label: 'Average streak', value: `${adopt.avgStreak.toFixed(1)} days`, sub: 'Days in a row with learning' },
          { icon: LuListChecks, tone: 'text-gold', label: 'Quests this week', value: adopt.questsThisWeek, sub: 'Lessons, quizzes and challenges' },
          { icon: LuRocket, tone: ready >= 0.5 ? 'text-pass' : 'text-fail', label: 'Lumeva launch ready', value: pct(ready), sub: 'All launch skills at target' },
        ].map((k, i) => (
          <GlassCard key={k.label} className="p-4" delay={0.04 * i}>
            <Stat {...k} />
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <GlassCard className="p-5 lg:col-span-7" lift={false}>
          <CardHeader title="Skills in demand vs skills lacking" subtitle="Bubble size = average gap. Top right is where training helps most." />
          <DemandMatrix insights={insights} />
        </GlassCard>
        <GlassCard className="p-5 lg:col-span-5" delay={0.05} lift={false}>
          <CardHeader title="Where to focus training" subtitle="Ranked by demand × average gap" />
          <ol className="mt-3 space-y-1.5">
            {insights.slice(0, 6).map((it, i) => (
              <li key={it.skill.id} className="glass-inset flex items-center gap-3 rounded-xl px-3 py-2.5">
                <span className="w-4 text-xs font-semibold text-muted">{i + 1}</span>
                <span className="size-2 shrink-0 rounded-full" style={{ background: categoryById[it.skill.category].color }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{it.skill.name}</span>
                  <span className="block text-[11px] text-muted">
                    {it.below} of {group.length} below target · avg gap {it.avgGap.toFixed(1)}
                  </span>
                </span>
                <Chip tone={STATUS_TONE[it.status]}>{it.status}</Chip>
              </li>
            ))}
          </ol>
        </GlassCard>
      </div>

      <GlassCard className="p-5" lift={false}>
        <CardHeader title="Skills heatmap" subtitle="Current level in each cell. Colour shows the gap to the role target.">
          <div className="hidden items-center gap-3 text-[11px] text-muted sm:flex">
            {[
              [0, 'At target'],
              [1, '1 below'],
              [2, '2+ below'],
            ].map(([g, label]) => (
              <span key={g} className="flex items-center gap-1.5">
                <span className="size-3 rounded" style={{ background: heatColor(g) }} /> {label}
              </span>
            ))}
          </div>
        </CardHeader>
        <div className="scroll-glass mt-4 overflow-x-auto">
          <table className="border-separate border-spacing-1 text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-[#131b2f] px-2 text-left font-medium text-muted">Rep</th>
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
                  <td className="sticky left-0 z-10 bg-[#131b2f] pr-2">
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
                        title={`${rep.name} · ${s.name}: level ${level}, target ${target}`}
                        className="heat-cell h-8 rounded-md text-center font-semibold"
                        style={{ background: heatColor(gap) }}
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
      </GlassCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <GlassCard className="p-5 lg:col-span-5" lift={false}>
          <CardHeader title="Adoption" subtitle="Last 8 weeks, whole field force">
            <span className="flex items-center gap-3 text-[11px] text-muted">
              <span className="flex items-center gap-1">
                <span className="h-0.5 w-3 bg-gold" /> Active
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2.5 rounded-sm bg-[#5b86f0]/40" /> Quests
              </span>
            </span>
          </CardHeader>
          <div className="mt-3">
            <AdoptionChart />
          </div>
        </GlassCard>

        <GlassCard className="p-5 lg:col-span-4" delay={0.05} lift={false}>
          <CardHeader title="Waiting for your review" subtitle="Role-plays and field challenges" />
          <div className="mt-3 space-y-2">
            {pending.length === 0 && <p className="text-sm text-muted">Nothing to review. All caught up.</p>}
            {pending.map((p) => {
              const quest = questById[p.questId];
              const Icon = QUEST_ICONS[quest.type];
              return (
                <div key={`${p.repId}-${p.questId}`} className="glass-inset rounded-xl p-3">
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
        </GlassCard>

        <GlassCard className="p-5 lg:col-span-3" delay={0.1} lift={false}>
          <CardHeader title="Needs a nudge" subtitle="No learning in 7+ days" />
          <div className="mt-3 space-y-2">
            {adopt.inactive.length === 0 && <p className="text-sm text-muted">Everyone learned this week.</p>}
            {adopt.inactive.map((r) => (
              <div key={r.id} className="glass-inset flex items-center gap-2.5 rounded-xl p-2.5">
                <Avatar id={r.id} size={28} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{r.name}</div>
                  <div className="text-[11px] text-muted">Last active {r.activeDaysAgo} days ago</div>
                </div>
                <button onClick={() => onNudge(r)} aria-label={`Nudge ${r.name}`} className="grid size-8 place-items-center rounded-full text-gold hover:bg-white/10">
                  <LuBellRing size={15} />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
