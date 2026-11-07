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

const COMPACT_TEXT = {
  HIGH: 'HIGH',
  MEDIUM: 'MED',
  LOW: 'LOW',
  NON_ECONOMIC: 'N/E',
};

export function ImpactBar({ impact }) {
  const style = IMPACT_STYLES[impact] || IMPACT_STYLES.NON_ECONOMIC;
  return <span className={`w-1 self-stretch min-h-[2rem] rounded-full shrink-0 ${style.bar}`} aria-hidden />;
}

export function ImpactBadge({ impact, compact = false }) {
  const style = IMPACT_STYLES[impact] || IMPACT_STYLES.NON_ECONOMIC;

  if (compact) {
    return (
      <span className={`text-[10px] font-bold uppercase tracking-wide ${style.label}`} title={impact}>
        {COMPACT_TEXT[impact] || COMPACT_TEXT.NON_ECONOMIC}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2" title={impact}>
      <span className={`w-1 h-5 rounded-full shrink-0 ${style.bar}`} aria-hidden />
      <span className={`text-[10px] font-semibold uppercase tracking-wide ${style.label}`}>
        {style.text}
      </span>
    </div>
  );
}
