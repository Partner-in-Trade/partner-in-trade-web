import React, { useState, useEffect, useMemo } from 'react';
import { X, ImagePlus, Calendar, Clock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addTrade,
  setIsAddModalOpen,
  selectIsAddModalOpen,
  selectPrefillDate,
  selectPrefillSetup,
  selectMarkets,
  selectSelectedMarketId,
  selectStrategyNames,
} from '@/app/store';
import { assetClassFromMarketType } from '@/constants/markets';
import { DEFAULT_TIMEFRAME, TIMEFRAMES } from '@/constants/timeframes';
import { symbolCatalogTypeForMarketType } from '@/data/symbolCatalog';
import { MISTAKE_TAGS } from '@/data/mockTrades';
import { Toast } from '@/components/ui/Toast';
import { SymbolAutocomplete } from './SymbolAutocomplete';

function todayIsoDate() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function defaultForm(dateOverride, marketId, setup = '') {
  const day = dateOverride || todayIsoDate();
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return {
    marketId: marketId ?? '',
    symbol: '',
    currency: 'USD',
    direction: 'LONG',
    entryDate: day,
    exitDate: '',
    entryTime: day === todayIsoDate() ? currentTime : '09:35',
    exitTime: day === todayIsoDate() ? currentTime : '10:05',
    entryPrice: '',
    exitPrice: '',
    quantity: '1',
    contractMultiplier: '1',
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
  if (value === '' || !Number.isFinite(Number(value))) return String(min);
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
      <input {...inputProps} className={`${inputClass()} pr-12 pit-datetime-input ${inputProps.type === 'date' ? (inputProps.value ? 'font-bold text-white' : 'font-normal text-slate-500') : ''} ${className}`} />
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

export function TradeEntryModal() {
  const dispatch = useDispatch();
  const isAddModalOpen = useSelector(selectIsAddModalOpen);
  const prefillDate = useSelector(selectPrefillDate);
  const prefillSetup = useSelector(selectPrefillSetup);
  const markets = useSelector(selectMarkets);
  const selectedMarketId = useSelector(selectSelectedMarketId);
  const strategyNames = useSelector(selectStrategyNames);
  const [form, setForm] = useState(() => defaultForm());
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (isAddModalOpen) {
      const initialMarketId = selectedMarketId ?? markets[0]?.id ?? '';
      const market = markets.find((m) => m.id === initialMarketId);
      const defaultSetup = prefillSetup || strategyNames[0] || '';
      setForm({
        ...defaultForm(prefillDate || todayIsoDate(), initialMarketId, defaultSetup),
        currency: market?.currency || '',
      });
    }
  }, [isAddModalOpen, prefillDate, prefillSetup, selectedMarketId, markets, strategyNames]);

  const selectedFormMarket = useMemo(() => {
    if (form.marketId === '' || form.marketId == null) return null;
    return markets.find((m) => Number(m.id) === Number(form.marketId)) ?? null;
  }, [markets, form.marketId]);
  const symbolCatalogType = symbolCatalogTypeForMarketType(selectedFormMarket?.type);

  if (!isAddModalOpen) return null;

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const submit = async (e) => {
    e.preventDefault();
    const entryAt = new Date(form.entryDate + 'T' + form.entryTime);
    const hasExit = form.exitPrice !== '' && form.exitPrice != null;
    const exitAt = form.exitDate && form.exitTime
      ? new Date(form.exitDate + 'T' + form.exitTime)
      : null;
    const entryPrice = Number(form.entryPrice);
    const stop = form.stopLoss === '' ? null : Number(form.stopLoss);
    const target = form.takeProfit === '' ? null : Number(form.takeProfit);
    if (!Number.isFinite(entryPrice) || entryPrice <= 0) {
      setToast('Entry price must be greater than zero.');
      return;
    }
    if (hasExit && (!Number.isFinite(Number(form.exitPrice)) || Number(form.exitPrice) <= 0)) {
      setToast('Exit price must be greater than zero.');
      return;
    }
    if (!Number.isFinite(entryAt.getTime()) || entryAt > new Date()) {
      setToast('Entry date and time cannot be in the future.');
      return;
    }
    if (hasExit && (!exitAt || !Number.isFinite(exitAt.getTime()) || exitAt < entryAt)) {
      setToast('Exit date and time must be valid and not earlier than entry.');
      return;
    }
    if (stop != null && (form.direction === 'LONG' ? stop >= entryPrice : stop <= entryPrice)) {
      setToast('Stop loss must be ' + (form.direction === 'LONG' ? 'below' : 'above') + ' entry price.');
      return;
    }
    if (target != null && (form.direction === 'LONG' ? target <= entryPrice : target >= entryPrice)) {
      setToast('Take profit must be ' + (form.direction === 'LONG' ? 'above' : 'below') + ' entry price.');
      return;
    }
    if (!(Number(form.quantity) > 0)) {
      setToast('Quantity must be greater than zero.');
      return;
    }
    try {
      await dispatch(addTrade(formToTradePayload(form, markets))).unwrap();
      dispatch(setIsAddModalOpen(false));
    } catch (err) {
      setToast(err || 'Failed to save trade');
    }
  };

  // Live estimates mirror the backend trade-result formula: directional price move
  // multiplied by size and contract multiplier, less round-trip fees.
  const entryValue = Number(form.entryPrice);
  const exitValue = form.exitPrice === '' ? null : Number(form.exitPrice);
  const sizeValue = Number(form.quantity);
  const multiplierValue = Number(form.contractMultiplier);
  const feeValue = Number(form.fees || 0);
  const stopValue = form.stopLoss === '' ? null : Number(form.stopLoss);
  const hasValidInputs =
    Number.isFinite(entryValue) && entryValue > 0 &&
    Number.isFinite(sizeValue) && sizeValue > 0 &&
    Number.isFinite(multiplierValue) && multiplierValue > 0 &&
    Number.isFinite(feeValue) && feeValue >= 0;
  const directionFactor = form.direction === 'LONG' ? 1 : -1;
  const estimatedPnl = hasValidInputs && exitValue != null && Number.isFinite(exitValue) && exitValue > 0
    ? (exitValue - entryValue) * directionFactor * sizeValue * multiplierValue - feeValue
    : null;
  const estimatedRisk = hasValidInputs && stopValue != null && Number.isFinite(stopValue) &&
    (form.direction === 'LONG' ? stopValue < entryValue : stopValue > entryValue)
    ? Math.abs(entryValue - stopValue) * sizeValue * multiplierValue
    : null;
  const estimatedR = estimatedPnl != null && estimatedRisk > 0
    ? estimatedPnl / estimatedRisk
    : null;
  const currency = selectedFormMarket?.currency || form.currency || '';
  const formatMoney = (value) => value == null
    ? '—'
    : new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 2 }).format(value);
  const netPnlDisplay = estimatedPnl == null ? 'Enter an exit price' : formatMoney(estimatedPnl);
  const riskDisplay = estimatedRisk == null ? 'Set a valid stop' : formatMoney(estimatedRisk);
  const rDisplay = estimatedR == null ? '—' : `${estimatedR.toFixed(2)}R`;

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
                          currency: market?.currency || '',
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
                        onChange={(e) => set({
                          entryDate: e.target.value,
                          ...(form.exitDate && e.target.value && form.exitDate < e.target.value ? { exitDate: '' } : {}),
                        })}
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
                        disabled={!form.entryDate}
                        min={form.entryDate || undefined}
                        onChange={(e) => {
                          const nextExitDate = e.target.value;
                          if (nextExitDate && form.entryDate && nextExitDate < form.entryDate) {
                            setToast('Exit date cannot be earlier than entry date.');
                            return;
                          }
                          set({ exitDate: nextExitDate });
                        }}
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
                <output
                  aria-label="Market currency"
                  className={`${inputClass()} block cursor-not-allowed bg-pit-card font-semibold text-white`}
                >
                  {selectedFormMarket?.currency || form.currency || '—'}
                </output>
                <p className="mt-1 text-[11px] text-slate-500">
                  Currency is fixed by the selected market.
                </p>
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
                      min="0.000001"
                      value={form.quantity}
                      onChange={(e) => set({ quantity: e.target.value })}
                      placeholder="100"
                      className={`${inputClass()} font-mono`}
                    />
                  </div>
                  <div>
                    <FieldLabel hint="Contract or point value per unit. Use 1 for stocks and spot assets.">Contract multiplier</FieldLabel>
                    <input
                      type="number"
                      step="any"
                      required
                      min="0.000001"
                      value={form.contractMultiplier}
                      onChange={(e) =>
                        handleMinNumberChange(e.target.value, 0.000001, (v) => set({ contractMultiplier: v }))
                      }
                      onBlur={(e) =>
                        set({ contractMultiplier: enforceMinOnBlur(e.target.value, 0.000001) })
                      }
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
                      {netPnlDisplay}
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-3 gap-2 rounded-xl border border-pit-border bg-pit-card p-4 text-center">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Net P&L</p>
                  <p
                    className="mt-1 text-xs font-medium text-slate-400"
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
    currency: market?.currency || form.currency,
    direction: form.direction,
    quantity: Number(form.quantity),
    contractMultiplier: Math.max(0.000001, Number(form.contractMultiplier) || 1),
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
