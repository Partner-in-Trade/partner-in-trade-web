import React from 'react';
import { DollarSign, Percent, Activity, Scale, Compass, Award } from 'lucide-react';
import { useTrades } from '@/app/providers/TradeContext';
import { KpiCard } from '@/components/ui/KpiCard';
import { EquityCurveChart } from './components/EquityCurveChart';
import { DailyPnlChart } from './components/DailyPnlChart';
import { RecentTradesTable } from './components/RecentTradesTable';

export function DashboardView() {
  const { trades, metrics, setSelectedTrade } = useTrades();
  return (
    <div className="space-y-6">
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
      <RecentTradesTable trades={trades} onSelectTrade={setSelectedTrade} />
    </div>
  );
}