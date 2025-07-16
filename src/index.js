import React from 'react';
import ReactDOM from 'react-dom';
import VideotpushApp from './VideotpushApp.jsx';

ReactDOM.render(React.createElement(VideotpushApp), document.getElementById('root'));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    await navigator.serviceWorker.register(new URL('../public/service-worker.js', import.meta.url));
    await navigator.serviceWorker.register(new URL('./firebase-messaging-sw.js', import.meta.url));
  });
}
