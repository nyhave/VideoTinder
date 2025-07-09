import React from 'react';
import ReactDOM from 'react-dom';
import RealDateApp from './RealDateApp.jsx';

ReactDOM.render(React.createElement(RealDateApp), document.getElementById('root'));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(new URL('../public/service-worker.js', import.meta.url));
  });
}
