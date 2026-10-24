import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { enrichTrade, computePortfolioMetrics } from '@/features/trades/utils/tradeCalculations';
import { tradesApi } from '@/features/trades/api/tradesApi';
import {
  apiTradeToUi,
  uiTradeToApi,
  resolveStrategyId,
} from '@/lib/mappers/tradeMapper';
import { useAuth } from './AuthContext';
import { useWorkspace } from './WorkspaceContext';

const TradeContext = createContext(null);

export function TradeProvider({ children }) {
  const { user } = useAuth();
  const { selectedMarket, strategiesByName, workspaceLoading, workspaceError } = useWorkspace();
  const market = selectedMarket;

  const [rawTrades, setRawTrades] = useState([]);
  const [tradesLoading, setTradesLoading] = useState(false);
  const [tradesError, setTradesError] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [prefillDate, setPrefillDate] = useState(null);
  const [selectedTrade, setSelectedTrade] = useState(null);

  const fetchTrades = useCallback(async () => {
    if (!market?.id) {
      setRawTrades([]);
      return;
    }
    setTradesLoading(true);
    setTradesError(null);
    try {
      const res = await tradesApi.getByMarket(market.id);
      const list = (res.data || []).map(apiTradeToUi);
      setRawTrades(list);
    } catch (e) {
      console.error('Failed to load trades:', e);
      setTradesError(e.response?.data?.message || e.message || 'Failed to load trades');
      setRawTrades([]);
    } finally {
      setTradesLoading(false);
    }
  }, [market?.id]);

  useEffect(() => {
    if (!workspaceLoading) {
      fetchTrades();
    }
  }, [market?.id, workspaceLoading, fetchTrades]);

  const trades = useMemo(() => {
    return rawTrades
      .map(enrichTrade)
      .sort((a, b) => `${b.date} ${b.entryTime}`.localeCompare(`${a.date} ${a.entryTime}`));
  }, [rawTrades]);

  const metrics = useMemo(() => computePortfolioMetrics(trades), [trades]);

  const addTrade = async (newTradeData) => {
    if (!user?.id || !market) {
      throw new Error('Account not ready');
    }
    const strategyId = resolveStrategyId(strategiesByName, newTradeData.setup);
    if (!strategyId) {
      throw new Error('No strategy available for this setup');
    }
    const payload = uiTradeToApi(newTradeData, {
      userId: Number(user.id),
      marketId: market.id,
      marketName: market.name,
      strategyId,
    });
    const res = await tradesApi.create(payload);
    const ui = apiTradeToUi(res.data);
    setRawTrades((prev) => [ui, ...prev]);
  };

  const deleteTrade = async (tradeId) => {
    await tradesApi.delete(tradeId);
    setRawTrades((prev) => prev.filter((t) => t.id !== tradeId));
    if (selectedTrade?.id === tradeId) setSelectedTrade(null);
  };

  const openAddTradeModal = (dateStr = null) => {
    setPrefillDate(dateStr);
    setIsAddModalOpen(true);
  };

  const loading = workspaceLoading || tradesLoading;
  const error = workspaceError || tradesError;

  return (
    <TradeContext.Provider
      value={{
        trades,
        metrics,
        addTrade,
        deleteTrade,
        isAddModalOpen,
        setIsAddModalOpen,
        prefillDate,
        openAddTradeModal,
        selectedTrade,
        setSelectedTrade,
        loading,
        error,
        refreshTrades: fetchTrades,
        market,
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
