import React from 'react';
import ReactDOM from 'react-dom';
import './consoleLogs.js';
import VideotpushApp from './VideotpushApp.jsx';

ReactDOM.render(React.createElement(VideotpushApp), document.getElementById('root'));

// Attempt to enter fullscreen on first user interaction so the app fills the entire screen.
function enableFullscreen() {
  const el = document.documentElement;
  const request = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
  if (request && !document.fullscreenElement) {
    request.call(el).catch(() => {});
  }
}

['click', 'touchend'].forEach(evt => {
  document.addEventListener(evt, enableFullscreen, { once: true });
});

// >>> Service Worker registration with dynamic base path <<<
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Determine the base path of the application (e.g. "/" or "/VideoTinder/")
    const base = window.location.pathname.replace(/[^/]*$/, '');
    const swUrl = `${base}service-worker.js`;
    navigator.serviceWorker
      .register(swUrl, { scope: base })
      .then(reg => {
        console.log('SW scope:', reg.scope);
      })
      .catch(err => console.error('SW register failed:', err));
  });
}
