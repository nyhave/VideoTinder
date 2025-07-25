import React, { useState } from 'react';
import { getAge, getCurrentDate } from '../utils.js';
import { User as UserIcon, PlayCircle, Heart } from 'lucide-react';
import VideoOverlay from './VideoOverlay.jsx';
import MatchOverlay from './MatchOverlay.jsx';
import { Card } from './ui/card.js';
import PurchaseOverlay from './PurchaseOverlay.jsx';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { useCollection, db, doc, setDoc, deleteDoc, getDoc } from '../firebase.js';
import { useT } from '../i18n.js';
import StoryLineOverlay from './StoryLineOverlay.jsx';
import { triggerHaptic } from '../haptics.js';

export default function LikesScreen({ userId, onSelectProfile }) {
  const profiles = useCollection('profiles');
  const likes = useCollection('likes', 'profileId', userId);
  const matches = useCollection('matches', 'userId', userId);
  const matchedIds = matches.map(m => m.profileId);
  const likedProfiles = profiles.filter(p =>
    likes.some(l => l.userId === p.id) && !matchedIds.includes(p.id)
  );
  const currentUser = profiles.find(p => p.id === userId) || {};
  const hasSubscription =
    currentUser.subscriptionExpires &&
    new Date(currentUser.subscriptionExpires) > getCurrentDate();
  const t = useT();

  const [activeVideo, setActiveVideo] = useState(null);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [storyProfile, setStoryProfile] = useState(null);
  const progresses = useCollection('episodeProgress','userId', userId);
  const toggleLike = async profileId => {
    const likeId = `${userId}-${profileId}`;
    const exists = likes.some(l => l.profileId === profileId);
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
        if(prof) setMatchedProfile(prof);
        triggerHaptic([100,50,100]);
      }
    }
  };

  const [showPurchase, setShowPurchase] = useState(false);
  const handlePurchase = async () => {
    const now = getCurrentDate();
    const current = currentUser.subscriptionExpires ? new Date(currentUser.subscriptionExpires) : now;
    const base = current > now ? current : now;
    const expiry = new Date(base);
    expiry.setMonth(expiry.getMonth() + 1);
    await setDoc(doc(db,'profiles',userId),{
      subscriptionActive:true,
      subscriptionPurchased: now.toISOString(),
      subscriptionExpires: expiry.toISOString()
    },{ merge:true });
    setShowPurchase(false);
  };

  return React.createElement(Card,{className:'relative p-6 m-4 shadow-xl bg-white/90 flex flex-col'},
    React.createElement(SectionTitle,{title:t('likesTitle'), colorClass:'text-yellow-600'}),
    React.createElement('p',{className:'mb-4 text-gray-500'},`${likedProfiles.length} profiler`),
    React.createElement('div',{className: hasSubscription ? 'flex-1' : 'flex-1 filter blur-sm pointer-events-none'},
      React.createElement('ul',{className:'space-y-4'},
        likedProfiles.length ? likedProfiles.map(p => (
          React.createElement('li',{
            key:p.id,
            className:'p-4 bg-yellow-50 rounded-lg cursor-pointer shadow flex flex-col relative',
            onClick:()=>onSelectProfile(p.id)
          },
            React.createElement(Heart,{
              className:`w-8 h-8 absolute top-2 right-2 ${likes.some(l=>l.profileId===p.id)?'text-yellow-500':'text-gray-400'}`,
              onClick:e=>{e.stopPropagation(); toggleLike(p.id);}
            }),
            React.createElement('div',{className:'flex items-center gap-4 mb-2'},
              React.createElement('div', { className:'flex flex-col items-center' },
                p.photoURL ?
                  React.createElement('img',{src:p.photoURL,className:'w-10 h-10 rounded object-cover'}) :
                  React.createElement(UserIcon,{className:'w-10 h-10 text-yellow-500'}),
                p.verified && React.createElement('span', { className:'text-green-600 text-xs' }, 'Verified')
              ),
              React.createElement('div',null,
                React.createElement('p',{className:'font-medium'},`${p.name} (${p.birthday ? getAge(p.birthday) : p.age})`),
                p.clip && React.createElement('p',{className:'text-sm text-gray-500'},`“${p.clip}”`)
              )
            ),
            React.createElement('div',{className:'flex gap-2 mt-2'},
              React.createElement(Button,{size:'sm',variant:'outline',className:'flex items-center gap-1',onClick:e=>{e.stopPropagation();const url=(p.videoClips&&p.videoClips[0])?(p.videoClips[0].url||p.videoClips[0]):null;if(url)setActiveVideo(url);}},
                React.createElement(PlayCircle,{className:'w-5 h-5'}),'Afspil'
              ),
              React.createElement(Button,{size:'sm',variant:'outline',onClick:e=>{e.stopPropagation();setStoryProfile(p);}},'StoryLine')
            )
          )
        )) :
          React.createElement('li',{className:'text-center text-gray-500'},'Ingen har liket dig endnu')
      )
    ),
    !hasSubscription && React.createElement('span',{className:'absolute inset-0 m-auto text-yellow-500 text-sm font-semibold pointer-events-none flex items-center justify-center text-center px-2'},'Kr\u00e6ver premium abonnement'),
    !hasSubscription && React.createElement(Button,{className:'mt-4 w-full bg-yellow-500 text-white',onClick:()=>setShowPurchase(true)},'Køb premium'),
    showPurchase && React.createElement(PurchaseOverlay,{title:'Månedligt abonnement', price:'59 kr/md', onClose:()=>setShowPurchase(false), onBuy:handlePurchase},
      React.createElement('ul',{className:'list-disc list-inside text-sm space-y-1'},
        React.createElement('li',null,'🎞️ Få adgang til at se flere nye klip hver dag (+3 profiler)'),
        React.createElement('li',null,'🧠 Få indsigt i hvem der har liket dig (ubegrænset)'),
        React.createElement('li',null,'⏳ Bliv på set i længere tid på listen af profiler (+5 dage)')
      )
    ),
    storyProfile && React.createElement(StoryLineOverlay,{profile:storyProfile, progress: progresses.find(pr=>pr.profileId===storyProfile.id), onClose:()=>setStoryProfile(null), onMatch:id=>{toggleLike(id); setStoryProfile(null);}}),
    matchedProfile && React.createElement(MatchOverlay,{name:matchedProfile.name,onClose:()=>setMatchedProfile(null)}),
    activeVideo && React.createElement(VideoOverlay,{src:activeVideo,onClose:()=>setActiveVideo(null)})
  );
}
