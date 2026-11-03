import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2 } from 'lucide-react';
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
  const filtered = trades.filter((trade) =>
    (trade.symbol || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="bg-pit-card border border-pit-border rounded-xl p-4">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ticker..." className="w-full sm:w-64 px-3 py-2 rounded-lg bg-pit-bg border border-pit-border text-sm text-white" />
      </div>
      <div className="bg-pit-card border border-pit-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-pit-bg text-xs uppercase text-slate-400">
            <tr><th className="py-3 px-4">Date</th><th className="py-3 px-4">Symbol</th><th className="py-3 px-4">Side</th><th className="py-3 px-4">Setup</th><th className="py-3 px-4 text-right">R-Mult</th><th className="py-3 px-4 text-right">Net P&L</th><th className="py-3 px-4 text-center">Status</th><th className="py-3 px-4 text-center">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-pit-border">
            {filtered.map((trade) => (
              <tr key={trade.id} onClick={() => dispatch(setSelectedTrade(trade))} className="hover:bg-slate-800/40 cursor-pointer transition">
                <td className="py-3 px-4 font-mono text-xs">{trade.date}</td>
                <td className="py-3 px-4 font-bold text-white">{trade.symbol}</td>
                <td className="py-3 px-4 text-xs">{trade.direction}</td>
                <td className="py-3 px-4 text-xs">{trade.setup}</td>
                <td className="py-3 px-4 text-right font-mono text-xs">—</td>
                <td className="py-3 px-4 text-right font-mono font-semibold text-slate-400">—</td>
                <td className="py-3 px-4 text-center"><OutcomeBadge outcome={trade.outcome} /></td>
                <td className="py-3 px-4 text-center" onClick={(event) => { event.stopPropagation(); dispatch(deleteTrade(trade.id)).unwrap().catch((err) => setToast(err || 'Delete failed')); }}><button className="p-1 hover:text-pit-loss text-slate-400"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Toast message={toast} onDismiss={() => setToast('')} />
    </div>
  );
}
