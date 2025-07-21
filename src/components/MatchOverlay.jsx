import React, { useEffect } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { triggerHaptic } from '../haptics.js';

export default function MatchOverlay({ name, onClose }) {
  useEffect(() => {
    triggerHaptic([100, 50, 100]);
  }, []);
  return React.createElement('div', { className: 'fixed inset-0 z-50 bg-black/50 flex items-center justify-center' },
    React.createElement(Card, { className: 'bg-white p-6 rounded shadow-xl max-w-sm w-full text-center' },
      React.createElement('h2', { className: 'text-2xl font-bold text-pink-600 mb-4' }, 'Det er et match!'),
      React.createElement('p', { className: 'mb-4' }, `Du og ${name} har liket hinanden`),
      React.createElement('div', { className: 'text-4xl mb-4' }, '🎉'),
      React.createElement(Button, { className: 'w-full bg-pink-500 text-white', onClick: onClose }, 'Fedt')
    )
  );
}
