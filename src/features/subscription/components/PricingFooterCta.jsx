import React from 'react';

export function PricingFooterCta({ onStartTrial, trialLoading }) {
  return (
    <section className="max-w-5xl mx-auto px-4 pb-20">
      <div className="rounded-2xl border border-pit-border bg-pit-card p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-white">Ready to see your trading clearly?</h2>
          <p className="text-slate-400 text-sm mt-2">
            Start your 15-day free trial today. No card, no catch.
          </p>
        </div>
        <button
          type="button"
          disabled={trialLoading}
          onClick={onStartTrial}
          className="shrink-0 rounded-xl bg-pit-accent px-8 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {trialLoading ? 'Starting…' : 'Start free trial'}
        </button>
      </div>
    </section>
  );
}
