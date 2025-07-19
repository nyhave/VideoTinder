import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { useCollection } from '../firebase.js';

function formatDate(iso){
  if(!iso) return 'Ukendt';
  try{
    return new Date(iso).toLocaleString('da-DK',{ dateStyle:'short', timeStyle:'short' });
  }catch{
    return iso;
  }
}

export default function RecentLoginsScreen({ onBack }){
  const profiles = useCollection('profiles');
  const sorted = profiles
    .filter(p => p.lastActive)
    .sort((a,b)=> new Date(b.lastActive) - new Date(a.lastActive));
  const [showAll, setShowAll] = useState(false);
  const list = showAll ? sorted : sorted.slice(0,10);

  return React.createElement(Card,{ className:'p-6 m-4 shadow-xl bg-white/90 overflow-y-auto max-h-[90vh]' },
    React.createElement(SectionTitle,{ title:'Seneste logins', colorClass:'text-blue-600', action: React.createElement(Button,{onClick:onBack},'Tilbage') }),
    list.length ? (
      React.createElement('ul',{ className:'space-y-2 mt-4' },
        list.map(p=>React.createElement('li',{ key:p.id, className:'border-b pb-1 text-sm' },
          React.createElement('div',null,p.name || p.id),
          React.createElement('div',{ className:'text-xs text-gray-500' }, formatDate(p.lastActive))
        ))
      )
    ) : (
      React.createElement('p',{ className:'text-center mt-4 text-gray-500' },'Ingen aktive brugere')
    ),
    !showAll && sorted.length>10 && React.createElement(Button,{ className:'mt-4 bg-blue-500 text-white px-4 py-2 rounded', onClick:()=>setShowAll(true) },'Vis alle')
  );
}
