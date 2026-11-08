import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchStrategies,
  openAddTradeModal,
  selectEnrichedTrades,
  selectMarkets,
  selectSelectedMarket,
  selectStrategies,
  selectStrategiesError,
  selectStrategiesLoadedSearch,
  selectStrategiesLoading,
  selectStrategiesSearch,
  selectWorkspaceError,
  selectWorkspaceLoading,
  setStrategiesSearch,
} from '@/app/store';
import {
  buildStrategyPerformanceMap,
  performanceForStrategy,
  winRatePercent,
} from '@/features/strategies/utils/strategyPerformance';
import { StrategyCreateDrawer } from '@/features/strategies/components/StrategyCreateDrawer';
import { StrategyDetailDrawer } from '@/features/strategies/components/StrategyDetailDrawer';
import { StrategiesListStatus } from '@/features/strategies/components/StrategiesListStatus';
import { StrategyCard } from '@/features/strategies/components/StrategyCard';
import {
  STATUS_FILTERS,
  strategyListStatus,
  statusMatchesFilter,
} from '@/features/strategies/utils/strategyStatus';
import {
  buildStrategyEquitySeries,
  marketTypesForStrategy,
  rulesFollowedPercent,
} from '@/features/strategies/utils/strategyTradeInsights';
import {
  loadStrategyUiPrefs,
  isStrategyPinned,
  toggleStrategyPin,
} from '@/features/strategies/utils/strategyUiPrefs';

const SORT_OPTIONS = [
  { id: 'winrate-desc', label: 'Win rate' },
  { id: 'pnl-desc', label: 'Net P&L' },
  { id: 'trades-desc', label: 'Trades' },
  { id: 'name-asc', label: 'Name (A–Z)' },
  { id: 'name-desc', label: 'Name (Z–A)' },
];

const STATUS_TAB_LABELS = {
  active: 'Active',
  draft: 'Drafts',
};

function currencySymbol(currency) {
  return currency === 'INR' ? '₹' : '$';
}

function formatPnl(amount, currency) {
  const sym = currencySymbol(currency);
  const n = Number(amount) || 0;
  const formatted = Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
  return `${n >= 0 ? '+' : '-'}${sym}${formatted}`;
}

