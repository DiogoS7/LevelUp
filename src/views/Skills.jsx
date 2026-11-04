import GlassCard, { CardHeader } from '../components/GlassCard.jsx';
import { LevelPips, Chip, Bar } from '../components/ui.jsx';
import { categories, categoryById, roles } from '../data/academy.js';
import { skillProfile, readiness, levelName } from '../lib/game.js';

/** Radar of current level vs role target for every skill. */
function SkillRadar({ profile }) {
  const size = 300;
  const c = size / 2;
  const r = 110;
  const n = profile.length;
  const point = (i, value) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const d = (value / 5) * r;
    return [c + Math.cos(angle) * d, c + Math.sin(angle) * d];
  };
  const poly = (key) => profile.map((row, i) => point(i, row[key]).join(',')).join(' ');
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[320px]" role="img" aria-label="Skill radar: current level against target">
      {[1, 2, 3, 4, 5].map((ring) => (
        <polygon key={ring} points={profile.map((_, i) => point(i, ring).join(',')).join(' ')} fill="none" stroke="rgb(255 255 255 / 0.08)" />
      ))}
      {profile.map((_, i) => {
        const [x, y] = point(i, 5);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="rgb(255 255 255 / 0.06)" />;
      })}
      <polygon points={poly('target')} fill="rgb(245 243 240 / 0.04)" stroke="rgb(245 243 240 / 0.55)" strokeDasharray="4 4" strokeWidth="1.5" />
      <polygon points={poly('level')} fill="rgb(91 134 240 / 0.28)" stroke="#7da0ff" strokeWidth="2" />
      {profile.map((row, i) => {
        const [x, y] = point(i, row.level);
        return <circle key={row.skill.id} cx={x} cy={y} r="3.5" fill={row.gap ? '#ff8f8f' : '#4ade80'} />;
      })}
      {profile.map((row, i) => {
        const [x, y] = point(i, 6.1);
        return (
          <text key={row.skill.id} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="rgb(245 243 240 / 0.55)">
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
      <GlassCard className="p-5 lg:sticky lg:top-28 lg:col-span-5 lg:self-start" lift={false}>
        <CardHeader title="Skill profile" subtitle={`${roles[rep.role].label} targets`} />
        <SkillRadar profile={profile} />
        <div className="mt-2 flex justify-center gap-4 text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-[#7da0ff]" /> Current level
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 border-t border-dashed border-ink/60" /> Role target
          </span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <div className="glass-inset rounded-xl p-3">
            <div className="text-xl font-semibold">{Math.round(ready * 100)}%</div>
            <div className="text-[11px] text-muted">at target</div>
          </div>
          <div className="glass-inset rounded-xl p-3">
            <div className="text-xl font-semibold text-fail">{gaps.length}</div>
            <div className="text-[11px] text-muted">gaps</div>
          </div>
          <div className="glass-inset rounded-xl p-3">
            <div className="text-xl font-semibold text-gold">{urgent.length}</div>
            <div className="text-[11px] text-muted">in-demand gaps</div>
          </div>
        </div>
        <Bar value={ready} tone="linear-gradient(90deg,#3a62d8,#7da0ff)" className="mt-4" label="Skills at target" />
      </GlassCard>

      <div className="grid grid-cols-1 gap-4 lg:col-span-7">
        {categories.map((cat, ci) => {
          const rows = profile.filter((r) => r.skill.category === cat.id);
          return (
            <GlassCard key={cat.id} className="p-5" delay={0.05 * ci} lift={false}>
              <div className="mb-3 flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: cat.color }} />
                <h3 className="text-[15px] font-semibold">{cat.label}</h3>
              </div>
              <div className="space-y-2">
                {rows.map((row) => (
                  <button
                    key={row.skill.id}
                    onClick={() => onOpenSkill(row.skill.id)}
                    className="glass-inset flex w-full flex-col gap-2 rounded-xl px-3.5 py-3 text-left transition hover:bg-white/10 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-medium">{row.skill.name}</span>
                        {row.skill.demand >= 3 && <Chip tone="critical">Critical</Chip>}
                        {row.skill.demand === 2 && <Chip tone="demand">In demand</Chip>}
                        {row.skill.mandatory && <Chip tone="mandatory">Mandatory</Chip>}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-muted">
                        {levelName(row.level)} · {row.gap ? `${row.gap} level${row.gap > 1 ? 's' : ''} below target` : 'At target'}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <LevelPips level={row.level} target={row.target} color={categoryById[row.skill.category].color} />
                      <span className="w-14 text-right text-[11px] text-faint">{Math.round(row.progress * 100)}% to {Math.min(5, row.level + 1)}</span>
                    </span>
                  </button>
                ))}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
