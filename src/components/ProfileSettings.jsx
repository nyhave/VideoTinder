import React, { useState, useEffect, useRef } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Mic, Camera as CameraIcon, User as UserIcon, Heart } from 'lucide-react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Input } from './ui/input.js';
import { Textarea } from './ui/textarea.js';
import SectionTitle from './SectionTitle.jsx';
import VideoPreview from './VideoPreview.jsx';
import { db, storage, getDoc, doc, updateDoc, ref, uploadBytes, getDownloadURL, listAll, deleteObject, useCollection, setDoc, deleteDoc } from '../firebase.js';
import PurchaseOverlay from './PurchaseOverlay.jsx';
import MatchOverlay from './MatchOverlay.jsx';

export default function ProfileSettings({ userId, viewerId = userId, ageRange, onChangeAgeRange, publicView = false, onLogout = () => {} }) {
  const [profile,setProfile]=useState(null);
  const videoRef = useRef();
  const audioRef = useRef();
  const photoRef = useRef();

  const videoRecorder = useRef();
  const audioRecorder = useRef();
  const videoChunks = useRef([]);
  const audioChunks = useRef([]);
  const [videoRecording, setVideoRecording] = useState(false);
  const [audioRecording, setAudioRecording] = useState(false);
  const [replaceTarget, setReplaceTarget] = useState(null); // {field, index}
  const [showSub, setShowSub] = useState(false);
  const [distanceRange, setDistanceRange] = useState([10,25]);
  const likes = useCollection('likes','userId', viewerId);
  const [matchedProfile, setMatchedProfile] = useState(null);

  const handlePurchase = async () => {
    const now = new Date();
    const current = profile.subscriptionExpires ? new Date(profile.subscriptionExpires) : now;
    const base = current > now ? current : now;
    const expiry = new Date(base);
    expiry.setMonth(expiry.getMonth() + 1);
    await updateDoc(doc(db, 'profiles', userId), {
      subscriptionActive: true,
      subscriptionExpires: expiry.toISOString()
    });
    setProfile({ ...profile, subscriptionActive: true, subscriptionExpires: expiry.toISOString() });
    setShowSub(false);
  };

  const toggleLike = async () => {
    const likeId = `${viewerId}-${userId}`;
    const exists = likes.some(l => l.profileId === userId);
    const ref = doc(db, 'likes', likeId);
    if (exists) {
      await deleteDoc(ref);
      await Promise.all([
        deleteDoc(doc(db,'matches',`${viewerId}-${userId}`)),
        deleteDoc(doc(db,'matches',`${userId}-${viewerId}`))
      ]);
    } else {
      await setDoc(ref,{id:likeId,userId:viewerId,profileId:userId});
      const otherLike = await getDoc(doc(db,'likes',`${userId}-${viewerId}`));
      if(otherLike.exists()){
        const m1 = {
          id:`${viewerId}-${userId}`,
          userId:viewerId,
          profileId:userId,
          lastMessage:'',
          unreadByUser:false,
          unreadByProfile:false
        };
        const m2 = {
          id:`${userId}-${viewerId}`,
          userId:userId,
          profileId:viewerId,
          lastMessage:'',
          unreadByUser:false,
          unreadByProfile:false
        };
        await Promise.all([
          setDoc(doc(db,'matches',m1.id),m1),
          setDoc(doc(db,'matches',m2.id),m2)
        ]);
        if(profile) setMatchedProfile(profile);
      }
    }
  };

  useEffect(()=>{if(!userId)return;getDoc(doc(db,'profiles',userId)).then(s=>s.exists()&&setProfile({id:s.id,...s.data()}));},[userId]);
  useEffect(()=>{if(profile && profile.distanceRange) setDistanceRange(profile.distanceRange);},[profile]);
  if(!profile) return React.createElement('p', null, 'Indlæser profil...');

  const subscriptionActive = profile.subscriptionExpires && new Date(profile.subscriptionExpires) > new Date();

  const uploadFile = async (file, field) => {
    if(!file) return;
    const storageRef = ref(storage, `profiles/${userId}/${field}-${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    const updated = [...(profile[field] || []), url];
    await updateDoc(doc(db,'profiles',userId), { [field]: updated });
    setProfile({...profile, [field]: updated});
  };


  const uploadPhoto = async file => {
    if(!file) return;
    const storageRef = ref(storage, `profiles/${userId}/photo-${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await updateDoc(doc(db,'profiles',userId), { photoURL: url });
    setProfile({...profile, photoURL: url});
  };

  const handlePhotoChange = e => uploadPhoto(e.target.files[0]);

  const replaceFile = async (file, field, index) => {
    if(!file) return;
    const storageRef = ref(storage, `profiles/${userId}/${field}-${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    const updated = [...(profile[field] || [])];
    updated[index] = url;
    await updateDoc(doc(db,'profiles',userId), { [field]: updated });
    setProfile({...profile, [field]: updated});
  };

  const deleteFile = async (field, index) => {
    const updated = [...(profile[field] || [])];
    const url = updated[index];
    updated.splice(index, 1);
    await updateDoc(doc(db,'profiles',userId), { [field]: updated });
    setProfile({...profile, [field]: updated});
    if(url){
      try {
        await deleteObject(ref(storage, url));
      } catch(err){
        console.error('Failed to delete file', err);
      }
    }
  };

  const handleVideoChange = e => {
    const file = e.target.files[0];
    if(replaceTarget && replaceTarget.field==='videoClips'){
      replaceFile(file,'videoClips',replaceTarget.index);
      setReplaceTarget(null);
    } else {
      uploadFile(file, 'videoClips');
    }
  };

  const handleAudioChange = e => {
    const file = e.target.files[0];
    if(replaceTarget && replaceTarget.field==='audioClips'){
      replaceFile(file,'audioClips',replaceTarget.index);
      setReplaceTarget(null);
    } else {
      uploadFile(file, 'audioClips');
    }
  };


  const startVideoRecording = async () => {
    if (videoRecording) return;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const recorder = new MediaRecorder(stream);
    videoChunks.current = [];
    recorder.ondataavailable = e => videoChunks.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(videoChunks.current, { type: recorder.mimeType });
      const file = new File([blob], `video-${Date.now()}.webm`, { type: blob.type });
      if(replaceTarget && replaceTarget.field==='videoClips'){
        replaceFile(file,'videoClips',replaceTarget.index);
        setReplaceTarget(null);
      } else {
        uploadFile(file, 'videoClips');
      }
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
      if(replaceTarget && replaceTarget.field==='audioClips'){
        replaceFile(file,'audioClips',replaceTarget.index);
        setReplaceTarget(null);
      } else {
        uploadFile(file, 'audioClips');
      }
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
    await updateDoc(doc(db,'profiles',userId), {
      ageRange,
      interest: profile.interest || 'Mand',
      city: profile.city || '',
      distanceRange
    });
  };

  const recoverMissing = async () => {
    const profileRef = doc(db, 'profiles', userId);
    const snap = await getDoc(profileRef);
    if (!snap.exists()) return;
    let { photoURL = '', audioClips = [], videoClips = [] } = snap.data();
    const listRef = ref(storage, `profiles/${userId}`);
    const { items } = await listAll(listRef);
    const updates = {};
    for (const item of items) {
      const url = await getDownloadURL(item);
      const name = item.name;
      if (name.startsWith('photo-')) {
        if (!photoURL) {
          photoURL = url;
          updates.photoURL = url;
        }
      } else if (name.startsWith('videoClips-')) {
        if (!videoClips.includes(url)) {
          videoClips.push(url);
          updates.videoClips = videoClips;
        }
      } else if (name.startsWith('audioClips-')) {
        if (!audioClips.includes(url)) {
          audioClips.push(url);
          updates.audioClips = audioClips;
        }
      }
    }
    if (Object.keys(updates).length) {
      await updateDoc(profileRef, updates);
      setProfile({ ...profile, ...updates });
    }
  };

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement('div', { className:'flex items-center mb-4 gap-4' },
      profile.photoURL ?
        React.createElement('img', { src: profile.photoURL, alt: 'Profil', className:'w-24 h-24 rounded-full object-cover' }) :
        React.createElement('div', { className:'w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center' },
          React.createElement(UserIcon,{ className:'w-12 h-12 text-gray-500' })
        ),
      !publicView && React.createElement('input', {
        type:'file',
        accept:'image/*',
        ref:photoRef,
        onChange:handlePhotoChange,
        className:'hidden'
      }),
      !publicView && React.createElement(Button, {
        className:'ml-4 bg-pink-500 text-white',
        onClick:()=>photoRef.current && photoRef.current.click()
      }, profile.photoURL ? 'Skift billede' : 'Upload billede')
    ),
    React.createElement(SectionTitle, { title: `${profile.name}, ${profile.age}${profile.city ? ', ' + profile.city : ''}` }),
    !publicView && React.createElement('p', { className: 'text-center mb-2' },
      `Interesseret i ${profile.interest === 'Mand' ? 'Mænd' : 'Kvinder'} mellem ${ageRange[0]} og ${ageRange[1]} og i en afstand mellem ${distanceRange[0]} og ${distanceRange[1]} km`
    ),
    !publicView && React.createElement('div', { className: 'flex flex-col gap-4 mb-4' },
      React.createElement('label', null, 'By'),
      React.createElement(Input, {
        value: profile.city || '',
        onChange: e => setProfile({ ...profile, city: e.target.value }),
        className: 'border p-2 rounded'
      }),
      React.createElement(SectionTitle, { title: 'Interesseret i' }),
      React.createElement('select', {
        value: profile.interest || 'Mand',
        onChange: e => setProfile({ ...profile, interest: e.target.value }),
        className: 'border p-2 rounded'
      },
        React.createElement('option', { value: 'Mand' }, 'Mænd'),
        React.createElement('option', { value: 'Kvinde' }, 'Kvinder')
      ),
      React.createElement('label', { className: 'mt-2' }, `Alder: ${ageRange[0]} - ${ageRange[1]}`),
      React.createElement(Slider, {
        range: true,
        min: 18,
        max: 80,
        value: ageRange,
        onChange: onChangeAgeRange,
        className: 'w-full'
      }),
      React.createElement('label', { className: 'mt-2' }, `Afstand: ${distanceRange[0]} - ${distanceRange[1]} km`),
      React.createElement(Slider, {
        range: true,
        min: 0,
        max: 100,
        value: distanceRange,
        onChange: setDistanceRange,
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
    React.createElement('div', { className: 'flex flex-col gap-2 mb-4' },
      (profile.videoClips || []).map((url,i) =>
        React.createElement('div', { key: i, className:'flex flex-col mb-2' },
          React.createElement(VideoPreview, { src: url }),
          !publicView && React.createElement(Button, {
            className:'mt-1 bg-pink-500 text-white',
            onClick:()=>deleteFile('videoClips', i)
          }, 'Slet')
        )
      )
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
    React.createElement('div', { className: 'flex flex-col gap-2 mb-4' },
      (profile.audioClips || []).map((url,i) =>
        React.createElement('div', { key: i, className:'flex flex-col mb-2' },
          React.createElement('audio', {
            src: url,
            controls: true,
            className: 'w-full'
          }),
          !publicView && React.createElement(Button, {
            className:'mt-1 bg-pink-500 text-white',
            onClick:()=>{setReplaceTarget({field:'audioClips',index:i}); audioRef.current && audioRef.current.click();}
          }, 'Erstat')
        )
      )
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
    publicView && React.createElement(Button, {
        className: 'mb-4 bg-pink-500 text-white flex items-center gap-1',
        onClick: toggleLike
      },
        React.createElement(Heart, { className: 'w-5 h-5' }),
        likes.some(l=>l.profileId===userId) ? 'Unlike' : 'Like'
      ),
    !publicView && React.createElement('button', {
        className: 'mt-4 bg-pink-500 text-white px-4 py-2 rounded',
        onClick: saveChanges
      }, 'Gem ændringer'),
    !publicView && React.createElement(Button, {
        className: 'mt-2 bg-blue-500 text-white w-full',
        onClick: recoverMissing
      }, 'Hent mistet fra DB'),
    !publicView && profile.subscriptionExpires && React.createElement('p', {
        className: 'text-center text-sm mt-2 ' + (subscriptionActive ? 'text-green-600' : 'text-red-500')
      }, subscriptionActive
        ? `Abonnement aktivt til ${new Date(profile.subscriptionExpires).toLocaleDateString('da-DK')}`
        : `Abonnement udløb ${new Date(profile.subscriptionExpires).toLocaleDateString('da-DK')}`),
    !publicView && !subscriptionActive && React.createElement(Button, {
        className: 'mt-2 w-full bg-pink-500 text-white',
        onClick: () => setShowSub(true)
      }, 'K\u00f8b abonnement'),
    !publicView && React.createElement('button', {
        className: 'mt-2 bg-gray-200 text-gray-700 px-4 py-2 rounded',
        onClick: onLogout
      }, 'Logout'),
    showSub && React.createElement(PurchaseOverlay, {
        title: 'M\u00e5nedligt abonnement',
        price: '59 kr/md',
        onClose: () => setShowSub(false),
        onBuy: handlePurchase
      },
        React.createElement('ul', { className: 'list-disc list-inside text-sm space-y-1' },
          React.createElement('li', null, '🎞️ Flere daglige klip: Se fx 6 i stedet for 3 kandidater om dagen'),
          React.createElement('li', null, '🔁 Se tidligere klip igen ("Fortryd swipe")'),
          React.createElement('li', null, '🧠 Indsigt i hvem der har liket dig'),
          React.createElement('li', null, '📝 Udfoldede profiler – adgang til længere refleksioner, flere videoer'),
          React.createElement('li', null, '🎙️ Profilbooster: Få dit klip vist tidligere på dagen')
        )
      ),
    matchedProfile && React.createElement(MatchOverlay, {
        name: matchedProfile.name,
        onClose: () => setMatchedProfile(null)
      })
    );
}
