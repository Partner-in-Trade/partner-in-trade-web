import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser, selectAnalytics, selectRawTrades, selectMarkets, selectSelectedMarketId } from '@/app/store';
import { UserRound, Trophy, Target, Activity, CalendarDays, TrendingUp } from 'lucide-react';

const money = (value, currency = 'USD') => new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(value || 0));

function Metric({ label, value, note }) {
  return <div className="rounded-xl border border-pit-border bg-pit-card p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p>{note && <p className="mt-1 text-xs text-slate-500">{note}</p>}</div>;
}

export function ProfileView({ mode = 'profile' }) {
  const user = useSelector(selectUser);
  const analytics = useSelector(selectAnalytics);
  const trades = useSelector(selectRawTrades);
  const markets = useSelector(selectMarkets);
  const selectedMarketId = useSelector(selectSelectedMarketId);
  const market = markets.find((item) => item.id === selectedMarketId);
  const currency = analytics?.currency || market?.currency || user?.baseCurrency || 'USD';
  const name = user?.fullName || 'Your profile';
  const initials = name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  const closed = trades.filter((trade) => trade.status === 'CLOSED' || trade.exitPrice != null);
  const wins = closed.filter((trade) => Number(trade.netPnl ?? trade.pnl ?? 0) > 0).length;
  const winRate = closed.length ? Math.round((wins / closed.length) * 100) : null;

  if (mode === 'settings') {
    return <section className="mx-auto max-w-4xl space-y-6">
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">Account</p><h1 className="mt-2 text-2xl font-semibold text-white">Account settings</h1><p className="mt-1 text-sm text-slate-400">Manage your account information and preferences.</p></div>
      <div className="rounded-xl border border-pit-border bg-pit-card p-5"><h2 className="font-semibold text-white">Personal information</h2><p className="mt-1 text-sm text-slate-400">Your account details are currently managed by your sign-in profile.</p><dl className="mt-5 grid gap-4 sm:grid-cols-2"><div><dt className="text-xs text-slate-500">Name</dt><dd className="mt-1 text-sm text-slate-200">{name}</dd></div><div><dt className="text-xs text-slate-500">Email</dt><dd className="mt-1 text-sm text-slate-200">{user?.email || '—'}</dd></div></dl></div>
    </section>;
  }

  return <section className="mx-auto max-w-7xl space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">Account</p><h1 className="mt-2 text-2xl font-semibold text-white">Profile</h1></div><span className="rounded-lg border border-pit-border px-3 py-2 text-xs text-slate-400">Profile overview</span></div>
    <div className="rounded-2xl border border-pit-border bg-pit-card p-6">
      <div className="flex flex-wrap items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-full bg-indigo-500/15 text-xl font-semibold text-indigo-300">{initials || <UserRound />}</div><div className="min-w-0 flex-1"><h2 className="text-xl font-semibold text-white">{name}</h2><p className="mt-1 text-sm text-slate-400">{user?.username ? '@' + user.username : user?.email || 'Add a username in profile settings'}</p><p className="mt-2 text-sm text-slate-300">{user?.bio || 'Your trading journey and profile details will appear here.'}</p></div><div className="text-sm text-slate-400">{user?.location || ''}</div></div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Net P&L" value={analytics ? money(analytics.totalNetPnl, currency) : '—'} note="Current selected market" />
      <Metric label="Win rate" value={analytics ? String(analytics.winRate ?? winRate ?? 0) + '%' : winRate == null ? '—' : winRate + '%'} note="Closed trades" />
      <Metric label="Profit factor" value={analytics?.profitFactor ?? '—'} note="Current selected market" />
      <Metric label="Trades logged" value={analytics?.totalTrades ?? trades.length} note="Loaded trading history" />
    </div>
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-xl border border-pit-border bg-pit-card p-5"><div className="flex items-center gap-2"><Activity className="h-4 w-4 text-indigo-400"/><h2 className="font-semibold text-white">Trading profile</h2></div><dl className="mt-5 grid gap-5 sm:grid-cols-2">{[['Experience', user?.tradingExperience],['Markets', Array.isArray(user?.markets) ? user.markets.join(', ') : user?.markets],['Trading style', user?.tradingStyle],['Usual session', user?.usualSession],['Risk per trade', user?.riskPerTrade],['Account currency', user?.baseCurrency || currency],['Time zone', user?.timezone]].map(([label,value])=><div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 text-sm text-slate-200">{value || 'Not set'}</dd></div>)}</dl></div>
      <div className="rounded-xl border border-pit-border bg-pit-card p-5"><div className="flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-400"/><h2 className="font-semibold text-white">Achievements</h2></div><p className="mt-2 text-sm text-slate-400">Earned milestones will be calculated from your trading activity.</p><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-lg bg-pit-bg p-3"><TrendingUp className="h-4 w-4 text-emerald-400"/><p className="mt-2 text-xs text-slate-400">Winning trades</p><p className="mt-1 text-lg font-semibold text-white">{wins}</p></div><div className="rounded-lg bg-pit-bg p-3"><CalendarDays className="h-4 w-4 text-indigo-400"/><p className="mt-2 text-xs text-slate-400">Closed trades</p><p className="mt-1 text-lg font-semibold text-white">{closed.length}</p></div></div></div>
    </div>
    <div className="grid gap-6 xl:grid-cols-2"><div className="rounded-xl border border-pit-border bg-pit-card p-5"><div className="flex items-center gap-2"><Target className="h-4 w-4 text-indigo-400"/><h2 className="font-semibold text-white">Goals</h2></div><p className="mt-3 text-sm text-slate-400">Set personal trading goals to track your progress here.</p></div><div className="rounded-xl border border-pit-border bg-pit-card p-5"><h2 className="font-semibold text-white">Recent activity</h2>{trades.slice(0,5).length ? <ul className="mt-3 divide-y divide-pit-border">{trades.slice(0,5).map((trade,index)=><li key={trade.id ?? index} className="flex justify-between gap-3 py-3 text-sm"><span className="text-slate-300">{trade.symbol || trade.marketName || 'Trade'} · {trade.direction || trade.side || '—'}</span><span className="text-slate-400">{trade.netPnl == null ? '—' : money(trade.netPnl,currency)}</span></li>)}</ul> : <p className="mt-3 text-sm text-slate-400">Your recent trades will appear here once loaded.</p>}</div></div>
  </section>;
}
