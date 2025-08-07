import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { useT } from '../i18n.js';

export default function AdBanner({ user }){
  const t = useT();
  const tier = user?.subscriptionTier || 'free';
  if(tier !== 'free') return null;
  const tierLabel = t('tierSilver');
  return React.createElement(Card, {
    className:'fixed inset-x-0 p-4 bg-yellow-100 text-center shadow-lg z-20',
    style:{ bottom:'calc(env(safe-area-inset-bottom, 0px) + 4rem)' }
  },
    React.createElement('p', { className:'mb-2 text-sm text-gray-800' }, t('adBannerText').replace('{tier}', tierLabel)),
    React.createElement(Button, {
      className:'bg-yellow-500 text-white',
      onClick:()=>window.dispatchEvent(new CustomEvent('showSubscription'))
    }, t('adBannerButton'))
  );
}
