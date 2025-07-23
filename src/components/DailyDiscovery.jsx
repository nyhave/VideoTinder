import React, { useState, useEffect } from 'react';
import { getAge, getTodayStr, getCurrentDate } from '../utils.js';
import { User, PlayCircle, Star } from 'lucide-react';
import VideoOverlay from './VideoOverlay.jsx';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { useT } from '../i18n.js';
import { useCollection, useDoc, db, doc, setDoc, deleteDoc, getDoc, updateDoc, collection } from '../firebase.js';
import selectProfiles, { scoreProfiles } from '../selectProfiles.js';
import PurchaseOverlay from './PurchaseOverlay.jsx';
import MatchOverlay from './MatchOverlay.jsx';
import InfoOverlay from './InfoOverlay.jsx';
import StoryLineOverlay from './StoryLineOverlay.jsx';
import { triggerHaptic } from '../haptics.js';

export default function DailyDiscovery({ userId, onSelectProfile, ageRange, onOpenProfile }) {
  const profiles = useCollection('profiles');
  const t = useT();
  const config = useDoc('config', 'app') || {};
  const showLevels = config.showLevels !== false;
  const user = profiles.find(p => p.id === userId) || {};
  const hasActiveSub = prof =>
    prof.subscriptionExpires && new Date(prof.subscriptionExpires) > getCurrentDate();
  const today = getTodayStr();
  const filtered = selectProfiles(user, profiles, ageRange);
  const scored = scoreProfiles(user, profiles, ageRange);
  useEffect(() => {
    if(!userId || !profiles.length) return;
    const selectedIds = filtered.map(p => p.id);
    const log = {
      userId,
      date: getCurrentDate().toISOString(),
      potential: scored.map(p => ({ id: p.id, score: { score: p.score, breakdown: p.breakdown } })),
      selected: scored
        .filter(p => selectedIds.includes(p.id))
        .map(p => ({ id: p.id, score: { score: p.score, breakdown: p.breakdown } }))
    };
    setDoc(doc(collection(db, 'matchLogs')), log).catch(err =>
      console.error('Failed to log match scores', err)
    );
  }, [userId, profiles, ageRange]);

  const likes = useCollection('likes','userId',userId);
  const progresses = useCollection('episodeProgress','userId', userId);

  useEffect(() => {
    if(!userId) return;
    const hasSub = hasActiveSub(user);
    const extra = user.extraClipsDate === today ? 3 : 0;
    const limit = (hasSub ? 6 : 3) + extra;
    let createdToday = progresses.filter(pr => pr.addedDate === today).length;
    filtered.forEach(p => {
      const id = `${userId}-${p.id}`;
      const prog = progresses.find(pr => pr.id === id);
      if(!prog && createdToday < limit){
        const expires = new Date(getCurrentDate());
        const days = hasActiveSub(p) ? 10 : 5;
        expires.setDate(expires.getDate() + days);
        setDoc(doc(db,'episodeProgress', id), {
          id,
          userId,
          profileId: p.id,
          stage: 1,
          seenStage: 1,
          lastUpdated: today,
          addedDate: today,
          expiresAt: expires.toISOString()
        }, { merge: true }).catch(err => console.error('Failed to init progress', err));
        createdToday++;
      }
    });
  }, [filtered, progresses, userId]);

  useEffect(() => {
    if (!userId) return;
    const todayStr = getTodayStr();
    progresses.forEach(pr => {
      if(!pr) return;
      if(!pr.lastUpdated){
        setDoc(doc(db,'episodeProgress', pr.id), { lastUpdated: todayStr }, { merge: true });
        return;
      }
      const last = new Date(pr.lastUpdated);
      const nowStr = todayStr;
      const lastStr = last.toISOString().split('T')[0];
      if(pr.stage < 3 && lastStr !== nowStr){
        const newStage = pr.stage + 1;
        setDoc(doc(db,'episodeProgress', pr.id), {
          stage: newStage,
          seenStage: newStage,
          lastUpdated: todayStr
        }, { merge: true }).catch(err => console.error('Failed to advance stage', err));
      }
    });
  }, [progresses, userId]);

  const progressMap = new Map(progresses.map(pr => [pr.profileId, pr]));
  const activeProfiles = scored.filter(p => {
    const prog = progressMap.get(p.id);
    if(!prog) return false;
    if(prog.removed) return false;
    if(!prog.expiresAt) return true;
    const now = getCurrentDate();
    const grace = new Date(now);
    grace.setDate(grace.getDate() - 1);
    return new Date(prog.expiresAt) >= grace;
  });
  const archivedProfiles = progresses
    .filter(pr => (pr.removed || (pr.expiresAt && new Date(pr.expiresAt) < getCurrentDate())) && pr.rating >= 3)
    .map(pr => profiles.find(p => p.id === pr.profileId))
    .filter(Boolean);

  const [hoursUntil, setHoursUntil] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [storyProfile, setStoryProfile] = useState(null);
  const handleExtraPurchase = async () => {
    const todayStr = getTodayStr();
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
      await setDoc(doc(db,'episodeProgress', `${userId}-${profileId}`), { removed: true }, { merge: true });
      triggerHaptic();
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
        triggerHaptic([100,50,100]);
      }
    }
  };
  const removeProfile = async profileId => {
    const id = `${userId}-${profileId}`;
    await setDoc(doc(db,'episodeProgress', id), { removed: true }, { merge: true });
  };
  useEffect(() => {
    const now = getCurrentDate();
    const next = new Date(now);
    next.setDate(now.getDate() + 1);
    next.setHours(0,0,0,0);
    setHoursUntil(Math.ceil((next - now) / 3600000));
  }, []);

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: t('dailyClips'), action:
      React.createElement('span', { className:'text-sm text-blue-500 underline cursor-pointer', onClick:()=>setShowHelp(true) }, t('dailyHelpLabel'))
    }),
    React.createElement('p', { className: 'text-center text-gray-500 mb-4' }, `Nye klip om ${hoursUntil} timer`),
    React.createElement('p', { className: 'text-center text-gray-500 mb-4' }, `Tag dig god tid til at udforske dagens klip`),
    React.createElement('ul', { className: 'space-y-4' },
      activeProfiles.length ? activeProfiles.map(p => {
        const prog = progresses.find(pr => pr.profileId === p.id);
        const stage = prog?.stage || 1;
        const defaultDays = hasActiveSub(p) ? 10 : 5;
        const daysLeft = prog?.expiresAt ? Math.ceil((new Date(prog.expiresAt) - getCurrentDate())/86400000) : defaultDays;
        return React.createElement('li', {
          key: p.id,
          className: 'p-4 bg-white rounded-lg cursor-pointer shadow-lg border border-gray-200 flex flex-col relative',
          onClick: () => onSelectProfile(p.id)
        },
          showLevels && React.createElement('span', { className:'absolute top-2 left-2 bg-pink-100 text-pink-600 text-xs font-semibold px-2 rounded' }, `Level ${stage}`),
          React.createElement('span', { className:`absolute bottom-2 left-2 ${daysLeft <= 0 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'} text-xs font-semibold px-2 rounded` },
            daysLeft <= 0 ? t('lastDay') : t('expiresIn').replace('{days}', daysLeft)
          ),
          React.createElement(Button, {
            className: `absolute top-2 right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded ${likes.some(l => l.profileId === p.id) ? '' : 'opacity-80'}`,
            onClick: e => { e.stopPropagation(); toggleLike(p.id); }
          }, likes.some(l => l.profileId === p.id) ? 'Unlike' : 'Like'),
          React.createElement('div', { className: 'flex items-center gap-4 mb-2' },
            React.createElement('div', { className:'flex flex-col items-center' },
              (p.photoURL ?
                React.createElement('img', { src: p.photoURL, className: 'w-10 h-10 rounded object-cover' }) :
                React.createElement(User, { className: 'w-10 h-10 text-pink-500' })
              ),
              p.verified && React.createElement('span', { className:'text-green-600 text-xs' }, 'Verified')
            ),
            React.createElement('div', null,
              React.createElement('p', { className: 'font-medium' }, `${p.name} (${p.birthday ? getAge(p.birthday) : p.age})`),
              p.clip && React.createElement('p', { className: 'text-sm text-gray-700' }, `“${p.clip}”`)
            )
          ),
          React.createElement('div', { className: 'flex gap-2 mt-2' },
              React.createElement(Button, { size: 'sm', variant: 'outline', className: 'flex items-center gap-1 bg-white text-black border border-gray-300', onClick:e=>{e.stopPropagation(); const url=(p.videoClips&&p.videoClips[0])?(p.videoClips[0].url||p.videoClips[0]):null; if(url) setActiveVideo(url); } },
                React.createElement(PlayCircle, { className: 'w-5 h-5' }), 'Afspil'
              ),
              React.createElement(Button, { size: 'sm', variant: 'outline', className: 'bg-white text-black border border-gray-300', onClick:e=>{e.stopPropagation(); setStoryProfile(p);} }, 'StoryLine')
            ),
          prog?.rating && React.createElement('div', { className:'flex gap-1 mt-2' },
            [1,2,3,4].map(n =>
              React.createElement(Star,{key:n,className:`w-4 h-4 ${n <= prog.rating ? 'fill-pink-500 stroke-pink-500' : 'stroke-gray-400'}`})
            )
          ),
          React.createElement(Button, {
            size: 'sm',
            variant: 'ghost',
            className: 'self-end bg-red-500 text-white text-xs mt-1 px-2 py-1 rounded',
            onClick: e => { e.stopPropagation(); removeProfile(p.id); }
          }, t('remove'))
        )
      }) :
        React.createElement('li', { className: 'text-center text-gray-500' }, t('noProfiles'))
    ),
    archivedProfiles.length && !showArchived && React.createElement(Button, {
      className: 'mt-4 w-full bg-gray-200 text-black',
      onClick: () => setShowArchived(true)
    }, t('showArchived')),
    archivedProfiles.length && showArchived && React.createElement(React.Fragment, null,
      React.createElement('h3', { className:'mt-6 mb-2 font-medium' }, t('archivedProfiles')),
      React.createElement('ul', { className:'space-y-4 mb-4' },
        archivedProfiles.map(p => {
          const prog = progresses.find(pr => pr.profileId === p.id) || {};
          return React.createElement('li', {
            key:p.id,
            className:'p-4 bg-white rounded-lg cursor-pointer shadow-lg border border-gray-200 flex flex-col',
            onClick:()=>onSelectProfile(p.id)
          },
            React.createElement('div', { className:'flex items-center gap-4 mb-2' },
              React.createElement('div',{ className:'flex flex-col items-center' },
                p.photoURL ?
                  React.createElement('img',{src:p.photoURL,className:'w-10 h-10 rounded object-cover'}) :
                  React.createElement(User,{className:'w-10 h-10 text-pink-500'}),
                p.verified && React.createElement('span', { className:'text-green-600 text-xs' }, 'Verified')
              ),
              React.createElement('div',null,
                React.createElement('p',{className:'font-medium'},`${p.name} (${p.birthday ? getAge(p.birthday) : p.age})`),
                p.clip && React.createElement('p',{className:'text-sm text-gray-700'},`“${p.clip}”`)
              )
            ),
            prog.rating && React.createElement('div',{className:'flex gap-1 mt-2'},
              [1,2,3,4].map(n =>
                React.createElement(Star,{key:n,className:`w-4 h-4 ${n <= prog.rating ? 'fill-pink-500 stroke-pink-500' : 'stroke-gray-400'}`})
              )
            )
          );
        })
      ),
      React.createElement(Button,{className:'w-full bg-gray-200 text-black',onClick:()=>setShowArchived(false)},t('cancel'))
    ),
    React.createElement(Button, {
      className: 'mt-4 w-full bg-yellow-500 text-white',
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
    storyProfile && React.createElement(StoryLineOverlay, {
      profile: storyProfile,
      progress: progresses.find(pr => pr.profileId === storyProfile.id),
      onClose: () => setStoryProfile(null),
      onMatch: id => { toggleLike(id); setStoryProfile(null); }
    }),
    matchedProfile && React.createElement(MatchOverlay, {
      name: matchedProfile.name,
      onClose: () => setMatchedProfile(null)
    }),
    activeVideo && React.createElement(VideoOverlay, { src: activeVideo, onClose: () => setActiveVideo(null) }),
    showHelp && React.createElement(InfoOverlay, {
      title: t('dailyHelpTitle'),
      onClose: () => setShowHelp(false)
    },
      React.createElement('p', { className:'text-sm' }, t('dailyHelpText'))
    )
  );
}
