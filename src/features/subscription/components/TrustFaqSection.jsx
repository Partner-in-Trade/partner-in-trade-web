import React, { useState } from 'react';
import { CreditCard, Clock, Shield, Download, ChevronDown } from 'lucide-react';
import { FAQ_ITEMS, TRUST_ITEMS } from '@/features/subscription/constants/pricingCopy';

const TRUST_ICONS = [CreditCard, Clock, Shield, Download];

export function TrustFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {TRUST_ITEMS.map((item, i) => {
          const Icon = TRUST_ICONS[i];
          return (
            <div
              key={item.title}
              className="rounded-xl border border-pit-border bg-pit-card/60 p-4 flex gap-3"
            >
              <div className="rounded-lg bg-pit-accent/15 p-2 h-fit">
                <Icon className="w-5 h-5 text-pit-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-xs text-slate-400 mt-1">{item.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="text-2xl font-bold text-white text-center mb-8">Questions, answered</h2>
      <div className="max-w-3xl mx-auto space-y-2">
        {FAQ_ITEMS.map((item, index) => {
          const open = openIndex === index;
          return (
            <div key={item.q} className="rounded-xl border border-pit-border bg-pit-card overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between p-4 text-left text-sm text-white font-medium"
                onClick={() => setOpenIndex(open ? -1 : index)}
                aria-expanded={open}
              >
                {item.q}
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
                />
              </button>
              {open && <p className="px-4 pb-4 text-sm text-slate-400">{item.a}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
