import React from 'react';
import { useSelector } from 'react-redux';
import {
  selectAnalytics,
  selectAnalyticsError,
  selectAnalyticsLoading,
} from '@/app/store';
import { PlaybookBreakdownTable } from './components/PlaybookBreakdownTable';

export function AnalyticsView() {
  const analytics = useSelector(selectAnalytics);
  const loading = useSelector(selectAnalyticsLoading);
  const error = useSelector(selectAnalyticsError);

  return (
    <div className="space-y-6">
      <div className="bg-pit-card border border-pit-border rounded-xl p-6">
        <h2 className="text-base font-bold text-white mb-1">Partner in Trade Analytics</h2>
        <p className="text-xs text-slate-400">
          {analytics?.closedTradesCount ?? 0} closed trades · calculated by the backend
        </p>
        {loading && <p className="text-xs text-indigo-300 mt-3">Loading market analytics…</p>}
        {error && <p role="alert" className="text-xs text-rose-400 mt-3">{error}</p>}
      </div>
      <PlaybookBreakdownTable />
    </div>
  );
}
