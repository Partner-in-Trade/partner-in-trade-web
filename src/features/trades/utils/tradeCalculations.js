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
  else if (netPnl > 0) outcome = 'WIN';
  else if (netPnl < 0) outcome = 'LOSS';

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
  const sorted = [...enrichedTrades].sort((a, b) =>
    `${a.date} ${a.entryTime}`.localeCompare(`${b.date} ${b.entryTime}`)
  );
  const closedTrades = sorted.filter((trade) => !trade.isOpen);

  let totalNetPnl = 0;
  let grossProfit = 0;
  let grossLossAbs = 0;
  let winsCount = 0;
  let lossesCount = 0;
  let breakevenCount = 0;
  let totalR = 0;
  let validRCount = 0;
  let runningEquity = 0;
  const dailyMap = {};
  const equityCurve = [];

  closedTrades.forEach((trade, index) => {
    const pnl = Number(trade.netPnl) || 0;
    totalNetPnl += pnl;
    runningEquity += pnl;

    if (trade.outcome === 'WIN' || pnl > 0) {
      winsCount += 1;
      grossProfit += pnl;
    } else if (trade.outcome === 'LOSS' || pnl < 0) {
      lossesCount += 1;
      grossLossAbs += Math.abs(pnl);
    } else {
      breakevenCount += 1;
    }

    if (Number(trade.initialRiskDollars) > 0 && Number.isFinite(Number(trade.rMultiple))) {
      totalR += Number(trade.rMultiple);
      validRCount += 1;
    }

    if (!dailyMap[trade.date]) {
      dailyMap[trade.date] = { date: trade.date, netPnl: 0, trades: 0, wins: 0 };
    }
    dailyMap[trade.date].netPnl = Number((dailyMap[trade.date].netPnl + pnl).toFixed(2));
    dailyMap[trade.date].trades += 1;
    if (trade.outcome === 'WIN' || pnl > 0) dailyMap[trade.date].wins += 1;

    equityCurve.push({
      tradeNumber: index + 1,
      date: trade.date,
      symbol: trade.symbol,
      cumulativePnl: Number(runningEquity.toFixed(2)),
      tradePnl: pnl,
    });
  });

  const closedTradesCount = closedTrades.length;
  return {
    totalNetPnl: Number(totalNetPnl.toFixed(2)),
    winRate: closedTradesCount > 0 ? Number(((winsCount / closedTradesCount) * 100).toFixed(1)) : 0,
    profitFactor: grossLossAbs > 0 ? Number((grossProfit / grossLossAbs).toFixed(2)) : null,
    avgWin: winsCount > 0 ? Number((grossProfit / winsCount).toFixed(2)) : 0,
    avgLoss: lossesCount > 0 ? Number((grossLossAbs / lossesCount).toFixed(2)) : 0,
    expectancy: closedTradesCount > 0 ? Number((totalNetPnl / closedTradesCount).toFixed(2)) : 0,
    avgRMultiple: validRCount > 0 ? Number((totalR / validRCount).toFixed(2)) : 0,
    winsCount,
    lossesCount,
    breakevenCount,
    totalTrades: sorted.length,
    closedTradesCount,
    equityCurve,
    dailySeries: Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date)),
  };
}
