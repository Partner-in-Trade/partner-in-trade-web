import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function EquityCurveChart({ data }) {
  return (
    <div className="bg-pit-card border border-pit-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Cumulative Net P&L Curve</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2638" />
            <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
            <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `$${v}`} />
            <Tooltip contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#1E2638' }} formatter={(v) => [`$${v}`, 'Cumulative P&L']} />
            <Area type="monotone" dataKey="cumulativePnl" stroke="#10B981" strokeWidth={2.5} fill="#10B981" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}