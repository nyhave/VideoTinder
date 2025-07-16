import React from 'react';
import ReactDOM from 'react-dom';
import VideotpushApp from './VideotpushApp.jsx';
import { setFcmReg } from './swRegistration.js';

ReactDOM.render(React.createElement(VideotpushApp), document.getElementById('root'));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    // Register the main service worker generated in the production build
    await navigator.serviceWorker.register(new URL('../public/service-worker.js', import.meta.url));

    // Register the Firebase messaging service worker bundled under the public
    // directory
    const fcmReg = await navigator.serviceWorker.register(new URL('../public/firebase-messaging-sw.js', import.meta.url));
    setFcmReg(fcmReg);
  });
}
