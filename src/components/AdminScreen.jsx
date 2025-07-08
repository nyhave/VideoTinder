import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import seedData from '../seedData.js';

export default function AdminScreen({ profiles, onSwitch, currentUserId }) {
  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: 'Administration' }),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 text-pink-600' }, 'Skift profil'),
    React.createElement('select', {
      className: 'border p-2 mb-4 w-full',
      onChange: e=>onSwitch(e.target.value),
      value: currentUserId || ''
    },
      React.createElement('option', { value: '' }, '-- vælg profil --'),
      profiles.map(p => React.createElement('option', { key: p.id, value: p.id }, p.name))
    ),
    React.createElement('p', { className: 'text-gray-500 text-sm mb-4' }, 'Oplev app\u2019en som en anden bruger.'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 text-pink-600' }, 'Reset database'),
    React.createElement(Button, { className: 'mt-2 bg-pink-500 text-white px-4 py-2 rounded', onClick: seedData }, 'Reset database')
  );
}
