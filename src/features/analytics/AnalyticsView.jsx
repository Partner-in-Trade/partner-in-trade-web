import React from 'react';
import { useSelector } from 'react-redux';
import { DollarSign, Percent, Activity, Scale, Compass, Award } from 'lucide-react';
import {
  selectAnalytics,
  selectAnalyticsError,
  selectAnalyticsLoading,
  selectMarkets,
  selectSelectedMarketId,
} from '@/app/store';
import { KpiCard } from '@/components/ui/KpiCard';
import { EquityCurveChart } from '@/features/dashboard/components/EquityCurveChart';
import { DailyPnlChart } from '@/features/dashboard/components/DailyPnlChart';
import { PlaybookBreakdownTable } from './components/PlaybookBreakdownTable';

function formatMoney(value, currency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function AnalyticsView() {
  const analytics = useSelector(selectAnalytics);
  const loading = useSelector(selectAnalyticsLoading);
  const error = useSelector(selectAnalyticsError);
  const markets = useSelector(selectMarkets);
  const selectedMarketId = useSelector(selectSelectedMarketId);
  const selectedMarket = markets.find((market) => market.id === selectedMarketId);
  const currency = analytics?.currency || selectedMarket?.currency || 'USD';
  const ready = analytics?.marketId === selectedMarketId;
  const metric = (value) => ready ? value : loading ? 'Loading…' : '—';

  return (
    <div className="space-y-6">
      <div className="bg-pit-card border border-pit-border rounded-xl p-6">
        <h2 className="text-base font-bold text-white mb-1">Partner in Trade Analytics</h2>
        <p className="text-xs text-slate-400">
          {analytics?.closedTradesCount ?? 0} closed trades · calculated by the backend
        </p>
        {loading && <p className="text-xs text-indigo-300 mt-3">Loading market analytics…</p>}
        {error && <p role="alert" className="text-xs text-rose-400 mt-3">{error}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <KpiCard title="Net P&L" value={metric(formatMoney(analytics?.totalNetPnl, currency))}
          subtitle={metric((analytics?.totalTrades ?? 0) + ' total trades · ' + (analytics?.closedTradesCount ?? 0) + ' closed')}
          icon={DollarSign} trend={ready && (analytics?.totalNetPnl ?? 0) < 0 ? 'negative' : 'positive'} />
        <KpiCard title="Win Rate" value={metric((analytics?.winRate ?? 0) + '%')}
          subtitle={metric((analytics?.winsCount ?? 0) + 'W / ' + (analytics?.lossesCount ?? 0) + 'L · ' + (analytics?.breakevenCount ?? 0) + ' BE')} icon={Percent} />
        <KpiCard title="Profit Factor" value={metric(analytics?.profitFactor == null ? 'N/A' : analytics.profitFactor)}
          subtitle={metric(analytics?.profitFactor == null ? 'No losing closed trades' : 'Net profit / net loss after fees')} icon={Scale} />
        <KpiCard title="Avg Win / Loss" value={metric(formatMoney(analytics?.avgWin, currency) + ' / ' + formatMoney(analytics?.avgLoss, currency))}
          subtitle={metric('Payoff ratio')} icon={Activity} />
        <KpiCard title="Expectancy" value={metric(formatMoney(analytics?.expectancy, currency))}
          subtitle={metric('Per closed trade')} icon={Compass} />
        <KpiCard title="Avg R-Multiple" value={metric((analytics?.avgRMultiple ?? 0) + 'R')}
          subtitle={metric('Closed trades with valid risk')} icon={Award} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EquityCurveChart data={ready ? analytics?.equityCurve || [] : []} currency={currency} />
        <DailyPnlChart data={ready ? analytics?.dailySeries || [] : []} currency={currency} />
      </div>
      <PlaybookBreakdownTable />
    </div>
  );
}
