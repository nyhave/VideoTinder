import React, { useEffect } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { triggerHaptic } from '../haptics.js';

export default function WinnerOverlay({ winners = [], onClose }) {
  useEffect(() => {
    triggerHaptic([100, 50, 100]);
  }, []);
  const multiple = winners.length > 1;
  const title = multiple ? 'Vinderne er:' : 'Vinderen er:';
  const names = winners.join(' og ');
  return React.createElement('div', { className:'fixed inset-0 z-50 bg-black/50 flex items-center justify-center' },
    React.createElement(Card, { className:'bg-white p-6 rounded shadow-xl max-w-sm w-full text-center' },
      React.createElement('h2', { className:'text-2xl font-bold text-pink-600 mb-4' }, 'Spillet er slut!'),
      React.createElement('p', { className:'mb-2 font-semibold' }, title),
      React.createElement('p', { className:'mb-4 text-xl' }, names),
      React.createElement('div', { className:'text-4xl mb-4' }, '🎉'),
      React.createElement(Button, { className:'w-full bg-pink-500 text-white', onClick:onClose }, 'Fedt')
    )
  );
}
