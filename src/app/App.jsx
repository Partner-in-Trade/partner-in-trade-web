import React, { useState } from 'react';
import { AuthProvider, useAuth } from './providers/AuthContext';
import { WorkspaceProvider } from './providers/WorkspaceContext';
import { TradeProvider, useTrades } from './providers/TradeContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { DashboardView } from '@/features/dashboard/DashboardView';
import { CalendarView } from '@/features/calendar/CalendarView';
import { TradeLogView } from '@/features/trades/components/TradeLogView';
import { AnalyticsView } from '@/features/analytics/AnalyticsView';
import { TradeEntryModal } from '@/features/trades/components/TradeEntryModal';
import { TradeDetailModal } from '@/features/trades/components/TradeDetailModal';
import { AuthView } from '@/features/auth/AuthView';

function MainContent({ activeTab }) {
  const { loading, error } = useTrades();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-slate-400 text-sm">
        Loading your journal…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-200">
        {error}
      </div>
    );
  }

  return (
    <>
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'calendar' && <CalendarView />}
      {activeTab === 'tradelog' && <TradeLogView />}
      {activeTab === 'analytics' && <AnalyticsView />}
    </>
  );
}

function AppShell() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <WorkspaceProvider>
      <TradeProvider>
        <div className="min-h-screen bg-pit-bg text-slate-100 flex">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="flex-1 flex flex-col min-w-0">
            <TopHeader activeTab={activeTab} />
            <main className="flex-1 p-6 overflow-y-auto">
              <MainContent activeTab={activeTab} />
            </main>
          </div>
          <TradeEntryModal />
          <TradeDetailModal />
        </div>
      </TradeProvider>
    </WorkspaceProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
