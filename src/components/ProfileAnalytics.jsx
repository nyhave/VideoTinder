import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { useDoc, useCollection } from '../firebase.js';
import { useT } from '../i18n.js';

export default function ProfileAnalytics({ userId, onBack }){
  const profile = useDoc('profiles', userId) || {};
  const matches = useCollection('matches', 'profileId', userId);
  const t = useT();
  return React.createElement(Card, { className:'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: t('analyticsTitle'), action: React.createElement(Button, { className:'bg-blue-500 text-white', onClick:onBack }, t('back')) }),
    React.createElement('p',{className:'mb-2'},`${t('views')}: ${profile.viewCount || 0}`),
    React.createElement('p',{className:'mb-2'},`${t('watchTime')}: ${profile.watchTime || 0} ${t('seconds')}`),
    React.createElement('p',null,`${t('matchConversions')}: ${matches.length}`)
  );
}
