import React, { useState, useEffect } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Mic, Camera as CameraIcon } from 'lucide-react';
import { Card } from './ui/card.js';
import { Textarea } from './ui/textarea.js';
import SectionTitle from './SectionTitle.jsx';
import { db, getDoc, doc, updateDoc } from '../firebase.js';

export default function ProfileSettings({ userId, ageRange, onChangeAgeRange, publicView = false }) {
  const [profile,setProfile]=useState(null);
  useEffect(()=>{if(!userId)return;getDoc(doc(db,'profiles',userId)).then(s=>s.exists()&&setProfile({id:s.id,...s.data()}));},[userId]);
  if(!profile) return React.createElement('p', null, 'Indlæser profil...');

  const saveChanges = async () => {
    await updateDoc(doc(db,'profiles',userId), { ageRange });
  };

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: `${profile.name}, ${profile.age}` }),
    !publicView && React.createElement(SectionTitle, { title: 'Aldersinterval' }),
    !publicView && React.createElement('div', { className: 'flex flex-col gap-4 mb-4' },
      React.createElement('label', null, `Alder: ${ageRange[0]} - ${ageRange[1]}`),
      React.createElement(Slider, {
        range: true,
        min: 18,
        max: 80,
        value: ageRange,
        onChange: onChangeAgeRange,
        className: 'w-full'
      })
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
      React.createElement(Textarea, { className: 'mb-4', readOnly: true }, profile.clip),
      !publicView && React.createElement('button', {
        className: 'mt-4 bg-pink-500 text-white px-4 py-2 rounded',
        onClick: saveChanges
      }, 'Gem ændringer')
    );
}
