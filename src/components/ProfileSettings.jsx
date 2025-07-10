import React, { useState, useEffect, useRef } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Mic, Camera as CameraIcon, User as UserIcon, Trash2 as TrashIcon } from 'lucide-react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Input } from './ui/input.js';
import { Textarea } from './ui/textarea.js';
import SectionTitle from './SectionTitle.jsx';
import VideoPreview from './VideoPreview.jsx';
import { useCollection, db, storage, getDoc, doc, updateDoc, setDoc, deleteDoc, ref, uploadBytes, getDownloadURL, listAll, deleteObject } from '../firebase.js';
import PurchaseOverlay from './PurchaseOverlay.jsx';
import SnapAudioRecorder from "./SnapAudioRecorder.jsx";
import SnapVideoRecorder from "./SnapVideoRecorder.jsx";
import MatchOverlay from './MatchOverlay.jsx';

export default function ProfileSettings({ userId, ageRange, onChangeAgeRange, publicView = false, onLogout = () => {}, viewerId, onBack }) {
  const [profile,setProfile]=useState(null);
  const videoRef = useRef();
  const audioRef = useRef();
  const photoRef = useRef();

  const [showSnapRecorder, setShowSnapRecorder] = useState(false);
  const [showSnapVideoRecorder, setShowSnapVideoRecorder] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [distanceRange, setDistanceRange] = useState([10,25]);
  const currentUserId = viewerId || userId;
  const likes = useCollection('likes','userId', currentUserId);
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

  useEffect(()=>{if(!userId)return;getDoc(doc(db,'profiles',userId)).then(s=>s.exists()&&setProfile({id:s.id,...s.data()}));},[userId]);
  useEffect(()=>{if(profile && profile.distanceRange) setDistanceRange(profile.distanceRange);},[profile]);
  if(!profile) return React.createElement('p', null, 'Indlæser profil...');

  const subscriptionActive = profile.subscriptionExpires && new Date(profile.subscriptionExpires) > new Date();

  const maxVideos = (profile.videoClips || []).length >= 3;
  const maxAudios = (profile.audioClips || []).length >= 3;

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

  // Allow a small tolerance when validating clip length because the
  // MediaRecorder output can be slightly longer than the requested
  // duration due to encoding overhead.
  const checkDuration = file => new Promise(resolve => {
    const el = document.createElement(
      file.type.startsWith('audio') ? 'audio' : 'video'
    );
    el.preload = 'metadata';
    el.src = URL.createObjectURL(file);
    el.onloadedmetadata = () => {
      URL.revokeObjectURL(el.src);
      const max = 10.5; // accept files up to ~0.5s over the 10s limit
      resolve(el.duration <= max);
    };
    el.onerror = () => {
      URL.revokeObjectURL(el.src);
      resolve(true);
    };
  });

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

  const handleVideoChange = async e => {
    const file = e.target.files[0];
    if(!file) return;
    if(!(await checkDuration(file))){
      alert('Video må højest være 10 sekunder');
      return;
    }
    uploadFile(file, 'videoClips');
  };

  const handleAudioChange = async e => {
    const file = e.target.files[0];
    if(!file) return;
    if(!(await checkDuration(file))){
      alert('Lydklip må højest være 10 sekunder');
      return;
    }
    uploadFile(file, 'audioClips');
  };

  const handleAgeRangeChange = async range => {
    onChangeAgeRange(range);
    await updateDoc(doc(db,'profiles',userId), { ageRange: range });
  };

  const handleSnapRecorded = async file => {
    if(!(await checkDuration(file))){
      alert("Lydklip må højest være 10 sekunder");
      return;
    }
    setShowSnapRecorder(false);
    uploadFile(file, "audioClips");
  };

  const handleVideoRecorded = async file => {
    if(!(await checkDuration(file))){
      alert('Video må højest være 10 sekunder');
      return;
    }
    setShowSnapVideoRecorder(false);
    uploadFile(file, 'videoClips');
  };


  const handleCityChange = async e => {
    const city = e.target.value;
    setProfile({ ...profile, city });
    await updateDoc(doc(db,'profiles',userId), { city });
  };

  const handleInterestChange = async e => {
    const interest = e.target.value;
    setProfile({ ...profile, interest });
    await updateDoc(doc(db,'profiles',userId), { interest });
  };

  const handleDistanceRangeChange = async range => {
    setDistanceRange(range);
    await updateDoc(doc(db,'profiles',userId), { distanceRange: range });
  };

  const handleClipChange = async e => {
    const clip = e.target.value;
    setProfile({ ...profile, clip });
    await updateDoc(doc(db,'profiles',userId), { clip });
  };

  const toggleLike = async () => {
    const likeId = `${currentUserId}-${userId}`;
    const exists = likes.some(l => l.profileId === userId);
    const ref = doc(db,'likes',likeId);
    if(exists){
      await deleteDoc(ref);
      await Promise.all([
        deleteDoc(doc(db,'matches',`${currentUserId}-${userId}`)),
        deleteDoc(doc(db,'matches',`${userId}-${currentUserId}`))
      ]);
    } else {
      await setDoc(ref,{id:likeId,userId:currentUserId,profileId:userId});
      const otherLike = await getDoc(doc(db,'likes',`${userId}-${currentUserId}`));
      if(otherLike.exists()){
        const m1 = {
          id:`${currentUserId}-${userId}`,
          userId:currentUserId,
          profileId:userId,
          lastMessage:'',
          unreadByUser:false,
          unreadByProfile:false
        };
        const m2 = {
          id:`${userId}-${currentUserId}`,
          userId:userId,
          profileId:currentUserId,
          lastMessage:'',
          unreadByUser:false,
          unreadByProfile:false
        };
        await Promise.all([
          setDoc(doc(db,'matches',m1.id),m1),
          setDoc(doc(db,'matches',m2.id),m2)
        ]);
        setMatchedProfile(profile);
      }
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

  const videoSection = React.createElement(React.Fragment, null,
    React.createElement(SectionTitle, { title: 'Video-klip' }),
    React.createElement('div', { className: 'flex items-center gap-4 mb-4 justify-between' },
      Array.from({ length: 3 }).map((_, i) => {
        const url = (profile.videoClips || [])[i];
        return React.createElement('div', { key: i, className: 'w-[30%] flex flex-col items-center justify-center' },
          url
            ? React.createElement(VideoPreview, { src: url })
            : React.createElement(CameraIcon, {
                className: `w-10 h-10 ${!publicView ? 'text-pink-500 cursor-pointer' : 'text-gray-400'}`,
                onClick: !publicView ? () => {
                  if (videoRef.current) videoRef.current.click();
                } : undefined
              }),
          url && !publicView && React.createElement(Button, {
            className: 'mt-1 bg-pink-500 text-white p-1 rounded-full flex items-center justify-center',
            onClick: () => deleteFile('videoClips', i)
          }, React.createElement(TrashIcon, { className: 'w-4 h-4' }))
        );
      })
    ),
    !publicView && React.createElement(React.Fragment, null,
      React.createElement('input', {
        type: 'file',
        accept: 'video/*',
        ref: videoRef,
        onChange: handleVideoChange,
        className: 'hidden'
      }),
      React.createElement('div', { className:'flex gap-2 mb-4' },
        React.createElement(Button, {
          className: `${maxVideos ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-pink-500 text-white'}`,
          onClick: () => {
            if(!maxVideos && videoRef.current) videoRef.current.click();
          },
          disabled: maxVideos
        }, 'Upload video'),
        React.createElement(Button, {
          className: `${maxVideos ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-pink-500 text-white'}`,
          onClick: () => { if(!maxVideos) setShowSnapVideoRecorder(true); },
          disabled: maxVideos
        }, React.createElement(CameraIcon, { className:'w-4 h-4' }))
      ),
      showSnapVideoRecorder && React.createElement(SnapVideoRecorder, { onCancel: () => setShowSnapVideoRecorder(false), onRecorded: handleVideoRecorded }),
    )
  );

  const audioClips = profile.audioClips || [];
  const remainingAudios = Math.max(0, 3 - audioClips.length);

  const audioSection = React.createElement(React.Fragment, null,
    React.createElement(SectionTitle, { title: 'Lyd-klip' }),
    React.createElement('div', { className: 'space-y-2 mb-4' },
      audioClips.map((url, i) =>
        React.createElement('div', { key: i, className: 'flex items-center' },
          React.createElement('audio', { src: url, controls: true, className: 'flex-1 mr-2' }),
          !publicView && React.createElement(Button, {
            className: 'ml-2 bg-pink-500 text-white p-1 rounded w-[20%] flex items-center justify-center',
            onClick: () => deleteFile('audioClips', i)
          }, React.createElement(TrashIcon, { className: 'w-4 h-4' }))
        )
      )
    ),
    remainingAudios > 0 && React.createElement('div', { className: 'flex gap-4 justify-center mb-4' },
      Array.from({ length: remainingAudios }).map((_, i) =>
        React.createElement(Mic, { key: i, className: 'w-8 h-8 text-gray-400' })
      )
    ),
    !publicView && React.createElement(React.Fragment, null,
      React.createElement('input', {
        type: 'file',
        accept: 'audio/*',
        ref: audioRef,
        onChange: handleAudioChange,
        className: 'hidden'
      }),
      React.createElement(Button, {
        className: `mb-2 flex items-center justify-center ${maxAudios ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-pink-500 text-white'}`,
        onClick: () => { if(!maxAudios) setShowSnapRecorder(true); },
        disabled: maxAudios
      }, React.createElement(Mic, { className: 'w-4 h-4' })),
      showSnapRecorder && React.createElement(SnapAudioRecorder, { onCancel: () => setShowSnapRecorder(false), onRecorded: handleSnapRecorded })
    )
  );

  return React.createElement(React.Fragment, null,
    React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
      !publicView && React.createElement('button', {
        className: 'mb-4 bg-gray-200 text-gray-700 px-4 py-2 rounded',
        onClick: onLogout
      }, 'Logout'),
      publicView && onBack && React.createElement(Button, { className: 'mb-4 bg-pink-500 text-white', onClick: onBack }, 'Tilbage'),
      React.createElement('div', { className:'flex items-center mb-4 gap-4' },
        profile.photoURL ?
          React.createElement('img', { src: profile.photoURL, alt: 'Profil', className:'w-24 h-24 rounded object-cover' }) :
          React.createElement('div', { className:'w-24 h-24 rounded bg-gray-200 flex items-center justify-center' },
            React.createElement(UserIcon,{ className:'w-12 h-12 text-gray-500' })
          ),
        publicView && React.createElement(Button, {
          className: 'ml-auto bg-pink-500 text-white',
          onClick: toggleLike
        }, likes.some(l=>l.profileId===userId) ? 'Unmatch' : 'Match'),
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
      !publicView && profile.subscriptionExpires && React.createElement('p', {
        className: 'text-center text-sm mt-2 ' + (subscriptionActive ? 'text-green-600' : 'text-red-500')
      }, subscriptionActive
        ? `Premium abonnement aktivt til ${new Date(profile.subscriptionExpires).toLocaleDateString('da-DK')}`
        : `Premium abonnement udløb ${new Date(profile.subscriptionExpires).toLocaleDateString('da-DK')}`)
    ),
    React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' }, videoSection),
    React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' }, audioSection),
    !publicView && React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
      React.createElement(SectionTitle, { title: 'Interesseret i' }),
        React.createElement('select', {
          value: profile.interest || 'Mand',
          onChange: handleInterestChange,
          className: 'border p-2 rounded block mb-2'
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
        onChange: handleAgeRangeChange,
        className: 'w-full'
      }),
      React.createElement('label', { className: 'mt-2' }, `Afstand: ${distanceRange[0]} - ${distanceRange[1]} km`),
      React.createElement(Slider, {
        range: true,
        min: 0,
        max: 100,
        value: distanceRange,
        onChange: handleDistanceRangeChange,
        className: 'w-full'
      })
    ),
    React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
      !publicView && React.createElement(React.Fragment, null,
        React.createElement('label', null, 'By'),
        React.createElement(Input, {
          value: profile.city || '',
          onChange: handleCityChange,
          className: 'border p-2 rounded'
        })
      ),
      React.createElement(SectionTitle, { title: 'Om mig' }),
      React.createElement(Textarea, {
        className: 'mb-4',
        readOnly: publicView,
        value: profile.clip || '',
        onChange: publicView ? undefined : handleClipChange
      })
    ),
    !publicView && React.createElement(Button, {
        className: 'mt-2 bg-blue-500 text-white w-full',
        onClick: recoverMissing
      }, 'Hent mistet fra DB'),
    !publicView && !subscriptionActive && React.createElement(Button, {
        className: 'mt-2 w-full bg-pink-500 text-white',
        onClick: () => setShowSub(true)
      }, 'Køb abonnement'),
    showSub && React.createElement(PurchaseOverlay, {
        title: 'Månedligt abonnement',
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
