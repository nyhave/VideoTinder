import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';

export default function WelcomeScreen({ onNext }) {
  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement('h1', { className: 'text-3xl font-bold mb-4 text-pink-600 text-center' }, 'Om RealDating'),
    React.createElement('p', { className: 'mb-4 text-gray-700' },
      'Velkommen til en ny måde at date på. Her er fokus på at finde den personen med den rigtige energi. Det gør vi gennem lyd og video fremfor billeder.' 
      + 'Her handler det ikke om hurtige swipes.'
      + 'RealDating er for dig, der søger noget ægte og meningsfuldt.'
    ),
    React.createElement(Button, { onClick: onNext, className: 'bg-pink-500 hover:bg-pink-600 text-white mt-4' }, 'Login')
  );
}
