import React from 'react';

export function OutcomeBadge({ outcome }) {
  if (outcome === 'WIN') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-pit-profit border border-emerald-500/30">
        WIN
      </span>
    );
  }
  if (outcome === 'LOSS') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-pit-loss border border-rose-500/30">
        LOSS
      </span>
    );
  }
  if (outcome === 'OPEN') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
        OPEN
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-300 border border-slate-500/30">
      BE
    </span>
  );
}