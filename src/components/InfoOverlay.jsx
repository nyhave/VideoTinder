import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';

export default function InfoOverlay({ title, children, onClose }) {
  return React.createElement('div', { className: 'fixed inset-0 z-50 bg-black/50 flex items-center justify-center' },
    React.createElement(Card, { className: 'bg-white p-6 rounded shadow-xl max-w-sm w-full max-h-[90vh] overflow-y-auto' },
      React.createElement('h2', { className: 'text-xl font-semibold mb-4 text-pink-600 text-center' }, title),
      children,
      React.createElement(Button, { className: 'w-full bg-pink-500 text-white mt-4', onClick: onClose }, 'Luk')
    )
  );
}
