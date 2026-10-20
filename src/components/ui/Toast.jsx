import React, { useEffect } from 'react';

export function Toast({ message, onDismiss, duration = 2800 }) {
  useEffect(() => {
    const id = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(id);
  }, [duration, onDismiss]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-lg border border-pit-border bg-pit-card px-4 py-2.5 text-sm text-slate-200 shadow-lg"
    >
      {message}
    </div>
  );
}
