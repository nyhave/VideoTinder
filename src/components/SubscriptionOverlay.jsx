import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';

export default function SubscriptionOverlay({ onClose, onBuy, allowFree = false }) {
  const plans = [
    ...(allowFree ? [{ tier: 'free', title: 'Freemium', price: '0 kr/md', daily: 3, seconds: 10, boosts: 0 }] : []),
    { tier: 'silver', title: 'Sølv', price: '39 kr/md', daily: 5, seconds: 10, boosts: 1 },
    { tier: 'gold', title: 'Guld', price: '79 kr/md', daily: 8, seconds: 15, boosts: 2 },
    { tier: 'platinum', title: 'Platin', price: '139 kr/md', daily: 10, seconds: 25, boosts: 4 }
  ];
  const [selected, setSelected] = useState(plans[0].tier);
  return React.createElement('div', { className: 'fixed inset-0 z-50 bg-black/50 flex items-center justify-center' },
    React.createElement(Card, { className: 'bg-white p-6 rounded shadow-xl max-w-sm w-full' },
      React.createElement('h2', { className: 'text-xl font-semibold mb-4 text-yellow-600 text-center' }, 'Vælg abonnement'),
      React.createElement('ul', { className: 'space-y-2 mb-4' },
        plans.map(p => (
          React.createElement('li', { key: p.tier },
            React.createElement(Button, {
              className: `w-full flex flex-col items-start ${selected === p.tier ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-black'}`,
              onClick: () => setSelected(p.tier)
            },
              React.createElement('span', { className: 'font-medium' }, `${p.title} – ${p.price}`),
              React.createElement('span', { className: 'text-sm' }, `Dagligt kliplimit ${p.daily}, video op til ${p.seconds} sek`),
              React.createElement('span', { className: 'text-sm' }, `Boosts pr. måned ${p.boosts}`)
            )
          )
        ))
      ),
      React.createElement(Button, { className: 'w-full bg-yellow-500 text-white mb-2', onClick: () => onBuy(selected) }, 'Køb (ikke implementeret)'),
      React.createElement(Button, { className: 'w-full bg-gray-200 text-black', onClick: onClose }, 'Luk')
    )
  );
}
