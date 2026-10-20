import React from 'react';
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function DailyPnlChart({ data }) {
  return (
    <div className="bg-pit-card border border-pit-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Daily Net P&L Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2638" />
            <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
            <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `$${v}`} />
            <Tooltip contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#1E2638' }} formatter={(v) => [`$${v}`, 'Daily Net P&L']} />
            <Bar dataKey="netPnl" radius={[4, 4, 0, 0]}>
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.netPnl >= 0 ? '#10B981' : '#F43F5E'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}