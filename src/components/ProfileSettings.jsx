import React, { useState, useEffect } from 'react';
import { Mic, Camera as CameraIcon } from 'lucide-react';
import { Card } from './ui/card.js';
import { Textarea } from './ui/textarea.js';
import SectionTitle from './SectionTitle.jsx';
import { db, getDoc, doc, updateDoc } from '../firebase.js';

export default function ProfileSettings({ userId, ageRange, onChangeAgeRange }) {
  const [profile,setProfile]=useState(null);
  useEffect(()=>{if(!userId)return;getDoc(doc(db,'profiles',userId)).then(s=>s.exists()&&setProfile({id:s.id,...s.data()}));},[userId]);
  if(!profile) return React.createElement('p', null, 'Indlæser profil...');

  const saveChanges = async () => {
    await updateDoc(doc(db,'profiles',userId), { ageRange });
  };

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: `${profile.name}, ${profile.age}` }),
    React.createElement(SectionTitle, { title: 'Aldersinterval' }),
    React.createElement('div', { className: 'flex flex-col gap-4 mb-4' },
      React.createElement('div', null,
        React.createElement('label', null, `Alder fra: ${ageRange[0]}`),
        React.createElement('input', {
          type: 'range',
          min: '18',
          max: '80',
          value: ageRange[0],
          onChange: e=>onChangeAgeRange([Number(e.target.value),ageRange[1]]),
          className: 'w-full'
        })
      ),
      React.createElement('div', null,
        React.createElement('label', null, `Alder til: ${ageRange[1]}`),
        React.createElement('input', {
          type: 'range',
          min: '18',
          max: '80',
          value: ageRange[1],
          onChange: e=>onChangeAgeRange([ageRange[0],Number(e.target.value)]),
          className: 'w-full'
        })
      )
    ),
    React.createElement(SectionTitle, { title: 'Video-klip' }),
    React.createElement('div', { className: 'flex space-x-4 mb-4' },
      Array.from({length:3}).map((_,i)=>{
        const hasClip=(profile.videoClips||[])[i];
        return React.createElement(CameraIcon,{key:i,className:`w-10 h-10 ${hasClip?'':'opacity-50 text-gray-400'}`});
      })
    ),
    React.createElement(SectionTitle, { title: 'Lyd-klip' }),
    React.createElement('div', { className: 'flex space-x-4 mb-4' },
      Array.from({length:3}).map((_,i)=>{
        const hasClip=(profile.audioClips||[])[i];
        return React.createElement(Mic,{key:i,className:`w-10 h-10 ${hasClip?'':'opacity-50 text-gray-400'}`});
      })
    ),
    React.createElement(SectionTitle, { title: 'Om mig' }),
      React.createElement(Textarea, { readOnly: true }, profile.clip),
      React.createElement('button', {
        className: 'mt-4 bg-pink-500 text-white px-4 py-2 rounded',
        onClick: saveChanges
      }, 'Gem ændringer')
    );
}
