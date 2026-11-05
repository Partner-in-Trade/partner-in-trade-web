import React from 'react';
import { Target } from 'lucide-react';

export function StrategiesListStatus({
  message,
  submessage,
  pulse = false,
}) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-600/15 ${
          pulse ? 'animate-pulse' : ''
        }`}
      >
        <Target className="h-8 w-8 text-indigo-400" strokeWidth={1.75} />
      </div>
      <p className="max-w-sm text-sm font-medium text-slate-200">{message}</p>
      {submessage ? (
        <p className="mt-2 max-w-md text-xs text-slate-500">{submessage}</p>
      ) : null}
    </div>
  );
}
