import React from 'react';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Table2,
  BarChart3,
  PlusCircle,
  RotateCcw,
  TrendingUp,
} from 'lucide-react';
import { useTrades } from '@/app/providers/TradeContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calendar', label: 'P&L Calendar', icon: CalendarIcon },
  { id: 'tradelog', label: 'Trade Log', icon: Table2 },
  { id: 'analytics', label: 'Playbooks & Edge', icon: BarChart3 },
];

export function Sidebar({ activeTab, setActiveTab }) {
  const { openAddTradeModal, resetDemoData } = useTrades();

  return (
    <aside className="w-64 bg-pit-card border-r border-pit-border flex flex-col justify-between shrink-0">
      <div>
        <div className="h-16 px-6 flex items-center gap-3 border-b border-pit-border">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white leading-tight block">Partner in Trade</span>
            <span className="text-[10px] uppercase text-indigo-400 font-semibold">Journal Pro</span>
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={() => openAddTradeModal()}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition"
          >
            <PlusCircle className="w-4 h-4" />
            Log Manual Trade
          </button>
        </div>

        <nav className="px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
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

      <div className="p-4 border-t border-pit-border">
        <button
          onClick={resetDemoData}
          className="w-full py-2 px-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 flex items-center justify-center gap-2 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Sample Trades
        </button>
      </div>
    </aside>
  );
}