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

  const videoRecorder = useRef();
  const audioRecorder = useRef();
  const videoChunks = useRef([]);
  const audioChunks = useRef([]);
  const [videoRecording, setVideoRecording] = useState(false);
  const [audioRecording, setAudioRecording] = useState(false);

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


  const startVideoRecording = async () => {
    if (videoRecording) return;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const recorder = new MediaRecorder(stream);
    videoChunks.current = [];
    recorder.ondataavailable = e => videoChunks.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(videoChunks.current, { type: recorder.mimeType });
      const file = new File([blob], `video-${Date.now()}.webm`, { type: blob.type });
      uploadFile(file, 'videoClips');
      stream.getTracks().forEach(t => t.stop());
    };
    videoRecorder.current = recorder;
    recorder.start();
    setVideoRecording(true);
  };

  const stopVideoRecording = () => {
    if (videoRecorder.current && videoRecording) {
      videoRecorder.current.stop();
      setVideoRecording(false);
    }
  };

  const startAudioRecording = async () => {
    if (audioRecording) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    audioChunks.current = [];
    recorder.ondataavailable = e => audioChunks.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(audioChunks.current, { type: recorder.mimeType });
      const file = new File([blob], `audio-${Date.now()}.webm`, { type: blob.type });
      uploadFile(file, 'audioClips');
      stream.getTracks().forEach(t => t.stop());
    };
    audioRecorder.current = recorder;
    recorder.start();
    setAudioRecording(true);
  };

  const stopAudioRecording = () => {
    if (audioRecorder.current && audioRecording) {
      audioRecorder.current.stop();
      setAudioRecording(false);
    }
  };

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
        capture:'environment',
        ref:videoRef,
        onChange:handleVideoChange,
        className:'hidden'
      }),
      React.createElement(Button, {
        className:'mb-4 bg-pink-500 text-white',
        onClick:()=>videoRef.current && videoRef.current.click()
      }, 'Upload video'),
      React.createElement(Button, {
        className:'mb-4 ml-2 bg-pink-500 text-white',
        onClick:()=> videoRecording ? stopVideoRecording() : startVideoRecording()
      }, videoRecording ? 'Stop optagelse' : 'Optag video')

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
        capture:'user',
        ref:audioRef,
        onChange:handleAudioChange,
        className:'hidden'
      }),
      React.createElement(Button, {
        className:'mb-4 bg-pink-500 text-white',
        onClick:()=>audioRef.current && audioRef.current.click()
      }, 'Upload lyd'),
      React.createElement(Button, {
        className:'mb-4 ml-2 bg-pink-500 text-white',
        onClick:()=> audioRecording ? stopAudioRecording() : startAudioRecording()
      }, audioRecording ? 'Stop optagelse' : 'Optag lyd')
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
