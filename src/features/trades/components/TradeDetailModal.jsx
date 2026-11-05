import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X } from 'lucide-react';
import {
  setSelectedTrade,
  selectSelectedTradeWithPerformance,
  selectSelectedMarket,
} from '@/app/store';
import { OutcomeBadge } from '@/components/ui/OutcomeBadge';

const formatMoney = (value, currency) => {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value));
};

export function TradeDetailModal() {
  const dispatch = useDispatch();
  const selectedTrade = useSelector(selectSelectedTradeWithPerformance);
  const selectedMarket = useSelector(selectSelectedMarket);
  if (!selectedTrade) return null;

  const currency = selectedMarket?.currency || 'USD';
  const hasPerformance = selectedTrade.netPnl != null;
  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-pit-card border border-pit-border rounded-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex justify-between items-center"><div className="flex items-center gap-2"><h3 className="text-lg font-bold text-white">{selectedTrade.symbol}</h3><OutcomeBadge outcome={selectedTrade.outcome} /></div><button onClick={() => dispatch(setSelectedTrade(null))}><X className="w-5 h-5 text-slate-400" /></button></div>
        <p className="text-sm text-slate-300">Net Realized P&L: <strong className={`font-mono ${Number(selectedTrade.netPnl) >= 0 ? 'text-pit-profit' : 'text-pit-loss'}`}>{formatMoney(selectedTrade.netPnl, currency)}</strong> ({selectedTrade.rMultiple == null ? '—' : `${Number(selectedTrade.rMultiple).toFixed(2)}R`})</p>
        {!hasPerformance && <p className="text-xs text-slate-500">Performance is available after this trade is closed and analytics refreshes.</p>}
        <p className="text-xs text-slate-400">Playbook Setup: {selectedTrade.setup}</p>
        <p className="text-xs text-slate-400">Notes: {selectedTrade.notes || 'None recorded.'}</p>
      </div>
    </div>
  );
}
