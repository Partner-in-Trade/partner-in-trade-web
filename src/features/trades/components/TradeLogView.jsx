import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Check, Trash2, X } from 'lucide-react';
import {
  closeTrade,
  deleteTrade,
  setSelectedTrade,
  selectEnrichedTrades,
  selectSelectedMarket,
} from '@/app/store';
import { OutcomeBadge } from '@/components/ui/OutcomeBadge';
import { Toast } from '@/components/ui/Toast';

const formatMoney = (value, currency) => {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value));
};

export function TradeLogView() {
  const dispatch = useDispatch();
  const trades = useSelector(selectEnrichedTrades);
  const selectedMarket = useSelector(selectSelectedMarket);
  const currency = selectedMarket?.currency || 'USD';
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [closingTradeId, setClosingTradeId] = useState(null);
  const [exitPrice, setExitPrice] = useState('');
  const [closingFees, setClosingFees] = useState('0');
  const filtered = trades.filter((trade) =>
    (trade.symbol || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="bg-pit-card border border-pit-border rounded-xl p-4">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ticker..." className="w-full sm:w-64 px-3 py-2 rounded-lg bg-pit-bg border border-pit-border text-sm text-white" />
      </div>
      <div className="bg-pit-card border border-pit-border rounded-xl overflow-x-auto">
        <table className="w-full min-w-max text-left text-sm">
          <thead className="bg-pit-bg text-xs uppercase text-slate-400">
            <tr>
              <th className="py-3 px-4">Date</th><th className="py-3 px-4">Symbol</th><th className="py-3 px-4">Side</th><th className="py-3 px-4">Setup</th>
              <th className="py-3 px-4 text-right">Entry</th><th className="py-3 px-4 text-right">Exit</th><th className="py-3 px-4 text-right">Qty</th><th className="py-3 px-4 text-right">Multiplier</th><th className="py-3 px-4 text-right">Fees</th><th className="py-3 px-4 text-right">P&L %</th><th className="py-3 px-4 text-right">R-Mult</th><th className="py-3 px-4 text-right">Net P&L</th><th className="py-3 px-4 text-center">Status</th><th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pit-border">
            {filtered.map((trade) => (
              <tr key={trade.id} onClick={() => dispatch(setSelectedTrade(trade))} className="hover:bg-slate-800/40 cursor-pointer transition">
                <td className="py-3 px-4 font-mono text-xs">{trade.date}</td>
                <td className="py-3 px-4 font-bold text-white">{trade.symbol}</td>
                <td className="py-3 px-4 text-xs">{trade.direction}</td>
                <td className="py-3 px-4 text-xs">{trade.setup}</td>
                <td className="py-3 px-4 text-right font-mono text-xs">{trade.entryPrice ?? '—'}</td>
                <td className="py-3 px-4 text-right font-mono text-xs">{trade.exitPrice === '' || trade.exitPrice == null ? '—' : trade.exitPrice}</td>
                <td className="py-3 px-4 text-right font-mono text-xs">{trade.quantity ?? '—'}</td>
                <td className="py-3 px-4 text-right font-mono text-xs">{trade.contractMultiplier ?? 1}</td>
                <td className="py-3 px-4 text-right font-mono text-xs">{formatMoney(trade.fees, currency)}</td>
                <td className="py-3 px-4 text-right font-mono text-xs">{trade.resultInPercentage == null ? '—' : Number(trade.resultInPercentage).toFixed(2) + '%'}</td>
                <td className="py-3 px-4 text-right font-mono text-xs">{trade.rMultiple == null ? '—' : Number(trade.rMultiple).toFixed(2) + 'R'}</td>
                <td className={'py-3 px-4 text-right font-mono font-semibold ' + (Number(trade.netPnl) > 0 ? 'text-pit-profit' : Number(trade.netPnl) < 0 ? 'text-pit-loss' : 'text-slate-400')}>{formatMoney(trade.netPnl, currency)}</td>
                <td className="py-3 px-4 text-center"><OutcomeBadge outcome={trade.outcome} /></td>
                <td className="py-3 px-4 text-center" onClick={(event) => event.stopPropagation()}>
                  <div className="flex items-center justify-center gap-2">
                    {trade.status === 'OPEN' && (closingTradeId === trade.id ? (
                      <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
                        <input aria-label="Exit price" type="number" min="0" step="any" value={exitPrice} onChange={(event) => setExitPrice(event.target.value)} placeholder="Exit" className="w-20 px-2 py-1 rounded bg-pit-bg border border-pit-border text-xs" />
                        <input aria-label="Closing fees" type="number" min="0" step="any" value={closingFees} onChange={(event) => setClosingFees(event.target.value)} placeholder="Fees" className="w-16 px-2 py-1 rounded bg-pit-bg border border-pit-border text-xs" />
                        <button aria-label="Confirm close trade" disabled={!exitPrice || Number(exitPrice) <= 0 || Number(closingFees) < 0} onClick={() => dispatch(closeTrade({ tradeId: trade.id, exitPrice, closingFees })).unwrap().then(() => { setClosingTradeId(null); setExitPrice(''); setClosingFees('0'); }).catch((err) => setToast(err || 'Close failed'))} className="p-1 text-pit-profit disabled:opacity-40"><Check className="w-4 h-4" /></button>
                        <button aria-label="Cancel close trade" onClick={() => { setClosingTradeId(null); setExitPrice(''); setClosingFees('0'); }} className="p-1 text-slate-400"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <button onClick={() => setClosingTradeId(trade.id)} className="text-xs text-pit-profit hover:underline">Close</button>
                    ))}
                    <button aria-label={'Delete ' + trade.symbol} className="p-1 hover:text-pit-loss text-slate-400" onClick={() => dispatch(deleteTrade(trade.id)).unwrap().catch((err) => setToast(err || 'Delete failed'))}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Toast message={toast} onDismiss={() => setToast('')} />
    </div>
  );
}
