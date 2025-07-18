import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { useT } from '../i18n.js';
import { useCollection, useDoc } from '../firebase.js';

export default function InviteOverlay({ userId, onClose }) {
  const t = useT();
  const profiles = useCollection('profiles');
  const user = profiles.find(p => p.id === userId) || {};
  const invitesUsed = user.premiumInvitesUsed || 0;
  const config = useDoc('config','app') || {};
  const invitesEnabled = config.premiumInvitesEnabled !== false;
  const remaining = 5 - invitesUsed;
  const [recipient, setRecipient] = useState('');
  const base = window.location.origin + '/VideoTinder/invite.html?id=' + userId;
  const giftParam = invitesEnabled && remaining > 0 ? '&gift=1' : '';
  const recipientParam = recipient ? `&recipient=${encodeURIComponent(recipient)}` : '';
  const link = base + giftParam + recipientParam;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      alert(t('linkCopied'));
    } catch(err) {
      console.error('Failed to copy link', err);
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'RealDate', url: link });
        return;
      } catch (err) {
        console.error('Share failed', err);
      }
    }
    copy();
  };

  const text = invitesEnabled
    ? (remaining > 0
        ? `Tilbyd 3 måneders gratis premium. Du har ${remaining} tilbage`
        : 'Du har ikke flere premium invitationer')
    : t('inviteDesc');

  return React.createElement('div', { className: 'fixed inset-0 z-50 bg-black/50 flex items-center justify-center' },
    React.createElement(Card, { className: 'bg-white p-6 rounded shadow-xl max-w-sm w-full' },
      React.createElement('h2', { className: 'text-xl font-semibold mb-4 text-pink-600 text-center' }, t('inviteFriend')),
      React.createElement('p', { className: 'text-center text-sm mb-4' }, text),
      React.createElement('input', {
        type: 'text',
        placeholder: t('firstName'),
        className: 'border p-2 rounded w-full mb-2',
        value: recipient,
        onChange: e => setRecipient(e.target.value)
      }),
      React.createElement('input', { type: 'text', readOnly: true, className: 'border p-2 rounded w-full mb-4', value: link }),
      React.createElement(Button, { className: 'w-full bg-pink-500 text-white mb-2', onClick: share }, t('share')),
      React.createElement(Button, { className: 'w-full', onClick: copy }, t('copyLink')),
      React.createElement(Button, { className: 'w-full mt-2', onClick: onClose }, t('cancel'))
    )
  );
}
