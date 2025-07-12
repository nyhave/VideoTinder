import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';

export default function CallToAction({ icon, title, description, buttonText, onClick }) {
  return React.createElement(Card, {
    className: 'p-6 m-4 shadow-lg bg-gradient-to-br from-white via-pink-50 to-white rounded-lg flex flex-col items-center text-center'
  },
    React.createElement('div', { className: 'text-6xl mb-4' }, icon),
    React.createElement('h2', { className: 'text-2xl font-bold mb-2 text-pink-600' }, title),
    React.createElement('p', { className: 'mb-4 text-gray-700' }, description),
    React.createElement(Button, {
      onClick,
      className: 'bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded w-full max-w-xs'
    }, buttonText)
  );
}
