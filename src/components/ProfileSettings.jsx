import React, { useState, useEffect, useRef } from 'react';
import Slider from 'rc-slider'; // Ensure slider component is available
import 'rc-slider/assets/index.css';
import { Camera as CameraIcon, User as UserIcon, Trash2 as TrashIcon, Pencil as EditIcon, Heart, Flag } from 'lucide-react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Input } from './ui/input.js';
import { Textarea } from './ui/textarea.js';
import SectionTitle from './SectionTitle.jsx';
import VideoPreview from './VideoPreview.jsx';
import ReportOverlay from './ReportOverlay.jsx';
import DeleteAccountOverlay from './DeleteAccountOverlay.jsx';
import { useCollection, useDoc, db, storage, getDoc, doc, updateDoc, setDoc, deleteDoc, ref, uploadBytes, getDownloadURL, listAll, deleteObject, deleteAccount } from '../firebase.js';
import SubscriptionOverlay from './SubscriptionOverlay.jsx';
import InterestsOverlay from './InterestsOverlay.jsx';
import SnapVideoRecorder from "./SnapVideoRecorder.jsx";
import MatchOverlay from './MatchOverlay.jsx';
import { useT } from '../i18n.js';
import { getInterestCategory } from '../interests.js';
import { getAge, getCurrentDate, getMaxVideoSeconds, getMonthlyBoostLimit, hasAdvancedFilters } from '../utils.js';
import PremiumIcon from './PremiumIcon.jsx';
import { triggerHaptic } from '../haptics.js';
import VerificationBadge from './VerificationBadge.jsx';
import { showLocalNotification, sendWebPushToProfile } from '../notifications.js';

