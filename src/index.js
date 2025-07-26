import React from 'react';
import ReactDOM from 'react-dom';
import './consoleLogs.js';
import VideotpushApp from './VideotpushApp.jsx';
import { setFcmReg } from './swRegistration.js';
import { firebaseConfig, logEvent } from './firebase.js';

ReactDOM.render(React.createElement(VideotpushApp), document.getElementById('root'));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    // The build outputs the service worker next to the bundled JS
    // so use a relative path without the "public" folder.
    const swUrl = new URL('./service-worker.js', import.meta.url);
    const baseScope = new URL('../', swUrl).pathname;
    // Register the main service worker generated in the production build
    await navigator.serviceWorker
      .register(swUrl, { scope: baseScope })
      .catch(err => console.error('SW registration failed', err));

    // Register the Firebase messaging service worker now located under src
    const fcmReg = await navigator.serviceWorker
      .register(
        new URL('./firebase-messaging-sw.js', import.meta.url),
        { scope: baseScope }
      )
      .catch(err => {
        console.error('SW registration failed', err);
        throw err;
      });
    // Send Firebase config to the service worker so it can initialize
    const sw = fcmReg.active || fcmReg.waiting || fcmReg.installing;
    sw?.postMessage({ type: 'INIT_FIREBASE', config: firebaseConfig });
    setFcmReg(fcmReg);
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data && event.data.type === 'PUSH_RECEIVED') {
        logEvent('push received', event.data.payload);
      }
    });
  });
}
