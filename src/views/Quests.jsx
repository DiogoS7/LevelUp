import { useState } from 'react';
import GlassCard from '../components/GlassCard.jsx';
import QuestCard from '../components/QuestCard.jsx';
import { QUEST_ICONS } from '../components/ui.jsx';
import { quests, QUEST_TYPES, categories, skillById } from '../data/academy.js';
import { recommendQuests, questStatus } from '../lib/game.js';

export default function Quests({ rep, state, onStart }) {
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

  const pill = (active) =>
    `rounded-full px-3 py-1.5 text-xs font-medium transition ${active ? 'bg-white text-[#0f1524]' : 'text-muted hover:bg-white/10 hover:text-ink'}`;

  return (
    <div className="grid grid-cols-1 gap-4">
      <GlassCard className="flex flex-col gap-3 p-4" lift={false}>
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            ['open', 'To do · best first'],
            ['done', 'Done & in review'],
            ['all', 'All quests'],
          ].map(([id, label]) => (
            <button key={id} className={pill(show === id)} onClick={() => setShow(id)}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button className={pill(type === 'all')} onClick={() => setType('all')}>
            Every type
          </button>
          {Object.entries(QUEST_TYPES).map(([id, t]) => {
            const Icon = QUEST_ICONS[id];
            return (
              <button key={id} className={`${pill(type === id)} inline-flex items-center gap-1.5`} onClick={() => setType(id)}>
                <Icon size={13} /> {t.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button className={pill(category === 'all')} onClick={() => setCategory('all')}>
            Every skill area
          </button>
          {categories.map((c) => (
            <button key={c.id} className={`${pill(category === c.id)} inline-flex items-center gap-1.5`} onClick={() => setCategory(c.id)}>
              <span className="size-2 rounded-full" style={{ background: c.color }} /> {c.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {list.length === 0 ? (
        <GlassCard className="p-8 text-center text-sm text-muted" lift={false}>
          No quests match these filters.
        </GlassCard>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((q) => (
            <QuestCard key={q.id} quest={q} status={questStatus(state, rep.id, q.id)} reason={reasons[q.id]} onStart={onStart} />
          ))}
        </div>
      )}
    </div>
  );
}
