import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DollarSign, Percent, Activity, Scale, Compass, Award, PlusCircle } from 'lucide-react';
import {
  setSelectedMarketId,
  setSelectedTrade,
  selectRawTrades,
  selectAnalytics,
  selectAnalyticsLoading,
  selectAnalyticsError,
  selectMarkets,
  selectSelectedMarketId,
} from '@/app/store';
import { KpiCard } from '@/components/ui/KpiCard';
import { EquityCurveChart } from './components/EquityCurveChart';
import { DailyPnlChart } from './components/DailyPnlChart';
import { RecentTradesTable } from './components/RecentTradesTable';

function formatMarketLabel(market) {
  const symbol = market.currency === 'INR' ? '₹' : '$';
  const funds = Number(market.funds) || 0;
  return `${market.name} · ${symbol}${funds.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatMoney(value, currency) {
  const symbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
  return `${symbol}${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatProfitFactor(value) {
  if (value == null || value === '' || Number.isNaN(Number(value))) return 0;
  return value;
}

export function DashboardView({ onNavigate }) {
  const dispatch = useDispatch();
  const trades = useSelector(selectRawTrades);
  const analytics = useSelector(selectAnalytics);
  const loading = useSelector(selectAnalyticsLoading);
  const error = useSelector(selectAnalyticsError);
  const markets = useSelector(selectMarkets);
  const selectedMarketId = useSelector(selectSelectedMarketId);

  if (markets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <p className="text-slate-400 text-sm max-w-md">
          You don&apos;t have any markets yet. Create one (Stocks, Forex, Crypto, etc.) and add
          initial capital to start journaling trades.
        </p>
        <button type="button" onClick={() => onNavigate?.('markets')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold">
          <PlusCircle className="w-4 h-4" /> Add your first market
        </button>
      </div>
    );
  }

  const currency = analytics?.currency || markets.find((market) => market.id === selectedMarketId)?.currency || 'USD';
  const ready = analytics?.marketId === selectedMarketId;
  const metricUnavailable = loading ? 'Loading…' : error ? '—' : '—';
  const metric = (value) => ready ? value : metricUnavailable;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-xs text-slate-400 shrink-0">Active market</label>
        <select value={selectedMarketId ?? ''}
          onChange={(event) => dispatch(setSelectedMarketId(Number(event.target.value)))}
          className="max-w-md rounded-lg border border-pit-border bg-pit-bg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none">
          {markets.map((market) => <option key={market.id} value={market.id}>{formatMarketLabel(market)}</option>)}
        </select>
      </div>

      {loading && !ready && <p className="text-xs text-indigo-300">Loading backend analytics…</p>}
      {error && <p role="alert" className="text-xs text-rose-400">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <KpiCard title="Net P&L" value={metric(formatMoney(analytics?.totalNetPnl, currency))}
          subtitle={metric(`${analytics?.totalTrades ?? 0} total trades · ${analytics?.closedTradesCount ?? 0} closed`)}
          icon={DollarSign} trend={ready && (analytics?.totalNetPnl ?? 0) < 0 ? 'negative' : 'positive'} />
        <KpiCard title="Win Rate" value={metric(`${analytics?.winRate ?? 0}%`)}
          subtitle={metric(`${analytics?.winsCount ?? 0}W / ${analytics?.lossesCount ?? 0}L · ${analytics?.breakevenCount ?? 0} BE`)} icon={Percent} />
        <KpiCard
          title="Profit Factor"
          value={metric(formatProfitFactor(analytics?.profitFactor))}
          subtitle={metric(
            formatProfitFactor(analytics?.profitFactor) === 0
              ? 'No losing closed trades'
              : 'Net profit / net loss after fees'
          )}
          icon={Scale}
        />
        <KpiCard title="Avg Win / Loss" value={metric(`${formatMoney(analytics?.avgWin, currency)} / ${formatMoney(analytics?.avgLoss, currency)}`)}
          subtitle={metric('Payoff ratio')} icon={Activity} />
        <KpiCard title="Expectancy" value={metric(formatMoney(analytics?.expectancy, currency))}
          subtitle={metric('Per closed trade')} icon={Compass} />
        <KpiCard title="Avg R-Multiple" value={metric(`${analytics?.avgRMultiple ?? 0}R`)}
          subtitle={metric('Closed trades with valid risk')} icon={Award} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EquityCurveChart data={ready ? analytics?.equityCurve || [] : []} currency={currency} />
        <DailyPnlChart data={ready ? analytics?.dailySeries || [] : []} currency={currency} />
      </div>
      <RecentTradesTable trades={trades} onSelectTrade={(trade) => dispatch(setSelectedTrade(trade))} />
    </div>
  );
}
