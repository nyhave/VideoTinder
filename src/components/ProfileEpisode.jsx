import React, { useState, useEffect, useRef } from 'react';
import { useDoc, db, doc, setDoc } from '../firebase.js';
import { getTodayStr, getCurrentDate, getAge } from '../utils.js';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Textarea } from './ui/textarea.js';
import SectionTitle from './SectionTitle.jsx';
import { useT } from '../i18n.js';
import ProfileSettings from './ProfileSettings.jsx';
import VideoPreview from './VideoPreview.jsx';
import { Star } from 'lucide-react';
import InfoOverlay from './InfoOverlay.jsx';

export default function ProfileEpisode({ userId, profileId, onBack }) {
  const progressId = `${userId}-${profileId}`;
  const progress = useDoc('episodeProgress', progressId);
  const profile = useDoc('profiles', profileId);
  const viewer = useDoc('profiles', userId);
  const isOwnProfile = userId === profileId;
  const t = useT();
  const config = useDoc('config', 'app') || {};
  const showLevels = config.showLevels !== false;
  const profileHasSub = profile?.subscriptionExpires && new Date(profile.subscriptionExpires) > getCurrentDate();
  const expiryDays = profileHasSub ? 10 : 5;
  const [reflection, setReflection] = useState('');
  const [reaction, setReaction] = useState('');
  const [rating, setRating] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const reflectionRef = useRef('');
  const ratingRef = useRef(0);
  const progressRef = useRef(null);
  const MAX_REFLECTION_LEN = 30;
  const extendExpiry = (current) => {
    const base = current && new Date(current) > getCurrentDate()
      ? new Date(current) : getCurrentDate();
    const next = new Date(base);
    next.setDate(base.getDate() + expiryDays);
    return next.toISOString();
  };
  useEffect(() => {
    if(progress?.rating) setRating(progress.rating);
    if(progress?.lastUpdated === today && progress?.reflection){
      setReflection(progress.reflection);
    }
  }, [progress, today]);
  useEffect(()=>{ reflectionRef.current = reflection; }, [reflection]);
  useEffect(()=>{ ratingRef.current = rating; }, [rating]);
  useEffect(()=>{ progressRef.current = progress; }, [progress]);
  const stepLabels = [
    'Level 1',
    'Level 2',
    'Level 3'
  ];

  const stage = isOwnProfile ? 3 : (progress?.stage || 1);
  const showReveal = progress && (progress.seenStage || 1) < stage;
  const today = getTodayStr();

  useEffect(() => {
    if(!profile || isOwnProfile) return;
    if(!progress) {
      const expiresAt = extendExpiry();
      setDoc(doc(db,'episodeProgress', progressId), {
        id: progressId,
        userId,
        profileId,
        stage: 1,
        seenStage: 0,
        lastUpdated: today,
        addedDate: today,
        expiresAt
      }, { merge: true }).catch(err => console.error('Failed to init progress', err));
    }
  }, [profile, progress, isOwnProfile]);

  useEffect(() => {
    if(showReveal){
      const audio = new Audio('/reveal.mp3');
      audio.play().catch(err => console.error('Failed to play reveal sound', err));
    }
  }, [showReveal]);

  useEffect(() => {
    if(!progress) return;
    if((progress.seenStage || 1) < stage){
      setDoc(doc(db,'episodeProgress', progressId), {
        id: progressId,
        seenStage: stage
      }, { merge: true }).catch(err => console.error('Failed to update seen stage', err));
    }
  }, [progress, stage]);

  useEffect(() => {
    return () => {
      const text = reflectionRef.current.trim();
      const r = ratingRef.current;
      const prog = progressRef.current;
      if (!text && r === (prog?.rating || 0)) return;
      const data = {
        id: progressId,
        userId,
        profileId,
        lastUpdated: today,
        rating: r,
        expiresAt: extendExpiry(prog?.expiresAt)
      };
      if (text) data.reflection = text;
      setDoc(doc(db, 'episodeProgress', progressId), data, { merge: true })
        .catch(err => console.error('Failed to save progress on unmount', err));
      const refId = `${userId}-${today}-${profileId}`;
      const refData = {
        id: refId,
        userId,
        date: today,
        rating: r,
        profileName: profile?.name
      };
      if (text) refData.text = text;
      setDoc(doc(db, 'reflections', refId), refData, { merge: true })
        .catch(err => console.error('Failed to save reflection on unmount', err));
    };
  }, []);

  if (!profile) return null;

  const daysLeft = progress?.expiresAt ? Math.ceil((new Date(progress.expiresAt) - getCurrentDate())/86400000) : expiryDays;


  const saveReflection = async (givenRating = rating) => {
    const text = reflection.trim();
    if (!text && givenRating === (progress?.rating || 0)) return;
    const data = {
      id: progressId,
      userId,
      profileId,
      lastUpdated: today,
      rating: givenRating,
      expiresAt: extendExpiry(progress?.expiresAt)
    };
    if (text) data.reflection = text;
    await setDoc(doc(db, 'episodeProgress', progressId), data, { merge: true });
    const refId = `${userId}-${today}-${profileId}`;
    const refData = {
      id: refId,
      userId,
      date: today,
      rating: givenRating,
      profileName: profile?.name
    };
    if (text) refData.text = text;
    await setDoc(doc(db, 'reflections', refId), refData, { merge: true });
  };

  const saveReaction = async () => {
    const text = reaction.trim();
    if (!text) return;
    await setDoc(doc(db, 'episodeProgress', progressId), {
      id: progressId,
      userId,
      profileId,
      lastUpdated: today,
      reaction: text,
      expiresAt: extendExpiry(progress?.expiresAt)
    }, { merge: true });
  };

  const handleClipEnd = async index => {
    if(stage === index + 1 && stage < 3){
      if(stage === 1) await saveReflection();
      await setDoc(doc(db, 'episodeProgress', progressId), {
        id: progressId,
        userId,
        profileId,
        lastUpdated: today,
        expiresAt: extendExpiry(progress?.expiresAt)
      }, { merge: true });
    }
  };

  if (stage >= 3) {
    return React.createElement(ProfileSettings, {
      userId: profileId,
      viewerId: userId,
      publicView: true,
      onBack
    });
  }

  return React.createElement(React.Fragment, null,
    React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement('div', { className: 'flex justify-between items-start mb-4' },
      React.createElement(Button, { className: 'bg-pink-500 text-white', onClick: onBack }, 'Tilbage'),
      stage === 1 && React.createElement('p', {
        className: 'text-xs text-blue-500 underline cursor-pointer',
        onClick: () => setShowHelp(true)
      }, 'Need help?')
    ),
    // The old level 2 intro box has been removed
    React.createElement(SectionTitle, { title: `${profile.name || ''}, ${profile.birthday ? getAge(profile.birthday) : profile.age || ''}${profile.city ? ', ' + profile.city : ''}` }),
    React.createElement('p', { className:`text-left text-xs ${daysLeft <= 0 ? 'text-red-600' : 'text-yellow-600'} mb-2` },
      daysLeft <= 0 ? t('lastDay') : t('expiresIn').replace('{days}', daysLeft)
    ),
    React.createElement(SectionTitle, { title: t('episodeIntro') }),
    profile.clip && React.createElement('p', { className: 'mb-4' }, `"${profile.clip}"`),
    React.createElement(SectionTitle, { title: t('videoClips') }),
    React.createElement('div', { className: 'flex items-center gap-4 mb-4 justify-between' },
      Array.from({ length: 3 }).map((_, i) => {
        const clip = (profile.videoClips || [])[i];
        const url = clip && clip.url ? clip.url : clip;
        const locked = i >= stage;
        const classes = `w-[30%] flex flex-col items-center justify-end min-h-[160px] relative ${locked ? 'pointer-events-none' : ''}`;
        return React.createElement('div', { key: i, className: classes },
          url && React.createElement(VideoPreview, { src: url, onEnded: () => handleClipEnd(i) }),
          !locked && i === stage - 1 && React.createElement('span', { className:'absolute top-1 right-1 bg-green-100 text-green-600 text-xs font-semibold px-1 rounded' }, t('dayLabel').replace('{day}', i + 1)),
          (locked || (showReveal && i === stage - 1)) && React.createElement('div', { className:`absolute inset-0 bg-black/80 flex items-center justify-center rounded text-center px-2 ${showReveal && i === stage - 1 ? 'reveal-animation' : ''}` },
            React.createElement('span', { className:'text-pink-500 text-xs font-semibold' }, t('dayLabel').replace('{day}', i + 1))
          )
        );
      })
    ),
    React.createElement(SectionTitle, { title: t('audioClips') }),
    React.createElement('div', { className: 'space-y-2 mb-4' },
      (profile.audioClips || []).slice(0,3).map((clip, i) => {
        const url = clip && clip.url ? clip.url : clip;
        const locked = i >= stage;
        const aClasses = `flex items-center relative ${locked ? 'pointer-events-none' : ''}`;
        return React.createElement('div', { key: i, className: aClasses },
          React.createElement('audio', { src: url, controls: true, controlsList: 'nodownload noplaybackrate', onRateChange:e=>{e.currentTarget.playbackRate=1;}, className: 'flex-1 mr-2' }),
          !locked && i === stage - 1 && React.createElement('span', { className:'absolute top-1 right-1 bg-green-100 text-green-600 text-xs font-semibold px-1 rounded' }, t('dayLabel').replace('{day}', i + 1)),
          (locked || (showReveal && i === stage - 1)) && React.createElement('div', { className:`absolute inset-0 bg-black/80 flex items-center justify-center rounded text-center px-2 ${showReveal && i === stage - 1 ? 'reveal-animation' : ''}` },
            React.createElement('span', { className:'text-pink-500 text-xs font-semibold' }, t('dayLabel').replace('{day}', i + 1))
          )
        );
      })
    ),
    stage === 1 && React.createElement('div', { className:'mt-6 p-4 bg-gray-50 rounded-lg border border-gray-300' },
      React.createElement('div', { className: 'flex justify-center gap-1 mb-2' },
        [1,2,3,4].map(n => (
          React.createElement(Star, {
            key: n,
            className: `w-6 h-6 cursor-pointer ${n <= rating ? 'fill-pink-500 stroke-pink-500' : 'stroke-gray-400'}`,
            onClick: async () => {
              setRating(n);
              await saveReflection(n);
            }
          })
        ))
      ),
      rating >= 3 && React.createElement('p', { className:'text-xs text-green-700 font-medium text-center' }, t('keepProfile')),
      React.createElement('p', { className: 'text-sm text-gray-500 mb-2 text-center' }, 'Ratingen er privat'),
      React.createElement(Textarea, {
        value: reflection,
        maxLength: MAX_REFLECTION_LEN,
        onChange: e => setReflection(e.target.value.slice(0, MAX_REFLECTION_LEN)),
        onBlur: saveReflection,
        placeholder: t('episodeReflectionPrompt'),
        className: 'mb-1'
      }),
      React.createElement('p', { className:'text-xs text-right text-gray-500 mb-3' },
        t('charactersLeft').replace('{count}', MAX_REFLECTION_LEN - reflection.length))
    ),
    stage === 2 && React.createElement('div', { className:'mt-6 p-4 bg-gray-50 rounded-lg border border-gray-300' },
      progress?.reflection &&
        React.createElement('p', { className: 'italic text-gray-700 mb-2' }, `“${progress.reflection}”`),
      progress?.rating && React.createElement('div', { className:'flex justify-center gap-1 mb-2' },
        [1,2,3,4].map(n => (
          React.createElement(Star, {
            key:n,
            className:`w-5 h-5 ${n <= progress.rating ? 'fill-pink-500 stroke-pink-500' : 'stroke-gray-400'}`
          })
        ))
      ),
      progress?.rating >= 3 && React.createElement('p', { className:'text-xs text-green-700 font-medium text-center mb-2' }, t('keepProfile')),
      React.createElement(Textarea, {
        value: reaction,
        onChange: e => setReaction(e.target.value),
        placeholder: t('episodeReactionPrompt'),
        className: 'mb-4'
      }),
      React.createElement(Button, { className: 'bg-pink-500 text-white', onClick: saveReaction }, 'Gem')
    )
  ),
  showHelp && React.createElement(InfoOverlay, {
    title: 'Need help?',
    onClose: () => setShowHelp(false)
  },
    React.createElement('p', { className:'text-sm text-center' },
      t('level2Intro')
        .replace('{name}', profile.name || '')
        .replace('{day}', stage)
    )
  )
);
}
