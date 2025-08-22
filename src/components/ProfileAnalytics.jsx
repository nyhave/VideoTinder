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
  const tier = profile.subscriptionTier;
  const isGold = tier === 'gold';
  const views = profile.viewCount || 0;
  const watchTime = profile.watchTime || 0;
  const likeCount = profile.likeCount || 0;
  const avgWatch = views ? (watchTime / views).toFixed(1) : 0;
  const matchRate = views ? Math.round((matches.length / views) * 100) : 0;
  return React.createElement(Card, { className:'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: t('analyticsTitle'), action: React.createElement(Button, { className:'bg-blue-500 text-white', onClick:onBack }, t('back')) }),
    React.createElement('p',{className:'mb-2'},`${t('views')}: ${views}`),
    React.createElement('p',{className:'mb-2'},`${t('watchTime')}: ${watchTime} ${t('seconds')}`),
    React.createElement('p',{className:'mb-2'},`${t('matchConversions')}: ${matches.length}`),
    isGold && React.createElement('p',{className:'mb-2'},`${t('likes')}: ${likeCount}`),
    isGold && React.createElement('p',{className:'mb-2'},`${t('matchRate')}: ${matchRate}%`)
  );
}
