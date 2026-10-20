function hasPrice(raw) {
  return raw !== '' && raw !== null && raw !== undefined && !Number.isNaN(Number(raw));
}

function hasEntryPrice(trade) {
  return hasPrice(trade.entryPrice);
}

function hasExitPrice(trade) {
  return hasPrice(trade.exitPrice);
}

export function canCalculateNetPnl(trade) {
  return hasEntryPrice(trade) && hasExitPrice(trade);
}

export function enrichTrade(trade) {
  const qty = Number(trade.quantity) || 0;
  const entry = Number(trade.entryPrice) || 0;
  const exit = hasExitPrice(trade) ? Number(trade.exitPrice) : 0;
  const stop = Number(trade.stopLoss) || 0;
  const fees = Number(trade.fees) || 0;
  const multiplier = Number(trade.contractMultiplier) || 1;

  const overrideRaw = trade.netPnlOverride;
  const hasOverride =
    overrideRaw !== '' && overrideRaw !== null && overrideRaw !== undefined && !Number.isNaN(Number(overrideRaw));

  const isOpen = !hasExitPrice(trade) && !hasOverride;

  let grossPnl = 0;
  let netPnl = 0;

  if (hasOverride) {
    netPnl = Number(Number(overrideRaw).toFixed(2));
    grossPnl = netPnl + fees;
  } else if (canCalculateNetPnl(trade)) {
    grossPnl =
      trade.direction === 'LONG'
        ? (exit - entry) * qty * multiplier
        : (entry - exit) * qty * multiplier;
    netPnl = Number((grossPnl - fees).toFixed(2));
  }

  const initialRiskDollars =
    stop > 0 ? Number((Math.abs(entry - stop) * qty * multiplier).toFixed(2)) : 0;
  const rMultiple =
    initialRiskDollars > 0 && !isOpen ? Number((netPnl / initialRiskDollars).toFixed(2)) : 0;

  let outcome = 'BREAKEVEN';
  if (isOpen) outcome = 'OPEN';
  else if (netPnl > 5) outcome = 'WIN';
  else if (netPnl < -5) outcome = 'LOSS';

  return {
    ...trade,
    grossPnl: Number(grossPnl.toFixed(2)),
    netPnl,
    initialRiskDollars,
    rMultiple,
    outcome,
    isOpen,
  };
}

export function computePortfolioMetrics(enrichedTrades) {
  if (!enrichedTrades.length) {
    return { totalNetPnl: 0, winRate: 0, profitFactor: 0, avgWin: 0, avgLoss: 0, expectancy: 0, avgRMultiple: 0, winsCount: 0, lossesCount: 0, totalTrades: 0, equityCurve: [], dailySeries: [] };
  }
  const sorted = [...enrichedTrades].sort((a, b) => `${a.date} ${a.entryTime}`.localeCompare(`${b.date} ${b.entryTime}`));
  let totalNetPnl = 0, grossProfit = 0, grossLossAbs = 0, winsCount = 0, lossesCount = 0, totalR = 0, runningEquity = 0;
  const dailyMap = {}, equityCurve = [];

  sorted.forEach((t, idx) => {
    totalNetPnl += t.netPnl;
    totalR += t.rMultiple;
    runningEquity += t.netPnl;
    if (t.outcome === 'WIN') { winsCount++; grossProfit += t.netPnl; }
    else if (t.outcome === 'LOSS') { lossesCount++; grossLossAbs += Math.abs(t.netPnl); }

    if (!dailyMap[t.date]) dailyMap[t.date] = { date: t.date, netPnl: 0, trades: 0, wins: 0 };
    dailyMap[t.date].netPnl = Number((dailyMap[t.date].netPnl + t.netPnl).toFixed(2));
    dailyMap[t.date].trades++;
    if (t.outcome === 'WIN') dailyMap[t.date].wins++;

    equityCurve.push({ tradeNumber: idx + 1, date: t.date, symbol: t.symbol, cumulativePnl: Number(runningEquity.toFixed(2)), tradePnl: t.netPnl });
  });

  const totalTrades = sorted.length;
  return {
    totalNetPnl: Number(totalNetPnl.toFixed(2)),
    winRate: Number(((winsCount / totalTrades) * 100).toFixed(1)),
    profitFactor: grossLossAbs > 0 ? Number((grossProfit / grossLossAbs).toFixed(2)) : 99.9,
    avgWin: winsCount > 0 ? Number((grossProfit / winsCount).toFixed(2)) : 0,
    avgLoss: lossesCount > 0 ? Number((grossLossAbs / lossesCount).toFixed(2)) : 0,
    expectancy: Number((totalNetPnl / totalTrades).toFixed(2)),
    avgRMultiple: Number((totalR / totalTrades).toFixed(2)),
    winsCount, lossesCount, totalTrades, equityCurve,
    dailySeries: Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date)),
  };
}