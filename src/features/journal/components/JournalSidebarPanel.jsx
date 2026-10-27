import React from 'react';
import { PenLine } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { openJournalDayView, openWriteJournal } from '@/app/store/slices/journalSlice';
import { JournalEntryCalendar } from './JournalEntryCalendar';

export function JournalSidebarPanel() {
  const dispatch = useDispatch();

  return (
    <div className="mt-1 ml-3 pl-3 border-l border-pit-border space-y-3 pb-2">
      <div>
        <p className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold mb-2 px-0.5">
          Entry calendar
        </p>
        <div className="rounded-lg bg-pit-bg/60 border border-pit-border p-2.5">
          <JournalEntryCalendar
            compact
            onDateSelect={(dateStr) => dispatch(openJournalDayView(dateStr))}
          />
        </div>
        <p className="text-[10px] text-slate-500 mt-1.5 px-0.5">Dots mark days with a saved entry.</p>
      </div>
      <button
        type="button"
        onClick={() => dispatch(openWriteJournal())}
        className="w-full py-2.5 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-sm font-medium flex items-center justify-center gap-2 transition"
      >
        <PenLine className="w-4 h-4" />
        Write journal
      </button>
    </div>
  );
}
