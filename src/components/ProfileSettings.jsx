import React, { useState, useEffect, useRef } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Mic, Camera as CameraIcon } from 'lucide-react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Textarea } from './ui/textarea.js';
import SectionTitle from './SectionTitle.jsx';
import { db, storage, getDoc, doc, updateDoc, ref, uploadBytes, getDownloadURL } from '../firebase.js';

export default function ProfileSettings({ userId, ageRange, onChangeAgeRange, publicView = false, onLogout = () => {} }) {
  const [profile,setProfile]=useState(null);
  const videoRef = useRef();
  const audioRef = useRef();
  useEffect(()=>{if(!userId)return;getDoc(doc(db,'profiles',userId)).then(s=>s.exists()&&setProfile({id:s.id,...s.data()}));},[userId]);
  if(!profile) return React.createElement('p', null, 'Indlæser profil...');

  const uploadFile = async (file, field) => {
    if(!file) return;
    const storageRef = ref(storage, `profiles/${userId}/${field}-${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    const updated = [...(profile[field] || []), url];
    await updateDoc(doc(db,'profiles',userId), { [field]: updated });
    setProfile({...profile, [field]: updated});
  };

  const handleVideoChange = e => uploadFile(e.target.files[0], 'videoClips');
  const handleAudioChange = e => uploadFile(e.target.files[0], 'audioClips');

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
    React.createElement('div', { className: 'flex space-x-4 mb-2' },
      Array.from({length:3}).map((_,i)=>{
        const hasClip=(profile.videoClips||[])[i];
        return React.createElement(CameraIcon,{key:i,className:`w-10 h-10 ${hasClip?'text-pink-500':'opacity-50 text-gray-400'}`});
      })
    ),
    !publicView && React.createElement(React.Fragment, null,
      React.createElement('input', {
        type:'file',
        accept:'video/*',
        ref:videoRef,
        onChange:handleVideoChange,
        className:'hidden'
      }),
      React.createElement(Button, {
        className:'mb-4 bg-pink-500 text-white',
        onClick:()=>videoRef.current && videoRef.current.click()
      }, 'Upload video')
    ),
    React.createElement(SectionTitle, { title: 'Lyd-klip' }),
    React.createElement('div', { className: 'flex space-x-4 mb-2' },
      Array.from({length:3}).map((_,i)=>{
        const hasClip=(profile.audioClips||[])[i];
        return React.createElement(Mic,{key:i,className:`w-10 h-10 ${hasClip?'text-pink-500':'opacity-50 text-gray-400'}`});
      })
    ),
    !publicView && React.createElement(React.Fragment, null,
      React.createElement('input', {
        type:'file',
        accept:'audio/*',
        ref:audioRef,
        onChange:handleAudioChange,
        className:'hidden'
      }),
      React.createElement(Button, {
        className:'mb-4 bg-pink-500 text-white',
        onClick:()=>audioRef.current && audioRef.current.click()
      }, 'Upload lyd')
    ),
    React.createElement(SectionTitle, { title: 'Om mig' }),
      React.createElement(Textarea, { className: 'mb-4', readOnly: true }, profile.clip),
    !publicView && React.createElement('button', {
        className: 'mt-4 bg-pink-500 text-white px-4 py-2 rounded',
        onClick: saveChanges
      }, 'Gem ændringer'),
    !publicView && React.createElement('button', {
        className: 'mt-2 bg-gray-200 text-gray-700 px-4 py-2 rounded',
        onClick: onLogout
      }, 'Logout')
    );
}
