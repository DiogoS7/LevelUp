import Card, { CardHeader } from '../components/Card.jsx';
import { LevelPips, Bar, DemandChip } from '../components/ui.jsx';
import { categories, categoryById, roles } from '../data/academy.js';
import { skillProfile, readiness, levelName } from '../lib/game.js';

/** Radar of current level vs role target for every skill. */
function SkillRadar({ profile }) {
  const size = 360;
  const c = size / 2;
  const r = 115;
  const n = profile.length;
  const point = (i, value) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const d = (value / 5) * r;
    return [c + Math.cos(angle) * d, c + Math.sin(angle) * d];
  };
  const poly = (key) => profile.map((row, i) => point(i, row[key]).join(',')).join(' ');
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[380px]" role="img" aria-label="Skill radar: current level against target">
      {[1, 2, 3, 4, 5].map((ring) => (
        <polygon key={ring} points={profile.map((_, i) => point(i, ring).join(',')).join(' ')} fill="none" stroke="var(--line)" />
      ))}
      {profile.map((_, i) => {
        const [x, y] = point(i, 5);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="var(--line)" />;
      })}
      <polygon points={poly('target')} fill="none" stroke="var(--ink-3)" strokeDasharray="4 4" strokeWidth="1.5" />
      <polygon points={poly('level')} fill="var(--brand)" fillOpacity="0.18" stroke="var(--brand)" strokeWidth="2" />
      {profile.map((row, i) => {
        const [x, y] = point(i, row.level);
        return <circle key={row.skill.id} cx={x} cy={y} r="3.5" fill={row.gap ? "var(--bad)" : "var(--good)"} />;
      })}
      {profile.map((row, i) => {
        const [x, y] = point(i, 6.1);
        return (
          <text key={row.skill.id} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="10.5" fill="var(--ink-3)">
            {row.skill.short}
          </text>
        );
      })}
    </svg>
  );
}

export default function Skills({ rep, onOpenSkill }) {
  const profile = skillProfile(rep);
  const ready = readiness(rep);
  const gaps = profile.filter((r) => r.gap > 0);
  const urgent = gaps.filter((r) => r.skill.demand >= 2 || r.skill.mandatory);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <section className="pt-2 pb-2 lg:col-span-12">
        <span className="inline-block rounded-full bg-brand-soft px-3 py-1 text-[13px] font-semibold text-brand">{roles[rep.role].label}</span>
        <h1 className="mt-4 max-w-3xl text-[34px] leading-[1.08] font-extrabold tracking-tight sm:text-5xl">
          How strong are <span className="text-brand">your skills?</span>
        </h1>
        <p className="mt-3 max-w-2xl text-[17px] text-muted">Every skill has a level from 0 (not started) to 5 (expert). Your role needs a certain level in each one. Tap a skill to see why it matters and how to improve it.</p>
      </section>
      <Card className="p-5 lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
        <CardHeader title="Your skills at a glance" subtitle="The further out, the stronger the skill" />
        <SkillRadar profile={profile} />
        <div className="mt-2 flex justify-center gap-4 text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-brand" /> Current level
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 border-t border-dashed border-faint" /> What your role needs
          </span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <div className="card-inset rounded-xl p-3">
            <div className="text-xl font-semibold">{Math.round(ready * 100)}%</div>
            <div className="text-[12px] text-muted">where you need to be</div>
          </div>
          <div className="card-inset rounded-xl p-3">
            <div className="text-xl font-semibold text-bad">{gaps.length}</div>
            <div className="text-[12px] text-muted">to work on</div>
          </div>
          <div className="card-inset rounded-xl p-3">
            <div className="text-xl font-semibold text-amber-ink">{urgent.length}</div>
            <div className="text-[12px] text-muted">needed most</div>
          </div>
        </div>
        <Bar value={ready} tone="var(--brand)" className="mt-4" label="Skills where you need to be" />
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:col-span-7">
        {categories.map((cat, ci) => {
          const rows = profile.filter((r) => r.skill.category === cat.id);
          return (
            <Card key={cat.id} className="p-5" delay={0.05 * ci}>
              <div className="mb-3 flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: cat.color }} />
                <h3 className="text-[15px] font-semibold">{cat.label}</h3>
              </div>
              <div className="space-y-2">
                {rows.map((row) => (
                  <button
                    key={row.skill.id}
                    onClick={() => onOpenSkill(row.skill.id)}
                    className="card-inset flex w-full flex-col gap-2 rounded-xl px-3.5 py-3 text-left transition hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-medium">{row.skill.name}</span>
                        <DemandChip skill={row.skill} />
                      </span>
                      <span className="mt-0.5 block text-[11px] text-muted">
                        {levelName(row.level)} · {row.gap ? `${row.gap} level${row.gap > 1 ? 's' : ''} to go` : 'Where you need to be'}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <LevelPips level={row.level} target={row.target} color={categoryById[row.skill.category].color} />
                      <span className="w-24 text-right text-[12px] text-faint">{row.level >= 5 ? 'Top level' : `${Math.round(row.progress * 100)}% to level ${row.level + 1}`}</span>
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
