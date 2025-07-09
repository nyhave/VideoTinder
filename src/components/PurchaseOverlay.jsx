import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';

export default function PurchaseOverlay({ title, price, children, onClose, onBuy }) {
  return React.createElement('div', { className: 'fixed inset-0 z-50 bg-black/50 flex items-center justify-center' },
    React.createElement(Card, { className: 'bg-white p-6 rounded shadow-xl max-w-sm w-full' },
      React.createElement('h2', { className: 'text-xl font-semibold mb-4 text-pink-600 text-center' }, title),
      children,
      price && React.createElement('p', { className: 'text-center font-bold my-4' }, price),
      React.createElement(Button, { className: 'w-full bg-pink-500 text-white mb-2', onClick: onBuy }, 'Køb'),
      React.createElement(Button, { className: 'w-full', onClick: onClose }, 'Luk')
    )
  );
}
