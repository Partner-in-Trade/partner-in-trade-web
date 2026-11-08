import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppEffects } from './AppEffects';
import {
  selectActiveTab,
  selectIsAuthenticated,
  selectJournalError,
  selectJournalLoading,
  selectNeedsSubscriptionOnboarding,
  selectSubscriptionBootstrapping,
  selectSubscriptionStatus,
  selectSubscriptionError,
  selectHasCapability,
  PRODUCT_CAPABILITIES,
  fetchSubscriptionContext,
  setActiveTab,
} from '@/app/store';
import { PricingOnboardingView } from '@/features/subscription/PricingOnboardingView';
import { SubscriptionBootstrapScreen } from '@/features/subscription/components/SubscriptionBootstrapScreen';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { DashboardView } from '@/features/dashboard/DashboardView';
import { AnalyticsView } from '@/features/analytics/AnalyticsView';
import { CalendarView } from '@/features/calendar/CalendarView';
import { TradeLogView } from '@/features/trades/components/TradeLogView';
import { MarketsView } from '@/features/markets/MarketsView';
import { StrategiesView } from '@/features/strategies/StrategiesView';
import { NewsCalendarView } from '@/features/news/NewsCalendarView';
import { JournalView } from '@/features/journal/JournalView';
import { TradeEntryModal } from '@/features/trades/components/TradeEntryModal';
import { TradeDetailModal } from '@/features/trades/components/TradeDetailModal';
import { AuthView } from '@/features/auth/AuthView';

const TAB_CAPABILITIES = {
  dashboard: PRODUCT_CAPABILITIES.DASHBOARD,
  analytics: PRODUCT_CAPABILITIES.ANALYTICS,
  calendar: PRODUCT_CAPABILITIES.PNL_CALENDAR,
  journal: PRODUCT_CAPABILITIES.JOURNAL,
  tradelog: PRODUCT_CAPABILITIES.TRADE_LOG,
  strategies: PRODUCT_CAPABILITIES.STRATEGIES,
  markets: PRODUCT_CAPABILITIES.MARKETS,
  'news-calendar': PRODUCT_CAPABILITIES.NEWS_CALENDAR,
};

export function MainContent({ activeTab, onNavigate }) {
  const requiredCapability = TAB_CAPABILITIES[activeTab];
  const hasCapability = useSelector((state) =>
    requiredCapability ? selectHasCapability(state, requiredCapability) : true
  );
  const loading = useSelector(selectJournalLoading);
  const error = useSelector(selectJournalError);
  const journalIndependentTab =
    activeTab === 'markets' ||
    activeTab === 'strategies' ||
    activeTab === 'news-calendar' ||
    activeTab === 'analytics' ||
    activeTab === 'journal';
  const showJournalLoading = loading && !journalIndependentTab;

  if (!hasCapability) {
    return (
      <div className="rounded-xl border border-pit-border bg-pit-card p-6 text-sm text-slate-300">
        This feature is not included in your current plan. Upgrade your subscription to access it.
      </div>
    );
  }

  if (showJournalLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-slate-400 text-sm">
        Loading your journal…
      </div>
    );
  }

  if (error && !journalIndependentTab) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-200">
        {error}
      </div>
    );
  }

  return (
    <>
      {activeTab === 'dashboard' && <DashboardView onNavigate={onNavigate} />}
      {activeTab === 'analytics' && <AnalyticsView />}
      {activeTab === 'calendar' && <CalendarView />}
      {activeTab === 'tradelog' && <TradeLogView />}
      {activeTab === 'markets' && <MarketsView />}
      {activeTab === 'strategies' && <StrategiesView />}
      {activeTab === 'news-calendar' && <NewsCalendarView />}
      {activeTab === 'journal' && <JournalView />}
    </>
  );
}

function AppShell() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const activeTab = useSelector(selectActiveTab);
  const subscriptionBootstrapping = useSelector(selectSubscriptionBootstrapping);
  const subscriptionStatus = useSelector(selectSubscriptionStatus);
  const subscriptionError = useSelector(selectSubscriptionError);
  const needsOnboarding = useSelector(selectNeedsSubscriptionOnboarding);

  const navigate = (tab) => dispatch(setActiveTab(tab));

  if (!isAuthenticated) {
    return <AuthView />;
  }

  if (subscriptionBootstrapping) {
    return <SubscriptionBootstrapScreen />;
  }

  if (subscriptionStatus === 'error') {
    return (
      <SubscriptionBootstrapScreen
        error={subscriptionError}
        onRetry={() => dispatch(fetchSubscriptionContext())}
      />
    );
  }

  if (needsOnboarding) {
    return <PricingOnboardingView />;
  }

  return (
    <div className="min-h-screen bg-pit-bg text-slate-100 flex">
        <Sidebar activeTab={activeTab} setActiveTab={navigate} />
        <div className="flex-1 flex flex-col min-w-0">
          <TopHeader activeTab={activeTab} />
          <main className="flex-1 p-6 overflow-y-auto">
            <MainContent activeTab={activeTab} onNavigate={navigate} />
          </main>
        </div>
        <TradeEntryModal />
        <TradeDetailModal />
      </div>
  );
}

export default function App() {
  return (
    <>
      <AppEffects />
      <AppShell />
    </>
  );
}
