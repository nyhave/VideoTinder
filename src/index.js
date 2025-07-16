import React from 'react';
import ReactDOM from 'react-dom';
import VideotpushApp from './VideotpushApp.jsx';
import { setFcmReg } from './swRegistration.js';

ReactDOM.render(React.createElement(VideotpushApp), document.getElementById('root'));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    await navigator.serviceWorker.register(new URL('../public/service-worker.js', import.meta.url));
    const fcmReg = await navigator.serviceWorker.register(new URL('./firebase-messaging-sw.js', import.meta.url));
    setFcmReg(fcmReg);
  });
}
