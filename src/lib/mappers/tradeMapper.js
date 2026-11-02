import { DEFAULT_TIMEFRAME } from '@/constants/timeframes';

const META_MARKER = '\n---meta---\n';
const DEFAULT_CONFIDENCE = 'MEDIUM';

/**
 * @typedef {Object} UiTradeInput
 * @property {string} [id]
 * @property {string} [date] entry date (calendar / legacy)
 * @property {string} [entryDate]
 * @property {string} [exitDate]
 * @property {string} entryTime
 * @property {string} [exitTime]
 * @property {string} symbol
 * @property {string} [assetClass]
 * @property {string} currency
 * @property {'LONG'|'SHORT'} direction
 * @property {number} quantity
 * @property {number} entryPrice
 * @property {number|string} [exitPrice]
 * @property {number|string} [stopLoss]
 * @property {number|string} [takeProfit]
 * @property {number} [fees]
 * @property {string} setup
 * @property {string} [timeframe]
 * @property {string} [mistake]
 * @property {string} [notes]
 * @property {string} [emotion]
 * @property {number} [rating]
 */

function padTime(time) {
  if (!time) return '00:00:00';
  return time.length === 5 ? `${time}:00` : time;
}

function toLocalDateTime(date, time) {
  return `${date}T${padTime(time)}`;
}

function parseDateTime(iso) {
  if (!iso) return { date: '', entryTime: '' };
  const normalized = String(iso).replace(' ', 'T');
  const [datePart, timePart = '00:00:00'] = normalized.split('T');
  return {
    date: datePart,
    entryTime: timePart.slice(0, 5),
  };
}

function splitNotes(notes) {
  if (!notes) return { text: '', meta: {} };
  const idx = notes.indexOf(META_MARKER);
  if (idx === -1) return { text: notes, meta: {} };
  const text = notes.slice(0, idx).trim();
  try {
    const meta = JSON.parse(notes.slice(idx + META_MARKER.length));
    return { text, meta };
  } catch {
    return { text: notes, meta: {} };
  }
}

function buildNotes(text, meta) {
  const base = (text || '').trim();
  const hasMeta =
    meta &&
    (meta.fees != null || meta.mistake != null || meta.rating != null || meta.assetClass);
  if (!hasMeta) return base || null;
  return `${base}${META_MARKER}${JSON.stringify(meta)}`;
}

/**
 * @param {Object} apiTrade
 * @returns {UiTradeInput}
 */
export function apiTradeToUi(apiTrade) {
  const { date, entryTime } = parseDateTime(apiTrade.entryDate);
  const exitParsed = apiTrade.exitDate ? parseDateTime(apiTrade.exitDate) : null;
  const { text, meta } = splitNotes(apiTrade.notes);

  return {
    id: apiTrade.id,
    date,
    entryDate: date,
    exitDate: exitParsed?.date || '',
    entryTime,
    exitTime: exitParsed?.entryTime || '',
    symbol: apiTrade.symbol,
    assetClass: meta.assetClass || 'Stocks',
    currency: apiTrade.currency || 'USD',
    direction: apiTrade.direction,
    quantity: apiTrade.positionSize,
    entryPrice: apiTrade.entryPrice,
    exitPrice:
      apiTrade.status === 'OPEN' || apiTrade.exitPrice == null ? '' : apiTrade.exitPrice,
    stopLoss: apiTrade.stopLoss ?? '',
    takeProfit: apiTrade.takeProfit ?? '',
    fees: meta.fees ?? 0,
    setup: apiTrade.strategyUsed || meta.setup || 'Unknown',
    strategyId: apiTrade.strategyId,
    marketName: apiTrade.marketName,
    timeframe: apiTrade.timeframe || DEFAULT_TIMEFRAME,
    mistake: meta.mistake ?? 'None',
    notes: text,
    emotion: apiTrade.emotion || 'Focused',
    rating: meta.rating ?? 3,
  };
}

/**
 * @param {UiTradeInput} ui
 * @param {{ userId: number, marketId: number, marketName: string, strategyId: number }} ctx
 */
export function uiTradeToApi(ui, ctx) {
  const hasExit =
    ui.exitPrice !== '' && ui.exitPrice !== null && ui.exitPrice !== undefined;
  const exitPrice = hasExit ? Number(ui.exitPrice) : null;
  const status = hasExit ? 'CLOSED' : 'OPEN';

  const meta = {
    fees: Number(ui.fees) || 0,
    mistake: ui.mistake || 'None',
    rating: ui.rating ?? 3,
    assetClass: ui.assetClass,
  };

  const entryDay = ui.entryDate || ui.date;

  const payload = {
    symbol: ui.symbol,
    direction: ui.direction,
    currency: ui.currency,
    entryDate: toLocalDateTime(entryDay, ui.entryTime),
    entryPrice: Number(ui.entryPrice),
    positionSize: Number(ui.quantity),
    marketId: ctx.marketId,
    marketName: ctx.marketName,
    userId: ctx.userId,
    strategyId: ctx.strategyId,
    strategyUsed: ui.setup,
    timeframe: ui.timeframe || DEFAULT_TIMEFRAME,
    confidenceLevel: DEFAULT_CONFIDENCE,
    status,
    notes: buildNotes(ui.notes, meta),
    emotion: ui.emotion || 'Focused',
  };

  if (exitPrice != null && !Number.isNaN(exitPrice)) {
    payload.exitPrice = exitPrice;
    const exitDay = ui.exitDate || entryDay;
    if (ui.exitTime && exitDay) {
      payload.exitDate = toLocalDateTime(exitDay, ui.exitTime);
    }
  }

  const stop = ui.stopLoss === '' || ui.stopLoss == null ? null : Number(ui.stopLoss);
  const tp = ui.takeProfit === '' || ui.takeProfit == null ? null : Number(ui.takeProfit);
  if (stop != null && !Number.isNaN(stop)) payload.stopLoss = stop;
  if (tp != null && !Number.isNaN(tp)) payload.takeProfit = tp;

  return payload;
}

export function resolveStrategyId(strategiesByName, setupName) {
  if (!setupName) return null;
  const found = strategiesByName[setupName];
  return found ?? null;
}
