import React from 'react';
import ReactDOM from 'react-dom';
import VideotpushApp from './VideotpushApp.jsx';
import { setFcmReg } from './swRegistration.js';
import { firebaseConfig, logEvent } from './firebase.js';

ReactDOM.render(React.createElement(VideotpushApp), document.getElementById('root'));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    // Register the main service worker generated in the production build
    await navigator.serviceWorker
      .register(
        new URL('../public/service-worker.js', import.meta.url),
        { scope: '/VideoTinder/' }
      )
      .catch(err => console.error('SW registration failed', err));

    // Register the Firebase messaging service worker now located under src
    const fcmReg = await navigator.serviceWorker
      .register(
        new URL('./firebase-messaging-sw.js', import.meta.url),
        { scope: '/VideoTinder/' }
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
