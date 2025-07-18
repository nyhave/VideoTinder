import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Input } from './ui/input.js';
import { useT } from '../i18n.js';
import { useCollection, useDoc, db, collection, setDoc, doc } from '../firebase.js';

export default function InviteOverlay({ userId, onClose }) {
  const t = useT();
  const profiles = useCollection('profiles');
  const user = profiles.find(p => p.id === userId) || {};
  const invitesUsed = user.premiumInvitesUsed || 0;
  const config = useDoc('config','app') || {};
  const invitesEnabled = config.premiumInvitesEnabled !== false;
  const remaining = 5 - invitesUsed;
  const base = window.location.origin + '/VideoTinder/invite.html?id=' + userId;
  const linkBase = invitesEnabled && remaining > 0 ? base + '&gift=1' : base;

  const [name, setName] = useState('');
  const invites = useCollection('invites', 'inviter', userId);
  const [inviteLink, setInviteLink] = useState(linkBase);

  const createInvite = async () => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    try {
      const id = Date.now().toString();
      await setDoc(doc(collection(db, 'invites'), id), {
        inviter: userId,
        name: trimmed,
        createdAt: new Date().toISOString(),
        accepted: false
      });
      const fullLink = linkBase + '&invite=' + id;
      setInviteLink(fullLink);
      return fullLink;
    } catch (err) {
      console.error('Failed to create invite', err);
      return null;
    }
  };

  const copy = async () => {
    const url = await createInvite();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      alert(t('linkCopied'));
    } catch(err) {
      console.error('Failed to copy link', err);
    }
  };

  const share = async () => {
    const url = await createInvite();
    if (!url) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'RealDate', url });
        return;
      } catch (err) {
        console.error('Share failed', err);
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      alert(t('linkCopied'));
    } catch(err) {
      console.error('Failed to copy link', err);
    }
  };

  const text = invitesEnabled
    ? (remaining > 0
        ? `Tilbyd 3 måneders gratis premium. Du har ${remaining} tilbage`
        : 'Du har ikke flere premium invitationer')
    : t('inviteDesc');

  const inviteItems = invites.map(inv =>
    React.createElement('li', { key: inv.id, className: 'flex justify-between mb-1' },
      React.createElement('span', null, inv.name),
      React.createElement('span', { className: 'text-sm text-gray-600' }, inv.accepted ? 'Oprettet' : 'Afventer')
    )
  );

  return React.createElement('div', { className: 'fixed inset-0 z-50 bg-black/50 flex items-center justify-center' },
    React.createElement(Card, { className: 'bg-white p-6 rounded shadow-xl max-w-sm w-full' },
      React.createElement('h2', { className: 'text-xl font-semibold mb-4 text-pink-600 text-center' }, t('inviteFriend')),
      React.createElement('p', { className: 'text-center text-sm mb-4' }, text),
      React.createElement(Input, { type: 'text', placeholder: 'Fornavn', className: 'border p-2 rounded w-full mb-2', value: name, onChange: e => setName(e.target.value) }),
      React.createElement('input', { type: 'text', readOnly: true, className: 'border p-2 rounded w-full mb-4', value: inviteLink }),
      React.createElement(Button, { className: 'w-full bg-pink-500 text-white mb-2', onClick: share }, t('share')),
      React.createElement(Button, { className: 'w-full', onClick: copy }, t('copyLink')),
      invites.length > 0 && React.createElement('ul', { className: 'mt-4 mb-2' }, inviteItems),
      React.createElement(Button, { className: 'w-full mt-2', onClick: onClose }, t('cancel'))
    )
  );
}
