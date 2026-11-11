import { useState } from 'react';
import { LuKeyRound, LuShieldCheck, LuTrash2 } from 'react-icons/lu';
import { Modal, Button } from '../ui.jsx';
import { getKey, setKey, maskKey, CLAUDE_MODEL } from '../../lib/claude.js';

/**
 * Settings for the optional Claude connection. The visitor pastes their own API key; it stays in this
 * browser and is only ever sent to the Claude API when they draft a course from their own text.
 */
export default function ClaudeConnect({ open, onClose, onChange = () => {} }) {
  const [saved, setSaved] = useState(getKey);
  const [value, setValue] = useState('');
  const save = () => {
    setKey(value.trim());
    setSaved(value.trim());
    setValue('');
    onChange(true);
  };
  const remove = () => {
    setKey('');
    setSaved('');
    onChange(false);
  };
  return (
    <Modal open={open} onClose={onClose} title="Connect Claude (optional)">
      <p className="-mt-2 text-[15px] text-muted">
        The built-in documents work without this. Connect Claude to draft a course from <b className="text-ink">your own pasted text</b>, using your own Claude API key.
      </p>
      <ul className="mt-4 space-y-2 text-sm text-muted">
        <li className="flex gap-2">
          <LuShieldCheck size={16} className="mt-0.5 shrink-0 text-good" /> Your key is kept only in this browser and is sent only to the Claude API (api.anthropic.com), never anywhere else.
        </li>
        <li className="flex gap-2">
          <LuShieldCheck size={16} className="mt-0.5 shrink-0 text-good" /> Claude is told to use only your text and to say which sentence each part came from. Anything it can&apos;t back up is flagged in the review.
        </li>
        <li className="flex gap-2">
          <LuShieldCheck size={16} className="mt-0.5 shrink-0 text-good" /> Drafting uses your own Claude account ({CLAUDE_MODEL}). The demo never ships a key.
        </li>
      </ul>

      {saved ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-good-soft px-4 py-3">
          <span className="flex items-center gap-2 text-sm">
            <LuKeyRound size={16} className="text-good" /> Connected with <code className="font-semibold">{maskKey(saved)}</code>
          </span>
          <Button variant="secondary" className="py-1.5 text-sm" onClick={remove}>
            <LuTrash2 size={14} /> Remove key
          </Button>
        </div>
      ) : (
        <div className="mt-5">
          <label htmlFor="claude-key" className="block text-sm font-semibold">
            Your Claude API key
          </label>
          <input
            id="claude-key"
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="sk-ant-…"
            className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3 py-2 font-mono text-sm"
          />
          <p className="mt-1.5 text-[13px] text-faint">You can create one in the Claude Console. Remove it here any time.</p>
          <div className="mt-4 flex gap-2">
            <Button disabled={value.trim().length < 20} onClick={save}>
              <LuKeyRound size={15} /> Save key in this browser
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Not now
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
