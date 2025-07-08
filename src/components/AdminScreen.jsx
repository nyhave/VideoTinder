import React from 'https://cdn.skypack.dev/react';
import { Card } from './ui/card.js';
import SectionTitle from './SectionTitle.jsx';

export default function AdminScreen({ profiles, onSwitch }) {
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
    React.createElement('p', { className: 'text-gray-500 text-sm' }, 'Oplev app’en som en anden bruger.')
  );
}
