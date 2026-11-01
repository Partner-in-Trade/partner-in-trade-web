import React, { useState, useEffect, useMemo } from 'react';
import { X, ImagePlus, Calendar, Clock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addTrade,
  setIsAddModalOpen,
  selectIsAddModalOpen,
  selectPrefillDate,
  selectMarkets,
  selectSelectedMarketId,
  selectStrategyNames,
} from '@/app/store';
import { assetClassFromMarketType } from '@/constants/markets';
import { DEFAULT_TIMEFRAME, TIMEFRAMES } from '@/constants/timeframes';
import { symbolCatalogTypeForMarketType } from '@/data/symbolCatalog';
import { CURRENCIES, MISTAKE_TAGS } from '@/data/mockTrades';
import { canCalculateNetPnl, enrichTrade } from '../utils/tradeCalculations';
import { Toast } from '@/components/ui/Toast';
import { SymbolAutocomplete } from './SymbolAutocomplete';

function todayIsoDate() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function defaultForm(dateOverride, marketId, setup = '') {
  const day = dateOverride || todayIsoDate();
  return {
    marketId: marketId ?? '',
    symbol: '',
    currency: 'USD',
    direction: 'LONG',
    entryDate: day,
    exitDate: day,
    entryTime: '09:35',
    exitTime: '10:05',
    entryPrice: '',
    exitPrice: '',
    quantity: '1',
    fees: '0',
    stopLoss: '',
    takeProfit: '',
    setup,
    timeframe: DEFAULT_TIMEFRAME,
    mistake: 'None',
    notes: '',
  };
}

function FieldLabel({ children, hint, reserveHintSpace = false }) {
  return (
    <div className={`mb-1.5 ${reserveHintSpace ? 'min-h-[2.75rem]' : ''}`}>
      <span className="text-xs font-medium text-slate-400">{children}</span>
      {hint ? (
        <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{hint}</p>
      ) : reserveHintSpace ? (
        <p className="mt-0.5 text-[11px] leading-snug text-transparent select-none" aria-hidden>
          &nbsp;
        </p>
      ) : null}
    </div>
  );
}

function handleMinNumberChange(value, min, setValue) {
  if (value === '') {
    setValue('');
    return;
  }
  const n = Number(value);
  if (Number.isNaN(n)) return;
  setValue(n < min ? String(min) : value);
}

function enforceMinOnBlur(value, min) {
  if (value === '' || Number.isNaN(Number(value))) return String(min);
  return String(Math.max(min, Number(value)));
}

function handleOptionalMinNumberChange(value, min, setValue) {
  if (value === '') {
    setValue('');
    return;
  }
  const n = Number(value);
  if (Number.isNaN(n)) return;
  setValue(n < min ? String(min) : value);
}

function enforceOptionalMinOnBlur(value, min) {
  if (value === '') return '';
  if (Number.isNaN(Number(value))) return '';
  return String(Math.max(min, Number(value)));
}

function IconInput({ icon: Icon, className = '', ...inputProps }) {
  return (
    <div className="relative [&_input]:relative">
      <input {...inputProps} className={`${inputClass()} pr-12 pit-datetime-input ${className}`} />
      <Icon
        className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-white"
        aria-hidden
      />
    </div>
  );
}

function inputClass(extra = '') {
  return `w-full rounded-lg border border-pit-border bg-pit-bg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${extra}`;
}

function formatMoney(amount, currency) {
  const formatted = Number(amount).toFixed(2);
  return currency === 'INR' ? `₹${formatted}` : `$${formatted}`;
}

