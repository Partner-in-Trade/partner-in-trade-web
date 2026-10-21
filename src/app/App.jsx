import React, { useState } from 'react';
import { AuthProvider, useAuth } from './providers/AuthContext';
import { TradeProvider } from './providers/TradeContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { DashboardView } from '@/features/dashboard/DashboardView';
import { CalendarView } from '@/features/calendar/CalendarView';
import { TradeLogView } from '@/features/trades/components/TradeLogView';
import { AnalyticsView } from '@/features/analytics/AnalyticsView';
import { TradeEntryModal } from '@/features/trades/components/TradeEntryModal';
import { TradeDetailModal } from '@/features/trades/components/TradeDetailModal';
import { AuthView } from '@/features/auth/AuthView';

function AppShell() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <TradeProvider>
      <div className="min-h-screen bg-pit-bg text-slate-100 flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col min-w-0">
          <TopHeader activeTab={activeTab} />
          <main className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'calendar' && <CalendarView />}
            {activeTab === 'tradelog' && <TradeLogView />}
            {activeTab === 'analytics' && <AnalyticsView />}
          </main>
        </div>
        <TradeEntryModal />
        <TradeDetailModal />
      </div>
    </TradeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}