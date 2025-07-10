import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import version from '../version.js';

export default function AboutScreen({ onOpenAdmin }) {
  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement('h1', { className: 'text-3xl font-bold mb-4 text-pink-600 text-center' }, 'Om RealDate'),
    React.createElement('p', { className: 'mb-4 text-gray-700' },
      'Velkommen til en ny måde at date på. Her handler det ikke om hurtige swipes, men om at tage sig tid til at lære hinanden at kende. '
      + 'RealDate er for dig, der søger noget ægte og meningsfuldt. Tag det stille og roligt, og find den forbindelse, der virkelig betyder noget.'
    ),
    React.createElement('p', { className: 'text-gray-500 text-sm text-center mb-4' }, `Version ${version}`),
    onOpenAdmin && React.createElement(Button, { className: 'bg-blue-500 hover:bg-blue-600 text-white mt-4', onClick: onOpenAdmin }, 'Admin')
  );
}
