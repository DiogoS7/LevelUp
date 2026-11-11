import { useState } from 'react';
import Card from '../components/Card.jsx';
import QuestCard from '../components/QuestCard.jsx';
import { QUEST_ICONS } from '../components/ui.jsx';
import { QUEST_TYPES, categories, skillById } from '../data/academy.js';
import { recommendQuests, questStatus, allQuests } from '../lib/game.js';

export default function Quests({ rep, state, onStart }) {
  const quests = allQuests(state);
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [show, setShow] = useState('open');

  // Open quests in recommended order first, then everything else.
  const ranked = recommendQuests(rep, state, quests.length);
  const reasons = Object.fromEntries(ranked.map((r) => [r.quest.id, r.reason]));
  const order = [...ranked.map((r) => r.quest), ...quests.filter((q) => !reasons[q.id])];

  const list = order.filter((q) => {
    const status = questStatus(state, rep.id, q.id);
    if (show === 'open' && status !== 'open') return false;
    if (show === 'done' && status === 'open') return false;
    if (type !== 'all' && q.type !== type) return false;
    if (category !== 'all' && skillById[q.skill].category !== category) return false;
    return true;
  });

  const done = quests.filter((q) => questStatus(state, rep.id, q.id) !== 'open').length;
  const select = 'rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink';

  return (
    <div className="grid grid-cols-1 gap-4">
      <section className="pt-2 pb-2">
        <span className="inline-block rounded-full bg-brand-soft px-3 py-1 text-[13px] font-semibold text-brand">
          {done} of {quests.length} done
        </span>
        <h1 className="mt-4 max-w-3xl text-[34px] leading-[1.08] font-extrabold tracking-tight sm:text-5xl">
          Learn something <span className="text-brand">in a few minutes.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-[17px] text-muted">
          Quests are short lessons, quizzes and practice tasks. The ones that help you most come first. Each one earns XP and makes a skill stronger.
        </p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="card inline-flex self-start rounded-xl p-1" role="tablist" aria-label="Show">
          {[
            ['open', 'To do'],
            ['done', 'Done'],
            ['all', 'All'],
          ].map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={show === id}
              onClick={() => setShow(id)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${show === id ? 'bg-brand text-on-brand' : 'text-muted hover:text-ink'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="q-area">Skill area</label>
          <select id="q-area" className={select} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All skill areas</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="q-type">Kind of quest</label>
          <select id="q-type" className={select} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All kinds</option>
            {Object.entries(QUEST_TYPES).map(([id, t]) => (
              <option key={id} value={id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {list.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted">{show === 'done' ? 'Nothing done yet. Your finished quests will show up here.' : 'No quests match these choices.'}</Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((q) => (
            <QuestCard key={q.id} quest={q} status={questStatus(state, rep.id, q.id)} reason={reasons[q.id]} onStart={onStart} />
          ))}
        </div>
      )}

      <Card className="p-5">
        <h2 className="font-bold">The five kinds of quest</h2>
        <ul className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-5">
          {Object.entries(QUEST_TYPES).map(([id, t]) => {
            const Icon = QUEST_ICONS[id];
            return (
              <li key={id} className="flex gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                  <Icon size={15} />
                </span>
                <span>
                  <b className="block">{t.label}</b>
                  <span className="text-muted">{t.explain}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
