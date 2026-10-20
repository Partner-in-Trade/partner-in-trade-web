import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { INITIAL_TRADES } from '@/data/mockTrades';
import { enrichTrade, computePortfolioMetrics } from '@/features/trades/utils/tradeCalculations';

const TradeContext = createContext(null);
const STORAGE_KEY = 'partner_in_trade_trades_v1';

export function TradeProvider({ children }) {
  const [rawTrades, setRawTrades] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_TRADES;
    } catch {
      return INITIAL_TRADES;
    }
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [prefillDate, setPrefillDate] = useState(null);
  const [selectedTrade, setSelectedTrade] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rawTrades));
    } catch (e) {
      console.error('Failed to persist trades locally:', e);
    }
  }, [rawTrades]);

  const trades = useMemo(() => {
    return rawTrades
      .map(enrichTrade)
      .sort((a, b) => `${b.date} ${b.entryTime}`.localeCompare(`${a.date} ${a.entryTime}`));
  }, [rawTrades]);

  const metrics = useMemo(() => computePortfolioMetrics(trades), [trades]);

  const addTrade = (newTradeData) => {
    const tradeObj = {
      ...newTradeData,
      id: `trd-${Date.now()}`,
    };
    setRawTrades((prev) => [tradeObj, ...prev]);
  };

  const deleteTrade = (tradeId) => {
    setRawTrades((prev) => prev.filter((t) => t.id !== tradeId));
    if (selectedTrade?.id === tradeId) setSelectedTrade(null);
  };

  const resetDemoData = () => {
    setRawTrades(INITIAL_TRADES);
  };

  const openAddTradeModal = (dateStr = null) => {
    setPrefillDate(dateStr);
    setIsAddModalOpen(true);
  };

  return (
    <TradeContext.Provider
      value={{
        trades,
        metrics,
        addTrade,
        deleteTrade,
        resetDemoData,
        isAddModalOpen,
        setIsAddModalOpen,
        prefillDate,
        openAddTradeModal,
        selectedTrade,
        setSelectedTrade,
      }}
    >
      {children}
    </TradeContext.Provider>
  );
}

export function useTrades() {
  const ctx = useContext(TradeContext);
  if (!ctx) throw new Error('useTrades must be used within a TradeProvider');
  return ctx;
}