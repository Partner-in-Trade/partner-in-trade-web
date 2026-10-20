import React from 'react';

export function KpiCard({ title, value, subtitle, icon: Icon, trend = 'neutral' }) {
  const valueColor =
    trend === 'positive'
      ? 'text-pit-profit'
      : trend === 'negative'
      ? 'text-pit-loss'
      : 'text-slate-100';

  return (
    <div className="bg-pit-card border border-pit-border rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-lg bg-slate-800/70 text-indigo-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div>
        <div className={`text-2xl font-bold font-mono ${valueColor}`}>{value}</div>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}