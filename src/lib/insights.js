/**
 * Quiz insights for managers: who finished each new course, the average score, and which questions people
 * get wrong most. Built from every rep's first attempt at each course quiz. Pure functions, tested in
 * insights.test.js.
 */
import { courseQuests } from './courses.js';
import { completeQuest, questStatus, quizPassed, skillLevel, toCsv } from './game.js';

/** Save one finished quiz attempt (passed or not) with the answer picked for each question. */
export function recordAttempt(state, { repId, questId, answers, score, total, date }) {
  return { ...state, attempts: [...(state.attempts ?? []), { repId, questId, answers: [...answers], score, total, date }] };
}

const firstAttempts = (state, questId) => {
  const seen = new Set();
  return (state.attempts ?? []).filter((a) => a.questId === questId && !seen.has(a.repId) && seen.add(a.repId));
};

/** One entry per approved course with a quiz: finished, average score and every question, most-missed first. */
export function quizInsights(state, reps) {
  const quizzes = courseQuests(state.courses ?? []).filter((q) => q.type === 'quiz');
  return quizzes.map((quiz) => {
    const course = state.courses.find((c) => c.id === quiz.courseId);
    const first = firstAttempts(state, quiz.id);
    const finished = reps.filter((r) => questStatus(state, r.id, quiz.id) === 'done').length;
    const avgScore = first.length ? first.reduce((s, a) => s + a.score / a.total, 0) / first.length : null;
    const questions = quiz.questions
      .map((q, i) => {
        const answered = first.filter((a) => Number.isInteger(a.answers[i]));
        const wrong = answered.filter((a) => a.answers[i] !== q.answer).length;
        return { index: i, q: q.q, correct: q.options[q.answer], takers: answered.length, wrong, share: answered.length ? wrong / answered.length : 0 };
      })
      .sort((a, b) => b.share - a.share || b.wrong - a.wrong || a.index - b.index);
    return { course, quiz, people: reps.length, takers: first.length, finished, avgScore, questions };
  });
}

/** "7 of 12 got this wrong", or a plain message when nobody has tried it yet. */
export function wrongText(question) {
  if (!question.takers) return 'Nobody has answered it yet';
  if (!question.wrong) return `Everyone got this right (${question.takers} of ${question.takers})`;
  return `${question.wrong} of ${question.takers} got this wrong`;
}

export function insightsCsv(insights) {
  const header = ['Course', 'Question', 'Correct answer', 'People who answered', 'Got it wrong', 'Share wrong', 'Finished the course', 'Average score'];
  const rows = [];
  for (const it of insights)
    for (const q of it.questions)
      rows.push([it.course.title, q.q, q.correct, q.takers, q.wrong, `${Math.round(q.share * 100)}%`, `${it.finished} of ${it.people}`, it.avgScore == null ? '' : `${Math.round(it.avgScore * 100)}%`]);
  return toCsv(header, rows);
}

/* ---------------------------------------------------------------- demo */

/** A stable number in [0, 1) from a string, so the simulated team answers the same way every time. */
export function seeded(text) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

/**
 * Demo only: everyone who hasn't tried a course quiz yet plays it once. Stronger reps (higher level in the
 * course's skill) answer correctly more often. Uses the normal rules, so XP, skills and gaps update too.
 */
export function simulateTeam(state, questId, reps, date) {
  const quiz = courseQuests(state.courses ?? []).find((q) => q.id === questId);
  if (!quiz) return state;
  const tried = new Set((state.attempts ?? []).filter((a) => a.questId === questId).map((a) => a.repId));
  let next = state;
  for (const rep of reps) {
    if (tried.has(rep.id)) continue;
    const level = skillLevel(rep.skills[quiz.skill] ?? 0);
    const chance = Math.min(0.92, 0.35 + 0.14 * level);
    const answers = quiz.questions.map((q, i) => {
      // Later questions in a course are a little harder.
      const right = seeded(`${rep.id}:${questId}:${i}`) < chance - i * 0.08;
      if (right) return q.answer;
      const wrongs = q.options.map((_, k) => k).filter((k) => k !== q.answer);
      return wrongs[Math.floor(seeded(`${rep.id}:${i}:pick`) * wrongs.length)];
    });
    const score = answers.filter((a, i) => a === quiz.questions[i].answer).length;
    const result = { score, total: quiz.questions.length };
    next = recordAttempt(next, { repId: rep.id, questId, answers, ...result, date });
    if (quizPassed(result)) next = completeQuest(next, rep.id, questId, result, date).state;
  }
  return next;
}
