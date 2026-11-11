import { useEffect, useRef, useState } from 'react';
import { LuCheck, LuLoaderCircle, LuTriangleAlert, LuRotateCcw, LuArrowLeft, LuSparkles } from 'react-icons/lu';
import Card from '../Card.jsx';
import { Button } from '../ui.jsx';
import { DRAFT_STEPS, draftCourse } from '../../lib/draft.js';
import { getKey } from '../../lib/claude.js';
import { sourceSentences } from '../../lib/courses.js';
import { skillById } from '../../data/academy.js';

/**
 * Step 2: draft the course with AI. Shows each step as it happens; on failure explains in plain words and
 * offers to try again. Calls onDone(draft) when the draft is ready.
 */
export default function DraftStep({ request, onDone, onBack, onConnect = () => {} }) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  // The parent passes a new onDone on every render; keep the latest one without restarting the draft.
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    let alive = true;
    setError(null);
    setStep(0);
    draftCourse(request.source, {
      onStep: (i) => alive && setStep(i),
      key: getKey(),
      skillName: skillById[request.skill]?.name ?? '',
      sentences: sourceSentences(request.source),
    })
      .then((draft) => alive && done.current(draft))
      .catch((e) => alive && setError({ message: e.message || 'Something went wrong while drafting.', needsClaude: Boolean(e.needsClaude) }));
    return () => {
      alive = false;
    };
  }, [request, attempt]);

  return (
    <Card className="mx-auto w-full max-w-xl p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className={`grid size-11 place-items-center rounded-2xl ${error ? 'bg-bad-soft text-bad' : 'bg-brand text-on-brand'}`}>
          {error ? <LuTriangleAlert size={20} /> : <LuSparkles size={20} />}
        </span>
        <div>
          <h2 className="text-lg font-bold">{error ? 'The draft did not work this time' : 'Drafting your course…'}</h2>
          <p className="text-sm text-muted">From: {request.title}</p>
        </div>
      </div>

      {!error && (
        <ol className="mt-6 space-y-3" aria-live="polite">
          {DRAFT_STEPS.map((label, i) => {
            const done = i < step;
            const now = i === step;
            return (
              <li key={label} className={`flex items-center gap-3 text-[15px] ${done ? 'text-ink' : now ? 'font-semibold text-ink' : 'text-faint'}`}>
                <span className={`grid size-6 shrink-0 place-items-center rounded-full ${done ? 'bg-good-soft text-good' : now ? 'bg-brand-soft text-brand' : 'bg-surface-2'}`}>
                  {done ? <LuCheck size={14} /> : now ? <LuLoaderCircle size={14} className="animate-spin" /> : null}
                </span>
                {label}
              </li>
            );
          })}
        </ol>
      )}

      {error && (
        <div className="mt-5" role="alert">
          <p className="rounded-xl bg-bad-soft px-4 py-3 text-[15px] text-ink">{error.message}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {!error.needsClaude && (
              <Button onClick={() => setAttempt((a) => a + 1)}>
                <LuRotateCcw size={15} /> Try again
              </Button>
            )}
            {error.needsClaude && (
              <Button
                onClick={() => {
                  onConnect();
                  onBack();
                }}
              >
                Connect Claude
              </Button>
            )}
            <Button variant="secondary" onClick={onBack}>
              <LuArrowLeft size={15} /> Back to the source
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
