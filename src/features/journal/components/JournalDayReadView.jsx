import React, { useEffect } from 'react';
import { Calendar, Lock, PenLine, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchJournalByDate,
  openWriteJournal,
  selectDailyJournalForm,
  selectDailyJournalLoading,
  selectDailyJournalError,
  selectJournalHasEntry,
  selectJournalSelectedDate,
} from '@/app/store/slices/journalSlice';
import { formatJournalDateHeader, journalFormHasContent } from '@/constants/journal';

function ReadOnlySection({ title, html }) {
  if (!html || !html.replace(/<[^>]+>/g, '').trim() && !/<img[\s>]/i.test(html)) {
    return null;
  }
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div
        className="pit-rich-text rounded-lg border border-pit-border bg-pit-bg/40 px-4 py-3 text-slate-200 text-sm leading-relaxed select-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}

export function JournalDayReadView() {
  const dispatch = useDispatch();
  const journalDate = useSelector(selectJournalSelectedDate);
  const form = useSelector(selectDailyJournalForm(journalDate));
  const loading = useSelector(selectDailyJournalLoading);
  const error = useSelector(selectDailyJournalError);
  const hasEntryFlag = useSelector(selectJournalHasEntry(journalDate));
  const { long, weekday } = formatJournalDateHeader(journalDate);

  const hasEntry = hasEntryFlag || journalFormHasContent(form);

  useEffect(() => {
    dispatch(fetchJournalByDate(journalDate));
  }, [journalDate, dispatch]);

  return (
    <div className="relative w-full pb-24">
      <header className="flex flex-wrap items-start gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-pit-border text-indigo-400">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">{long}</h1>
          <p className="text-sm text-slate-400">{weekday}</p>
        </div>
      </header>

      {error && (
        <p className="mb-4 text-sm text-amber-200/90 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
          Could not load entry ({error}).
        </p>
      )}

      {loading ? (
        <p className="text-slate-400 text-sm">Loading entry…</p>
      ) : !hasEntry ? (
        <div className="max-w-md mx-auto text-center py-16 px-6 rounded-xl border border-dashed border-pit-border bg-pit-card/30">
          <p className="text-lg font-medium text-slate-200 mb-2">No entry for this day</p>
          <p className="text-sm text-slate-500 mb-8">
            Capture your session plan, review, and charts when you&apos;re ready.
          </p>
          <button
            type="button"
            onClick={() => dispatch(openWriteJournal(journalDate))}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Add Entry for this day
          </button>
        </div>
      ) : (
        <div className="space-y-6 pointer-events-none select-none">
          <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wide font-medium">
            <Lock className="w-3.5 h-3.5" />
            Read-only — tap Edit to change this entry
          </div>

          {form.title?.trim() && (
            <h2 className="text-2xl font-semibold text-white">{form.title}</h2>
          )}
          {form.quickSummary?.trim() && (
            <p className="text-sm text-slate-400">{form.quickSummary}</p>
          )}

          <div className="rounded-xl border border-pit-border bg-[#121722] p-4 space-y-6">
            <ReadOnlySection title="Market Overview" html={form.marketOverview} />
            <ReadOnlySection title="What Went Well" html={form.whatWentWell} />
            <ReadOnlySection title="What to Improve" html={form.whatToImprove} />

            {form.screenshots?.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-lg font-semibold text-white">Screenshots</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {form.screenshots.map((shot) => (
                    <div
                      key={shot.id}
                      className="rounded-lg border border-pit-border overflow-hidden bg-pit-bg"
                    >
                      <img
                        src={shot.imageUrl}
                        alt={shot.caption || 'Screenshot'}
                        className="w-full h-40 object-cover"
                      />
                      {shot.caption?.trim() && (
                        <p className="px-3 py-2 text-xs text-slate-400 border-t border-pit-border">
                          {shot.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}

      {hasEntry && !loading && (
        <button
          type="button"
          onClick={() => dispatch(openWriteJournal(journalDate))}
          className="fixed bottom-8 right-8 z-30 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-xl shadow-indigo-900/40 transition pointer-events-auto"
          aria-label="Edit journal entry"
        >
          <PenLine className="w-4 h-4" />
          Edit
        </button>
      )}
    </div>
  );
}
