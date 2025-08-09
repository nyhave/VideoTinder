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
  window.addEventListener('load', async () => {
    // The service worker file lives in the public folder. Use a
    // relative path so Parcel can locate it during the build.
    const swUrl = new URL('../public/service-worker.js', import.meta.url);
    const baseScope = new URL('.', swUrl).pathname;
    // Register the main service worker generated in the production build
    console.log('Attempting SW registration', swUrl.href, { scope: baseScope });
    let mainReg = null;
    try {
      mainReg = await navigator.serviceWorker.register(swUrl, { scope: baseScope });
      console.log('SW registration success', swUrl.href, { scope: baseScope });
      logEvent('serviceWorker registered');
    } catch (err) {
      console.error('SW registration failed', {
        message: err.message,
        name: err.name,
        stack: err.stack,
        swUrl: swUrl.href,
        scope: baseScope
      });
      logEvent('serviceWorker register error', {
        error: err.message,
        os: detectOS(),
        browser: detectBrowser(),
        timestamp: new Date().toISOString()
      });
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
      console.log('FCM SW registration success', fcmUrl.href, { scope: baseScope });
      logEvent('fcm serviceWorker registered');
    } catch (err) {
      console.error('FCM SW registration failed', {
        message: err.message,
        name: err.name,
        stack: err.stack,
        swUrl: fcmUrl.href,
        scope: baseScope
      });
      logEvent('fcm serviceWorker register error', {
        error: err.message,
        os: detectOS(),
        browser: detectBrowser(),
        timestamp: new Date().toISOString()
      });
      throw err;
    }
    // Send Firebase config to the service worker so it can initialize
    const sw = fcmReg.active || fcmReg.waiting || fcmReg.installing;
    sw?.postMessage({ type: 'INIT_FIREBASE', config: firebaseConfig });
    console.log('Sent INIT_FIREBASE to FCM SW');
    setFcmReg(fcmReg);
    navigator.serviceWorker.ready.then(reg => {
      console.log('Service worker ready', reg);
    });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service worker controller changed', navigator.serviceWorker.controller?.scriptURL);
    });
    navigator.serviceWorker.addEventListener('error', event => {
      logEvent('serviceWorker error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        os: detectOS(),
        browser: detectBrowser(),
        timestamp: new Date().toISOString()
      });
    });
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data && event.data.type === 'PUSH_RECEIVED') {
        logEvent('push received', event.data.payload);
        const payload = event.data.payload || {};
        addNotification({ title: payload.title, body: payload.body, type: 'push' });
      }
    });
  });
}