export default function ProfileSettings({ userId, ageRange, onChangeAgeRange, publicView = false, onViewPublicProfile = () => {}, onOpenAbout = () => {}, onLogout = null, viewerId = userId, onBack, activeTask, taskTrigger = 0 }) {
  const [profile,setProfile]=useState(null);
  const t = useT();
  const photoRef = useRef();
  const photoSectionRef = useRef();
  const videoSectionRef = useRef();
  const aboutSectionRef = useRef();
  const prevBirthdayRef = useRef('');

  const [showSnapVideoRecorder, setShowSnapVideoRecorder] = useState(false);
  const [recordClipIndex, setRecordClipIndex] = useState(null);
  const [showSub, setShowSub] = useState(false);
  const [showInterests, setShowInterests] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editInfo, setEditInfo] = useState(false);
  const [editInterests, setEditInterests] = useState(false);
  const [editPrefs, setEditPrefs] = useState(false);
  const [editAbout, setEditAbout] = useState(false);
  const profiles = useCollection('profiles');
  const viewerProfile = viewerId ? profiles.find(p => p.id === viewerId) : null;
  const viewerInterests = viewerProfile ? viewerProfile.interests || [] : [];
  const viewerCategories = new Set(viewerInterests.map(getInterestCategory));
  const currentUserId = viewerId || userId;
  const isOwnProfile = viewerId === userId;
  const likes = useCollection('likes','userId', currentUserId);
  const liked = likes.some(l => l.profileId === userId);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [reportMode, setReportMode] = useState(false);
  const [reportItem, setReportItem] = useState(null);
  const [boostCountdown, setBoostCountdown] = useState('');
  const progressId = publicView && viewerId && viewerId !== userId ? `${viewerId}-${userId}` : null;
  const progress = useDoc('episodeProgress', progressId);
  const stage = isOwnProfile ? 3 : (progress?.stage || 1);
  const activeNow = profile?.lastActive
    ? (getCurrentDate().getTime() - new Date(profile.lastActive).getTime()) < 3 * 60 * 60 * 1000
    : false;
  const advancedFilters = hasAdvancedFilters(profile);

  const handlePurchase = async (tier) => {
    const now = getCurrentDate();
    if (tier === 'free') {
      await updateDoc(doc(db, 'profiles', userId), {
        subscriptionActive: false,
        subscriptionPurchased: null,
        subscriptionExpires: null,
        subscriptionTier: 'free'
      });
      setProfile({ ...profile, subscriptionActive: false, subscriptionPurchased: null, subscriptionExpires: null, subscriptionTier: 'free' });
      setShowSub(false);
      return;
    }
    const current = profile.subscriptionExpires ? new Date(profile.subscriptionExpires) : now;
    const base = current > now ? current : now;
    const expiry = new Date(base);
    expiry.setMonth(expiry.getMonth() + 1);
    const month = now.toISOString().slice(0,7);
    await updateDoc(doc(db, 'profiles', userId), {
      subscriptionActive: true,
      subscriptionPurchased: now.toISOString(),
      subscriptionExpires: expiry.toISOString(),
      subscriptionTier: tier,
      boostMonth: month,
      boostsUsed: 0
    });
    setProfile({ ...profile, subscriptionActive: true, subscriptionPurchased: now.toISOString(), subscriptionExpires: expiry.toISOString(), subscriptionTier: tier, boostMonth: month, boostsUsed: 0 });
    setShowSub(false);
  };

  const handleBoost = async () => {
    const now = getCurrentDate();
    if (profile.boostExpires && new Date(profile.boostExpires) > now) {
      window.alert('Boost allerede aktiv');
      return;
    }
    const month = now.toISOString().slice(0, 7);
    const limit = getMonthlyBoostLimit(profile);
    const used = profile.boostMonth === month ? (profile.boostsUsed || 0) : 0;
    if (used >= limit) {
      window.alert('Ingen boosts tilbage denne måned');
      return;
    }
    const expires = new Date(now.getTime() + 30 * 60 * 1000);
    await updateDoc(doc(db, 'profiles', userId), {
      boostExpires: expires.toISOString(),
      boostsUsed: used + 1,
      boostMonth: month
    });
    setProfile({
      ...profile,
      boostExpires: expires.toISOString(),
      boostsUsed: used + 1,
      boostMonth: month
    });
    triggerHaptic();
  };

  useEffect(() => {
    if (!userId) return;
    getDoc(doc(db, 'profiles', userId))
      .then(s => {
        if (s.exists()) {
          setProfile({ id: s.id, ...s.data() });
        } else {
          setProfile(false);
        }
      })
      .catch(err => {
        console.error('Failed to load profile', err);
        setProfile(false);
      });
  }, [userId]);
  useEffect(() => {
    const ref =
      activeTask === 'photo' ? photoSectionRef :
      activeTask === 'video1' || activeTask === 'video2' ? videoSectionRef :
      activeTask === 'about' ? aboutSectionRef : null;
    ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [activeTask, taskTrigger, profile]);
  const subscriptionActive =
    profile?.subscriptionExpires &&
    new Date(profile.subscriptionExpires) > getCurrentDate();
  const boostActive =
    profile?.boostExpires && new Date(profile.boostExpires) > getCurrentDate();
  useEffect(() => {
    let timer;
    if (boostActive && profile?.boostExpires) {
      const updateCountdown = () => {
        const diff = new Date(profile.boostExpires) - getCurrentDate();
        if (diff > 0) {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setBoostCountdown(`${minutes}:${seconds.toString().padStart(2,'0')}`);
        } else {
          setBoostCountdown('');
        }
      };
      updateCountdown();
      timer = setInterval(updateCountdown, 1000);
    } else {
      setBoostCountdown('');
    }
    return () => clearInterval(timer);
  }, [boostActive, profile?.boostExpires]);
  if(profile === null) return React.createElement('div', { className:'mt-8' },
    React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90 h-24 animate-pulse' }),
    React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90 h-32 animate-pulse' }),
    React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90 h-32 animate-pulse' }),
    React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90 h-40 animate-pulse' })
  );

  if(profile === false) return React.createElement('div', { className:'mt-8' },
    React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90 text-center' },
      'Profile not found'
    )
  );
  const boostsLeft = (() => {
    const limit = getMonthlyBoostLimit(profile);
    if (limit === 0) return 0;
    const now = getCurrentDate();
    const month = now.toISOString().slice(0, 7);
    const used = profile.boostMonth === month ? (profile.boostsUsed || 0) : 0;
    return limit - used;
  })();


  const highlightPhoto = activeTask === 'photo';
  const highlightVideo1 = activeTask === 'video1';
  const highlightVideo2 = activeTask === 'video2';
  const highlightAbout = activeTask === 'about';

  const resizeImage = (file, maxSize = 512) => new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width <= maxSize && height <= maxSize) {
        resolve(file);
        return;
      }
      if (width > height) {
        height = Math.round(height * maxSize / width);
        width = maxSize;
      } else {
        width = Math.round(width * maxSize / height);
        height = maxSize;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.85);
    };
    img.src = URL.createObjectURL(file);
  });


  const uploadPhoto = async file => {
    if(!file) return;
    const resized = await resizeImage(file);
    const storageRef = ref(storage, `profiles/${userId}/photo-${Date.now()}.jpg`);
    await uploadBytes(storageRef, resized, { contentType: 'image/jpeg' });
    const url = await getDownloadURL(storageRef);
    const uploadedAt = new Date().toISOString();
    await updateDoc(doc(db,'profiles',userId), { photoURL: url, photoUploadedAt: uploadedAt });
    setProfile({...profile, photoURL: url, photoUploadedAt: uploadedAt});
  };

  const handlePhotoChange = e => uploadPhoto(e.target.files[0]);

  const deletePhoto = async () => {
    if(!profile.photoURL) return;
    const url = profile.photoURL;
    await updateDoc(doc(db,'profiles',userId), { photoURL: '', photoUploadedAt: '' });
    setProfile({ ...profile, photoURL: '', photoUploadedAt: '' });
    try {
      await deleteObject(ref(storage, url));
    } catch(err){
      console.error('Failed to delete photo', err);
    }
  };


  // Allow a small tolerance when validating clip length because the
  // MediaRecorder output can be slightly longer than the requested
  // duration due to encoding overhead.
  const checkDuration = (file, limit) => new Promise(resolve => {
    const el = document.createElement('video');
    el.preload = 'metadata';
    el.src = URL.createObjectURL(file);
    el.onloadedmetadata = () => {
      URL.revokeObjectURL(el.src);
      const max = (limit || 10) + 0.5; // accept files slightly over the limit
      resolve(el.duration <= max);
    };
    el.onerror = () => {
      URL.revokeObjectURL(el.src);
      resolve(true);
    };
  });

  const replaceFile = async (file, field, index, music) => {
    if(!file) return;
    try {
      const storageRef = ref(storage, `profiles/${userId}/${field}-${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      const clip = { url, lang: profile.language || 'en', uploadedAt: new Date().toISOString() };
      if(music){
        const musicRef = ref(storage, `profiles/${userId}/${field}-music-${Date.now()}-${music.name}`);
        await uploadBytes(musicRef, music);
        clip.music = await getDownloadURL(musicRef);
      }
      const updated = [...(profile[field] || [])];
      const targetIndex = Number.isInteger(index) && index >= 0 ? index : updated.length;
      if(targetIndex < updated.length){
        updated[targetIndex] = clip;
      } else {
        updated.push(clip);
      }
      await updateDoc(doc(db,'profiles',userId), { [field]: updated });
      setProfile({...profile, [field]: updated});
    } catch(err){
      console.error('Failed to upload file', err);
      const msg = t('uploadFailed');
      alert(msg !== 'uploadFailed' ? msg : 'Upload failed');
    }
  };

  const deleteFile = async (field, index) => {
    const updated = [...(profile[field] || [])];
    const item = updated[index];
    const url = item && item.url ? item.url : item;
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


  const handleAgeRangeChange = async range => {
    onChangeAgeRange(range);
    await updateDoc(doc(db,'profiles',userId), { ageRange: range });
  };

  const handleVideoRecorded = async (file, music) => {
    const max = getMaxVideoSeconds(profile);
    if(!(await checkDuration(file, max))){
      alert(t('videoTooLong').replace('{seconds}', max));
      return;
    }
    setShowSnapVideoRecorder(false);
    await replaceFile(file, 'videoClips', recordClipIndex, music);
    setRecordClipIndex(null);
  };

  const handleNameChange = async e => {
    const name = e.target.value;
    setProfile({ ...profile, name });
    await updateDoc(doc(db,'profiles',userId), { name });
  };

  const handleBirthdayChange = e => {
    const birthday = e.target.value;
    setProfile({ ...profile, birthday });
  };

  const handleBirthdayFocus = () => {
    prevBirthdayRef.current = profile.birthday || '';
  };

  const handleBirthdayBlur = async e => {
    const birthday = e.target.value;
    if (birthday && getAge(birthday) < 18) {
      alert('Du skal v\u00e6re mindst 18 \u00e5r for at bruge appen');
      setProfile({ ...profile, birthday: prevBirthdayRef.current });
      return;
    }
    const age = birthday ? getAge(birthday) : '';
    await updateDoc(doc(db, 'profiles', userId), { birthday, age });
  };

  const updateNotificationPref = (field, value) => {
    const prefs = { ...(profile.notificationPrefs || {}) };
    if (field.startsWith('types.')) {
      const type = field.split('.')[1];
      prefs.types = { ...(prefs.types || {}), [type]: value };
    } else {
      prefs[field] = value;
    }
    setProfile({ ...profile, notificationPrefs: prefs });
    updateDoc(doc(db,'profiles',userId), { notificationPrefs: prefs });
  };


  const handleCityChange = async e => {
    const city = e.target.value;
    setProfile({ ...profile, city });
    await updateDoc(doc(db,'profiles',userId), { city });
  };

  const handleEmailChange = async e => {
    const email = e.target.value;
    setProfile({ ...profile, email });
    await updateDoc(doc(db,'profiles',userId), { email });
  };

  const handleInterestChange = async e => {
    const interest = e.target.value;
    setProfile({ ...profile, interest });
    await updateDoc(doc(db,'profiles',userId), { interest });
  };

  const handleInterestsChange = async e => {
    const opts = Array.from(e.target.selectedOptions).map(o => o.value);
    setProfile({ ...profile, interests: opts });
    await updateDoc(doc(db,'profiles',userId), { interests: opts });
  };

  const handleRemoveInterest = async interest => {
    const updated = (profile.interests || []).filter(i => i !== interest);
    setProfile({ ...profile, interests: updated });
    await updateDoc(doc(db,'profiles',userId), { interests: updated });
  };

  const handleSaveInterests = async interests => {
    setProfile({ ...profile, interests });
    await updateDoc(doc(db,'profiles',userId), { interests });
  };


  const handleClipChange = async e => {
    const clip = e.target.value;
    setProfile({ ...profile, clip });
    await updateDoc(doc(db,'profiles',userId), { clip });
  };

  const toggleLike = async () => {
    if(isOwnProfile) return;
    const likeId = `${currentUserId}-${userId}`;
    const exists = likes.some(l => l.profileId === userId);
    const ref = doc(db,'likes',likeId);
    if(exists){
      if(!window.confirm('Er du sikker?')) return;
      await deleteDoc(ref);
      await Promise.all([
        deleteDoc(doc(db,'matches',`${currentUserId}-${userId}`)),
        deleteDoc(doc(db,'matches',`${userId}-${currentUserId}`))
      ]);
    } else {
      await setDoc(ref,{id:likeId,userId:currentUserId,profileId:userId});
      triggerHaptic();
      const otherLike = await getDoc(doc(db,'likes',`${userId}-${currentUserId}`));
      if(otherLike.exists()){
        const m1 = {
          id:`${currentUserId}-${userId}`,
          userId:currentUserId,
          profileId:userId,
          lastMessage:'',
          unreadByUser:false,
          unreadByProfile:false,
          newMatch:false
        };
        const m2 = {
          id:`${userId}-${currentUserId}`,
          userId:userId,
          profileId:currentUserId,
          lastMessage:'',
          unreadByUser:false,
          unreadByProfile:false,
          newMatch:true
        };
        await Promise.all([
          setDoc(doc(db,'matches',m1.id),m1),
          setDoc(doc(db,'matches',m2.id),m2)
        ]);
        await setDoc(doc(db,'episodeProgress', `${currentUserId}-${userId}`), { removed: true }, { merge: true });
        setMatchedProfile(profile);
        showLocalNotification('Det er et match!', `Du og ${profile.name} kan lide hinanden`);
        sendWebPushToProfile(userId, 'Det er et match!', `${viewerProfile?.name || 'En person'} har matchet med dig`, false, 'newMatch');
        triggerHaptic([100,50,100]);
      }
    }
  };

  const saveChanges = async () => {
    await updateDoc(doc(db,'profiles',userId), {
      ageRange,
      interest: profile.interest || 'Mand',
      city: profile.city || ''
    });
  };


  const videoSection = React.createElement(React.Fragment, null,
    React.createElement(SectionTitle, {
      title: t('videoClips'),
      action: publicView && !isOwnProfile ? React.createElement(Heart, {
        className: `w-6 h-6 cursor-pointer ${liked ? 'text-pink-500' : 'text-gray-400'}`,
        onClick: toggleLike
      }) : null
    }),
    React.createElement('div', { className: 'flex items-center gap-4 mb-4 justify-between' },
      Array.from({ length: 3 }).map((_, i) => {
        const clip = (profile.videoClips || [])[i];
        const url = clip && clip.url ? clip.url : clip;
        const locked = i >= stage;
        return React.createElement('div', { key: i, className: `w-[30%] flex flex-col items-center justify-end min-h-[160px] relative ${locked ? 'pointer-events-none' : ''} ${ (i===0 && highlightVideo1) || (i===1 && highlightVideo2) ? 'ring-4 ring-green-500' : ''}` },
          url
            ? React.createElement(VideoPreview, { src: url })
            : React.createElement('div', { className:'flex flex-col items-center' },
                React.createElement(CameraIcon, {
                  className: `w-10 h-10 text-gray-400 ${!publicView ? 'cursor-pointer' : ''}`,
                  onClick: !publicView ? () => { setRecordClipIndex(i); setShowSnapVideoRecorder(true); } : undefined
                }),
                React.createElement('span', { className:'text-xs text-gray-500 mt-1' }, t('max10Sec'))
              ),
          locked && React.createElement('div', { className:'absolute inset-0 bg-black/80 flex items-center justify-center rounded text-center px-2' },
            React.createElement('span', { className:'text-pink-500 text-xs font-semibold' }, t('dayLabel').replace('{day}', i + 1))
          ),
          url && !publicView && React.createElement(Button, {
            className: 'mt-1 bg-pink-500 text-white p-1 rounded-full flex items-center justify-center',
            onClick: () => deleteFile('videoClips', i)
          }, React.createElement(TrashIcon, { className: 'w-4 h-4' })),
          url && publicView && reportMode && React.createElement(Flag, {
            className: 'w-5 h-5 text-red-500 absolute top-1 right-1 cursor-pointer',
            onClick: () => setReportItem({ clipURL: url })
          })
        );
      })
    ),
    !publicView && showSnapVideoRecorder && React.createElement(SnapVideoRecorder, { onCancel: () => { setShowSnapVideoRecorder(false); setRecordClipIndex(null); }, onRecorded: handleVideoRecorded, maxDuration: getMaxVideoSeconds(profile)*1000, user: profile, clipIndex: recordClipIndex })
  );


  return React.createElement('div', { className:'mt-8' },
    !publicView && React.createElement(Card, { className: 'p-4 m-4 shadow-xl bg-white/90' },
      React.createElement('div', { className: 'flex items-start justify-between gap-2' },
        React.createElement('div', { className: 'flex flex-col' },
          React.createElement(Button, {
            className: 'bg-gray-200 text-gray-700 px-4 py-2 rounded',
            onClick: onViewPublicProfile
          }, t('viewPublicProfile')),
          boostActive && React.createElement('p', {
            className: 'mt-2 text-sm text-purple-700'
          }, `Boost aktiv${boostCountdown ? ` (${boostCountdown})` : ''}`),
          !boostActive && boostsLeft > 0 && React.createElement(Button, {
            className: 'mt-2 bg-purple-600 text-white',
            onClick: handleBoost
          }, `Boost profil (${boostsLeft} tilbage)`),
          !boostActive && boostsLeft <= 0 && getMonthlyBoostLimit(profile) > 0 && React.createElement('p', {
            className: 'mt-2 text-sm text-gray-500'
          }, 'Ingen boosts tilbage denne måned')
        ),
        onLogout && React.createElement(Button, {
          className: 'bg-gray-200 text-gray-700 px-4 py-2 rounded',
          onClick: onLogout
        }, t('logout'))
      ),
      React.createElement('div', { className: 'mt-4 flex justify-end' },
        React.createElement(Button, {
          className: 'bg-pink-500 text-white',
          onClick: onOpenAbout
        }, t('about'))
      )
    ),
    React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90', ref: photoSectionRef, style: { scrollMarginTop: 'calc(5rem + 1rem)' } },
        React.createElement(SectionTitle, { title: t('yourProfileTitle'), action: !publicView && (
          editInfo ? null :
          React.createElement(EditIcon, {
            className:'w-5 h-5 text-gray-500 cursor-pointer',
            onClick: () => setEditInfo(true)
          })
        ) }),
      publicView && onBack && React.createElement(Button, { className: 'mb-4 bg-pink-500 text-white', onClick: onBack }, 'Tilbage'),
      React.createElement('div', { className:'flex items-center mb-4 gap-4' },
        React.createElement('div', { className:`flex flex-col items-center ${highlightPhoto ? 'ring-4 ring-green-500' : ''}` },
          profile.photoURL ?
            React.createElement('img', {
              src: profile.photoURL,
              alt: 'Profil',
              className:`w-24 h-24 rounded object-cover ${!publicView && editInfo ? 'cursor-pointer' : ''}`,
              onClick: !publicView && editInfo ? () => photoRef.current && photoRef.current.click() : undefined
            }) :
            React.createElement('div', {
              className:`w-24 h-24 rounded bg-gray-200 flex items-center justify-center ${!publicView && editInfo ? 'cursor-pointer' : ''}`,
              onClick: !publicView && editInfo ? () => photoRef.current && photoRef.current.click() : undefined
            },
              React.createElement(UserIcon,{ className:'w-12 h-12 text-gray-500' })
            ),
          profile.verified && React.createElement(VerificationBadge, null)
        ),
        !publicView && editInfo && profile.photoURL && React.createElement(Button, {
          className: 'bg-pink-500 text-white p-1 rounded flex items-center justify-center',
          onClick: deletePhoto
        }, React.createElement(TrashIcon, { className:'w-4 h-4' })),
        !publicView && editInfo && !profile.photoURL && React.createElement(Button, {
          className: 'bg-pink-500 text-white',
          onClick: () => photoRef.current && photoRef.current.click()
        }, 'Upload billede'),
        publicView && !isOwnProfile && React.createElement('div', { className:'relative ml-auto' },
          React.createElement(Button, {
            className: `bg-pink-500 text-white ${stage < 3 ? 'opacity-50 pointer-events-none' : ''}`,
            onClick: stage >= 3 ? toggleLike : undefined
          }, liked ? 'Unmatch' : 'Match'),
          stage < 3 && React.createElement('span', { className:'absolute inset-0 m-auto text-pink-500 text-xs font-semibold flex items-center justify-center text-center px-2' }, t('dayLabel').replace('{day}', 3))
        ),
        publicView && !isOwnProfile && React.createElement(Button, {
          className: 'ml-2 bg-red-500 text-white',
          onClick: () => setReportMode(m => !m)
        }, reportMode ? 'Annuller' : 'Anmeld'),
        !publicView && React.createElement('input', {
          type:'file',
          accept:'image/*',
          ref:photoRef,
          onChange:handlePhotoChange,
          className:'hidden'
        })
      ),
      editInfo ?
        React.createElement('div', { className:'space-y-2 mb-2 w-full' },
          React.createElement('label', { className:'block text-sm font-medium' }, t('firstName')),
          React.createElement(Input, {
            value: profile.name || '',
            onChange: handleNameChange,
            className:'border p-2 rounded w-full',
            placeholder: t('firstName'),
            name:'given-name',
            autoComplete:'given-name'
          }),
          React.createElement('label', { className:'block text-sm font-medium' }, t('birthday')),
          React.createElement(Input, {
            type:'date',
            value: profile.birthday || '',
            onChange: handleBirthdayChange,
            onFocus: handleBirthdayFocus,
            onBlur: handleBirthdayBlur,
            className:'border p-2 rounded w-full',
            placeholder: t('chooseBirthday')
          }),
          React.createElement('label', { className:'block text-sm font-medium' }, t('city')),
          React.createElement(Input, {
            value: profile.city || '',
            onChange: handleCityChange,
            className:'border p-2 rounded w-full',
            placeholder: t('city'),
            name:'city',
            autoComplete:'address-level2'
          }),
          React.createElement('label', { className:'block text-sm font-medium' }, t('email')),
          React.createElement(Input, {
            type:'email',
            value: profile.email || '',
            onChange: handleEmailChange,
            className:'border p-2 rounded w-full',
            placeholder:'you@example.com',
            name:'email',
            autoComplete:'email'
          }),
          React.createElement('p', { className:'text-xs text-gray-500 mt-1 mb-2' }, t('emailPrivate')),
          React.createElement(Button, {
            className:'bg-pink-500 text-white w-full',
            onClick: () => setEditInfo(false)
          }, 'Gem ændringer')
        ) :
        React.createElement('div', { className:'flex items-center justify-between w-full' },
          React.createElement(SectionTitle, {
            title: `${profile.name}, ${profile.birthday ? getAge(profile.birthday) : profile.age}${profile.city ? ', ' + profile.city : ''}`,
            action: publicView && !isOwnProfile && activeNow ? React.createElement('span', { className: 'text-sm text-green-600 font-medium' }, t('activeNow')) : null
          })
        ),
      isOwnProfile && !publicView && !editInfo && profile.email && React.createElement('p', { className:'text-center text-sm text-gray-600 mt-1' }, profile.email)
    ),
    React.createElement(Card, { className: `p-6 m-4 shadow-xl bg-white/90 ${highlightAbout ? 'ring-4 ring-green-500' : ''}`, ref: aboutSectionRef, style: { scrollMarginTop: 'calc(5rem + 1rem)' } },
      React.createElement(SectionTitle, { title: t('aboutMe'), action: !publicView && (editAbout ?
        React.createElement(Button, { className:'bg-pink-500 text-white', onClick: () => setEditAbout(false) }, 'Gem ændringer') :
        React.createElement(EditIcon, { className:'w-5 h-5 text-gray-500 cursor-pointer', onClick: () => setEditAbout(true) }) ) }),
      React.createElement(Textarea, {
        className: `mb-4 ${highlightAbout ? 'ring-4 ring-green-500' : ''}`,
        readOnly: publicView || !editAbout,
        value: profile.clip || '',
        onChange: (publicView || !editAbout) ? undefined : handleClipChange
      }),
      publicView && reportMode && profile.clip && React.createElement(Flag, {
        className: 'w-5 h-5 text-red-500 cursor-pointer ml-auto',
        onClick: () => setReportItem({ text: profile.clip })
      })
    ),
    !publicView && React.createElement(Card, { className:'p-6 m-4 shadow-xl bg-white/90' },
        React.createElement(SectionTitle, { title: t('settings') }),
        profile.subscriptionExpires && React.createElement('p', {
          className: 'text-center text-sm mt-2 flex items-center justify-center gap-1 ' + (subscriptionActive ? 'text-green-600' : 'text-red-500')
        },
          !subscriptionActive && React.createElement(PremiumIcon, null),
          (() => {
            const tierLabel = {
              silver: t('tierSilver'),
              gold: t('tierGold'),
              platinum: t('tierPlatinum')
            }[profile.subscriptionTier] || 'Premium';
            const date = new Date(profile.subscriptionExpires).toLocaleDateString('da-DK');
            return subscriptionActive
              ? `${tierLabel} abonnement aktivt til ${date}`
              : `${tierLabel} abonnement udløb ${date}`;
          })()
        ),
        profile.subscriptionPurchased && React.createElement('p', {
          className: 'text-center text-sm text-gray-500'
        }, `Købt ${new Date(profile.subscriptionPurchased).toLocaleDateString('da-DK')}`),
        subscriptionActive && profile.subscriptionTier === 'platinum' && React.createElement('label', { className:'flex items-center gap-2 mt-2' },
          React.createElement('input', { type:'checkbox', checked: profile.incognito || false, onChange: async e => { const checked = e.target.checked; await updateDoc(doc(db,'profiles', userId), { incognito: checked }); setProfile({ ...profile, incognito: checked }); } }),
          t('incognitoMode')
        )
      ),
    React.createElement(Card, { className: `p-6 m-4 shadow-xl bg-white/90 ${highlightVideo1 || highlightVideo2 ? 'ring-4 ring-green-500' : ''}`, ref: videoSectionRef, style: { scrollMarginTop: 'calc(5rem + 1rem)' } }, videoSection),
    React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
      React.createElement(SectionTitle, { title: t('interests'), action: !publicView && (editInterests ?
        React.createElement(Button, { className:'bg-pink-500 text-white', onClick: () => setEditInterests(false) }, 'Gem ændringer') :
        React.createElement(EditIcon, { className:'w-5 h-5 text-gray-500 cursor-pointer', onClick: () => setEditInterests(true) }) ) }),
      editInterests && !publicView && React.createElement(Button, {
        className:'bg-blue-500 text-white mt-2 mb-2',
        onClick: () => setShowInterests(true)
      }, 'Tilføj interesse'),
      React.createElement('div', { className: 'flex flex-wrap gap-2 mb-2' },
        (profile.interests || []).map(i => {
          const cat = getInterestCategory(i);
          const exact = viewerInterests.includes(i);
          const sameCat = !exact && viewerCategories.has(cat);
          const base = exact ? 'bg-pink-500 text-white' : sameCat ? 'bg-pink-200 text-pink-800' : 'bg-gray-200 text-gray-800';
          if(publicView || !editInterests){
            return React.createElement('span', { key:i, className:`px-2 py-1 rounded text-sm ${base}` }, i);
          }
          return React.createElement('div', { key:i, className:`px-2 py-1 rounded text-sm flex items-center gap-1 ${base}` },
            React.createElement('span', null, i),
            React.createElement(TrashIcon, { className:'w-4 h-4 cursor-pointer', onClick: () => handleRemoveInterest(i) })
          );
        })
      )
    ),
    !publicView && React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
      React.createElement(SectionTitle, { title: t('interestedIn'), action: editPrefs ?
        React.createElement(Button, { className:'bg-pink-500 text-white', onClick: () => setEditPrefs(false) }, 'Gem ændringer') :
        React.createElement(EditIcon, { className:'w-5 h-5 text-gray-500 cursor-pointer', onClick: () => setEditPrefs(true) }) }),
        editPrefs
          ? React.createElement('select', {
              value: profile.interest || 'Mand',
              onChange: handleInterestChange,
              className: 'border p-2 rounded block mb-2'
            },
              React.createElement('option', { value: 'Mand' }, 'Mænd'),
              React.createElement('option', { value: 'Kvinde' }, 'Kvinder')
            )
          : React.createElement('p', { className: 'mb-2' },
              (profile.interest || 'Mand') === 'Kvinde' ? 'Kvinder' : 'Mænd'
            ),
      
      React.createElement('label', { className: 'mt-2' }, `Alder: ${ageRange[0]} - ${ageRange[1]}`),
      React.createElement(Slider, {
        range: true,
        min: 18,
        max: 80,
        value: ageRange,
        onChange: editPrefs ? handleAgeRangeChange : undefined,
        className: 'w-full'
      }),
    ),
    !publicView && React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
      React.createElement(SectionTitle, { title: t('notificationsTitle') }),
      React.createElement('label', { className:'flex items-center mt-2' },
        React.createElement('input', { type:'checkbox', className:'mr-2', checked: (profile.notificationPrefs?.types?.newClips !== false), onChange: e => updateNotificationPref('types.newClips', e.target.checked) }),
        'Nye klip'
      ),
      React.createElement('label', { className:'flex items-center mt-2' },
        React.createElement('input', { type:'checkbox', className:'mr-2', checked: (profile.notificationPrefs?.types?.newMatch !== false), onChange: e => updateNotificationPref('types.newMatch', e.target.checked) }),
        'Nye matches'
      ),
      React.createElement('label', { className:'flex items-center mt-2' },
        React.createElement('input', { type:'checkbox', className:'mr-2', checked: (profile.notificationPrefs?.types?.newMessage !== false), onChange: e => updateNotificationPref('types.newMessage', e.target.checked) }),
        'Nye beskeder'
      ),
      React.createElement('div', { className:'flex items-center gap-2 mt-2' },
        React.createElement('label', null, 'Forstyr ikke fra'),
        React.createElement('input', { type:'time', value: profile.notificationPrefs?.dndStart || '', onChange: e => updateNotificationPref('dndStart', e.target.value) }),
      React.createElement('span', null, 'til'),
      React.createElement('input', { type:'time', value: profile.notificationPrefs?.dndEnd || '', onChange: e => updateNotificationPref('dndEnd', e.target.value) })
      )
    ),
    !publicView && React.createElement(Button, {
        className: 'mt-2 w-full bg-yellow-500 text-white',
        onClick: () => setShowSub(true)
      }, subscriptionActive ? 'Skift abonnement' : 'Køb abonnement (gratis nu - betaling ikke implementeret)'),
    !publicView && React.createElement(Button, {
        className: 'mt-6 w-full bg-red-500 text-white',
        onClick: () => setShowDelete(true)
      }, t('deleteAccount')),
    showSub && React.createElement(SubscriptionOverlay, {
        onClose: () => setShowSub(false),
        onBuy: handlePurchase,
        allowFree: subscriptionActive
      }),
    showInterests && React.createElement(InterestsOverlay, {
        current: profile.interests || [],
        onSave: handleSaveInterests,
        onClose: () => setShowInterests(false)
      }),
    matchedProfile && React.createElement(MatchOverlay, {
        name: matchedProfile.name,
        onClose: () => setMatchedProfile(null)
      }),
    reportItem && React.createElement(ReportOverlay, {
        userId: currentUserId,
        profileId: userId,
        clipURL: reportItem.clipURL || '',
        text: reportItem.text || '',
        onClose: () => { setReportItem(null); setReportMode(false); }
      }),
    showDelete && React.createElement(DeleteAccountOverlay, {
        onDelete: async () => { await deleteAccount(userId); onLogout && onLogout(); },
        onClose: () => setShowDelete(false)
      })
  );
}
