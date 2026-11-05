import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const currencySymbol = (currency) => ({ INR: '₹', EUR: '€', GBP: '£' }[currency] || '$');
const money = (value, symbol) => symbol + Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function EquityCurveChart({ data, currency = 'USD' }) {
  const symbol = currencySymbol(currency);
  return (
    <div className="bg-pit-card border border-pit-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Cumulative Net P&amp;L Curve</h3>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-slate-400">Close a trade to start building your equity curve.</div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2638" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} tickFormatter={(value) => money(value, symbol)} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const point = payload[0].payload;
                return (
                  <div className="rounded-lg border border-pit-border bg-pit-bg p-3 text-xs shadow-xl">
                    <p className="mb-1 text-slate-400">{point.date} · {point.symbol}</p>
                    <p className="text-white">Cumulative: {money(point.cumulativePnl, symbol)}</p>
                    <p className="text-slate-300">Trade P&amp;L: {money(point.tradePnl, symbol)}</p>
                  </div>
                );
              }} />
              <Area type="monotone" dataKey="cumulativePnl" stroke="#10B981" strokeWidth={2.5}
                fill="#10B981" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
