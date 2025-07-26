import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { useCollection } from '../firebase.js';
import { useT } from '../i18n.js';

export default function TextLogScreen({ onBack }) {
  const t = useT();
  const logs = useCollection('textLogs');
  const sorted = logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90 overflow-y-auto max-h-[90vh]' },
    React.createElement(SectionTitle, { title: t('textLogTitle'), colorClass: 'text-blue-600', action: React.createElement(Button, { onClick: onBack }, 'Tilbage') }),
    sorted.length ?
      React.createElement('ul', { className: 'space-y-2 mt-4' },
        sorted.map(l =>
          React.createElement('li', { key: l.id, className: 'border-b pb-1 text-sm' },
            React.createElement('div', { className: 'font-mono text-xs text-gray-500' }, l.timestamp),
            React.createElement('div', null, l.event),
            l.details && React.createElement('pre', { className: 'whitespace-pre-wrap break-words text-xs' }, JSON.stringify(l.details, null, 2))
          )
        )
      ) :
      React.createElement('p', { className: 'text-center mt-4 text-gray-500' }, 'Ingen logs')
  );
}
