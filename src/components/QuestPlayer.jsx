import { useState } from 'react';
import { LuCheck, LuX, LuZap, LuSend, LuRotateCcw, LuClock } from 'react-icons/lu';
import { Modal, Button, Chip, QUEST_ICONS } from './ui.jsx';
import { QUEST_TYPES, skillById } from '../data/academy.js';
import { rewardFor, quizPassed, PERFECT_QUIZ_BONUS } from '../lib/game.js';

/** Plays a quest: reads a lesson, runs a quiz, or submits a role-play / field challenge for review. */
export default function QuestPlayer({ quest, onClose, onFinish }) {
  return (
    <Modal open={Boolean(quest)} onClose={onClose} title={quest?.title ?? ''} wide={quest?.type === 'quiz'}>
      {quest && <PlayerBody key={quest.id} quest={quest} onFinish={onFinish} />}
    </Modal>
  );
}

function PlayerBody({ quest, onFinish }) {
  const Icon = QUEST_ICONS[quest.type];
  const type = QUEST_TYPES[quest.type];
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Chip tone="info">
          <Icon size={12} /> {type.label}
        </Chip>
        <Chip>{skillById[quest.skill].name}</Chip>
        <Chip>
          <LuClock size={12} /> {quest.minutes} min
        </Chip>
        <Chip tone="demand">
          <LuZap size={12} /> {quest.xp} XP
        </Chip>
      </div>
      {quest.type === 'quiz' ? <Quiz quest={quest} onFinish={onFinish} /> : <Reading quest={quest} onFinish={onFinish} />}
    </div>
  );
}

function Reading({ quest, onFinish }) {
  const needsApproval = QUEST_TYPES[quest.type].approval;
  return (
    <div>
      <ul className="space-y-3">
        {quest.body.map((line) => (
          <li key={line} className="card-inset rounded-xl px-4 py-3 text-sm leading-relaxed text-ink">
            {line}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-xs text-muted">
          {needsApproval ? 'Your team lead gives this a quick yes before the XP is added.' : `Makes your ${skillById[quest.skill].name.toLowerCase()} stronger.`}
        </p>
        <Button onClick={() => onFinish(null)}>
          {needsApproval ? (
            <>
              <LuSend size={15} /> Send to my team lead
            </>
          ) : (
            <>
              <LuCheck size={16} /> Done, I've read it
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function Quiz({ quest, onFinish }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const total = quest.questions.length;

  if (finished) {
    const result = { score, total };
    const passed = quizPassed(result);
    const reward = rewardFor(quest, result);
    const perfect = score === total;
    return (
      <div className="py-2 text-center">
        <div className={`mx-auto grid size-20 place-items-center text-2xl font-bold ${passed ? 'rounded-full medal-earned' : 'rounded-full card-inset text-bad'}`}>
          {score}/{total}
        </div>
        <h3 className="mt-4 text-lg font-semibold">{perfect ? 'Perfect score!' : passed ? 'Quiz passed' : 'Not quite yet'}</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
          {passed
            ? `You earn ${reward.xp} XP${perfect ? ` (including a ${PERFECT_QUIZ_BONUS} XP perfect bonus)` : ''} and ${reward.points} skill points.`
            : 'You need 2 out of 3 to pass. Have another go: the right answers were shown in green.'}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          {passed ? (
            <Button onClick={() => onFinish(result)}>
              <LuZap size={15} /> Claim {reward.xp} XP
            </Button>
          ) : (
            <Button
              onClick={() => {
                setIndex(0);
                setScore(0);
                setPicked(null);
                setFinished(false);
              }}
            >
              <LuRotateCcw size={15} /> Try again
            </Button>
          )}
        </div>
      </div>
    );
  }

  const question = quest.questions[index];
  const answered = picked !== null;
  const next = () => {
    if (index + 1 === total) setFinished(true);
    else {
      setIndex(index + 1);
      setPicked(null);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs text-muted">
        <span>
          Question {index + 1} of {total}
        </span>
        <span>{score} correct</span>
      </div>
      <div className="mb-4 flex gap-1.5">
        {quest.questions.map((q, i) => (
          <span key={q.q} className={`h-1.5 flex-1 rounded-full ${i < index ? 'bg-brand' : i === index ? 'bg-brand/40' : 'bg-surface-2'}`} />
        ))}
      </div>
      <p className="mb-4 text-[15px] font-medium">{question.q}</p>
      <div className="grid gap-2">
        {question.options.map((option, i) => {
          const isAnswer = i === question.answer;
          const isPicked = i === picked;
          let style = 'card-inset hover:border-brand/30 hover:bg-brand-soft';
          if (answered && isAnswer) style = 'border border-good/50 bg-good-soft';
          else if (answered && isPicked) style = 'border border-bad/50 bg-bad-soft';
          else if (answered) style = 'card-inset opacity-60';
          return (
            <button
              key={option}
              disabled={answered}
              onClick={() => {
                setPicked(i);
                if (isAnswer) setScore((s) => s + 1);
              }}
              className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${style}`}
            >
              <span>{option}</span>
              {answered && isAnswer && <LuCheck size={16} className="shrink-0 text-good" />}
              {answered && isPicked && !isAnswer && <LuX size={16} className="shrink-0 text-bad" />}
            </button>
          );
        })}
      </div>
      <div className="mt-5 flex min-h-9 items-center justify-between gap-3">
        <p className={`text-sm font-medium ${picked === question.answer ? 'text-good' : 'text-bad'}`}>
          {answered ? (picked === question.answer ? 'Correct!' : 'Not this one. The right answer is in green.') : ''}
        </p>
        {answered && <Button onClick={next}>{index + 1 === total ? 'See result' : 'Next'}</Button>}
      </div>
    </div>
  );
}
