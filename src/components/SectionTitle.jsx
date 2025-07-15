import React from 'react';

export default function SectionTitle({ title, action, colorClass = 'text-pink-600' }) {
  return React.createElement('div', { className: 'flex items-center justify-between mb-2' },
    React.createElement('h2', { className: `text-2xl font-semibold ${colorClass}` }, title),
    action || null
  );
}
