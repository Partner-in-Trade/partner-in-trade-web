import React from 'react';
import { Check } from 'lucide-react';

const TRIAL_FEATURES = [
  'Full Pro access for all 15 days',
  'No credit card or payment details',
  'Nothing is charged unless you choose a plan',
];

const TIMELINE = [
  { day: 'DAY 0', title: 'Sign up with your email', detail: 'No card, no payment details.' },
  {
    day: 'DAYS 1–15',
    title: 'Use everything',
    detail: 'Journal, analytics, strategies and the news calendar.',
  },
  {
    day: 'DAY 15',
    title: 'Pick a plan, or walk away',
    detail: 'Your trades and journal stay saved either way.',
  },
];

export function TrialHeroSection({ onStartTrial, trialLoading }) {
  return (
  <section className="max-w-6xl mx-auto px-4 pt-10 pb-16 text-center">
    <p className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-xs font-medium tracking-wide text-emerald-400">
      15-DAY FREE TRIAL · NO CARD NEEDED
    </p>
    <h1 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
      Simple pricing for serious traders
    </h1>
    <p className="mt-4 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
      Try everything free for 15 days. No credit card, no commitment. Pick a plan only when
      you&apos;re sure it&apos;s helping you trade better.
    </p>

    <div className="mt-12 rounded-2xl border border-pit-accent/40 bg-pit-card/80 p-6 sm:p-10 text-left shadow-[0_0_60px_-12px_rgba(99,102,241,0.35)] max-w-5xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-10">
        <div>
          <span className="inline-block rounded-full bg-pit-accent/20 text-pit-accent text-xs font-semibold px-3 py-1">
            FREE TRIAL
          </span>
          <p className="mt-6 text-4xl font-bold text-white">
            ₹0 <span className="text-lg font-normal text-slate-400">for 15 days</span>
          </p>
          <p className="mt-3 text-slate-400 text-sm">
            Full access to every feature, so you can see how your trading really looks in numbers.
          </p>
          <ul className="mt-8 space-y-3">
            {TRIAL_FEATURES.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-pit-profit mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              type="button"
              disabled={trialLoading}
              onClick={onStartTrial}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
            >
              {trialLoading ? 'Starting…' : 'Start your free trial →'}
            </button>
            <span className="text-xs text-slate-500">Just your email. No card required.</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium tracking-widest text-slate-500 uppercase mb-6">
            How the trial works
          </p>
          <ol className="relative border-l border-pit-border ml-3 space-y-10">
            {TIMELINE.map((step, i) => (
              <li key={step.day} className="pl-8 relative">
                <span className="absolute -left-[13px] top-0 flex h-6 w-6 items-center justify-center rounded-full border border-pit-accent/60 bg-pit-bg text-xs text-pit-accent">
                  {i + 1}
                </span>
                <p className="text-xs text-pit-accent font-medium">{step.day}</p>
                <p className="text-white font-semibold mt-1">{step.title}</p>
                <p className="text-sm text-slate-400 mt-1">{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  </section>
  );
}
