import React from 'react';

const IMPACT_STYLES = {
  HIGH: {
    bar: 'bg-rose-500',
    label: 'text-rose-400',
    text: 'High',
  },
  MEDIUM: {
    bar: 'bg-amber-500',
    label: 'text-amber-400',
    text: 'Med',
  },
  LOW: {
    bar: 'bg-yellow-500/80',
    label: 'text-yellow-400/90',
    text: 'Low',
  },
  NON_ECONOMIC: {
    bar: 'bg-slate-500',
    label: 'text-slate-400',
    text: 'N/E',
  },
};

export function ImpactBadge({ impact }) {
  const style = IMPACT_STYLES[impact] || IMPACT_STYLES.NON_ECONOMIC;

  return (
    <div className="flex items-center gap-2" title={impact}>
      <span className={`w-1 h-5 rounded-full shrink-0 ${style.bar}`} aria-hidden />
      <span className={`text-[10px] font-semibold uppercase tracking-wide ${style.label}`}>
        {style.text}
      </span>
    </div>
  );
}
