const STORAGE_KEY = 'pit_strategy_ui_prefs_v1';

function readPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { pinnedIds: [], statusById: {} };
    const parsed = JSON.parse(raw);
    return {
      pinnedIds: Array.isArray(parsed.pinnedIds) ? parsed.pinnedIds : [],
      statusById:
        parsed.statusById && typeof parsed.statusById === 'object' ? parsed.statusById : {},
    };
  } catch {
    return { pinnedIds: [], statusById: {} };
  }
}

function writePrefs(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore quota / private mode */
  }
}

export function loadStrategyUiPrefs() {
  return readPrefs();
}

export function isStrategyPinned(strategyId, prefs = readPrefs()) {
  return prefs.pinnedIds.includes(Number(strategyId));
}

export function toggleStrategyPin(strategyId) {
  const prefs = readPrefs();
  const id = Number(strategyId);
  const set = new Set(prefs.pinnedIds.map(Number));
  if (set.has(id)) set.delete(id);
  else set.add(id);
  const next = { ...prefs, pinnedIds: [...set] };
  writePrefs(next);
  return next;
}

export function strategyStatusOverride(strategyId, prefs = readPrefs()) {
  return prefs?.statusById?.[String(strategyId)] || null;
}
