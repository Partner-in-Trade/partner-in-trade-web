import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  BarChart3,
  Calendar as CalendarIcon,
  Table2,
  Wallet,
  Target,
  PlusCircle,
  RotateCcw,
  LogOut,
  Newspaper,
  BookOpen,
  ChevronDown,
} from 'lucide-react';
import { LOGO_ALT, LOGO_SRC } from '@/constants/branding';
import {
  openAddTradeModal,
  refreshTrades,
  logout,
  selectUser,
  selectIsDevBypassEnabled,
  selectSelectedMarket,
  selectJournalLoading,
  setActiveTab,
  selectActiveTab,
} from '@/app/store';
import {
  openJournalDayView,
  selectJournalNavExpanded,
  setJournalNavExpanded,
} from '@/app/store/slices/journalSlice';
import { JournalSidebarPanel } from '@/features/journal/components/JournalSidebarPanel';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'calendar', label: 'P&L Calendar', icon: CalendarIcon },
  { id: 'journal', label: 'Journal', icon: BookOpen, expandable: true },
  { id: 'tradelog', label: 'Trade Log', icon: Table2 },
  { id: 'strategies', label: 'Strategies', icon: Target },
  { id: 'markets', label: 'Markets', icon: Wallet },
  { id: 'news-calendar', label: 'News Calendar', icon: Newspaper },
];

export function Sidebar({ activeTab, setActiveTab: setActiveTabProp }) {
  const dispatch = useDispatch();
  const loading = useSelector(selectJournalLoading);
  const selectedMarket = useSelector(selectSelectedMarket);
  const user = useSelector(selectUser);
  const isDevBypassEnabled = selectIsDevBypassEnabled();
  const journalExpanded = useSelector(selectJournalNavExpanded);
  const currentTab = useSelector(selectActiveTab);

  const navigate = (tab) => {
    if (setActiveTabProp) setActiveTabProp(tab);
    else dispatch(setActiveTab(tab));
  };

  const handleJournalClick = () => {
    const nextExpanded = currentTab === 'journal' ? !journalExpanded : true;
    navigate('journal');
    dispatch(setJournalNavExpanded(nextExpanded));
    if (currentTab !== 'journal') {
      dispatch(openJournalDayView());
    }
  };

  return (
    <aside className="w-64 bg-pit-card border-r border-pit-border flex flex-col justify-between shrink-0">
      <div>
        <div className="px-4 py-3 flex items-center justify-center border-b border-pit-border">
          <img
            src={LOGO_SRC}
            alt={LOGO_ALT}
            className="h-24 w-auto max-w-full object-contain"
          />
        </div>

        <div className="p-4">
          <button
            type="button"
            disabled={loading || !selectedMarket}
            onClick={() => dispatch(openAddTradeModal())}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition"
          >
            <PlusCircle className="w-4 h-4" />
            Log Trade
          </button>
        </div>

        <nav className="px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            if (item.expandable) {
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    onClick={handleJournalClick}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      active
                        ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition ${journalExpanded && active ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {active && journalExpanded && <JournalSidebarPanel />}
                </div>
              );
            }
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-pit-border space-y-3">
        {user && (
          <div className="p-2.5 rounded-lg bg-pit-bg border border-pit-border flex items-center justify-between">
            <div className="truncate pr-2">
              <div className="text-xs font-semibold text-white truncate">
                {user.fullName}
              </div>
              <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-pit-profit shrink-0">
              {user.accountType}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => dispatch(refreshTrades())}
          className="w-full py-2 px-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 flex items-center justify-center gap-2 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Refresh trades
        </button>

        {isDevBypassEnabled && (
          <p className="text-[10px] text-slate-500 text-center">Dev mock login skips API</p>
        )}

        <button
          type="button"
          onClick={() => dispatch(logout())}
          className="w-full py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs text-pit-loss font-medium flex items-center justify-center gap-2 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
