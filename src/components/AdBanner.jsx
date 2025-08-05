import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { useT } from '../i18n.js';

export default function AdBanner({ user }){
  const t = useT();
  const tier = user?.subscriptionTier || 'free';
  if(tier !== 'free') return null;
  return React.createElement(Card, { className:'p-4 mb-4 bg-yellow-100 text-center' },
    React.createElement('p', { className:'mb-2 text-sm text-gray-800' }, t('adBannerText')),
    React.createElement(Button, { className:'bg-yellow-500 text-white', onClick:()=>window.dispatchEvent(new CustomEvent('showSubscription')) }, t('adBannerButton'))
  );
}
