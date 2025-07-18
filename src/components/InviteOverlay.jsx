import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { useT } from '../i18n.js';

export default function InviteOverlay({ onClose }) {
  const t = useT();
  const link = window.location.origin;

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

  return React.createElement('div', { className: 'fixed inset-0 z-50 bg-black/50 flex items-center justify-center' },
    React.createElement(Card, { className: 'bg-white p-6 rounded shadow-xl max-w-sm w-full' },
      React.createElement('h2', { className: 'text-xl font-semibold mb-4 text-pink-600 text-center' }, t('inviteFriend')),
      React.createElement('p', { className: 'text-center text-sm mb-4' }, t('inviteDesc')),
      React.createElement('input', { type: 'text', readOnly: true, className: 'border p-2 rounded w-full mb-4', value: link }),
      React.createElement(Button, { className: 'w-full bg-pink-500 text-white mb-2', onClick: share }, t('share')),
      React.createElement(Button, { className: 'w-full', onClick: copy }, t('copyLink')),
      React.createElement(Button, { className: 'w-full mt-2', onClick: onClose }, t('cancel'))
    )
  );
}
