import React, { useState } from 'react';
import { getAge, getCurrentDate, getSuperLikeLimit, getWeekId } from '../utils.js';
import { User as UserIcon, Star } from 'lucide-react';
import MatchOverlay from './MatchOverlay.jsx';
import { Card } from './ui/card.js';
import SubscriptionOverlay from './SubscriptionOverlay.jsx';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { useCollection, db, doc, setDoc, deleteDoc, getDoc, updateDoc } from '../firebase.js';
import { useT } from '../i18n.js';
import { triggerHaptic } from '../haptics.js';
import { showLocalNotification, sendWebPushToProfile } from '../notifications.js';

export default function LikesScreen({ userId, onSelectProfile, onBack }) {
  const profiles = useCollection('profiles');
  const likesToMe = useCollection('likes', 'profileId', userId);
  const myLikes = useCollection('likes', 'userId', userId);
  const matches = useCollection('matches', 'userId', userId);
  const matchedIds = matches.map(m => m.profileId);
  const likedProfiles = profiles.filter(p =>
    likesToMe.some(l => l.userId === p.id) && !matchedIds.includes(p.id)
  );
  const currentUser = profiles.find(p => p.id === userId) || {};
  const showSuperLike = getSuperLikeLimit(currentUser) > 0;
  const tier = currentUser.subscriptionTier || 'free';
  const hasActiveSubscription =
    currentUser.subscriptionExpires &&
    new Date(currentUser.subscriptionExpires) > getCurrentDate();
  const canSeeLikes = hasActiveSubscription && tier === 'gold';
  const t = useT();
  const tierLabel = {
    gold: t('tierGold')
  }[tier] || 'Premium';

  const [matchedProfile, setMatchedProfile] = useState(null);
  const toggleLike = async profileId => {
    const likeId = `${userId}-${profileId}`;
    const exists = myLikes.some(l => l.profileId === profileId);
    const ref = doc(db,'likes',likeId);
    if(exists){
      if(!window.confirm('Er du sikker?')) return;
      await deleteDoc(ref);
      await Promise.all([
        deleteDoc(doc(db,'matches',`${userId}-${profileId}`)),
        deleteDoc(doc(db,'matches',`${profileId}-${userId}`))
      ]);
    } else {
      await setDoc(ref,{id:likeId,userId,profileId});
      triggerHaptic();
      const otherLike = await getDoc(doc(db,'likes',`${profileId}-${userId}`));
      if(otherLike.exists()){
        const m1 = {id:`${userId}-${profileId}`,userId,profileId,lastMessage:'',unreadByUser:false,unreadByProfile:false,newMatch:false};
        const m2 = {id:`${profileId}-${userId}`,userId:profileId,profileId:userId,lastMessage:'',unreadByUser:false,unreadByProfile:false,newMatch:true};
        await Promise.all([
          setDoc(doc(db,'matches',m1.id),m1),
          setDoc(doc(db,'matches',m2.id),m2)
        ]);
        await setDoc(doc(db,'episodeProgress', `${userId}-${profileId}`), { removed: true }, { merge: true });
        const prof = profiles.find(p => p.id === profileId);
        if(prof){
          setMatchedProfile(prof);
          showLocalNotification('Det er et match!', `Du og ${prof.name} kan lide hinanden`);
          sendWebPushToProfile(profileId, 'Det er et match!', `${currentUser.name || 'En person'} har matchet med dig`, false, 'newMatch');
        }
        triggerHaptic([100,50,100]);
      }
    }
  };

  const sendSuperLike = async profileId => {
    const weekId = getWeekId();
    const limit = getSuperLikeLimit(currentUser);
    const used = currentUser.superLikeWeek === weekId ? (currentUser.superLikesUsed || 0) : 0;
    if(used >= limit){
      alert('Ugentlig super like gr\u00e6nse n\u00e5et');
      return;
    }
    const likeId = `${userId}-${profileId}`;
    await setDoc(doc(db,'likes',likeId),{id:likeId,userId,profileId,super:true});
    await setDoc(doc(db,'episodeProgress', `${userId}-${profileId}`), { removed: true }, { merge: true });
    await updateDoc(doc(db,'profiles',userId),{ superLikeWeek: weekId, superLikesUsed: used + 1 });
    triggerHaptic([200,50,200]);
    const otherLike = await getDoc(doc(db,'likes',`${profileId}-${userId}`));
    if(otherLike.exists()){
      const m1 = {id:`${userId}-${profileId}`,userId,profileId,lastMessage:'',unreadByUser:false,unreadByProfile:false,newMatch:false};
      const m2 = {id:`${profileId}-${userId}`,userId:profileId,profileId:userId,lastMessage:'',unreadByUser:false,unreadByProfile:false,newMatch:true};
      await Promise.all([
        setDoc(doc(db,'matches',m1.id),m1),
        setDoc(doc(db,'matches',m2.id),m2)
      ]);
      const prof = profiles.find(p => p.id === profileId);
      if(prof){
        setMatchedProfile(prof);
        showLocalNotification('Det er et match!', `Du og ${prof.name} kan lide hinanden`);
        sendWebPushToProfile(profileId, 'Det er et match!', `${currentUser.name || 'En person'} har matchet med dig`, false, 'newMatch');
      }
      triggerHaptic([100,50,100]);
    }
  };

  const removeProfile = async profileId => {
    await deleteDoc(doc(db,'likes',`${profileId}-${userId}`));
    await setDoc(doc(db,'episodeProgress', `${userId}-${profileId}`), { removed: true }, { merge: true });
  };

  const [showPurchase, setShowPurchase] = useState(false);
  const handlePurchase = async (tier) => {
    const now = getCurrentDate();
    const current = currentUser.subscriptionExpires ? new Date(currentUser.subscriptionExpires) : now;
    const base = current > now ? current : now;
    const expiry = new Date(base);
    expiry.setMonth(expiry.getMonth() + 1);
    const month = now.toISOString().slice(0,7);
    await setDoc(doc(db,'profiles',userId),{
      subscriptionActive:true,
      subscriptionPurchased: now.toISOString(),
      subscriptionExpires: expiry.toISOString(),
      subscriptionTier: tier,
      boostMonth: month,
      boostsUsed: 0
    },{ merge:true });
    setShowPurchase(false);
  };

  const showBlur = !canSeeLikes && likedProfiles.length > 0;

  return React.createElement(Card,{className:'relative p-6 m-4 shadow-xl bg-white/90 flex flex-col'},
    React.createElement(SectionTitle,{title:t('likesTitle'), colorClass:'text-yellow-600', action: React.createElement(Button,{onClick:onBack, className:'bg-yellow-500 text-white'}, t('back'))}),
    likedProfiles.length > 0 && React.createElement('p',{className:'mb-4 text-gray-500'},`${likedProfiles.length} profiler`),
    likedProfiles.length > 0 && hasActiveSubscription && currentUser.subscriptionExpires &&
      React.createElement('p', {
        className: 'text-sm text-gray-600 mb-2'
      }, `${tierLabel} abonnement aktivt til ${new Date(currentUser.subscriptionExpires).toLocaleDateString('da-DK')}`),
    React.createElement('div',{className: showBlur ? 'flex-1 filter blur-sm pointer-events-none' : 'flex-1'},
      React.createElement('ul',{className:'space-y-4'},
        likedProfiles.length ? likedProfiles.map(p => {
          const theirLike = likesToMe.find(l => l.userId === p.id);
          const superLike = theirLike?.super;
          const myLike = myLikes.find(l => l.profileId === p.id);
          return React.createElement('li',{
            key:p.id,
            className:'p-4 bg-yellow-50 rounded-lg cursor-pointer shadow flex flex-col relative',
            onClick:()=>onSelectProfile(p.id)
          },
            superLike && React.createElement('div',{className:'absolute top-2 left-2 flex items-center gap-1 text-blue-500'},
              React.createElement(Star,{className:'w-6 h-6'}),
              React.createElement('span',{className:'text-sm font-semibold'}, t('superLike'))
            ),
            React.createElement('div',{className:'flex items-center gap-4 mb-2'},
              React.createElement('div', { className:'flex flex-col items-center' },
                p.photoURL ?
                  React.createElement('img',{src:p.photoURL,className:'w-10 h-10 rounded object-cover'}) :
                  React.createElement(UserIcon,{className:'w-10 h-10 text-yellow-500'})
              ),
              React.createElement('div',null,
                React.createElement('p',{className:'font-medium'},`${p.name} (${p.birthday ? getAge(p.birthday) : p.age})`),
                p.clip && React.createElement('p',{className:'text-sm text-gray-500'},`“${p.clip}”`)
              )
            ),
            React.createElement('div',{className:'flex gap-2 mt-2'},
              [
                React.createElement(Button, {
                  className:'flex-1 bg-red-500 text-white text-xs px-2 py-1 rounded',
                  onClick: e => { e.stopPropagation(); removeProfile(p.id); }
                }, t('remove')),
                showSuperLike && React.createElement(Button, {
                  className:`flex-1 bg-blue-500 text-white text-xs px-2 py-1 rounded ${myLike && myLike.super ? '' : 'opacity-80'}`,
                  onClick: e => { e.stopPropagation(); sendSuperLike(p.id); }
                }, t('superLike')),
                React.createElement(Button, {
                  className:`flex-1 bg-yellow-500 text-white text-xs px-2 py-1 rounded ${myLike ? '' : 'opacity-80'}`,
                  onClick: e => { e.stopPropagation(); toggleLike(p.id); }
                }, myLike ? 'Unlike' : 'Like')
              ].filter(Boolean)
            )
          );
        }) :
          React.createElement('li',{className:'text-center text-gray-500'},'Ingen har liket dig endnu')
      )
    ),
    showBlur && React.createElement('span',{className:'absolute inset-0 m-auto text-yellow-500 text-sm font-semibold pointer-events-none flex items-center justify-center text-center px-2'},'Kr\u00e6ver Guld'),
    !canSeeLikes && likedProfiles.length > 0 && React.createElement(Button,{className:'mt-4 w-full bg-yellow-500 text-white',onClick:()=>setShowPurchase(true)},'Køb Guld (gratis nu - betaling ikke implementeret)'),
    showPurchase && React.createElement(SubscriptionOverlay,{onClose:()=>setShowPurchase(false), onBuy:handlePurchase}),
    matchedProfile && React.createElement(MatchOverlay,{name:matchedProfile.name,onClose:()=>setMatchedProfile(null)})
  );
}
