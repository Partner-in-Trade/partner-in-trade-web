import React from 'react';

export function SubscriptionBootstrapScreen({ error, onRetry }) {
  if (error) {
    return (
      <div className="min-h-screen bg-pit-bg flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-xl border border-rose-500/30 bg-pit-card p-6 text-center">
          <h1 className="text-lg font-semibold text-white">We couldn't load your account</h1>
          <p className="mt-2 text-sm text-slate-400">
            {error.message || 'Your subscription details are temporarily unavailable. Please try again.'}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pit-bg flex items-center justify-center text-slate-400 text-sm">
      Loading your account…
    </div>
  );
}
