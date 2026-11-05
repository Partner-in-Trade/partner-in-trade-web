import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, MoreHorizontal, Newspaper, Trash2, ImagePlus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchJournalByDate,
  saveDailyJournal,
  selectDailyJournalForm,
  selectDailyJournalLoading,
  selectDailyJournalSaving,
  selectDailyJournalError,
  selectJournalSelectedDate,
  openJournalDayView,
} from '@/app/store/slices/journalSlice';
import { fetchThisWeekNews, selectNewsEvents } from '@/app/store/slices/newsSlice';
import { formatJournalDateHeader, emptyDailyJournalForm } from '@/constants/journal';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { formatEventTime } from '@/features/news/utils/weekRangeLabel';
import { ImpactBadge } from '@/features/news/components/ImpactBadge';
import { MAX_JOURNAL_IMAGE_BYTES } from '@/features/journal/utils/journalMediaUpload';

const SECTION_MIN = '14rem';

function revokeBlobUrl(url) {
  if (typeof url === 'string' && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

function JournalDayNewsPanel({ open, onToggle, events }) {
  if (!open) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="shrink-0 sticky top-6 flex flex-col items-center gap-1.5 py-3 px-2 rounded-l-xl border border-pit-border border-r-0 bg-[#121722] text-amber-200/80 hover:bg-slate-800/60 transition-colors"
        aria-expanded={false}
        aria-label="Show news for this day"
      >
        <Newspaper className="w-4 h-4" />
        {events.length > 0 && (
          <span className="text-[10px] font-semibold tabular-nums text-amber-200/90">{events.length}</span>
        )}
        <ChevronLeft className="w-4 h-4 text-slate-500" aria-hidden />
      </button>
    );
  }

  return (
    <aside
      className="shrink-0 w-72 sticky top-6 rounded-xl border border-amber-500/25 bg-[#121722] overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]"
      aria-label="News for this day"
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-amber-500/20 bg-amber-500/5">
        <div className="flex items-center gap-2 min-w-0">
          <Newspaper className="w-4 h-4 shrink-0 text-amber-200/90" />
          <h3 className="text-sm font-semibold text-amber-200/90 truncate">News this day</h3>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
          aria-expanded={true}
          aria-label="Collapse news panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="overflow-y-auto px-3 py-2 text-xs space-y-2.5">
        {events.length === 0 ? (
          <p className="text-slate-500 py-4 text-center leading-relaxed">No economic events for this day.</p>
        ) : (
          events.map((ev) => (
            <div key={ev.id || ev.eventUid} className="rounded-lg border border-pit-border/80 bg-pit-bg/50 px-2.5 py-2 space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[11px] text-slate-200">{formatEventTime(ev.eventTime)}</span>
                <ImpactBadge impact={ev.impact} />
              </div>
              <p className="text-slate-300 leading-snug">{ev.eventName}</p>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

export function WriteJournalEditor() {
  const dispatch = useDispatch();
  const journalDate = useSelector(selectJournalSelectedDate);
  const storedForm = useSelector(selectDailyJournalForm(journalDate));
  const [form, setForm] = useState(emptyDailyJournalForm());
  const [newsPanelOpen, setNewsPanelOpen] = useState(true);
  const [pendingUploads, setPendingUploads] = useState({});
  const [autosaveStatus, setAutosaveStatus] = useState('saved');
  const dirtyRef = useRef(false);
  const revisionRef = useRef(0);
  const savingRef = useRef(false);
  const loading = useSelector(selectDailyJournalLoading);
  const saving = useSelector(selectDailyJournalSaving);
  const error = useSelector(selectDailyJournalError);
  const newsEvents = useSelector(selectNewsEvents);
  const { long, weekday } = formatJournalDateHeader(journalDate);

  const dayNews = (newsEvents || [])
    .filter((e) => e.eventDate === journalDate)
    .sort((a, b) => (a.eventTime || '').localeCompare(b.eventTime || ''));

  useEffect(() => {
    dispatch(fetchThisWeekNews());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchJournalByDate(journalDate));
  }, [journalDate, dispatch]);

  useEffect(() => {
    dirtyRef.current = false;
    revisionRef.current += 1;
    setAutosaveStatus('saved');
    setForm(storedForm);
    setPendingUploads({});
  }, [storedForm, journalDate]);

  const registerPendingUpload = useCallback((id, file) => {
    setPendingUploads((prev) => ({ ...prev, [id]: file }));
  }, []);

  const set = (patch) => {
    dirtyRef.current = true;
    revisionRef.current += 1;
    setAutosaveStatus('unsaved');
    setForm((f) => ({ ...f, ...patch }));
  };

  const persistJournal = useCallback(async (manual = false) => {
    if (savingRef.current || !dirtyRef.current) return;
    const revision = revisionRef.current;
    const formSnapshot = form;
    const uploadsSnapshot = pendingUploads;
    savingRef.current = true;
    setAutosaveStatus('saving');
    const result = await dispatch(
      saveDailyJournal({ date: journalDate, form: formSnapshot, pendingUploads: uploadsSnapshot })
    );
    savingRef.current = false;
    if (saveDailyJournal.fulfilled.match(result)) {
      if (revisionRef.current === revision) {
        dirtyRef.current = false;
        setPendingUploads({});
        setAutosaveStatus('saved');
      } else {
        setAutosaveStatus('unsaved');
      }
    } else {
      setAutosaveStatus('failed');
    }
    return result;
  }, [dispatch, form, journalDate, pendingUploads]);

  useEffect(() => {
    if (!dirtyRef.current || loading || saving) return undefined;
    const timer = window.setTimeout(() => {
      persistJournal();
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [form, pendingUploads, loading, saving, persistJournal]);

  const handleSave = async () => {
    await persistJournal(true);
  };

  const handleScreenshotAdd = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_JOURNAL_IMAGE_BYTES) {
      window.alert('Image must be under 2 MB');
      return;
    }
    const id = crypto.randomUUID();
    const imageUrl = URL.createObjectURL(file);
    registerPendingUpload(id, file);
    set({
      screenshots: [
        ...form.screenshots,
        {
          id,
          caption: file.name.replace(/\.[^.]+$/, ''),
          imageUrl,
        },
      ],
    });
    e.target.value = '';
  };

  const removeScreenshot = (id) => {
    const shot = form.screenshots.find((s) => s.id === id);
    revokeBlobUrl(shot?.imageUrl);
    setPendingUploads((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    set({ screenshots: form.screenshots.filter((s) => s.id !== id) });
  };

  return (
    <div className="flex w-full items-start gap-3">
      <div className="flex-1 min-w-0">
      <button
        type="button"
        onClick={() => dispatch(openJournalDayView(journalDate))}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to entry
      </button>
      <header className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-pit-border text-indigo-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">{long}</h1>
            <p className="text-sm text-slate-400">{weekday}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span role="status" aria-live="polite" className="text-xs text-slate-400">
            {autosaveStatus === 'saving' ? 'Autosaving…' : autosaveStatus === 'saved' ? 'All changes saved' : autosaveStatus === 'failed' ? 'Autosave failed — use Save to retry' : 'Unsaved changes'}
          </span>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-50 shadow-lg shadow-indigo-600/20"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button type="button" className="p-2 rounded-lg border border-pit-border text-slate-400 hover:bg-slate-800" aria-label="More options">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      {error && (
        <p className="mb-4 text-sm text-amber-200/90 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
          Could not sync with server ({error}). Edits are kept locally until Save works.
        </p>
      )}

      {loading ? (
        <p className="text-slate-400 text-sm">Loading entry…</p>
      ) : (
        <div className="space-y-5">
          <input
            type="text"
            value={form.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="Headline for the day"
            className="w-full text-2xl font-semibold bg-transparent border-none text-white placeholder:text-slate-600 focus:outline-none"
          />
          <input
            type="text"
            value={form.quickSummary}
            onChange={(e) => set({ quickSummary: e.target.value })}
            placeholder="Quick summary of the day (optional)"
            className="w-full text-sm bg-transparent border-none text-slate-400 placeholder:text-slate-600 focus:outline-none"
          />

          <div className="rounded-xl border border-pit-border bg-[#121722] p-4 space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-white mb-2">Market Overview</h2>
              <RichTextEditor
                value={form.marketOverview}
                onChange={(html) => set({ marketOverview: html })}
                placeholder="Context, bias, and plan for the session…"
                minHeight={SECTION_MIN}
                registerPendingUpload={registerPendingUpload}
              />
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">What Went Well</h2>
              <RichTextEditor
                value={form.whatWentWell}
                onChange={(html) => set({ whatWentWell: html })}
                placeholder="Use the checklist button for wins you want to repeat…"
                minHeight={SECTION_MIN}
                registerPendingUpload={registerPendingUpload}
              />
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">What to Improve</h2>
              <RichTextEditor
                value={form.whatToImprove}
                onChange={(html) => set({ whatToImprove: html })}
                placeholder="Honest notes on mistakes and adjustments…"
                minHeight={SECTION_MIN}
                registerPendingUpload={registerPendingUpload}
              />
            </section>

            <section>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-white">Screenshots</h2>
                <label className="inline-flex items-center gap-1.5 text-xs text-indigo-400 cursor-pointer hover:text-indigo-300">
                  <ImagePlus className="w-4 h-4" />
                  Add image
                  <input type="file" accept="image/*" className="hidden" onChange={handleScreenshotAdd} />
                </label>
              </div>
              {form.screenshots.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center border border-dashed border-pit-border rounded-lg">
                  Attach chart captures for this session (max 2 MB each).
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {form.screenshots.map((shot) => (
                    <div key={shot.id} className="relative rounded-lg border border-pit-border overflow-hidden bg-pit-bg">
                      <button
                        type="button"
                        onClick={() => removeScreenshot(shot.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-md bg-black/50 text-slate-300 hover:text-rose-400 z-10"
                        aria-label="Remove screenshot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <img src={shot.imageUrl} alt={shot.caption || 'Screenshot'} className="w-full h-40 object-cover" />
                      <input
                        type="text"
                        value={shot.caption}
                        onChange={(e) =>
                          set({
                            screenshots: form.screenshots.map((s) =>
                              s.id === shot.id ? { ...s, caption: e.target.value } : s
                            ),
                          })
                        }
                        placeholder="Caption (e.g. BTCUSDT · 5m)"
                        className="w-full px-3 py-2 text-xs bg-slate-900/80 border-t border-pit-border text-slate-300 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
      </div>

      <JournalDayNewsPanel
        open={newsPanelOpen}
        onToggle={() => setNewsPanelOpen((v) => !v)}
        events={dayNews}
      />
    </div>
  );
}
