import React from 'react';
import ReactDOM from 'react-dom';
import './consoleLogs.js';
import VideotpushApp from './VideotpushApp.jsx';
import { setFcmReg } from './swRegistration.js';
import { firebaseConfig, logEvent } from './firebase.js';
import { addNotification } from './notifications.js';

ReactDOM.render(React.createElement(VideotpushApp), document.getElementById('root'));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    // The service worker file lives in the public folder. Use a
    // relative path so Parcel can locate it during the build.
    const swUrl = new URL('../public/service-worker.js', import.meta.url);
    const baseScope = new URL('../', swUrl).pathname;
    // Register the main service worker generated in the production build
    console.log('Attempting SW registration', swUrl.href, { scope: baseScope });
    let mainReg = null;
    try {
      mainReg = await navigator.serviceWorker.register(swUrl, { scope: baseScope });
      logEvent('serviceWorker registered');
    } catch (err) {
      console.error('SW registration failed', {
        message: err.message,
        name: err.name,
        stack: err.stack,
        swUrl: swUrl.href,
        scope: baseScope
      });
      logEvent('serviceWorker register error', { error: err.message });
    }

    // Register the Firebase messaging service worker now located under src
    let fcmReg = null;
    const fcmUrl = new URL('./firebase-messaging-sw.js', import.meta.url);
    console.log('Attempting FCM SW registration', fcmUrl.href, { scope: baseScope });
    try {
      fcmReg = await navigator.serviceWorker.register(
        fcmUrl,
        { scope: baseScope }
      );
      logEvent('fcm serviceWorker registered');
    } catch (err) {
      console.error('FCM SW registration failed', {
        message: err.message,
        name: err.name,
        stack: err.stack,
        swUrl: fcmUrl.href,
        scope: baseScope
      });
      logEvent('fcm serviceWorker register error', { error: err.message });
      throw err;
    }
    // Send Firebase config to the service worker so it can initialize
    const sw = fcmReg.active || fcmReg.waiting || fcmReg.installing;
    sw?.postMessage({ type: 'INIT_FIREBASE', config: firebaseConfig });
    setFcmReg(fcmReg);
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data && event.data.type === 'PUSH_RECEIVED') {
        logEvent('push received', event.data.payload);
        const payload = event.data.payload || {};
        addNotification({ title: payload.title, body: payload.body, type: 'push' });
      }
    });
  });
}
