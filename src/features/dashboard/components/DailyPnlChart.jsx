import React from 'react';
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const currencySymbol = (currency) => ({ INR: '₹', EUR: '€', GBP: '£' }[currency] || '$');

export function DailyPnlChart({ data, currency = 'USD' }) {
  const symbol = currencySymbol(currency);
  return (
    <div className="bg-pit-card border border-pit-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Daily Net P&amp;L Distribution</h3>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-slate-400">Daily P&amp;L will appear after your first closed trade.</div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2638" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} tickFormatter={(value) => `${symbol}${value}`} />
              <Tooltip contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#1E2638' }}
                formatter={(value) => [`${symbol}${value}`, 'Daily Net P&L']} />
              <Bar dataKey="netPnl" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.netPnl >= 0 ? '#10B981' : '#F43F5E'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
