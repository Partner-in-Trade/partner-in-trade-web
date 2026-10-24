import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Trash2 } from 'lucide-react';
import {
  deleteTrade,
  setSelectedTrade,
  selectEnrichedTrades,
} from '@/app/store';
import { OutcomeBadge } from '@/components/ui/OutcomeBadge';
import { Toast } from '@/components/ui/Toast';

export function TradeLogView() {
  const dispatch = useDispatch();
  const trades = useSelector(selectEnrichedTrades);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const filtered = trades.filter((t) => t.symbol.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="bg-pit-card border border-pit-border rounded-xl p-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ticker..." className="w-full sm:w-64 px-3 py-2 rounded-lg bg-pit-bg border border-pit-border text-sm text-white" />
      </div>
      <div className="bg-pit-card border border-pit-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-pit-bg text-xs uppercase text-slate-400">
            <tr><th className="py-3 px-4">Date</th><th className="py-3 px-4">Symbol</th><th className="py-3 px-4">Side</th><th className="py-3 px-4">Setup</th><th className="py-3 px-4 text-right">R-Mult</th><th className="py-3 px-4 text-right">Net P&L</th><th className="py-3 px-4 text-center">Status</th><th className="py-3 px-4 text-center">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-pit-border">
            {filtered.map((t) => (
              <tr key={t.id} onClick={() => dispatch(setSelectedTrade(t))} className="hover:bg-slate-800/40 cursor-pointer transition">
                <td className="py-3 px-4 font-mono text-xs">{t.date}</td>
                <td className="py-3 px-4 font-bold text-white">{t.symbol}</td>
                <td className="py-3 px-4 text-xs">{t.direction}</td>
                <td className="py-3 px-4 text-xs">{t.setup}</td>
                <td className="py-3 px-4 text-right font-mono text-xs">{t.rMultiple}R</td>
                <td className={`py-3 px-4 text-right font-mono font-semibold ${t.netPnl >= 0 ? 'text-pit-profit' : 'text-pit-loss'}`}>${t.netPnl.toFixed(2)}</td>
                <td className="py-3 px-4 text-center"><OutcomeBadge outcome={t.outcome} /></td>
                <td className="py-3 px-4 text-center" onClick={(e) => { e.stopPropagation(); dispatch(deleteTrade(t.id)).unwrap().catch((err) => setToast(err || 'Delete failed')); }}><button className="p-1 hover:text-pit-loss text-slate-400"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Toast message={toast} onDismiss={() => setToast('')} />
    </div>
  );
}