import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useTrades } from '@/app/providers/TradeContext';

export function CalendarView() {
  const { trades, openAddTradeModal, setSelectedTrade } = useTrades();
  const [currentMonth, setCurrentMonth] = useState(() => new Date(2025, 4, 1));

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayWeekday = new Date(year, month, 1).getDay();

  const tradesByDate = useMemo(() => {
    const map = {};
    trades.forEach((t) => {
      if (!map[t.date]) map[t.date] = { netPnl: 0, count: 0, wins: 0, items: [] };
      map[t.date].netPnl = Number((map[t.date].netPnl + t.netPnl).toFixed(2));
      map[t.date].count += 1;
      if (t.outcome === 'WIN') map[t.date].wins += 1;
      map[t.date].items.push(t);
    });
    return map;
  }, [trades]);

  const cells = [];
  for (let i = 0; i < firstDayWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, dateStr, summary: tradesByDate[dateStr] });
  }

  return (
    <div className="space-y-6">
      <div className="bg-pit-card border border-pit-border rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-2 rounded-lg bg-slate-800 text-slate-200"><ChevronLeft className="w-4 h-4" /></button>
          <h2 className="text-base font-bold text-white w-44 text-center">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
          <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-2 rounded-lg bg-slate-800 text-slate-200"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="bg-pit-card border border-pit-border rounded-xl p-4">
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold uppercase text-slate-400">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d} className="py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {cells.map((cell, idx) => {
            if (!cell) return <div key={idx} className="h-28 rounded-lg bg-pit-bg/40" />;
            const { day, dateStr, summary } = cell;
            const hasTrades = Boolean(summary);
            const isGreen = hasTrades && summary.netPnl >= 0;
            return (
              <div key={dateStr} onClick={() => hasTrades ? setSelectedTrade(summary.items[0]) : openAddTradeModal(dateStr)} className={`h-28 rounded-lg p-2.5 border transition cursor-pointer flex flex-col justify-between ${!hasTrades ? 'bg-pit-bg/80 border-pit-border' : isGreen ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                <div className="flex items-center justify-between"><span className="text-xs font-mono text-slate-400">{day}</span><Plus className="w-3 h-3 text-slate-400" /></div>
                {hasTrades && (
                  <div className="text-right">
                    <div className={`text-sm font-mono font-bold ${isGreen ? 'text-pit-profit' : 'text-pit-loss'}`}>{isGreen ? '+' : ''}${summary.netPnl.toFixed(0)}</div>
                    <div className="text-[11px] text-slate-300">{summary.count} trades</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}