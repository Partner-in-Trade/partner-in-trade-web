import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { registerStrategyInWorkspace, selectUser } from '@/app/store';
import { TRADING_SESSIONS } from '@/constants/tradingSessions';
import {
  STRATEGY_TAG_SUGGESTIONS,
  STRATEGY_TIMEFRAME_OPTIONS,
} from '@/constants/strategySessions';
import { strategiesApi } from '@/features/strategies/api/strategiesApi';
import { Toast } from '@/components/ui/Toast';

function inputClass(extra = '') {
  return `w-full rounded-lg border border-pit-border bg-pit-bg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${extra}`;
}

function SectionTitle({ children }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">{children}</h3>
  );
}

function defaultForm() {
  return {
    name: '',
    description: '',
    tags: [],
    tagInput: '',
    rulesSetup: '',
    worksInTrendingMarket: '',
    worksInRangingMarket: '',
    timeframes: ['15m'],
    sessions: ['London'],
    preferredSymbols: '',
    riskNotes: '',
  };
}

function parseBoolSelect(value) {
  if (value === 'yes') return true;
  if (value === 'no') return false;
  return null;
}

export function StrategyCreateDrawer({ open, onClose, onCreated }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (open) setForm(defaultForm());
  }, [open]);

  if (!open) return null;

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const addTag = (raw) => {
    const tag = raw.trim();
    if (!tag || form.tags.includes(tag)) return;
    set({ tags: [...form.tags, tag], tagInput: '' });
  };

  const toggleList = (key, value) => {
    setForm((prev) => {
      const list = prev[key];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...prev, [key]: next };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = form.name.trim();
    if (!trimmed) {
      setToast('Strategy name is required.');
      return;
    }
    if (!user?.id) {
      setToast('You must be signed in.');
      return;
    }

    const symbols = form.preferredSymbols
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setSubmitting(true);
    try {
      const res = await strategiesApi.create({
        name: trimmed,
        description: form.description.trim() || null,
        tags: form.tags,
        rulesSetup: form.rulesSetup.trim() || null,
        worksInTrendingMarket: parseBoolSelect(form.worksInTrendingMarket),
        worksInRangingMarket: parseBoolSelect(form.worksInRangingMarket),
        timeframes: form.timeframes,
        sessions: form.sessions,
        preferredSymbols: symbols.length ? symbols : null,
        riskNotes: form.riskNotes.trim() || null,
        userId: Number(user.id),
      });
      dispatch(registerStrategyInWorkspace({ name: res.data.name, id: res.data.id }));
      onCreated?.(res.data);
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        err.message ||
        'Failed to save strategy';
      setToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        <button
          type="button"
          className="absolute inset-0 bg-black/50"
          aria-label="Close create strategy panel"
          onClick={onClose}
        />
        <aside className="relative flex h-full w-full max-w-xl flex-col border-l border-pit-border bg-pit-card shadow-2xl animate-slide-in-right">
          <header className="flex shrink-0 items-center justify-between border-b border-pit-border px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Create New Strategy</h2>
              <p className="text-xs text-slate-400">Define your setup rules and context</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-pit-bg hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              <section>
                <SectionTitle>Basic information</SectionTitle>
                <label className="block mb-3">
                  <span className="text-xs font-medium text-slate-400">Strategy name *</span>
                  <input
                    className={`${inputClass()} mt-1.5`}
                    value={form.name}
                    onChange={(e) => set({ name: e.target.value })}
                    placeholder="Liquidity Sweep"
                  />
                </label>
                <label className="block mb-3">
                  <span className="text-xs font-medium text-slate-400">Description</span>
                  <textarea
                    className={`${inputClass()} mt-1.5 min-h-[72px]`}
                    value={form.description}
                    onChange={(e) => set({ description: e.target.value })}
                    placeholder="Short summary of the strategy"
                  />
                </label>
                <div>
                  <span className="text-xs font-medium text-slate-400">Tags</span>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      className={inputClass()}
                      value={form.tagInput}
                      onChange={(e) => set({ tagInput: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag(form.tagInput);
                        }
                      }}
                      placeholder="Add tag"
                    />
                    <button
                      type="button"
                      onClick={() => addTag(form.tagInput)}
                      className="shrink-0 rounded-lg border border-pit-border px-3 text-sm text-slate-300 hover:bg-pit-bg"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {STRATEGY_TAG_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => addTag(s)}
                        className="rounded-full border border-pit-border px-2 py-0.5 text-[11px] text-slate-400 hover:border-indigo-500/50 hover:text-indigo-300"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {form.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {form.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 px-2 py-0.5 text-xs text-indigo-300"
                        >
                          {tag}
                          <button
                            type="button"
                            className="text-indigo-400 hover:text-white"
                            onClick={() => set({ tags: form.tags.filter((t) => t !== tag) })}
                            aria-label={`Remove ${tag}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section>
                <SectionTitle>Strategy details</SectionTitle>
                <label className="block mb-3">
                  <span className="text-xs font-medium text-slate-400">Rules / setup</span>
                  <textarea
                    className={`${inputClass()} mt-1.5 min-h-[96px]`}
                    value={form.rulesSetup}
                    onChange={(e) => set({ rulesSetup: e.target.value })}
                    placeholder="Entry criteria, confirmation, invalidation…"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <label className="block">
                    <span className="text-xs font-medium text-slate-400">Works in trending market</span>
                    <select
                      className={`${inputClass()} mt-1.5`}
                      value={form.worksInTrendingMarket}
                      onChange={(e) => set({ worksInTrendingMarket: e.target.value })}
                    >
                      <option value="">—</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-slate-400">Works in ranging market</span>
                    <select
                      className={`${inputClass()} mt-1.5`}
                      value={form.worksInRangingMarket}
                      onChange={(e) => set({ worksInRangingMarket: e.target.value })}
                    >
                      <option value="">—</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </label>
                </div>
                <div className="mb-3">
                  <span className="text-xs font-medium text-slate-400">Recommended timeframes</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {STRATEGY_TIMEFRAME_OPTIONS.map((tf) => (
                      <label
                        key={tf}
                        className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-300"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-pit-border bg-pit-bg text-indigo-600"
                          checked={form.timeframes.includes(tf)}
                          onChange={() => toggleList('timeframes', tf)}
                        />
                        {tf}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <span className="text-xs font-medium text-slate-400">Sessions</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {TRADING_SESSIONS.map((session) => (
                      <label
                        key={session}
                        className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-300"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-pit-border bg-pit-bg text-indigo-600"
                          checked={form.sessions.includes(session)}
                          onChange={() => toggleList('sessions', session)}
                        />
                        {session}
                      </label>
                    ))}
                  </div>
                </div>
                <label className="block mb-3">
                  <span className="text-xs font-medium text-slate-400">Preferred symbols</span>
                  <input
                    className={`${inputClass()} mt-1.5`}
                    value={form.preferredSymbols}
                    onChange={(e) => set({ preferredSymbols: e.target.value })}
                    placeholder="BTC, ETH, SOL"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-400">Risk notes</span>
                  <textarea
                    className={`${inputClass()} mt-1.5 min-h-[72px]`}
                    value={form.riskNotes}
                    onChange={(e) => set({ riskNotes: e.target.value })}
                    placeholder="Position sizing, max daily loss…"
                  />
                </label>
              </section>
            </div>

            <footer className="flex shrink-0 gap-3 border-t border-pit-border bg-pit-bg px-5 py-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-pit-border py-2.5 text-sm font-medium text-slate-300 hover:bg-pit-card"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {submitting ? 'Saving…' : 'Save strategy'}
              </button>
            </footer>
          </form>
        </aside>
      </div>
      <Toast message={toast} onDismiss={() => setToast('')} />
    </>
  );
}
