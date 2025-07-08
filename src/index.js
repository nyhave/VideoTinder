import React from 'react';
import ReactDOM from 'react-dom';
import RealDatingApp from './RealDatingApp.js';

ReactDOM.render(React.createElement(RealDatingApp), document.getElementById('root'));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(new URL('../public/service-worker.js', import.meta.url));
  });
}