export function TradeEntryModal() {
  const dispatch = useDispatch();
  const isAddModalOpen = useSelector(selectIsAddModalOpen);
  const prefillDate = useSelector(selectPrefillDate);
  const markets = useSelector(selectMarkets);
  const selectedMarketId = useSelector(selectSelectedMarketId);
  const strategyNames = useSelector(selectStrategyNames);
  const [form, setForm] = useState(() => defaultForm());
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (isAddModalOpen) {
      const initialMarketId = selectedMarketId ?? markets[0]?.id ?? '';
      const market = markets.find((m) => m.id === initialMarketId);
      const defaultSetup = strategyNames[0] || '';
      setForm({
        ...defaultForm(prefillDate || todayIsoDate(), initialMarketId, defaultSetup),
        ...(market?.currency ? { currency: market.currency } : {}),
      });
    }
  }, [isAddModalOpen, prefillDate, selectedMarketId, markets, strategyNames]);

  const selectedFormMarket = useMemo(() => {
    if (form.marketId === '' || form.marketId == null) return null;
    return markets.find((m) => Number(m.id) === Number(form.marketId)) ?? null;
  }, [markets, form.marketId]);
  const symbolCatalogType = symbolCatalogTypeForMarketType(selectedFormMarket?.type);

  const preview = useMemo(
    () => enrichTrade(formToTradePayload(form, markets)),
    [form, markets]
  );

  if (!isAddModalOpen) return null;

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(addTrade(formToTradePayload(form, markets))).unwrap();
      dispatch(setIsAddModalOpen(false));
    } catch (err) {
      setToast(err || 'Failed to save trade');
    }
  };

  const pnlReady = canCalculateNetPnl(formToTradePayload(form, markets));
  const netPnlDisplay = pnlReady
    ? formatMoney(preview.netPnl, form.currency)
    : form.entryPrice !== '' && form.exitPrice === ''
      ? 'Open'
      : '—';
  const readOnlyNetPnl = netPnlDisplay;
  const riskDisplay =
    preview.initialRiskDollars > 0
      ? formatMoney(preview.initialRiskDollars, form.currency)
      : '—';
  const rDisplay = !pnlReady || preview.rMultiple === 0 ? '—' : `${preview.rMultiple}R`;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        <button
          type="button"
          className="absolute inset-0 bg-black/60"
          aria-label="Close add trade panel"
          onClick={() => dispatch(setIsAddModalOpen(false))}
        />

        <aside
          className="relative flex h-full w-full max-w-xl flex-col border-l border-pit-border bg-pit-bg shadow-2xl animate-slide-in-right"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-trade-title"
        >
          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
            <header className="flex shrink-0 items-center justify-between border-b border-pit-border px-5 py-4">
              <h2 id="add-trade-title" className="text-lg font-semibold text-white">
                Add trade
              </h2>
              <button
                type="button"
                onClick={() => dispatch(setIsAddModalOpen(false))}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-pit-card hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 space-y-6">
              <section>
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Trade
                </h3>
                <div className="space-y-3">
                  <div>
                    <FieldLabel>Market</FieldLabel>
                    <select
                      required
                      value={form.marketId}
                      disabled={markets.length === 0}
                      onChange={(e) => {
                        const id = Number(e.target.value);
                        const market =
                          markets.find((m) => Number(m.id) === id) ?? null;
                        const nextType = symbolCatalogTypeForMarketType(market?.type);
                        const prevType = symbolCatalogTypeForMarketType(
                          selectedFormMarket?.type
                        );
                        set({
                          marketId: id,
                          ...(market?.currency ? { currency: market.currency } : {}),
                          ...(nextType !== prevType ? { symbol: '' } : {}),
                        });
                      }}
                      className={inputClass()}
                    >
                      {markets.length === 0 ? (
                        <option value="">No markets — create one in Markets</option>
                      ) : (
                        markets.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.type ? `${m.name} (${m.type})` : m.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Symbol</FieldLabel>
                    <SymbolAutocomplete
                      required
                      value={form.symbol}
                      onChange={(symbol) => set({ symbol })}
                      catalogType={symbolCatalogType}
                      placeholder="Symbol"
                    />
                  </div>
                  <div>
                    <FieldLabel>Side</FieldLabel>
                    <div className="grid grid-cols-2 gap-1 rounded-lg border border-pit-border bg-pit-card p-1">
                      {['LONG', 'SHORT'].map((side) => {
                        const active = form.direction === side;
                        const isLong = side === 'LONG';
                        return (
                          <button
                            key={side}
                            type="button"
                            onClick={() => set({ direction: side })}
                            className={`rounded-md py-2 text-sm font-semibold transition ${
                              active
                                ? isLong
                                  ? 'bg-emerald-500/20 text-pit-profit shadow-sm ring-1 ring-emerald-500/45'
                                  : 'bg-rose-500/20 text-pit-loss shadow-sm ring-1 ring-rose-500/45'
                                : isLong
                                  ? 'text-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400'
                                  : 'text-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400'
                            }`}
                          >
                            {isLong ? 'Long' : 'Short'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Timeframe</FieldLabel>
                    <select
                      required
                      value={form.timeframe}
                      onChange={(e) => set({ timeframe: e.target.value })}
                      className={inputClass()}
                    >
                      {TIMEFRAMES.map((tf) => (
                        <option key={tf} value={tf}>{tf}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div>
                      <FieldLabel>Entry date</FieldLabel>
                      <IconInput
                        icon={Calendar}
                        type="date"
                        required
                        value={form.entryDate}
                        onChange={(e) => set({ entryDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <FieldLabel>Time in</FieldLabel>
                      <IconInput
                        icon={Clock}
                        type="time"
                        required
                        value={form.entryTime}
                        onChange={(e) => set({ entryTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <FieldLabel hint="Optional until the trade is closed." reserveHintSpace>
                        Exit date
                      </FieldLabel>
                      <IconInput
                        icon={Calendar}
                        type="date"
                        value={form.exitDate}
                        onChange={(e) => set({ exitDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <FieldLabel>Time out</FieldLabel>
                      <IconInput
                        icon={Clock}
                        type="time"
                        value={form.exitTime}
                        onChange={(e) => set({ exitTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Currency
                </h3>
                <div className="grid grid-cols-2 gap-1 rounded-lg border border-pit-border bg-pit-card p-1">
                  {CURRENCIES.map((code) => {
                    const active = form.currency === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => set({ currency: code })}
                        className={`rounded-md py-2 text-sm font-semibold transition ${
                          active
                            ? 'bg-pit-bg text-white shadow-sm ring-1 ring-indigo-500/40'
                            : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
                        }`}
                      >
                        {code}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Prices and size
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div>
                      <FieldLabel reserveHintSpace>Entry price</FieldLabel>
                      <input
                        type="number"
                        step="any"
                        required
                        value={form.entryPrice}
                        onChange={(e) => set({ entryPrice: e.target.value })}
                        placeholder="0.00"
                        className={`${inputClass()} font-mono`}
                      />
                    </div>
                    <div>
                      <FieldLabel hint="Leave blank while the trade is open." reserveHintSpace>
                        Exit price
                      </FieldLabel>
                      <input
                        type="number"
                        step="any"
                        value={form.exitPrice}
                        onChange={(e) => set({ exitPrice: e.target.value })}
                        placeholder="0.00"
                        className={`${inputClass()} font-mono`}
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel hint="Shares, contracts, lots or coins.">Size</FieldLabel>
                    <input
                      type="number"
                      step="any"
                      required
                      min={1}
                      value={form.quantity}
                      onChange={(e) =>
                        handleMinNumberChange(e.target.value, 1, (v) => set({ quantity: v }))
                      }
                      onBlur={(e) => set({ quantity: enforceMinOnBlur(e.target.value, 1) })}
                      placeholder="100"
                      className={`${inputClass()} font-mono`}
                    />
                  </div>
                  <div>
                    <FieldLabel hint="Total for the round trip.">Fees and commissions</FieldLabel>
                    <input
                      type="number"
                      step="any"
                      min={0}
                      value={form.fees}
                      onChange={(e) =>
                        handleMinNumberChange(e.target.value, 0, (v) => set({ fees: v }))
                      }
                      onBlur={(e) => set({ fees: enforceMinOnBlur(e.target.value, 0) })}
                      className={`${inputClass()} font-mono`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div>
                      <FieldLabel hint="Used to work out R." reserveHintSpace>Stop price</FieldLabel>
                      <input
                        type="number"
                        step="any"
                        min={0}
                        value={form.stopLoss}
                        onChange={(e) =>
                          handleOptionalMinNumberChange(e.target.value, 0, (v) => set({ stopLoss: v }))
                        }
                        onBlur={(e) =>
                          set({ stopLoss: enforceOptionalMinOnBlur(e.target.value, 0) })
                        }
                        placeholder="optional"
                        className={`${inputClass()} font-mono`}
                      />
                    </div>
                    <div>
                      <FieldLabel reserveHintSpace>Target price</FieldLabel>
                      <input
                        type="number"
                        step="any"
                        min={0}
                        value={form.takeProfit}
                        onChange={(e) =>
                          handleOptionalMinNumberChange(e.target.value, 0, (v) => set({ takeProfit: v }))
                        }
                        onBlur={(e) =>
                          set({ takeProfit: enforceOptionalMinOnBlur(e.target.value, 0) })
                        }
                        placeholder="optional"
                        className={`${inputClass()} font-mono`}
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Net P&L ({form.currency})</FieldLabel>
                    <div
                      className={`${inputClass()} font-mono cursor-default border-pit-border/80 bg-pit-card text-slate-200`}
                      aria-readonly="true"
                    >
                      {readOnlyNetPnl}
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-3 gap-2 rounded-xl border border-pit-border bg-pit-card p-4 text-center">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Net P&L</p>
                  <p
                    className={`mt-1 text-sm font-bold font-mono ${
                      !pnlReady
                        ? form.entryPrice !== '' && form.exitPrice === ''
                          ? 'text-indigo-300'
                          : 'text-slate-400'
                        : preview.netPnl >= 0
                          ? 'text-pit-profit'
                          : 'text-pit-loss'
                    }`}
                  >
                    {netPnlDisplay}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Risk</p>
                  <p className="mt-1 text-sm font-bold font-mono text-slate-200">{riskDisplay}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Result in R</p>
                  <p className="mt-1 text-sm font-bold font-mono text-indigo-300">{rDisplay}</p>
                </div>
              </div>

              <section>
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Review
                </h3>
                <div className="space-y-3">
                  <div>
                    <FieldLabel>Screenshots</FieldLabel>
                    <button
                      type="button"
                      onClick={() => setToast('Coming soon')}
                      className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-pit-border bg-pit-card py-10 text-slate-500 transition hover:border-indigo-500/40 hover:text-slate-400"
                    >
                      <ImagePlus className="h-8 w-8 opacity-60" />
                      <span className="text-xs">Tap to add chart screenshots</span>
                    </button>
                  </div>
                  <div>
                    <FieldLabel>Strategy</FieldLabel>
                    {strategyNames.length === 0 ? (
                      <p className="text-xs text-amber-400/90">
                        Create a strategy under Strategies before logging trades.
                      </p>
                    ) : (
                      <select
                        value={form.setup}
                        onChange={(e) => set({ setup: e.target.value })}
                        className={inputClass()}
                      >
                        {strategyNames.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <FieldLabel>Mistake tag</FieldLabel>
                    <select
                      value={form.mistake}
                      onChange={(e) => set({ mistake: e.target.value })}
                      className={inputClass()}
                    >
                      {MISTAKE_TAGS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Notes</FieldLabel>
                    <textarea
                      value={form.notes}
                      onChange={(e) => set({ notes: e.target.value })}
                      rows={3}
                      className={`${inputClass()} resize-y min-h-[80px]`}
                      placeholder="What happened on this trade?"
                    />
                  </div>
                </div>
              </section>
            </div>

            <footer className="flex shrink-0 gap-3 border-t border-pit-border bg-pit-bg px-5 py-4">
              <button
                type="button"
                onClick={() => dispatch(setIsAddModalOpen(false))}
                className="flex-1 rounded-lg border border-pit-border py-2.5 text-sm font-medium text-slate-300 hover:bg-pit-card"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={markets.length === 0 || strategyNames.length === 0 || !form.setup}
                className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                Save trade
              </button>
            </footer>
          </form>
        </aside>
      </div>

      <Toast message={toast} onDismiss={() => setToast('')} />
    </>
  );
}

function formToTradePayload(form, markets) {
  const market = markets.find((m) => Number(m.id) === Number(form.marketId));
  return {
    date: form.entryDate,
    entryDate: form.entryDate,
    exitDate: form.exitDate,
    entryTime: form.entryTime,
    exitTime: form.exitTime,
    symbol: form.symbol.toUpperCase().trim(),
    marketId: form.marketId,
    assetClass: assetClassFromMarketType(market?.type),
    currency: form.currency,
    direction: form.direction,
    quantity: Math.max(1, Number(form.quantity) || 1),
    entryPrice: Number(form.entryPrice),
    exitPrice: form.exitPrice === '' ? '' : Number(form.exitPrice),
    stopLoss: form.stopLoss === '' ? '' : Math.max(0, Number(form.stopLoss)),
    takeProfit: form.takeProfit === '' ? '' : Math.max(0, Number(form.takeProfit)),
    fees: Math.max(0, Number(form.fees) || 0),
    setup: form.setup,
    timeframe: form.timeframe || DEFAULT_TIMEFRAME,
    mistake: form.mistake,
    notes: form.notes,
    emotion: 'Focused',
    rating: 3,
  };
}
