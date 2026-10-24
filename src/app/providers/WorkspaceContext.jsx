import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { useAuth } from './AuthContext';
import { marketsApi } from '@/features/markets/api/marketsApi';
import { ensureStrategies } from '@/lib/bootstrap/ensureUserWorkspace';

const WorkspaceContext = createContext(null);
const SELECTED_MARKET_KEY = 'pit_selected_market_id';

export function WorkspaceProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [markets, setMarkets] = useState([]);
  const [selectedMarketId, setSelectedMarketIdState] = useState(() => {
    const saved = localStorage.getItem(SELECTED_MARKET_KEY);
    return saved ? Number(saved) : null;
  });
  const [strategiesByName, setStrategiesByName] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedMarket = useMemo(
    () => markets.find((m) => m.id === selectedMarketId) ?? null,
    [markets, selectedMarketId]
  );

  const setSelectedMarketId = useCallback((id) => {
    setSelectedMarketIdState(id);
    if (id != null) {
      localStorage.setItem(SELECTED_MARKET_KEY, String(id));
    } else {
      localStorage.removeItem(SELECTED_MARKET_KEY);
    }
  }, []);

  const loadMarkets = useCallback(async (userId) => {
    const res = await marketsApi.getMarkets(userId);
    return res.data || [];
  }, []);

  const bootstrap = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const userId = Number(user.id);
      const [marketList, strategyMap] = await Promise.all([
        loadMarkets(userId),
        ensureStrategies(userId),
      ]);
      setMarkets(marketList);
      setStrategiesByName(strategyMap);

      if (marketList.length === 0) {
        setSelectedMarketId(null);
      } else {
        const savedRaw = localStorage.getItem(SELECTED_MARKET_KEY);
        const savedId = savedRaw ? Number(savedRaw) : null;
        const stillValid = savedId != null && marketList.some((m) => m.id === savedId);
        if (!stillValid) {
          setSelectedMarketId(marketList[0].id);
        }
      }
    } catch (e) {
      console.error('Workspace bootstrap failed:', e);
      setError(e.response?.data?.message || e.message || 'Failed to load account data');
      setMarkets([]);
      setStrategiesByName({});
      setSelectedMarketId(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadMarkets, setSelectedMarketId]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      bootstrap();
    } else {
      setMarkets([]);
      setStrategiesByName({});
      setSelectedMarketId(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap on auth/user only
  }, [isAuthenticated, user?.id]);

  const createAndActivateMarket = useCallback(
    async ({ name, funds, currency }) => {
      if (!user?.id) throw new Error('Not signed in');
      const userId = Number(user.id);
      const created = await marketsApi.createMarket(name.trim(), userId);
      const marketId = created.data.id;
      const activated = await marketsApi.activateMarket(marketId, {
        funds: Number(funds),
        currency,
      });
      const list = await loadMarkets(userId);
      setMarkets(list);
      setSelectedMarketId(activated.data.id);
      return activated.data;
    },
    [user?.id, loadMarkets, setSelectedMarketId]
  );

  const addFundsToMarket = useCallback(
    async (marketId, funds) => {
      if (!user?.id) throw new Error('Not signed in');
      await marketsApi.addFunds(marketId, { funds: Number(funds) });
      const list = await loadMarkets(Number(user.id));
      setMarkets(list);
    },
    [user?.id, loadMarkets]
  );

  return (
    <WorkspaceContext.Provider
      value={{
        markets,
        selectedMarket,
        selectedMarketId,
        setSelectedMarketId,
        market: selectedMarket,
        strategiesByName,
        workspaceLoading: loading,
        workspaceError: error,
        refreshWorkspace: bootstrap,
        createAndActivateMarket,
        addFundsToMarket,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
