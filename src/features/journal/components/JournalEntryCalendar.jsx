import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchJournalRange,
  selectJournalSummariesByDate,
  selectJournalSelectedDate,
  setJournalSelectedDate,
} from '@/app/store/slices/journalSlice';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toIso(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function JournalEntryCalendar({ compact = false, onDateSelect }) {
  const dispatch = useDispatch();
  const selectedDate = useSelector(selectJournalSelectedDate);
  const summariesByDate = useSelector(selectJournalSummariesByDate);
  const [viewMonth, setViewMonth] = useState(() => parseDate(selectedDate));

  useEffect(() => {
    setViewMonth(parseDate(selectedDate));
  }, [selectedDate]);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  useEffect(() => {
    const from = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const to = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
    dispatch(fetchJournalRange({ from, to }));
  }, [year, month, daysInMonth, dispatch]);

  const cells = useMemo(() => {
    const items = [];
    for (let i = 0; i < firstWeekday; i++) {
      const day = prevMonthDays - firstWeekday + i + 1;
      const m = month === 0 ? 11 : month - 1;
      const y = month === 0 ? year - 1 : year;
      items.push({ day, dateStr: toIso(new Date(y, m, day)), outside: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      items.push({ day: d, dateStr: toIso(new Date(year, month, d)), outside: false });
    }
    const trailing = (7 - (items.length % 7)) % 7;
    for (let i = 1; i <= trailing; i++) {
      const m = month === 11 ? 0 : month + 1;
      const y = month === 11 ? year + 1 : year;
      items.push({ day: i, dateStr: toIso(new Date(y, m, i)), outside: true });
    }
    return items;
  }, [year, month, daysInMonth, firstWeekday, prevMonthDays]);

  const monthLabel = viewMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const selectDate = (dateStr) => {
    dispatch(setJournalSelectedDate(dateStr));
    onDateSelect?.(dateStr);
  };

  return (
    <div className={compact ? 'text-xs' : ''}>
      <div className="flex items-center justify-between mb-2 px-0.5">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setViewMonth(new Date(year, month - 1, 1))}
          className="p-1 rounded hover:bg-slate-800 text-slate-400"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-white">{monthLabel}</span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setViewMonth(new Date(year, month + 1, 1))}
          className="p-1 rounded hover:bg-slate-800 text-slate-400"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] text-slate-500 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-0.5 font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map(({ day, dateStr, outside }) => {
          const isSelected = dateStr === selectedDate;
          const hasEntry = summariesByDate[dateStr]?.hasEntry;
          return (
            <button
              key={`${dateStr}-${outside}`}
              type="button"
              onClick={() => selectDate(dateStr)}
              className={`relative flex flex-col items-center justify-center rounded-md py-1.5 text-xs font-medium transition ${
                outside ? 'text-slate-600' : 'text-slate-200 hover:bg-slate-800/80'
              } ${isSelected ? 'bg-indigo-600 text-white hover:bg-indigo-600' : ''}`}
            >
              {day}
              {hasEntry && !isSelected && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-indigo-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
