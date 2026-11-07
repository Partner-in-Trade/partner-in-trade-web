import React from 'react';

const FILTERS = [
  {
    id: 'ALL',
    label: 'All',
    textClass: 'text-white',
    selectedClass: 'bg-indigo-600/35 text-white border-indigo-500/50',
    idleClass: 'text-slate-400 border-transparent hover:text-slate-200',
  },
  {
    id: 'HIGH',
    label: 'High',
    textClass: 'text-rose-400',
    selectedClass: 'text-rose-400 border-white/90 bg-transparent',
    idleClass: 'text-rose-400/90 border-transparent hover:text-rose-300',
  },
  {
    id: 'MEDIUM',
    label: 'Medium',
    textClass: 'text-amber-400',
    selectedClass: 'text-amber-400 border-white/90 bg-transparent',
    idleClass: 'text-amber-400/90 border-transparent hover:text-amber-300',
  },
  {
    id: 'LOW',
    label: 'Low',
    textClass: 'text-yellow-500/90',
    selectedClass: 'text-yellow-500/90 border-white/90 bg-transparent',
    idleClass: 'text-yellow-500/80 border-transparent hover:text-yellow-400/90',
  },
];

export function NewsImpactFilter({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by impact">
      {FILTERS.map((f) => {
        const selected = value === f.id;
        const stateClass = selected ? f.selectedClass : f.idleClass;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onChange(f.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition ${stateClass}`}
            aria-pressed={selected}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
