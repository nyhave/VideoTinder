import React, { useState, useEffect } from 'react';
import { getAge } from '../utils.js';
import { User, PlayCircle, Heart, Star } from 'lucide-react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { useT } from '../i18n.js';
import { useCollection, db, doc, setDoc, deleteDoc, getDoc, updateDoc } from '../firebase.js';
import selectProfiles from '../selectProfiles.js';
import PurchaseOverlay from './PurchaseOverlay.jsx';
import MatchOverlay from './MatchOverlay.jsx';
import InfoOverlay from './InfoOverlay.jsx';

export default function DailyDiscovery({ userId, onSelectProfile, ageRange, onOpenPremium, onOpenProfile }) {
  const profiles = useCollection('profiles');
  const t = useT();
  const user = profiles.find(p => p.id === userId) || {};
  const hasSubscription = user.subscriptionExpires && new Date(user.subscriptionExpires) > new Date();
  const today = new Date().toISOString().split('T')[0];
  const filtered = selectProfiles(user, profiles, ageRange);

  if(!(user.videoClips && user.videoClips.length)){
    return React.createElement(Card, { className:'p-6 m-4 shadow-xl bg-white/90' },
      React.createElement('p', { className:'mb-4 text-center' }, t('uploadVideoPrompt')),
      React.createElement(Button, { className:'w-full bg-pink-500 text-white', onClick:onOpenProfile }, t('uploadVideoButton'))
    );
  }
  const likes = useCollection('likes','userId',userId);

  const [hoursUntil, setHoursUntil] = useState(0);
  const [showPurchase, setShowPurchase] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const handleExtraPurchase = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    await updateDoc(doc(db, 'profiles', userId), { extraClipsDate: todayStr });
    setShowPurchase(false);
  };
  const toggleLike = async profileId => {
    const likeId = `${userId}-${profileId}`;
    const exists = likes.some(l => l.profileId === profileId);
    const ref = doc(db,'likes',likeId);
    if(exists){
      if(!window.confirm('Er du sikker?')) return;
      await deleteDoc(ref);
      // remove any existing match when unliking
      await Promise.all([
        deleteDoc(doc(db,'matches',`${userId}-${profileId}`)),
        deleteDoc(doc(db,'matches',`${profileId}-${userId}`))
      ]);
    } else {
      await setDoc(ref,{id:likeId,userId,profileId});
      const otherLike = await getDoc(doc(db,'likes',`${profileId}-${userId}`));
      if(otherLike.exists()){
        const m1 = {
          id:`${userId}-${profileId}`,
          userId,
          profileId,
          lastMessage:'',
          unreadByUser:false,
          unreadByProfile:false,
          newMatch:false
        };
        const m2 = {
          id:`${profileId}-${userId}`,
          userId:profileId,
          profileId:userId,
          lastMessage:'',
          unreadByUser:false,
          unreadByProfile:false,
          newMatch:true
        };
        await Promise.all([
          setDoc(doc(db,'matches',m1.id),m1),
          setDoc(doc(db,'matches',m2.id),m2)
        ]);
        const prof = profiles.find(p => p.id === profileId);
        if(prof) setMatchedProfile(prof);
      }
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
    React.createElement(SectionTitle, { title: t('dailyClips') }),
    hasSubscription && React.createElement(Button, {
      className: 'mb-4 w-full bg-yellow-400 text-white flex items-center gap-2',
      onClick: onOpenPremium
    },
      React.createElement(Star, { className: 'w-4 h-4' }),
      'Premium feature: Se hvem der har liket dig'
    ),
    React.createElement('p', { className: 'text-center text-gray-500 mb-4' }, `Nye klip om ${hoursUntil} timer`),
    React.createElement('p', { className: 'text-center text-gray-500 mb-4' }, `Tag dig god tid til at udforske dagens klip`),
    React.createElement('ul', { className: 'space-y-4' },
      filtered.length ? filtered.map(p => (
        React.createElement('li', {
          key: p.id,
          className: 'p-4 bg-pink-50 rounded-lg cursor-pointer shadow flex flex-col relative',
          onClick: () => onSelectProfile(p.id)
        },
          React.createElement(Heart, {
            className: `w-8 h-8 absolute top-2 right-2 ${likes.some(l => l.profileId === p.id) ? 'text-pink-500' : 'text-gray-400'}`,
            onClick: e => { e.stopPropagation(); toggleLike(p.id); }
          }),
          React.createElement('div', { className: 'flex items-center gap-4 mb-2' },
            (p.photoURL ?
              React.createElement('img', { src: p.photoURL, className: 'w-10 h-10 rounded object-cover' }) :
              React.createElement(User, { className: 'w-10 h-10 text-pink-500' })
            ),
            React.createElement('div', null,
              React.createElement('p', { className: 'font-medium' }, `${p.name} (${p.birthday ? getAge(p.birthday) : p.age})`),
              p.clip && React.createElement('p', { className: 'text-sm text-gray-500' }, `“${p.clip}”`)
            )
          ),
          React.createElement('div', { className: 'flex gap-2 mt-2' },
            React.createElement(Button, { size: 'sm', variant: 'outline', className: 'flex items-center gap-1' },
              React.createElement(PlayCircle, { className: 'w-5 h-5' }), 'Afspil'
            )
          )
        )
      )) :
        React.createElement('li', { className: 'text-center text-gray-500' }, t('noProfiles'))
    ),
    React.createElement(Button, {
      className: 'mt-4 w-full bg-pink-500 text-white',
      onClick: () => {
        if(user.extraClipsDate === today){
          setShowInfo(true);
        } else {
          setShowPurchase(true);
        }
      }
    }, t('loadMore')),
    showPurchase && React.createElement(PurchaseOverlay, {
      title: 'Flere klip',
      price: '9 kr',
      onClose: () => setShowPurchase(false),
      onBuy: handleExtraPurchase
    },
      React.createElement('p', { className: 'text-center text-sm mb-2' }, 'Få 3 ekstra klip i dag')
    ),
    showInfo && React.createElement(InfoOverlay, {
      title: 'Flere klip',
      onClose: () => setShowInfo(false)
    },
      React.createElement('p', { className: 'text-center text-sm' }, 'Du har allerede købt ekstra klip i dag')
    ),
    matchedProfile && React.createElement(MatchOverlay, {
      name: matchedProfile.name,
      onClose: () => setMatchedProfile(null)
    })
  );
}
