import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LayoutDashboard, BarChart3, Calendar as CalendarIcon, Table2, Wallet, Target, PlusCircle, RotateCcw, LogOut, Newspaper, BookOpen, ChevronDown, UserRound, Settings } from 'lucide-react';
import { LOGO_ALT, LOGO_SRC } from '@/constants/branding';
import { openAddTradeModal, refreshTrades, logout, selectUser, selectIsDevBypassEnabled, selectSelectedMarket, selectJournalLoading, setActiveTab, selectActiveTab, selectAvailableCapabilities, PRODUCT_CAPABILITIES } from '@/app/store';
import { openJournalDayView, selectJournalNavExpanded, setJournalNavExpanded } from '@/app/store/slices/journalSlice';
import { JournalSidebarPanel } from '@/features/journal/components/JournalSidebarPanel';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, capability: PRODUCT_CAPABILITIES.DASHBOARD },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, capability: PRODUCT_CAPABILITIES.ANALYTICS },
  { id: 'calendar', label: 'P&L Calendar', icon: CalendarIcon, capability: PRODUCT_CAPABILITIES.PNL_CALENDAR },
  { id: 'journal', label: 'Journal', icon: BookOpen, expandable: true, capability: PRODUCT_CAPABILITIES.JOURNAL },
  { id: 'tradelog', label: 'Trade Log', icon: Table2, capability: PRODUCT_CAPABILITIES.TRADE_LOG },
  { id: 'strategies', label: 'Strategies', icon: Target, capability: PRODUCT_CAPABILITIES.STRATEGIES },
  { id: 'markets', label: 'Markets', icon: Wallet, capability: PRODUCT_CAPABILITIES.MARKETS },
  { id: 'news-calendar', label: 'News Calendar', icon: Newspaper, capability: PRODUCT_CAPABILITIES.NEWS_CALENDAR },
];

export function Sidebar({ activeTab, setActiveTab: setActiveTabProp }) {
  const dispatch = useDispatch();
  const loading = useSelector(selectJournalLoading);
  const selectedMarket = useSelector(selectSelectedMarket);
  const user = useSelector(selectUser);
  const isDevBypassEnabled = selectIsDevBypassEnabled();
  const journalExpanded = useSelector(selectJournalNavExpanded);
  const currentTab = useSelector(selectActiveTab);
  const availableCapabilities = useSelector(selectAvailableCapabilities);
  const canLogTrade = availableCapabilities.includes(PRODUCT_CAPABILITIES.TRADE_LOG);
  const visibleNavItems = NAV_ITEMS.filter((item) => availableCapabilities.includes(item.capability));
  const navigate = (tab) => setActiveTabProp ? setActiveTabProp(tab) : dispatch(setActiveTab(tab));
  const handleJournalClick = () => {
    const nextExpanded = currentTab === 'journal' ? !journalExpanded : true;
    navigate('journal'); dispatch(setJournalNavExpanded(nextExpanded));
    if (currentTab !== 'journal') dispatch(openJournalDayView());
  };
  return <aside className="w-64 bg-pit-card border-r border-pit-border flex flex-col justify-between shrink-0">
    <div>
      <div className="px-4 py-3 flex items-center justify-center border-b border-pit-border"><img src={LOGO_SRC} alt={LOGO_ALT} className="h-24 w-auto max-w-full object-contain" /></div>
      {canLogTrade && <div className="p-4"><button type="button" disabled={loading || !selectedMarket} onClick={() => dispatch(openAddTradeModal())} className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition"><PlusCircle className="w-4 h-4" />Log Trade</button></div>}
      <nav className="px-3 space-y-1">{visibleNavItems.map((item) => {
        const Icon = item.icon; const active = activeTab === item.id;
        if (item.expandable) return <div key={item.id}><button type="button" onClick={handleJournalClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${active ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}><Icon className="w-4 h-4 shrink-0" /><span className="flex-1 text-left">{item.label}</span><ChevronDown className={`w-4 h-4 transition ${journalExpanded && active ? 'rotate-180' : ''}`} /></button>{active && journalExpanded && <JournalSidebarPanel />}</div>;
        return <button key={item.id} type="button" onClick={() => navigate(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${active ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}><Icon className="w-4 h-4" />{item.label}</button>;
      })}</nav>
    </div>
    <div className="p-4 border-t border-pit-border space-y-3">
      {user && <div className="rounded-lg border border-pit-border bg-pit-bg p-2.5"><div className="flex items-center gap-2"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-500/15 text-xs font-semibold text-indigo-300">{(user.fullName || 'U').split(/\s+/).map((part) => part[0]).slice(0,2).join('').toUpperCase()}</div><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold text-white">{user.fullName}</div><div className="truncate text-[11px] text-slate-400">{user.email}</div></div></div><div className="mt-2 grid grid-cols-2 gap-2"><button type="button" onClick={() => navigate('profile')} className={`flex items-center justify-center gap-1 rounded-md px-2 py-2 text-[11px] ${activeTab === 'profile' ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-400 hover:bg-slate-800'}`}><UserRound className="h-3.5 w-3.5"/>View profile</button><button type="button" onClick={() => navigate('settings')} className={`flex items-center justify-center gap-1 rounded-md px-2 py-2 text-[11px] ${activeTab === 'settings' ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-400 hover:bg-slate-800'}`}><Settings className="h-3.5 w-3.5"/>Settings</button></div><div className="mt-2 text-[10px] text-slate-500">{user.accountType || 'Account'}</div></div>}
      <button type="button" onClick={() => dispatch(refreshTrades())} className="w-full py-2 px-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 flex items-center justify-center gap-2 transition"><RotateCcw className="w-3.5 h-3.5"/>Refresh trades</button>
      {isDevBypassEnabled && <p className="text-[10px] text-slate-500 text-center">Dev mock login skips API</p>}
      <button type="button" onClick={() => dispatch(logout())} className="w-full py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs text-pit-loss font-medium flex items-center justify-center gap-2 transition"><LogOut className="w-3.5 h-3.5"/>Sign Out</button>
    </div>
  </aside>;
}
