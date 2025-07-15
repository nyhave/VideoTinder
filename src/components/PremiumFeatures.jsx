import React from 'react';
import { getAge } from '../utils.js';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { useCollection } from '../firebase.js';
import { User as UserIcon } from 'lucide-react';

export default function PremiumFeatures({ userId, onBack, onSelectProfile }) {
  const likes = useCollection('likes', 'profileId', userId);
  const profiles = useCollection('profiles');
  const likedProfiles = profiles.filter(p => likes.some(l => l.userId === p.id));

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: 'Premium', colorClass: 'text-yellow-600' }),
    React.createElement(Button, { className: 'mb-4 bg-yellow-500 text-white', onClick: onBack }, 'Tilbage'),
    React.createElement('p', { className: 'mb-4 text-sm text-gray-700' }, 'Her er profiler der har liket dig:'),
    React.createElement('ul', { className: 'space-y-4' },
      likedProfiles.length ? likedProfiles.map(p => (
        React.createElement('li', {
          key: p.id,
          className: 'flex items-center gap-4 bg-yellow-50 p-2 rounded cursor-pointer',
          onClick: () => onSelectProfile(p.id)
        },
          React.createElement('div', { className:'flex flex-col items-center' },
            p.photoURL ?
              React.createElement('img', { src: p.photoURL, className: 'w-10 h-10 rounded object-cover' }) :
              React.createElement(UserIcon, { className: 'w-10 h-10 text-yellow-500' }),
            p.verified && React.createElement('span', { className:'text-green-600 text-xs' }, 'Verified')
          ),
          React.createElement('span', null, `${p.name} (${p.birthday ? getAge(p.birthday) : p.age})`)
        )
      )) :
        React.createElement('li', { className: 'text-gray-500 text-center' }, 'Ingen har liket dig endnu')
    )
  );
}
