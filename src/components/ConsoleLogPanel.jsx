import React, { useState, useEffect } from 'react';
import { getLogs, addLogListener, removeLogListener, isConsoleCapture } from '../consoleLogs.js';

export default function ConsoleLogPanel() {
  const [logs, setLogs] = useState(getLogs());
  useEffect(() => {
    const handler = l => setLogs(l);
    addLogListener(handler);
    return () => removeLogListener(handler);
  }, []);
  if (!isConsoleCapture()) return null;
  return React.createElement('div', {
      className: 'fixed left-0 right-0 bottom-0 max-h-40 overflow-y-auto bg-black text-white text-xs p-2 z-50 opacity-80'
    },
    logs.map((l, i) =>
      React.createElement('div', { key: i, className: l.type === 'error' ? 'text-red-400' : '' },
        `[${l.timestamp.split('T')[1].slice(0,8)}] ${l.msg}`
      )
    )
  );
}
