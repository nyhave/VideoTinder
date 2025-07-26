import React, { useState, useEffect } from 'react';
import { getLogs, addLogListener, removeLogListener, isConsoleCapture } from '../consoleLogs.js';

export default function ConsoleLogPanel() {
  const [logs, setLogs] = useState(getLogs());
  const [visible, setVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('consolePanelVisible') !== 'false';
    }
    return true;
  });

  useEffect(() => {
    const handler = l => setLogs(l);
    addLogListener(handler);
    return () => removeLogListener(handler);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('consolePanelVisible', visible ? 'true' : 'false');
    }
  }, [visible]);

  if (!isConsoleCapture() || !visible) return null;

  return React.createElement('div', {
      className: 'fixed left-0 right-0 bottom-0 max-h-40 overflow-y-auto bg-black text-white text-xs p-2 z-50 opacity-80'
    },
    React.createElement('button', {
      className: 'absolute right-1 top-1 text-white',
      onClick: () => setVisible(false)
    }, '✕'),
    logs.map((l, i) =>
      React.createElement('div', { key: i, className: l.type === 'error' ? 'text-red-400' : '' },
        `[${l.timestamp.split('T')[1].slice(0,8)}] ${l.msg}`
      )
    )
  );
}
