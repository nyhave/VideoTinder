import React, { useState, useEffect } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { useT } from '../i18n.js';

export default function AdBanner({ user }){
  const t = useT();
  const tier = user?.subscriptionTier || 'free';
  if(tier !== 'free') return null;
  const tierLabel = t('tierGold');
  const ads = [
    {
      text: t('adBannerText').replace('{tier}', tierLabel),
      button: t('adBannerButton'),
      onClick: () => window.dispatchEvent(new CustomEvent('showSubscription'))
    },
    {
      text: t('adInviteText'),
      button: t('adInviteButton'),
      onClick: () => window.dispatchEvent(new CustomEvent('showInvite'))
    }
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % ads.length), 5000);
    return () => clearInterval(id);
  }, [ads.length]);
  const ad = ads[idx];
  return React.createElement(Card, {
    className:'fixed inset-x-0 p-4 bg-yellow-100 text-center shadow-lg z-20',
    style:{ bottom:'calc(env(safe-area-inset-bottom, 0px) + 4rem)' }
  },
    React.createElement('p', { className:'mb-2 text-sm text-gray-800' }, ad.text),
    React.createElement(Button, {
      className:'bg-yellow-500 text-white',
      onClick: ad.onClick
    }, ad.button)
  );
}
