import React from 'react';
import { Card } from './ui/card.js';

export default function AboutScreen() {
  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement('h1', { className: 'text-3xl font-bold mb-4 text-pink-600 text-center' }, 'Om RealDating'),
    React.createElement('p', { className: 'mb-4 text-gray-700' }, '🎧 Udforsk klip fra andre brugere.'),
    React.createElement('p', { className: 'mb-4 text-gray-700' }, '💬 Chat kun med aktive matches.'),
    React.createElement('p', { className: 'mb-4 text-gray-700' }, '📅 Gem dine refleksioner i kalenderen.')
  );
}
