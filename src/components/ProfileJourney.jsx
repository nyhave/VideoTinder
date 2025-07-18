import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Textarea } from './ui/textarea.js';
import VideoOverlay from './VideoOverlay.jsx';
import { useDoc, doc, setDoc, updateDoc, db, collection, useCollection, deleteDoc } from '../firebase.js';
import { Heart, PlayCircle } from 'lucide-react';

export default function ProfileJourney({ profileId, viewerId, onBack }) {
  const profile = useDoc('profiles', profileId);
  const journeyId = `${viewerId}-${profileId}`;
  const journey = useDoc('profileJourneys', journeyId);
  const likes = useCollection('likes', 'userId', viewerId);
  const [text, setText] = useState('');
  const [activeVideo, setActiveVideo] = useState(null);
  if (!profile) return null;

  const likeExists = likes.some(l => l.profileId === profileId);

  const saveReflection = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = new Date().toISOString();
    await setDoc(doc(db, 'profileJourneys', journeyId), {
      id: journeyId,
      userId: viewerId,
      profileId,
      reflection: trimmed,
      reflectionAt: now
    });
    setText('');
  };

  const saveReaction = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = new Date().toISOString();
    await updateDoc(doc(db, 'profileJourneys', journeyId), {
      reaction: trimmed,
      reactionAt: now
    });
    setText('');
  };

  const toggleLike = async () => {
    const likeId = `${viewerId}-${profileId}`;
    const ref = doc(db, 'likes', likeId);
    if (likeExists) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, { id: likeId, userId: viewerId, profileId });
    }
  };

  const now = Date.now();
  let step = 'reflection';
  if (journey) {
    if (journey.reactionAt) {
      const diff = now - new Date(journey.reactionAt).getTime();
      if (diff >= 48 * 3600 * 1000) step = 'connect';
      else step = 'waitReaction';
    } else if (journey.reflectionAt) {
      const diff = now - new Date(journey.reflectionAt).getTime();
      if (diff >= 24 * 3600 * 1000) step = 'reaction';
      else step = 'waitReflection';
    }
  }

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90 relative' },
    React.createElement('button', { className: 'absolute top-2 left-2 text-sm text-gray-500', onClick: onBack }, 'Tilbage'),
    React.createElement('h2', { className: 'text-2xl font-bold mb-2 text-pink-600 text-center' }, profile.name),
    profile.videoClips && profile.videoClips[0] &&
      React.createElement(Button, { variant: 'outline', className: 'mb-2 flex items-center gap-1', onClick: () => setActiveVideo(profile.videoClips[0].url || profile.videoClips[0]) },
        React.createElement(PlayCircle, { className: 'w-5 h-5' }), 'Afspil introduktion'),
    step === 'reflection' && (
      React.createElement(React.Fragment, null,
        React.createElement('p', { className: 'mb-2' }, 'Hvad vækker dette møde i dig?'),
        React.createElement(Textarea, { className: 'mb-2', value: text, onChange: e => setText(e.target.value), placeholder: 'Skriv din refleksion...' }),
        React.createElement(Button, { className: 'bg-pink-500 text-white', onClick: saveReflection, disabled: !text.trim() }, 'Gem refleksion')
      )
    ),
    step === 'waitReflection' && (
      React.createElement('p', { className: 'text-center text-gray-500' }, 'Kom tilbage i morgen for at reagere')
    ),
    step === 'reaction' && (
      React.createElement(React.Fragment, null,
        React.createElement('p', { className: 'mb-2' }, `Din refleksion: ${journey.reflection}`),
        React.createElement(Textarea, { className: 'mb-2', value: text, onChange: e => setText(e.target.value), placeholder: 'Din reaktion...' }),
        React.createElement(Button, { className: 'bg-pink-500 text-white', onClick: saveReaction, disabled: !text.trim() }, 'Gem reaktion')
      )
    ),
    step === 'waitReaction' && (
      React.createElement('p', { className: 'text-center text-gray-500' }, 'Kom tilbage i morgen for at forbinde')
    ),
    step === 'connect' && (
      React.createElement(React.Fragment, null,
        React.createElement('p', { className: 'mb-2' }, journey.reaction ? `Din reaktion: ${journey.reaction}` : ''),
        React.createElement(Button, { variant: 'outline', className: 'flex items-center gap-1', onClick: toggleLike },
          React.createElement(Heart, { className: `w-6 h-6 ${likeExists ? 'text-pink-500' : 'text-gray-500'}` }),
          likeExists ? 'Fjern like' : 'Synes godt om'
        )
      )
    ),
    activeVideo && React.createElement(VideoOverlay, { src: activeVideo, onClose: () => setActiveVideo(null) })
  );
}
