import React, { useState, useEffect } from 'react';
import { User, PlayCircle, Heart } from 'lucide-react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { useCollection } from '../firebase.js';
import PurchaseOverlay from './PurchaseOverlay.jsx';

export default function DailyDiscovery({ userId, onSelectProfile, ageRange }) {
  const profiles = useCollection('profiles');
  const user = profiles.find(p => p.id === userId) || {};
  const interest = user.interest;
  const allClips = useCollection('clips', 'gender', interest);
  const filtered = allClips.filter(c => {
    const profile = profiles.find(p => p.id === c.profileId);
    return profile && profile.age >= ageRange[0] && profile.age <= ageRange[1];
  }).slice(0, 3);
  const nameMap = Object.fromEntries(profiles.map(p => [p.id, p.name]));

  const [hoursUntil, setHoursUntil] = useState(0);
  const [showPurchase, setShowPurchase] = useState(false);
  useEffect(() => {
    const now = new Date();
    const next = new Date(now);
    next.setDate(now.getDate() + 1);
    next.setHours(0,0,0,0);
    setHoursUntil(Math.ceil((next - now) / 3600000));
  }, []);

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: 'Dagens klip' }),
    React.createElement('p', { className: 'text-center text-gray-500 mb-4' }, `Nye klip om ${hoursUntil} timer`),
    React.createElement('p', { className: 'text-center text-gray-500 mb-4' }, `Tag dig god tid til at lytte til og se dagens klip`),
    React.createElement('ul', { className: 'space-y-4' },
      filtered.length ? filtered.map(c => (
        React.createElement('li', {
          key: c.id,
          className: 'p-4 bg-pink-50 rounded-lg cursor-pointer shadow flex flex-col',
          onClick: () => onSelectProfile(c.profileId)
        },
          React.createElement('div', { className: 'flex items-center gap-4 mb-2' },
            React.createElement(User, { className: 'w-10 h-10 text-pink-500' }),
            React.createElement('div', null,
              React.createElement('p', { className: 'font-medium' }, `${nameMap[c.profileId]} (${profiles.find(p=>p.id===c.profileId)?.age})`),
              c.text && React.createElement('p', { className: 'text-sm text-gray-500' }, `“${c.text}”`)
            )
          ),
          React.createElement('div', { className: 'flex gap-2 mt-2' },
            React.createElement(Button, { size: 'sm', variant: 'outline', className: 'flex items-center gap-1' },
              React.createElement(PlayCircle, { className: 'w-5 h-5' }), 'Afspil'
            ),
            React.createElement(Button, { size: 'sm', className: 'bg-pink-500 text-white flex items-center gap-1' },
              React.createElement(Heart, { className: 'w-5 h-5' }), 'Like'
            )
          )
        )
      )) :
        React.createElement('li', { className: 'text-center text-gray-500' }, 'Ingen profiler fundet')
    ),
    React.createElement(Button, {
      className: 'mt-4 w-full bg-pink-500 text-white',
      onClick: () => setShowPurchase(true)
    }, 'Hent flere...'),
    showPurchase && React.createElement(PurchaseOverlay, {
      title: 'Flere klip',
      price: '9 kr',
      onClose: () => setShowPurchase(false)
    },
      React.createElement('p', { className: 'text-center text-sm mb-2' }, 'Få 3 ekstra klip i dag')
    )
  );
}
