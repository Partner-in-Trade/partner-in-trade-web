import React from 'react';
import { useSelector } from 'react-redux';
import { selectAnalytics, selectAnalyticsLoading } from '@/app/store';

export function TopHeader({ activeTab }) {
  const analytics = useSelector(selectAnalytics);
  const analyticsLoading = useSelector(selectAnalyticsLoading);

  const titles = {
    dashboard: 'Performance Overview',
    calendar: 'Monthly P&L Calendar',
    journal: 'Trading Journal',
    tradelog: 'Manual Trade Execution Log',
    strategies: 'Strategies',
    markets: 'Markets & Capital',
    'news-calendar': 'Economic News Calendar',
  };

  const currency = analytics?.currency || 'USD';
  const currencySymbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
  const totalNetPnl = analytics?.totalNetPnl;
  const winRate = analytics?.winRate;
  const profitFactor = analytics?.profitFactor;
  const formatPnl = (value) => value == null
    ? '—'
    : `${value >= 0 ? '+' : ''}${currencySymbol}${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  return (
    <header className="h-16 bg-pit-card/80 backdrop-blur border-b border-pit-border px-6 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-white">{titles[activeTab]}</h1>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Net P&L:</span>
          <span className={`font-mono font-bold ${totalNetPnl == null ? 'text-slate-400' : totalNetPnl >= 0 ? 'text-pit-profit' : 'text-pit-loss'}`}>
            {analyticsLoading && totalNetPnl == null ? 'Loading…' : formatPnl(totalNetPnl)}
          </span>
        </div>
        <div className="h-4 w-px bg-slate-800" />
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Win Rate:</span>
          <span className="font-mono font-semibold text-indigo-400">{winRate == null ? '—' : `${winRate}%`}</span>
        </div>
        <div className="h-4 w-px bg-slate-800" />
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Profit Factor:</span>
          <span className="font-mono font-semibold text-slate-200">
            {profitFactor == null || profitFactor === '' ? 0 : profitFactor}
          </span>
        </div>
      </div>
    </header>
  );
}
