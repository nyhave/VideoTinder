let capture = false;
if (typeof window !== 'undefined') {
  capture = localStorage.getItem('consoleCapture') === 'true';
}

const listeners = [];
const logs = [];
const MAX = 100;

function notify() {
  listeners.forEach(l => l([...logs]));
}

function add(type, args) {
  if (!capture) return;
  const msg = args.map(a => {
    if (typeof a === 'object') {
      try {
        return JSON.stringify(a);
      } catch (err) {
        return String(a);
      }
    }
    return String(a);
  }).join(' ');
  logs.push({ type, msg, timestamp: new Date().toISOString() });
  if (logs.length > MAX) logs.shift();
  notify();
}

const origLog = console.log;
const origError = console.error;
console.log = (...args) => { add('log', args); origLog(...args); };
console.error = (...args) => { add('error', args); origError(...args); };

export function getLogs() {
  return [...logs];
}

export function addLogListener(fn) {
  listeners.push(fn);
}

export function removeLogListener(fn) {
  const i = listeners.indexOf(fn);
  if (i >= 0) listeners.splice(i, 1);
}

export function setConsoleCapture(val) {
  capture = val;
  if (typeof window !== 'undefined') {
    localStorage.setItem('consoleCapture', val ? 'true' : 'false');
  }
  if (!val) {
    logs.length = 0;
    notify();
  }
}

export function isConsoleCapture() {
  return capture;
}

export function showConsolePanel() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('consolePanelVisible', 'true');
    window.dispatchEvent(new Event('consolePanelShow'));
  }
}
