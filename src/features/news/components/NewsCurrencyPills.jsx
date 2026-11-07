import React from 'react';

export function NewsCurrencyPills({ currencies }) {
  if (!currencies?.length) {
    return <p className="text-xs text-slate-500">No currencies scheduled.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {currencies.map(({ currency, count }) => (
        <span
          key={currency}
          className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/60 text-xs font-bold text-slate-200"
        >
          {currency}
          <span className="text-slate-500 font-mono text-[11px] font-normal">{count}</span>
        </span>
      ))}
    </div>
  );
}
