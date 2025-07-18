import React, { useState, useEffect } from 'react';
import { useDoc, db, doc, setDoc } from '../firebase.js';
import { getTodayStr } from '../utils.js';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Textarea } from './ui/textarea.js';
import SectionTitle from './SectionTitle.jsx';
import { useT } from '../i18n.js';
import ProfileSettings from './ProfileSettings.jsx';
import VideoPreview from './VideoPreview.jsx';
import { Star } from 'lucide-react';

export default function ProfileEpisode({ userId, profileId, onBack }) {
  const progressId = `${userId}-${profileId}`;
  const progress = useDoc('episodeProgress', progressId);
  const profile = useDoc('profiles', profileId);
  const t = useT();
  const [reflection, setReflection] = useState('');
  const [reaction, setReaction] = useState('');
  const [rating, setRating] = useState(0);
  useEffect(() => {
    if(progress?.rating) setRating(progress.rating);
  }, [progress]);
  const stepLabels = [
    'Level 1',
    'Level 2',
    'Level 3'
  ];

  if (!profile) return null;
  const stage = progress?.stage || 1;
  const lastDate = progress?.lastUpdated;
  const today = getTodayStr();

  const waiting = lastDate === today && stage !== 3;

  const saveReflection = async () => {
    const text = reflection.trim();
    if (!text) return;
    await setDoc(doc(db, 'episodeProgress', progressId), {
      id: progressId,
      userId,
      profileId,
      stage: 2,
      lastUpdated: today,
      reflection: text,
      rating
    }, { merge: true });
  };

  const saveReaction = async () => {
    const text = reaction.trim();
    if (!text) return;
    await setDoc(doc(db, 'episodeProgress', progressId), {
      id: progressId,
      userId,
      profileId,
      stage: 3,
      lastUpdated: today,
      reaction: text
    }, { merge: true });
  };

  if (stage >= 3) {
    return React.createElement(ProfileSettings, {
      userId: profileId,
      viewerId: userId,
      publicView: true,
      onBack
    });
  }

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(Button, { className: 'mb-4 bg-pink-500 text-white', onClick: onBack }, 'Tilbage'),
    React.createElement('div', { className: 'flex justify-center gap-2 mb-2' },
      stepLabels.map((_, i) => React.createElement('span', {
        key: i,
        className: `w-3 h-3 rounded-full ${i < stage ? 'bg-pink-500' : 'bg-gray-300'}`
      }))
    ),
    React.createElement('p', { className:'text-center text-sm text-gray-600 mb-2' }, stepLabels[stage-1]),
    React.createElement(SectionTitle, { title: t('episodeIntro') }),
    profile.clip && React.createElement('p', { className: 'mb-4' }, `"${profile.clip}"`),
    React.createElement(SectionTitle, { title: t('videoClips') }),
    React.createElement('div', { className: 'flex items-center gap-4 mb-4 justify-between' },
      Array.from({ length: 3 }).map((_, i) => {
        const clip = (profile.videoClips || [])[i];
        const url = clip && clip.url ? clip.url : clip;
        const locked = i >= stage;
        return React.createElement('div', { key: i, className:`w-[30%] flex flex-col items-center justify-end min-h-[160px] ${locked ? 'filter blur-sm pointer-events-none' : ''}` },
          url && React.createElement(VideoPreview, { src: url })
        );
      })
    ),
    React.createElement(SectionTitle, { title: t('audioClips') }),
    React.createElement('div', { className: 'space-y-2 mb-4' },
      (profile.audioClips || []).slice(0,3).map((clip, i) => {
        const url = clip && clip.url ? clip.url : clip;
        const locked = i >= stage;
        return React.createElement('div', { key: i, className:`flex items-center relative ${locked ? 'filter blur-sm pointer-events-none' : ''}` },
          React.createElement('audio', { src: url, controls: true, className: 'flex-1 mr-2' })
        );
      })
    ),
    React.createElement(Button, { className:`mt-2 w-full bg-pink-500 text-white ${stage < 3 ? 'filter blur-sm pointer-events-none' : ''}` }, t('episodeMatchPrompt')),
    stage === 1 && React.createElement(React.Fragment, null,
      React.createElement('div', { className: 'flex justify-center gap-1 mb-2' },
        [1,2,3].map(n => (
          React.createElement(Star, {
            key: n,
            className: `w-6 h-6 cursor-pointer ${n <= rating ? 'fill-pink-500 stroke-pink-500' : 'stroke-gray-400'}`,
            onClick: () => setRating(n)
          })
        ))
      ),
      React.createElement('p', { className: 'text-sm text-gray-500 mb-2 text-center' }, 'Ratingen er privat'),
      React.createElement(Textarea, {
        value: reflection,
        onChange: e => setReflection(e.target.value),
        placeholder: t('episodeReflectionPrompt'),
        className: 'mb-4'
      }),
      waiting ?
        React.createElement('p', { className: 'text-sm text-gray-500' }, t('episodeReturnTomorrow')) :
        React.createElement(Button, { className: 'bg-pink-500 text-white', onClick: saveReflection }, 'Gem')
    ),
    stage === 2 && React.createElement(React.Fragment, null,
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
      waiting ?
        React.createElement('p', { className: 'text-sm text-gray-500' }, t('episodeReturnTomorrow')) :
        React.createElement(Button, { className: 'bg-pink-500 text-white', onClick: saveReaction }, 'Gem')
    )
  );
}
