import React from 'react';
import { Card } from './ui/card.js';

export default function CallToAction({ icon, title, description, buttonText, onClick }) {
  return React.createElement(Card, {
    onClick, className: 'p-6 m-4 shadow-lg bg-gradient-to-br from-white via-pink-50 to-white rounded-lg flex flex-col items-center text-center cursor-pointer'
  },
    React.createElement('div', { className: 'text-4xl mb-4' }, icon),
    React.createElement('h2', { className: 'text-2xl font-bold mb-2 text-pink-600' }, title),
    React.createElement('p', { className: 'mb-4 text-gray-700' }, description),
    buttonText && React.createElement("div", { className: "mt-2 text-pink-600 font-semibold" }, buttonText)
  );
}
