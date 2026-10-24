import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DollarSign, Percent, Activity, Scale, Compass, Award, PlusCircle } from 'lucide-react';
import {
  setSelectedMarketId,
  setSelectedTrade,
  selectEnrichedTrades,
  selectMetrics,
  selectMarkets,
  selectSelectedMarketId,
} from '@/app/store';
import { KpiCard } from '@/components/ui/KpiCard';
import { EquityCurveChart } from './components/EquityCurveChart';
import { DailyPnlChart } from './components/DailyPnlChart';
import { RecentTradesTable } from './components/RecentTradesTable';

function formatMarketLabel(m) {
  const sym = m.currency === 'INR' ? '₹' : '$';
  const funds = Number(m.funds) || 0;
  return `${m.name} · ${sym}${funds.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function DashboardView({ onNavigate }) {
  const dispatch = useDispatch();
  const trades = useSelector(selectEnrichedTrades);
  const metrics = useSelector(selectMetrics);
  const markets = useSelector(selectMarkets);
  const selectedMarketId = useSelector(selectSelectedMarketId);

  if (markets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <p className="text-slate-400 text-sm max-w-md">
          You don&apos;t have any markets yet. Create one (Stocks, Forex, Crypto, etc.) and add
          initial capital to start journaling trades.
        </p>
        <button
          type="button"
          onClick={() => onNavigate?.('markets')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
        >
          <PlusCircle className="w-4 h-4" />
          Add your first market
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-xs text-slate-400 shrink-0">Active market</label>
        <select
          value={selectedMarketId ?? ''}
          onChange={(e) => dispatch(setSelectedMarketId(Number(e.target.value)))}
          className="max-w-md rounded-lg border border-pit-border bg-pit-bg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
        >
          {markets.map((m) => (
            <option key={m.id} value={m.id}>
              {formatMarketLabel(m)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <KpiCard title="Net P&L" value={`${metrics.totalNetPnl >= 0 ? '+' : ''}$${metrics.totalNetPnl.toLocaleString()}`} subtitle={`${metrics.totalTrades} total executions`} icon={DollarSign} trend={metrics.totalNetPnl >= 0 ? 'positive' : 'negative'} />
        <KpiCard title="Win Rate" value={`${metrics.winRate}%`} subtitle={`${metrics.winsCount}W / ${metrics.lossesCount}L`} icon={Percent} />
        <KpiCard title="Profit Factor" value={metrics.profitFactor} subtitle="Gross Win / Loss" icon={Scale} />
        <KpiCard title="Avg Win / Loss" value={`$${metrics.avgWin} / $${metrics.avgLoss}`} subtitle="Payoff ratio" icon={Activity} />
        <KpiCard title="Expectancy" value={`$${metrics.expectancy}`} subtitle="Expected value" icon={Compass} />
        <KpiCard title="Avg R-Multiple" value={`${metrics.avgRMultiple}R`} subtitle="Risk-adjusted" icon={Award} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EquityCurveChart data={metrics.equityCurve} />
        <DailyPnlChart data={metrics.dailySeries} />
      </div>
      <RecentTradesTable
        trades={trades}
        onSelectTrade={(trade) => dispatch(setSelectedTrade(trade))}
      />
    </div>
  );
}
