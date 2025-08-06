import React from 'react';
import PremiumIcon from './PremiumIcon.jsx';

export default function SectionTitle({ title, action, colorClass = 'text-pink-600', premium = false }) {
  return React.createElement('div', { className: 'flex items-center justify-between mb-2' },
    React.createElement('h2', { className: `text-2xl font-semibold flex items-center gap-2 ${colorClass}` },
      premium && React.createElement(PremiumIcon, null),
      title
    ),
    action || null
  );
}
