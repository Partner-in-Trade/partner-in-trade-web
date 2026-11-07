import React, { useMemo } from 'react';

function buildPaths(values) {
  const w = 100;
  const h = 56;
  const padX = 0;
  const padY = 4;
  const baseline = h - padY;
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const span = max - min || 1;

  const coords = values.map((v, i) => {
    const x = padX + (i / Math.max(values.length - 1, 1)) * (w - padX * 2);
    const y = padY + (1 - (v - min) / span) * (h - padY * 2);
    return [x, y];
  });

  const line = coords
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ');

  const firstX = coords[0][0];
  const lastX = coords[coords.length - 1][0];
  const area = `${line} L${lastX.toFixed(2)},${baseline.toFixed(2)} L${firstX.toFixed(2)},${baseline.toFixed(2)} Z`;

  return { line, area, w, h };
}

export function StrategySparkline({ values, positive }) {
  const paths = useMemo(() => {
    if (!values?.length) return null;
    return buildPaths(values);
  }, [values]);

  if (!paths) {
    return (
      <div
        className="h-16 rounded-lg border border-violet-500/15 bg-pit-bg/60"
        aria-hidden
      />
    );
  }

  const stroke = positive ? '#34d399' : '#f87171';
  const gradId = positive ? 'strategy-spark-up' : 'strategy-spark-down';

  return (
    <svg
      viewBox={`0 0 ${paths.w} ${paths.h}`}
      className="h-16 w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.45" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path d={paths.area} fill={`url(#${gradId})`} />
      <path
        d={paths.line}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
