import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { useCollection } from '../firebase.js';
import { useT } from '../i18n.js';

export default function ActiveGroupCallsScreen({ onBack }) {
  const groups = useCollection('realetten');
  const profiles = useCollection('profiles');
  const t = useT();

  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));

  const formatName = id => profileMap[id]?.name || id;

  const activeGroups = groups.filter(g => (g.participants || []).length);
  const sortedGroups = [...activeGroups].sort((a,b)=> (b.participants?.length||0) - (a.participants?.length||0));

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, {
      title: t('groupCallsTitle'),
      colorClass: 'text-blue-600',
      action: React.createElement(Button, { onClick: onBack }, t('back'))
    }),
    sortedGroups.length ? (
      React.createElement('ul', { className: 'space-y-4 mt-4 overflow-y-auto max-h-[70vh]' },
        sortedGroups.map(g => (
          React.createElement('li', { key: g.id, className: 'border p-2 rounded' },
            React.createElement('div', { className: 'font-bold' }, g.interest || g.id),
            React.createElement('div', { className: 'mt-2 text-sm' }, (g.participants || []).map(formatName).join(', '))
          )
        ))
      )
    ) : (
      React.createElement('p', { className: 'text-center mt-4 text-gray-500' }, 'Ingen aktive opkald')
    )
  );
}
