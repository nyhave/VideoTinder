import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';

export default function AdminScreen({ profiles, onSwitch, onReset }) {
  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: 'Admin: Skift profil' }),
    React.createElement('select', {
      className: 'border p-2 mb-4 w-full',
      onChange: e=>onSwitch(e.target.value),
      defaultValue: ''
    },
      React.createElement('option', { value: '' }, '-- vælg profil --'),
      profiles.map(p => React.createElement('option', { key: p.id, value: p.id }, p.name))
    ),
    React.createElement('p', { className: 'text-gray-500 text-sm mb-4' }, 'Oplev app’en som en anden bruger.'),
    React.createElement(Button, { className: 'bg-red-500 text-white', onClick: onReset }, 'Reset database')
  );
}
