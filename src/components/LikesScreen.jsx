import React, { useState } from 'react';
import { getAge } from '../utils.js';
import { User as UserIcon, PlayCircle, Heart } from 'lucide-react';
import VideoOverlay from './VideoOverlay.jsx';
import MatchOverlay from './MatchOverlay.jsx';
import { Card } from './ui/card.js';
import PurchaseOverlay from './PurchaseOverlay.jsx';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { useCollection, db, doc, setDoc, deleteDoc, getDoc } from '../firebase.js';

export default function LikesScreen({ userId, onSelectProfile, onBack }) {
  const profiles = useCollection('profiles');
  const likes = useCollection('likes', 'profileId', userId);
  const likedProfiles = profiles.filter(p => likes.some(l => l.userId === p.id));
  const currentUser = profiles.find(p => p.id === userId) || {};
  const hasSubscription = currentUser.subscriptionExpires && new Date(currentUser.subscriptionExpires) > new Date();

  const [activeVideo, setActiveVideo] = useState(null);
  const [matchedProfile, setMatchedProfile] = useState(null);
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
      const otherLike = await getDoc(doc(db,'likes',`${profileId}-${userId}`));
      if(otherLike.exists()){
        const m1 = {id:`${userId}-${profileId}`,userId,profileId,lastMessage:'',unreadByUser:false,unreadByProfile:false,newMatch:false};
        const m2 = {id:`${profileId}-${userId}`,userId:profileId,profileId:userId,lastMessage:'',unreadByUser:false,unreadByProfile:false,newMatch:true};
        await Promise.all([
          setDoc(doc(db,'matches',m1.id),m1),
          setDoc(doc(db,'matches',m2.id),m2)
        ]);
        const prof = profiles.find(p => p.id === profileId);
        if(prof) setMatchedProfile(prof);
      }
    }
  };

  const [showPurchase, setShowPurchase] = useState(false);
  const handlePurchase = async () => {
    const now = new Date();
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

  return React.createElement(Card,{className:'p-6 m-4 shadow-xl bg-white/90 flex flex-col'},
    React.createElement(SectionTitle,{title:'Dine likes', action: React.createElement(Button,{onClick:onBack},'Tilbage')}),
    React.createElement('div',{className: hasSubscription ? 'flex-1' : 'flex-1 filter blur-sm pointer-events-none'},
      React.createElement('ul',{className:'space-y-4'},
        likedProfiles.length ? likedProfiles.map(p => (
          React.createElement('li',{
            key:p.id,
            className:'p-4 bg-pink-50 rounded-lg cursor-pointer shadow flex flex-col relative',
            onClick:()=>onSelectProfile(p.id)
          },
            React.createElement(Heart,{
              className:`w-8 h-8 absolute top-2 right-2 ${likes.some(l=>l.profileId===p.id)?'text-pink-500':'text-gray-400'}`,
              onClick:e=>{e.stopPropagation(); toggleLike(p.id);}
            }),
            React.createElement('div',{className:'flex items-center gap-4 mb-2'},
              p.photoURL ?
                React.createElement('img',{src:p.photoURL,className:'w-10 h-10 rounded object-cover'}) :
                React.createElement(UserIcon,{className:'w-10 h-10 text-pink-500'}),
              React.createElement('div',null,
                React.createElement('p',{className:'font-medium'},`${p.name} (${p.birthday ? getAge(p.birthday) : p.age})`),
                p.clip && React.createElement('p',{className:'text-sm text-gray-500'},`“${p.clip}”`)
              )
            ),
            React.createElement('div',{className:'flex gap-2 mt-2'},
              React.createElement(Button,{size:'sm',variant:'outline',className:'flex items-center gap-1',onClick:e=>{e.stopPropagation();const url=(p.videoClips&&p.videoClips[0])?(p.videoClips[0].url||p.videoClips[0]):null;if(url)setActiveVideo(url);}},
                React.createElement(PlayCircle,{className:'w-5 h-5'}),'Afspil'
              )
            )
          )
        )) :
          React.createElement('li',{className:'text-center text-gray-500'},'Ingen har liket dig endnu')
      )
    ),
    !hasSubscription && React.createElement(Button,{className:'mt-4 w-full bg-pink-500 text-white',onClick:()=>setShowPurchase(true)},'Køb premium'),
    showPurchase && React.createElement(PurchaseOverlay,{title:'Månedligt abonnement', price:'59 kr/md', onClose:()=>setShowPurchase(false), onBuy:handlePurchase},
      React.createElement('ul',{className:'list-disc list-inside text-sm space-y-1'},
        React.createElement('li',null,'🎞️ Flere daglige klip: Se fx 6 i stedet for 3 kandidater om dagen'),
        React.createElement('li',null,'🔁 Se tidligere klip igen ("Fortryd swipe")'),
        React.createElement('li',null,'🧠 Indsigt i hvem der har liket dig'),
        React.createElement('li',null,'📝 Udfoldede profiler – adgang til længere refleksioner, flere videoer'),
        React.createElement('li',null,'🎙️ Profilbooster: Få dit klip vist tidligere på dagen')
      )
    ),
    matchedProfile && React.createElement(MatchOverlay,{name:matchedProfile.name,onClose:()=>setMatchedProfile(null)}),
    activeVideo && React.createElement(VideoOverlay,{src:activeVideo,onClose:()=>setActiveVideo(null)})
  );
}
