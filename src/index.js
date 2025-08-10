import React from 'react';
import ReactDOM from 'react-dom';
import './consoleLogs.js';
import VideotpushApp from './VideotpushApp.jsx';
import { setFcmReg } from './swRegistration.js';
import { firebaseConfig, logEvent } from './firebase.js';
import { addNotification } from './notifications.js';
import { detectOS, detectBrowser } from './utils.js';

ReactDOM.render(React.createElement(VideotpushApp), document.getElementById('root'));

// >>> Service Worker registration for GitHub Pages subpath <<<
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const base = '/VideoTinder/';                 // GH Pages repo path
    const swUrl = `${base}service-worker.js`;     // SW file under public/
    navigator.serviceWorker
      .register(swUrl, { scope: base })
      .then(reg => console.log('SW scope:', reg.scope))
      .catch(err => console.error('SW register failed:', err));
  });
}
