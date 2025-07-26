import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { useCollection } from '../firebase.js';
import { useT } from '../i18n.js';

export default function MatchLogScreen({ onBack }) {
  const matches = useCollection('matches');
  const profiles = useCollection('profiles');
  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
  const t = useT();

  const uniqueMatches = matches
    .filter(m => m.userId < m.profileId)
    .sort((a, b) => a.id.localeCompare(b.id));

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: t('matchLogTitle'), colorClass: 'text-blue-600', action: React.createElement(Button, { onClick: onBack }, t('back')) }),
    uniqueMatches.length ?
      React.createElement('ul', { className: 'space-y-2 mt-4 overflow-y-auto max-h-[70vh]' },
        uniqueMatches.map(m =>
          React.createElement('li', { key: m.id }, `${profileMap[m.userId]?.name || m.userId} ❤️ ${profileMap[m.profileId]?.name || m.profileId}`)
        )
      ) :
      React.createElement('p', { className: 'text-center mt-4 text-gray-500' }, 'Ingen matches')
  );
}
