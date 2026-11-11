import { LuDownload, LuUsers, LuGraduationCap, LuPlay } from 'react-icons/lu';
import Card, { CardHeader } from './Card.jsx';
import { Bar, Button, Chip, InfoTip } from './ui.jsx';
import { quizInsights, wrongText, insightsCsv } from '../lib/insights.js';
import { skillById } from '../data/academy.js';

const pct = (v) => `${Math.round(v * 100)}%`;

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/** For managers: how the team did on each new course quiz, with the most-missed questions first. */
export default function QuizInsights({ state, reps, onSimulate }) {
  const insights = quizInsights(state, reps);
  if (!insights.length) return null;
  return (
    <Card className="p-5 sm:p-6">
      <CardHeader title="How the team did on new courses" subtitle="From each person's first try at the quiz. The questions most people got wrong come first, so you know what to retrain.">
        <Button variant="secondary" className="shrink-0 py-1.5 text-xs" onClick={() => download('levelup-quiz-insights.csv', insightsCsv(insights))}>
          <LuDownload size={14} /> Download (CSV)
        </Button>
      </CardHeader>
      <div className={`mt-4 grid grid-cols-1 gap-4 ${insights.length > 1 ? 'lg:grid-cols-2' : ''}`}>
        {insights.map((it) => (
          <section key={it.quiz.id} className="card-inset rounded-2xl p-4" aria-label={it.course.title}>
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                <LuGraduationCap size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold">{it.course.title}</h4>
                <p className="text-[13px] text-muted">
                  {skillById[it.course.skill].name} · approved by {it.course.approvedBy}
                </p>
              </div>
            </div>
            <div className={`mt-3 grid grid-cols-2 gap-3 ${insights.length === 1 ? 'md:max-w-md' : ''}`}>
              <div className="rounded-xl bg-surface p-3">
                <div className="text-2xl font-extrabold">
                  {it.finished} <span className="text-base font-semibold text-faint">of {it.people}</span>
                </div>
                <div className="flex items-center gap-1 text-[13px] text-muted">
                  <LuUsers size={13} /> finished it
                  <InfoTip>Finished means they passed the quiz (2 of 3 right or better).</InfoTip>
                </div>
              </div>
              <div className="rounded-xl bg-surface p-3">
                <div className="text-2xl font-extrabold">{it.avgScore == null ? '–' : pct(it.avgScore)}</div>
                <div className="text-[13px] text-muted">average score{it.takers ? ` · ${it.takers} tried` : ''}</div>
              </div>
            </div>
            <ol className={`mt-3 grid grid-cols-1 gap-2 ${insights.length === 1 ? 'md:grid-cols-3' : ''}`}>
              {it.questions.map((q, rank) => (
                <li key={q.index} className="rounded-xl bg-surface p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold">{q.q}</span>
                    {rank === 0 && q.wrong > 0 && <Chip tone="critical">Most missed</Chip>}
                  </div>
                  <div className="mt-0.5 text-[12px] text-faint">Right answer: {q.correct}</div>
                  <Bar value={q.share} tone={q.share >= 0.5 ? 'var(--bad)' : q.share > 0.25 ? 'var(--amber)' : 'var(--good)'} height={6} className="mt-2" label={`Share who got it wrong: ${pct(q.share)}`} />
                  <div className="mt-1 text-[13px] text-muted">{wrongText(q)}</div>
                </li>
              ))}
            </ol>
            {it.takers < it.people && (
              <button onClick={() => onSimulate(it.quiz.id)} className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:underline">
                <LuPlay size={13} /> Demo: let the rest of the team play it
              </button>
            )}
          </section>
        ))}
      </div>
    </Card>
  );
}
