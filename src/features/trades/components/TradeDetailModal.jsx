import React from 'react';
import { X } from 'lucide-react';
import { useTrades } from '@/app/providers/TradeContext';
import { OutcomeBadge } from '@/components/ui/OutcomeBadge';

export function TradeDetailModal() {
  const { selectedTrade, setSelectedTrade } = useTrades();
  if (!selectedTrade) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-pit-card border border-pit-border rounded-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex justify-between items-center"><div className="flex items-center gap-2"><h3 className="text-lg font-bold text-white">{selectedTrade.symbol}</h3><OutcomeBadge outcome={selectedTrade.outcome} /></div><button onClick={() => setSelectedTrade(null)}><X className="w-5 h-5 text-slate-400" /></button></div>
        <p className="text-sm text-slate-300">Net Realized P&L: <strong className={`font-mono ${selectedTrade.netPnl >= 0 ? 'text-pit-profit' : 'text-pit-loss'}`}>${selectedTrade.netPnl}</strong> ({selectedTrade.rMultiple}R)</p>
        <p className="text-xs text-slate-400">Playbook Setup: {selectedTrade.setup}</p>
        <p className="text-xs text-slate-400">Notes: {selectedTrade.notes || 'None recorded.'}</p>
      </div>
    </div>
  );
}