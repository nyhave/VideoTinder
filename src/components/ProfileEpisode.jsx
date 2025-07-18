import React, { useState } from 'react';
import { useDoc, db, doc, setDoc } from '../firebase.js';
import { getTodayStr } from '../utils.js';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Textarea } from './ui/textarea.js';
import SectionTitle from './SectionTitle.jsx';
import { useT } from '../i18n.js';
import ProfileSettings from './ProfileSettings.jsx';

export default function ProfileEpisode({ userId, profileId, onBack }) {
  const progressId = `${userId}-${profileId}`;
  const progress = useDoc('episodeProgress', progressId);
  const profile = useDoc('profiles', profileId);
  const t = useT();
  const [reflection, setReflection] = useState('');
  const [reaction, setReaction] = useState('');

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
      reflection: text
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
    React.createElement(SectionTitle, { title: t('episodeIntro') }),
    profile.clip && React.createElement('p', { className: 'mb-4' }, `"${profile.clip}"`),
    stage === 1 && React.createElement(React.Fragment, null,
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
