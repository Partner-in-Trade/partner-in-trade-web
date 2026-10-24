import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSelectedMarketId,
  createAndActivateMarket,
  addFundsToMarket,
  selectMarkets,
  selectSelectedMarketId,
  selectWorkspaceLoading,
} from '@/app/store';
import { MARKET_NAME_PRESETS } from '@/constants/markets';
import { CURRENCIES } from '@/data/mockTrades';
import { Toast } from '@/components/ui/Toast';

function currencySymbol(currency) {
  return currency === 'INR' ? '₹' : '$';
}

function formatFunds(amount, currency) {
  const n = Number(amount) || 0;
  return `${currencySymbol(currency)}${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function inputClass(extra = '') {
  return `w-full rounded-lg border border-pit-border bg-pit-bg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${extra}`;
}

export function MarketsView() {
  const dispatch = useDispatch();
  const markets = useSelector(selectMarkets);
  const selectedMarketId = useSelector(selectSelectedMarketId);
  const workspaceLoading = useSelector(selectWorkspaceLoading);

  const [preset, setPreset] = useState(MARKET_NAME_PRESETS[0]);
  const [name, setName] = useState(MARKET_NAME_PRESETS[0]);
  const [funds, setFunds] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const [addFundsFor, setAddFundsFor] = useState(null);
  const [addFundsAmount, setAddFundsAmount] = useState('');

  const onPresetChange = (value) => {
    setPreset(value);
    setName(value);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 25) {
      setToast('Market name is required (max 25 characters).');
      return;
    }
    const amount = Number(funds);
    if (!amount || amount <= 0) {
      setToast('Initial capital must be a positive number.');
      return;
    }
    setSubmitting(true);
    try {
      await dispatch(
        createAndActivateMarket({ name: trimmed, funds: amount, currency })
      ).unwrap();
      setFunds('');
      setToast('Market created and funded.');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        err.message ||
        'Failed to create market';
      setToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddFunds = async (marketId) => {
    const amount = Number(addFundsAmount);
    if (!amount || amount <= 0) {
      setToast('Enter a positive amount.');
      return;
    }
    try {
      await dispatch(addFundsToMarket({ marketId, funds: amount })).unwrap();
      setAddFundsFor(null);
      setAddFundsAmount('');
      setToast('Funds added.');
    } catch (err) {
      setToast(err.response?.data?.message || err.message || 'Failed to add funds');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-pit-card border border-pit-border rounded-xl p-6">
        <h2 className="text-base font-bold text-white mb-1">Add market</h2>
        <p className="text-xs text-slate-400 mb-4">
          Create a trading account (Stocks, Forex, Crypto, etc.) and set initial capital. Each market
          keeps its own trade journal.
        </p>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Market type</label>
            <select
              value={preset}
              onChange={(e) => onPresetChange(e.target.value)}
              className={inputClass()}
            >
              {MARKET_NAME_PRESETS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Name</label>
            <input
              required
              maxLength={25}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass()}
              placeholder="e.g. Forex"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Initial capital</label>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-300"
                aria-hidden
              >
                {currencySymbol(currency)}
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={funds}
                onChange={(e) => setFunds(e.target.value)}
                className={`${inputClass()} font-mono pl-8`}
                placeholder="10000"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Currency</label>
            <div className="grid grid-cols-2 gap-1 rounded-lg border border-pit-border bg-pit-card p-1">
              {CURRENCIES.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCurrency(code)}
                  className={`rounded-md py-2 text-sm font-semibold transition ${
                    currency === code
                      ? 'bg-pit-bg text-white ring-1 ring-indigo-500/40'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting || workspaceLoading}
              className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold"
            >
              {submitting ? 'Creating…' : 'Create market'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-pit-card border border-pit-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-pit-border">
          <h3 className="text-sm font-semibold text-white">Your markets</h3>
          <p className="text-xs text-slate-400">Select which market the dashboard and trades use.</p>
        </div>
        {markets.length === 0 ? (
          <p className="p-6 text-sm text-slate-400">No markets yet. Create one above.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-pit-bg text-xs uppercase text-slate-400">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Currency</th>
                <th className="py-3 px-4 text-right">Funds</th>
                <th className="py-3 px-4 text-center">Active</th>
                <th className="py-3 px-4 text-right">Trades</th>
                <th className="py-3 px-4 text-right">Win rate</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pit-border">
              {markets.map((m) => {
                const isSelected = m.id === selectedMarketId;
                return (
                  <tr
                    key={m.id}
                    className={isSelected ? 'bg-indigo-500/10' : 'hover:bg-slate-800/30'}
                  >
                    <td className="py-3 px-4 font-semibold text-white">{m.name}</td>
                    <td className="py-3 px-4 font-mono text-xs">{m.currency || '—'}</td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatFunds(m.funds, m.currency || 'USD')}
                    </td>
                    <td className="py-3 px-4 text-center text-xs">
                      {m.marketActivated ? 'Yes' : 'No'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">{m.numberOfTrades ?? 0}</td>
                    <td className="py-3 px-4 text-right font-mono">
                      {m.winRate != null ? `${m.winRate}%` : '—'}
                    </td>
                    <td className="py-3 px-4 text-center space-x-2">
                      <button
                        type="button"
                        onClick={() => dispatch(setSelectedMarketId(m.id))}
                        className={`text-xs px-2 py-1 rounded ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'border border-pit-border text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAddFundsFor(m.id);
                          setAddFundsAmount('');
                        }}
                        className="text-xs px-2 py-1 rounded border border-pit-border text-slate-300 hover:bg-slate-800"
                      >
                        Add funds
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {addFundsFor != null && (() => {
        const fundMarket = markets.find((m) => m.id === addFundsFor);
        const fundCurrency = fundMarket?.currency || 'USD';
        return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-pit-card border border-pit-border rounded-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-white font-semibold">Add funds</h3>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-300"
                aria-hidden
              >
                {currencySymbol(fundCurrency)}
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                value={addFundsAmount}
                onChange={(e) => setAddFundsAmount(e.target.value)}
                className={inputClass() + ' font-mono pl-8'}
                placeholder="Amount"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAddFundsFor(null)}
                className="flex-1 py-2 rounded-lg border border-pit-border text-slate-300 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAddFunds(addFundsFor)}
                className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      <Toast message={toast} onDismiss={() => setToast('')} />
    </div>
  );
}
