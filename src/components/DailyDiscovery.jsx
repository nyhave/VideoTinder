import React, { useState, useEffect } from 'react';
import { User, PlayCircle, Heart } from 'lucide-react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { useCollection, db, doc, setDoc, deleteDoc } from '../firebase.js';
import PurchaseOverlay from './PurchaseOverlay.jsx';

export default function DailyDiscovery({ userId, onSelectProfile, ageRange }) {
  const profiles = useCollection('profiles');
  const user = profiles.find(p => p.id === userId) || {};
  const interest = user.interest;
  const allClips = useCollection('clips', 'gender', interest);
  const limit = user.subscriptionActive ? 6 : 3;
  const filtered = allClips.filter(c => {
    const profile = profiles.find(p => p.id === c.profileId);
    return profile && profile.age >= ageRange[0] && profile.age <= ageRange[1];
  }).slice(0, limit);
  const nameMap = Object.fromEntries(profiles.map(p => [p.id, p.name]));
  const likes = useCollection('likes','userId',userId);

  const [hoursUntil, setHoursUntil] = useState(0);
  const [showPurchase, setShowPurchase] = useState(false);
  const toggleLike = async profileId => {
    const likeId = `${userId}-${profileId}`;
    const exists = likes.some(l => l.profileId === profileId);
    const ref = doc(db,'likes',likeId);
    if(exists){
      await deleteDoc(ref);
    } else {
      await setDoc(ref,{id:likeId,userId,profileId});
    }
  };
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
          className: 'p-4 bg-pink-50 rounded-lg cursor-pointer shadow flex flex-col relative',
          onClick: () => onSelectProfile(c.profileId)
        },
          likes.some(l=>l.profileId===c.profileId) &&
            React.createElement(Heart,{className:'w-6 h-6 text-pink-500 absolute top-2 right-2'}),
          React.createElement('div', { className: 'flex items-center gap-4 mb-2' },
            (profiles.find(p=>p.id===c.profileId)?.photoURL ?
              React.createElement('img', { src: profiles.find(p=>p.id===c.profileId)?.photoURL, className: 'w-10 h-10 rounded-full object-cover' }) :
              React.createElement(User, { className: 'w-10 h-10 text-pink-500' })
            ),
            React.createElement('div', null,
              React.createElement('p', { className: 'font-medium' }, `${nameMap[c.profileId]} (${profiles.find(p=>p.id===c.profileId)?.age})`),
              c.text && React.createElement('p', { className: 'text-sm text-gray-500' }, `“${c.text}”`)
            )
          ),
          React.createElement('div', { className: 'flex gap-2 mt-2' },
            React.createElement(Button, { size: 'sm', variant: 'outline', className: 'flex items-center gap-1' },
              React.createElement(PlayCircle, { className: 'w-5 h-5' }), 'Afspil'
            ),
            React.createElement(Button, {
              size: 'sm',
              className: 'bg-pink-500 text-white flex items-center gap-1',
              onClick: e => {e.stopPropagation(); toggleLike(c.profileId);}
            },
              React.createElement(Heart, { className: 'w-5 h-5' }),
              likes.some(l=>l.profileId===c.profileId) ? 'Unlike' : 'Like'
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
