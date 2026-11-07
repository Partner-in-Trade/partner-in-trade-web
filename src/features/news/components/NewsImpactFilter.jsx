import React from 'react';

const SELECTED_CHIP =
  'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-950/40';

const FILTERS = [
  {
    id: 'ALL',
    label: 'All',
    idleClass: 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50',
  },
  {
    id: 'HIGH',
    label: 'High',
    idleClass: 'text-rose-400 border-transparent hover:text-rose-300 hover:bg-slate-800/50',
  },
  {
    id: 'MEDIUM',
    label: 'Medium',
    idleClass: 'text-amber-400 border-transparent hover:text-amber-300 hover:bg-slate-800/50',
  },
  {
    id: 'LOW',
    label: 'Low',
    idleClass:
      'text-emerald-400/95 border-transparent hover:text-emerald-300 hover:bg-slate-800/50',
  },
];

export function NewsImpactFilter({ value, onChange }) {
  return (
    <div
      className="rounded-xl border border-slate-700/80 bg-[#141922]/90 p-2 shadow-sm"
      role="group"
      aria-label="Filter by impact"
    >
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const selected = value === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onChange(f.id)}
              className={`min-w-[4.25rem] flex-1 px-4 py-2 rounded-lg text-xs font-semibold border transition ${
                selected ? SELECTED_CHIP : `bg-[#0f1318]/60 ${f.idleClass}`
              }`}
              aria-pressed={selected}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
