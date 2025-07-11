import React from 'react';

export default function SectionTitle({ title, action }) {
  return React.createElement('div', { className: 'flex items-center justify-between mb-2' },
    React.createElement('h2', { className: 'text-2xl font-semibold text-pink-600' }, title),
    action || null
  );
}
