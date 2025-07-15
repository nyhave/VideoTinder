import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { useCollection } from '../firebase.js';

export default function ActiveCallsScreen({ onBack }) {
  const calls = useCollection('calls');
  const profiles = useCollection('profiles');
  const tokens = useCollection('pushTokens');

  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
  const tokensByUser = tokens.reduce((acc, t) => {
    if (!acc[t.userId]) acc[t.userId] = [];
    acc[t.userId].push(t.id);
    return acc;
  }, {});

    const formatName = id => profileMap[id]?.name || id;
    const renderToken = id => tokensByUser[id]?.join(', ') || 'N/A';
    const formatDate = iso => {
      if (!iso) return 'Ukendt';
      try {
        return new Date(iso).toLocaleString('da-DK', {
          dateStyle: 'short',
          timeStyle: 'short'
        });
      } catch {
        return iso;
      }
    };

    const sortedCalls = [...calls].sort((a,b)=> new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, {
      title: 'Aktive opkald',
      colorClass: 'text-blue-600',
      action: React.createElement(Button, { onClick: onBack }, 'Tilbage')
    }),
      sortedCalls.length ? (
        React.createElement('ul', { className: 'space-y-4 mt-4 overflow-y-auto max-h-[70vh]' },
        sortedCalls.map(call => {
          const ids = call.id.split('-');
          const [id1, id2] = ids;
          return React.createElement('li', { key: call.id, className: 'border p-2 rounded' },
            React.createElement('div', null, `${formatName(id1)} (${id1})`),
            React.createElement('div', { className: 'text-xs text-gray-600 break-all' }, 'Token: ' + renderToken(id1)),
            React.createElement('div', { className: 'mt-2' }, `${formatName(id2)} (${id2})`),
            React.createElement('div', { className: 'text-xs text-gray-600 break-all' }, 'Token: ' + renderToken(id2)),
            call.from && React.createElement('div', { className: 'text-xs text-gray-500 mt-1' }, `Startet af: ${formatName(call.from)}`),
            React.createElement('div', { className: 'text-xs text-gray-500' }, 'Startet: ' + formatDate(call.createdAt))
          );
        })
      )
    ) : (
      React.createElement('p', { className: 'text-center mt-4 text-gray-500' }, 'Ingen aktive opkald')
    )
  );
}