export function StrategiesView() {
  const dispatch = useDispatch();
  const selectedMarket = useSelector(selectSelectedMarket);
  const enrichedTrades = useSelector(selectEnrichedTrades);
  const markets = useSelector(selectMarkets);
  const strategies = useSelector(selectStrategies);
  const searchInput = useSelector(selectStrategiesSearch);
  const loadedSearch = useSelector(selectStrategiesLoadedSearch);
  const strategiesLoading = useSelector(selectStrategiesLoading);
  const strategiesError = useSelector(selectStrategiesError);
  const workspaceLoading = useSelector(selectWorkspaceLoading);
  const workspaceError = useSelector(selectWorkspaceError);
  const currency = selectedMarket?.currency || 'USD';

  const trimmedSearch = searchInput.trim();
  const [sortBy, setSortBy] = useState('winrate-desc');
  const [statusFilter, setStatusFilter] = useState('active');
  const [uiPrefs, setUiPrefs] = useState(() => loadStrategyUiPrefs());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailStrategy, setDetailStrategy] = useState(null);
  const [editingStrategy, setEditingStrategy] = useState(null);

  useEffect(() => {
    if (trimmedSearch === loadedSearch) {
      return;
    }
    dispatch(fetchStrategies(trimmedSearch));
  }, [trimmedSearch, loadedSearch, dispatch]);

  const initialLoading = workspaceLoading && strategies.length === 0;
  const searchPending = trimmedSearch !== loadedSearch || strategiesLoading;
  const isSearching =
    searchPending && (trimmedSearch.length > 0 || loadedSearch.length > 0);
  const error = strategiesError || workspaceError;

  const perfMap = useMemo(
    () => buildStrategyPerformanceMap(enrichedTrades),
    [enrichedTrades]
  );

  const rows = useMemo(() => {
    return strategies.map((s) => {
      const perf = performanceForStrategy(perfMap, s);
      const status = strategyListStatus(s, uiPrefs);
      return {
        strategy: s,
        perf,
        winRate: winRatePercent(perf),
        status,
        pinned: isStrategyPinned(s.id, uiPrefs),
        equitySeries: buildStrategyEquitySeries(enrichedTrades, s),
        rulesPercent: rulesFollowedPercent(enrichedTrades, s),
        marketTypes: marketTypesForStrategy(enrichedTrades, s, markets),
        timeframeLabel: s.timeframe || s.timeframes?.[0] || null,
      };
    });
  }, [strategies, perfMap, enrichedTrades, uiPrefs, markets]);

  const activeCount = useMemo(
    () => strategies.filter((s) => s.isActive === true).length,
    [strategies]
  );

  const filteredRows = useMemo(
    () => rows.filter((r) => statusMatchesFilter(r.status, statusFilter)),
    [rows, statusFilter]
  );

  const sortedRows = useMemo(() => {
    const copy = [...filteredRows];
    const pinRank = (row) => (row.pinned ? 0 : 1);
    copy.sort((a, b) => {
      const pinDiff = pinRank(a) - pinRank(b);
      if (pinDiff !== 0) return pinDiff;
      switch (sortBy) {
        case 'name-desc':
          return b.strategy.name.localeCompare(a.strategy.name);
        case 'trades-desc':
          return b.perf.tradeCount - a.perf.tradeCount;
        case 'winrate-desc':
          return b.winRate - a.winRate || b.perf.tradeCount - a.perf.tradeCount;
        case 'pnl-desc':
          return b.perf.netPnl - a.perf.netPnl;
        default:
          return a.strategy.name.localeCompare(b.strategy.name);
      }
    });
    return copy;
  }, [filteredRows, sortBy]);

  const handleTogglePin = (strategyId) => {
    setUiPrefs(toggleStrategyPin(strategyId));
  };

  const handleLogTrade = (strategyName) => {
    dispatch(openAddTradeModal({ setup: strategyName }));
  };

  const showEmpty =
    !initialLoading && !isSearching && !error && sortedRows.length === 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Playbook</h2>
          <p className="mt-1 text-sm text-slate-400">
            {strategies.length} strateg{strategies.length === 1 ? 'y' : 'ies'} • {activeCount}{' '}
            active. Pin your favourites to keep them first.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Create new strategy"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 hover:from-indigo-500 hover:to-violet-500"
        >
          <Plus className="h-4 w-4" />
          New strategy
        </button>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => dispatch(setStrategiesSearch(e.target.value))}
            placeholder="Search strategies..."
            className="w-full rounded-xl border border-pit-border bg-pit-card py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div
            className="inline-flex flex-wrap gap-1 rounded-xl border border-pit-border bg-pit-card p-1"
            role="tablist"
            aria-label="Strategy status"
          >
            {STATUS_FILTERS.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={statusFilter === id}
                onClick={() => setStatusFilter(id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  statusFilter === id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                {STATUS_TAB_LABELS[id]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-400">
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
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {initialLoading ? (
        <div className="rounded-2xl border border-pit-border bg-pit-card">
          <StrategiesListStatus
            message="Loading your strategies…"
            submessage="Pulling playbooks from your account."
          />
        </div>
      ) : isSearching ? (
        <div className="rounded-2xl border border-pit-border bg-pit-card">
          <StrategiesListStatus
            pulse
            message="Zeroing in on your edge…"
            submessage="Matching names, tags, and notes across your playbook."
          />
        </div>
      ) : showEmpty ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-pit-border bg-pit-card/40 p-6 text-center transition hover:border-indigo-500/50 hover:bg-pit-card/70"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-pit-border bg-pit-bg text-slate-400">
              <Plus className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-white">New strategy</p>
            <p className="mt-2 max-w-xs text-xs text-slate-500">
              {trimmedSearch
                ? 'No strategies match your search.'
                : 'Start blank, or from a template like ICT Silver Bullet or Opening Range.'}
            </p>
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sortedRows.map((row) => (
            <StrategyCard
              key={row.strategy.id}
              strategy={row.strategy}
              perf={row.perf}
              winRate={row.winRate}
              status={row.status}
              pinned={row.pinned}
              currency={currency}
              equitySeries={row.equitySeries}
              rulesPercent={row.rulesPercent}
              marketTypes={row.marketTypes}
              timeframeLabel={row.timeframeLabel}
              formatPnl={formatPnl}
              onTogglePin={() => handleTogglePin(row.strategy.id)}
              onOpenPlaybook={() => setDetailStrategy(row.strategy)}
              onLogTrade={() => handleLogTrade(row.strategy.name)}
            />
          ))}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-pit-border bg-pit-card/40 p-6 text-center transition hover:border-indigo-500/50 hover:bg-pit-card/70"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-pit-border bg-pit-bg text-slate-400">
              <Plus className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-white">New strategy</p>
            <p className="mt-2 max-w-xs text-xs text-slate-500">
              Start blank, or from a template like ICT Silver Bullet or Opening Range.
            </p>
          </button>
        </div>
      )}

      <StrategyCreateDrawer
        open={drawerOpen || editingStrategy != null}
        strategy={editingStrategy}
        onClose={() => { setDrawerOpen(false); setEditingStrategy(null); }}
        onUpdated={() => { setDetailStrategy(null); setEditingStrategy(null); }}
      />
      <StrategyDetailDrawer
        open={detailStrategy != null}
        strategy={detailStrategy}
        onClose={() => setDetailStrategy(null)}
        onEdit={(strategy) => { setDetailStrategy(null); setEditingStrategy(strategy); }}
      />
    </div>
  );
}
