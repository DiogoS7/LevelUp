import { useState } from 'react';
import { LuCrown, LuFlame, LuInfo } from 'react-icons/lu';
import Card, { CardHeader } from '../components/Card.jsx';
import { Avatar, Bar } from '../components/ui.jsx';
import { teamById, company } from '../data/academy.js';
import { individualLeague, teamLeague, playerLevel } from '../lib/game.js';

const MEDALS = ['#f5a524', '#c3c7d6', '#d9946a'];

export default function Leaderboard({ reps, currentId }) {
  const [mode, setMode] = useState('people');
  const people = individualLeague(reps);
  const teamsRanked = teamLeague(reps);
  const top = people[0]?.rep.weeklyXp || 1;
  const myTeam = reps.find((r) => r.id === currentId)?.team;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <Card className="p-5 lg:col-span-8">
        <CardHeader title={`Weekly league · ${company.week}`} subtitle="XP earned since Monday">
          <div className="card-inset flex rounded-full p-1">
            {[
              ['people', 'People'],
              ['teams', 'Teams'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${mode === id ? 'bg-brand text-white' : 'text-muted hover:text-ink'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </CardHeader>

        {mode === 'people' ? (
          <>
            <div className="mt-6 grid grid-cols-3 items-end gap-3">
              {[1, 0, 2].map((i) => {
                const row = people[i];
                if (!row) return <div key={i} />;
                const heights = ['h-28', 'h-20', 'h-14'];
                return (
                  <div key={row.rep.id} className="flex flex-col items-center text-center">
                    {i === 0 && <LuCrown className="mb-1 text-gold" size={20} />}
                    <Avatar id={row.rep.id} size={i === 0 ? 56 : 46} />
                    <span className="mt-2 text-sm font-semibold">{row.rep.name.split(' ')[0]}</span>
                    <span className="text-xs text-gold">{row.rep.weeklyXp} XP</span>
                    <div
                      className={`mt-2 grid w-full place-items-center rounded-t-xl text-2xl font-bold text-[#4a2a00] ${heights[i]}`}
                      style={{ background: `linear-gradient(180deg, ${MEDALS[i]}, ${MEDALS[i]}66)` }}
                    >
                      {i + 1}
                    </div>
                  </div>
                );
              })}
            </div>
            <ol className="mt-4 space-y-1.5">
              {people.slice(3).map(({ rep, rank }) => (
                <li
                  key={rep.id}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${rep.id === currentId ? 'border border-[#f5a524]/40 bg-[#fff6e5]' : 'card-inset'}`}
                >
                  <span className="w-6 text-center text-sm font-semibold text-muted">{rank}</span>
                  <Avatar id={rep.id} size={30} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {rep.name} {rep.id === currentId && <span className="text-xs text-gold">(you)</span>}
                    </span>
                    <span className="block text-[11px] text-muted">
                      {teamById[rep.team].name} · Level {playerLevel(rep.xp).level}
                    </span>
                  </span>
                  {rep.streak > 0 && (
                    <span className="hidden items-center gap-1 text-xs text-flame sm:flex">
                      <LuFlame size={13} /> {rep.streak}
                    </span>
                  )}
                  <span className="hidden w-24 sm:block">
                    <Bar value={rep.weeklyXp / top} height={6} />
                  </span>
                  <span className="w-16 text-right text-sm font-semibold text-gold">{rep.weeklyXp}</span>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <ol className="mt-5 space-y-3">
            {teamsRanked.map(({ team, members, average, total, rank }) => (
              <li key={team.id} className={`rounded-2xl p-4 ${team.id === myTeam ? 'border border-[#f5a524]/40 bg-[#fff6e5]' : 'card-inset'}`}>
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full text-sm font-bold text-[#4a2a00]" style={{ background: MEDALS[rank - 1] }}>
                    {rank}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">
                      {team.name} {team.id === myTeam && <span className="text-xs text-gold">(your team)</span>}
                    </span>
                    <span className="block text-xs text-muted">
                      Lead: {team.lead} · {members.length} people · {total.toLocaleString('en')} XP in total
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block text-lg font-semibold text-gold">{average}</span>
                    <span className="block text-[11px] text-muted">XP per person</span>
                  </span>
                </div>
                <div className="mt-3 flex -space-x-1.5">
                  {members.map((m) => (
                    <Avatar key={m.id} id={m.id} size={26} />
                  ))}
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>

      <Card className="p-5 lg:col-span-4 lg:self-start" delay={0.1}>
        <CardHeader title="How the league stays fair">
          <LuInfo className="shrink-0 text-brand" size={18} />
        </CardHeader>
        <ul className="mt-4 space-y-3 text-sm text-ink/85">
          <li className="card-inset rounded-xl p-3">
            <b className="text-ink">Weekly reset.</b> <span className="text-muted">Everyone starts at zero on Monday, so a new joiner can win next week.</span>
          </li>
          <li className="card-inset rounded-xl p-3">
            <b className="text-ink">Teams use averages.</b> <span className="text-muted">XP per person, so a small team can beat a big one.</span>
          </li>
          <li className="card-inset rounded-xl p-3">
            <b className="text-ink">Learning, not sales.</b> <span className="text-muted">Only learning earns XP. Sales numbers never appear here.</span>
          </li>
          <li className="card-inset rounded-xl p-3">
            <b className="text-ink">Quality counts.</b> <span className="text-muted">Quizzes pay for correct answers, and role-plays need a coach&apos;s approval.</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
