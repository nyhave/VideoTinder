import React from 'react';
import ReactDOM from 'react-dom';
import './consoleLogs.js';
import VideotpushApp from './VideotpushApp.jsx';
import { ensureWebPush } from './ensureWebPush.js';

ReactDOM.render(React.createElement(VideotpushApp), document.getElementById('root'));

// >>> Service Worker registration with dynamic base path <<<
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Determine the base path of the application (e.g. "/" or "/VideoTinder/")
    const base = window.location.pathname.replace(/[^/]*$/, '');
    const swUrl = `${base}service-worker.js`;
    navigator.serviceWorker
      .register(swUrl, { scope: base })
      .then(async reg => {
        console.log('SW scope:', reg.scope);
        await ensureWebPush();
      })
      .catch(err => console.error('SW register failed:', err));
  });
}
