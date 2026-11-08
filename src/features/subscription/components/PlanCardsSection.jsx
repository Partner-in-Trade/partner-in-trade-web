import React from 'react';
import { Check } from 'lucide-react';

const BASIC_BULLETS = [
  'Unlimited manual trade logging',
  'P&L calendar and trade log',
  'Economic news calendar',
  'Up to 3 strategies',
  '1 trading account',
  'Email support',
];

const PRO_BULLETS = [
  'Unlimited strategies and playbook rules',
  'Rules-adherence scoring on every trade',
  'Advanced analytics: profit factor, expectancy, drawdown',
  'Up to 5 trading accounts',
  'Journal with chart screenshots',
  'CSV and PDF export',
  'Priority support',
];

function formatInr(priceInr) {
  return `₹${priceInr}`;
}

export function PlanCardsSection({ plans, onChooseBasic, onChoosePro, checkoutLoading }) {
  const basic = plans.find((p) => p.code === 'BASIC');
  const pro = plans.find((p) => p.code === 'PRO');

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-white text-center">Then pick the plan that fits</h2>
      <p className="text-slate-400 text-center mt-2">Billed monthly in INR. Switch or cancel anytime.</p>

      <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-pit-border bg-pit-card p-8 flex flex-col">
          <h3 className="text-xl font-bold text-white">Basic</h3>
          <p className="text-sm text-slate-400 mt-2">
            Everything you need to log trades and build the habit.
          </p>
          <p className="mt-6 text-3xl font-bold text-white">
            {basic ? formatInr(basic.priceInr) : '₹299'}{' '}
            <span className="text-base font-normal text-slate-500">/ month</span>
          </p>
          <button
            type="button"
            disabled={checkoutLoading}
            onClick={onChooseBasic}
            className="mt-6 w-full rounded-xl border border-slate-500 py-3 text-sm font-semibold text-white hover:bg-white/5 disabled:opacity-50"
          >
            Choose Basic
          </button>
          <p className="text-xs text-slate-500 text-center mt-3">UPI, cards and net banking accepted</p>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-8 mb-4">
            What&apos;s included
          </p>
          <ul className="space-y-2 text-sm text-slate-300">
            {BASIC_BULLETS.map((b) => (
              <li key={b} className="flex gap-2">
                <Check className="w-4 h-4 text-pit-profit shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border-2 border-pit-accent bg-pit-card p-8 flex flex-col relative shadow-[0_0_40px_-8px_rgba(99,102,241,0.45)]">
          <span className="absolute top-4 right-4 rounded-full bg-pit-accent px-3 py-1 text-[10px] font-bold uppercase text-white">
            Most popular
          </span>
          <h3 className="text-xl font-bold text-white">Pro</h3>
          <p className="text-sm text-slate-400 mt-2">
            Deeper analytics and a playbook that keeps you disciplined.
          </p>
          <p className="mt-6 text-3xl font-bold text-white">
            {pro ? formatInr(pro.priceInr) : '₹499'}{' '}
            <span className="text-base font-normal text-slate-500">/ month</span>
          </p>
          <button
            type="button"
            disabled={checkoutLoading}
            onClick={onChoosePro}
            className="mt-6 w-full rounded-xl bg-pit-accent py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            Choose Pro
          </button>
          <p className="text-xs text-slate-500 text-center mt-3">UPI, cards and net banking accepted</p>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-8 mb-4">
            Everything in Basic, plus
          </p>
          <ul className="space-y-2 text-sm text-slate-300">
            {PRO_BULLETS.map((b) => (
              <li key={b} className="flex gap-2">
                <Check className="w-4 h-4 text-pit-profit shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
