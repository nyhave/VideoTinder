import React from 'react';
import { Card } from './ui/card.js';

export default function AboutScreen() {
  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement('h1', { className: 'text-3xl font-bold mb-4 text-pink-600 text-center' }, 'Om RealDating'),
    React.createElement('p', { className: 'mb-4 text-gray-700' },
      'Velkommen til en ny måde at date på. Her handler det ikke om hurtige swipes, men om at tage sig tid til at lære hinanden at kende. '
      + 'SlowDating er for dig, der søger noget ægte og meningsfuldt. Tag det stille og roligt, og find den forbindelse, der virkelig betyder noget.'
    )
  );
}
