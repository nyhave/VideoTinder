import React from 'react';
import ReactDOM from 'react-dom';
import './consoleLogs.js';
import VideotpushApp from './VideotpushApp.jsx';
import { setFcmReg } from './swRegistration.js';
import { firebaseConfig, logEvent } from './firebase.js';
import { addNotification } from './notifications.js';
import { detectOS, detectBrowser } from './utils.js';

ReactDOM.render(React.createElement(VideotpushApp), document.getElementById('root'));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // BASE_URL er typisk '/VideoTinder/' når du hoster på GH Pages
    const base = (import.meta && import.meta.env && import.meta.env.BASE_URL) || '/VideoTinder/';
    const swUrl = `${base}service-worker.js`;

    navigator.serviceWorker
      .register('/VideoTinder/service-worker.js', { scope: '/VideoTinder/' })
      .then((reg) => {
        console.log('SW registered with scope:', reg.scope);
      })
      .catch((err) => console.error('SW register failed:', err));
  });
}
