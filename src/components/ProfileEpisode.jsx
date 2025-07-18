import React, { useState, useEffect } from 'react';
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
  const t = useT();
  const profileHasSub = profile?.subscriptionExpires && new Date(profile.subscriptionExpires) > getCurrentDate();
  const expiryDays = profileHasSub ? 10 : 5;
  const [reflection, setReflection] = useState('');
  const [reaction, setReaction] = useState('');
  const [rating, setRating] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const extendExpiry = (current) => {
    const base = current && new Date(current) > getCurrentDate()
      ? new Date(current) : getCurrentDate();
    const next = new Date(base);
    next.setDate(base.getDate() + expiryDays);
    return next.toISOString();
  };
  useEffect(() => {
    if(progress?.rating) setRating(progress.rating);
  }, [progress]);
  const stepLabels = [
    'Level 1',
    'Level 2',
    'Level 3'
  ];

  const stage = progress?.stage || 1;
  const today = getTodayStr();

  useEffect(() => {
    if(!profile) return;
    if(!progress) {
      const expiresAt = extendExpiry();
      setDoc(doc(db,'episodeProgress', progressId), {
        id: progressId,
        userId,
        profileId,
        stage: 1,
        expiresAt
      }, { merge: true }).catch(err => console.error('Failed to init progress', err));
    }
  }, [profile, progress]);

  if (!profile) return null;

  const daysLeft = progress?.expiresAt ? Math.ceil((new Date(progress.expiresAt) - getCurrentDate())/86400000) : expiryDays;

  const showWatchLine = (profile.videoClips?.length || 0) > 0 || (profile.audioClips?.length || 0) > 0;
  const showRatingLine = !progress?.rating;

  const saveReflection = async () => {
    const text = reflection.trim();
    if (!text) return;
    await setDoc(doc(db, 'episodeProgress', progressId), {
      id: progressId,
      userId,
      profileId,
      lastUpdated: today,
      reflection: text,
      rating,
      expiresAt: extendExpiry(progress?.expiresAt)
    }, { merge: true });
    const refId = `${userId}-${today}-${profileId}`;
    await setDoc(doc(db, 'reflections', refId), {
      id: refId,
      userId,
      date: today,
      text
    }, { merge: true });
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
        stage: stage + 1,
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
    React.createElement(Button, { className: 'mb-4 bg-pink-500 text-white', onClick: onBack }, 'Tilbage'),
    React.createElement('div', { className:'w-[300px] mx-auto text-left border border-gray-300 rounded p-4 mb-4' },
      React.createElement('div', { className: 'flex justify-start gap-2 mb-2' },
        stepLabels.map((_, i) => React.createElement('span', {
          key: i,
          className: `w-3 h-3 rounded-full ${i < stage ? 'bg-pink-500' : 'bg-gray-300'}`
        }))
      ),
      React.createElement('p', { className:'text-left text-sm text-gray-600 mb-2' }, stepLabels[stage-1]),
      stage === 1 && React.createElement('p', { className:'text-left text-sm mb-2 text-gray-700 font-medium' }, t('level2Intro').replace('{name}', profile.name || '')),
      stage === 1 && React.createElement('ul', { className:'list-disc list-inside text-sm' },
        [
          showWatchLine && React.createElement('li', { key:'watch' }, t('level2Watch')),
          showRatingLine && React.createElement('li', { key:'rate' }, t('level2Rate')),
          React.createElement('li', { key:'reflect' }, t('level2Reflect'))
        ].filter(Boolean)
      ),
      stage === 1 && React.createElement('p', {
        className:'text-right text-xs text-blue-500 underline cursor-pointer mt-1',
        onClick: ()=>setShowHelp(true)
      }, 'Need help?')
    ),
    React.createElement(SectionTitle, { title: `${profile.name || ''}, ${profile.birthday ? getAge(profile.birthday) : profile.age || ''}${profile.city ? ', ' + profile.city : ''}` }),
    React.createElement('p', { className:'text-left text-xs text-yellow-600 mb-2' }, t('expiresIn').replace('{days}', daysLeft)),
    React.createElement(SectionTitle, { title: t('episodeIntro') }),
    profile.clip && React.createElement('p', { className: 'mb-4' }, `"${profile.clip}"`),
    React.createElement(SectionTitle, { title: t('videoClips') }),
    React.createElement('div', { className: 'flex items-center gap-4 mb-4 justify-between' },
      Array.from({ length: 3 }).map((_, i) => {
        const clip = (profile.videoClips || [])[i];
        const url = clip && clip.url ? clip.url : clip;
        const locked = i >= stage;
        return React.createElement('div', { key: i, className:`w-[30%] flex flex-col items-center justify-end min-h-[160px] relative ${locked ? 'pointer-events-none' : ''}` },
          url && React.createElement(VideoPreview, { src: url, onEnded: () => handleClipEnd(i) }),
          !locked && i === stage - 1 && React.createElement('span', { className:'absolute top-1 right-1 bg-green-100 text-green-600 text-xs font-semibold px-1 rounded' }, t('newLabel')),
          locked && React.createElement('div', { className:'absolute inset-0 bg-black/80 flex items-center justify-center rounded text-center px-2' },
            React.createElement('span', { className:'text-pink-500 text-xs font-semibold' }, t('unlockHigherLevels'))
          )
        );
      })
    ),
    React.createElement(SectionTitle, { title: t('audioClips') }),
    React.createElement('div', { className: 'space-y-2 mb-4' },
      (profile.audioClips || []).slice(0,3).map((clip, i) => {
        const url = clip && clip.url ? clip.url : clip;
        const locked = i >= stage;
        return React.createElement('div', { key: i, className:`flex items-center relative ${locked ? 'pointer-events-none' : ''}` },
          React.createElement('audio', { src: url, controls: true, className: 'flex-1 mr-2' }),
          !locked && i === stage - 1 && React.createElement('span', { className:'absolute top-1 right-1 bg-green-100 text-green-600 text-xs font-semibold px-1 rounded' }, t('newLabel')),
          locked && React.createElement('div', { className:'absolute inset-0 bg-black/80 flex items-center justify-center rounded text-center px-2' },
            React.createElement('span', { className:'text-pink-500 text-xs font-semibold' }, t('unlockHigherLevels'))
          )
        );
      })
    ),
    React.createElement('div', { className:'relative' },
      React.createElement(Button, { className:`mt-2 w-full bg-pink-500 text-white ${stage < 3 ? 'opacity-50 pointer-events-none' : ''}` }, t('episodeMatchPrompt')),
      stage < 3 && React.createElement('span', { className:'absolute inset-0 m-auto text-pink-500 text-xs font-semibold flex items-center justify-center text-center px-2' }, t('unlockHigherLevels'))
    ),
    stage === 1 && React.createElement('div', { className:'mt-6 p-4 bg-gray-50 rounded-lg border border-gray-300' },
      React.createElement('div', { className: 'flex justify-center gap-1 mb-2' },
        [1,2,3].map(n => (
          React.createElement(Star, {
            key: n,
            className: `w-6 h-6 cursor-pointer ${n <= rating ? 'fill-pink-500 stroke-pink-500' : 'stroke-gray-400'}`,
            onClick: async () => {
              setRating(n);
              await saveReflection();
            }
          })
        ))
      ),
      React.createElement('p', { className: 'text-sm text-gray-500 mb-2 text-center' }, 'Ratingen er privat'),
      React.createElement(Textarea, {
        value: reflection,
        onChange: e => setReflection(e.target.value),
        onBlur: saveReflection,
        placeholder: t('episodeReflectionPrompt'),
        className: 'mb-4'
      })
    ),
    stage === 2 && React.createElement('div', { className:'mt-6 p-4 bg-gray-50 rounded-lg border border-gray-300' },
      progress?.reflection &&
        React.createElement('p', { className: 'italic text-gray-700 mb-2' }, `“${progress.reflection}”`),
      progress?.rating && React.createElement('div', { className:'flex justify-center gap-1 mb-2' },
        [1,2,3].map(n => (
          React.createElement(Star, {
            key:n,
            className:`w-5 h-5 ${n <= progress.rating ? 'fill-pink-500 stroke-pink-500' : 'stroke-gray-400'}`
          })
        ))
      ),
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
    onClose: ()=>setShowHelp(false)
  },
    React.createElement('div', { className:'space-y-2 text-sm' },
      React.createElement('p', null, t('level2Intro').replace('{name}', profile.name || '')),
      React.createElement('ul', { className:'list-disc list-inside' },
        React.createElement('li', null, t('level2Watch')),
        React.createElement('li', null, t('level2Rate')),
        React.createElement('li', null, t('level2Reflect'))
      )
    )
  )
);
}
