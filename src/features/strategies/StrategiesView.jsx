import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search, Layers, TrendingUp, BarChart2, Hash } from 'lucide-react';
import { useSelector } from 'react-redux';
import {
  selectEnrichedTrades,
  selectSelectedMarket,
  selectUser,
} from '@/app/store';
import { KpiCard } from '@/components/ui/KpiCard';
import { strategiesApi } from '@/features/strategies/api/strategiesApi';
import {
  buildStrategyPerformanceMap,
  performanceForStrategy,
  winRatePercent,
} from '@/features/strategies/utils/strategyPerformance';
import { StrategyCreateDrawer } from '@/features/strategies/components/StrategyCreateDrawer';

const SORT_OPTIONS = [
  { id: 'name-asc', label: 'Name (A–Z)' },
  { id: 'name-desc', label: 'Name (Z–A)' },
  { id: 'trades-desc', label: 'Trades (high–low)' },
  { id: 'winrate-desc', label: 'Win rate (high–low)' },
  { id: 'pnl-desc', label: 'Net P&L (high–low)' },
];

function currencySymbol(currency) {
  return currency === 'INR' ? '₹' : '$';
}

function formatPnl(amount, currency) {
  const sym = currencySymbol(currency);
  const n = Number(amount) || 0;
  const formatted = Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
  return `${n >= 0 ? '+' : '-'}${sym}${formatted}`;
}

function strategyInitial(name) {
  return (name || '?').trim().charAt(0).toUpperCase();
}

function tagColorClass(tag, index) {
  const palette = [
    'bg-indigo-500/15 text-indigo-300',
    'bg-emerald-500/15 text-emerald-300',
    'bg-amber-500/15 text-amber-300',
    'bg-sky-500/15 text-sky-300',
  ];
  return palette[index % palette.length];
}

export function StrategiesView() {
  const user = useSelector(selectUser);
  const selectedMarket = useSelector(selectSelectedMarket);
  const enrichedTrades = useSelector(selectEnrichedTrades);
  const currency = selectedMarket?.currency || 'USD';

  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadStrategies = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      const res = await strategiesApi.getByUser(Number(user.id), 0, 200, debouncedSearch);
      setStrategies(res.data?.strategies || []);
    } catch (e) {
      setError(e.message || 'Failed to load strategies');
      setStrategies([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, debouncedSearch]);

  useEffect(() => {
    loadStrategies();
  }, [loadStrategies]);

  const perfMap = useMemo(
    () => buildStrategyPerformanceMap(enrichedTrades),
    [enrichedTrades]
  );

  const rows = useMemo(() => {
    return strategies.map((s) => {
      const perf = performanceForStrategy(perfMap, s);
      return {
        strategy: s,
        perf,
        winRate: winRatePercent(perf),
      };
    });
  }, [strategies, perfMap]);

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      switch (sortBy) {
        case 'name-desc':
          return b.strategy.name.localeCompare(a.strategy.name);
        case 'trades-desc':
          return b.perf.tradeCount - a.perf.tradeCount;
        case 'winrate-desc':
          return b.winRate - a.winRate;
        case 'pnl-desc':
          return b.perf.netPnl - a.perf.netPnl;
        default:
          return a.strategy.name.localeCompare(b.strategy.name);
      }
    });
    return copy;
  }, [rows, sortBy]);

  const kpis = useMemo(() => {
    let totalTrades = 0;
    let totalWins = 0;
    let totalNetPnl = 0;
    rows.forEach(({ perf }) => {
      totalTrades += perf.tradeCount;
      totalWins += perf.wins;
      totalNetPnl += perf.netPnl;
    });
    const aggregateWinRate = totalTrades ? Math.round((totalWins / totalTrades) * 100) : 0;
    return {
      totalStrategies: strategies.length,
      totalTrades,
      aggregateWinRate,
      totalNetPnl,
    };
  }, [rows, strategies.length]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Strategies</h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage your trading strategies and track their performance.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 shrink-0"
        >
          <Plus className="h-4 w-4" />
          New strategy
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Total strategies" value={kpis.totalStrategies} icon={Layers} />
        <KpiCard
          title="Total trades"
          value={kpis.totalTrades}
          icon={Hash}
          trend="neutral"
        />
        <KpiCard
          title="Win rate (all)"
          value={`${kpis.aggregateWinRate}%`}
          icon={BarChart2}
        />
        <KpiCard
          title="Net P&L (all)"
          value={formatPnl(kpis.totalNetPnl, currency)}
          icon={TrendingUp}
          trend={kpis.totalNetPnl >= 0 ? 'positive' : 'negative'}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search strategies…"
            className="w-full rounded-lg border border-pit-border bg-pit-card py-2 pl-10 pr-3 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-400 shrink-0">
          Sort by
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-pit-border bg-pit-card px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="bg-pit-card border border-pit-border rounded-xl overflow-hidden">
        {error && (
          <div className="p-4 text-sm text-rose-300 border-b border-pit-border">{error}</div>
        )}
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading strategies…</div>
        ) : sortedRows.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            {debouncedSearch ? 'No strategies match your search.' : 'No strategies yet. Create your first one.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[720px]">
              <thead className="bg-pit-bg text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-3 px-4">Strategy</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Trades</th>
                  <th className="py-3 px-4 text-right">Win rate</th>
                  <th className="py-3 px-4 text-right">Net P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pit-border">
                {sortedRows.map(({ strategy, perf, winRate }) => (
                  <tr key={strategy.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-sm font-bold text-indigo-300">
                          {strategyInitial(strategy.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{strategy.name}</div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {(strategy.tags || []).slice(0, 4).map((tag, i) => (
                              <span
                                key={tag}
                                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${tagColorClass(tag, i)}`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                      {strategy.description || '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-200">
                      {perf.tradeCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-indigo-400">
                      {perf.tradeCount ? `${winRate}%` : '—'}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-bold ${
                        perf.netPnl >= 0 ? 'text-pit-profit' : 'text-pit-loss'
                      }`}
                    >
                      {perf.tradeCount ? formatPnl(perf.netPnl, currency) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StrategyCreateDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={() => loadStrategies()}
      />
    </div>
  );
}
