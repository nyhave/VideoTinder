import React, { useState, useEffect } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { useT } from '../i18n.js';
import { useCollection, useDoc, db, collection, addDoc, doc, updateDoc } from '../firebase.js';

export default function InviteOverlay({ userId, onClose }) {
  const t = useT();
  const profiles = useCollection('profiles');
  const user = profiles.find(p => p.id === userId) || {};
  const invites = useCollection('invites','inviterId', userId) || [];
  const invitesUsed = invites.filter(inv => inv.gift).length;
  const config = useDoc('config','app') || {};
  const invitesEnabled = config.premiumInvitesEnabled !== false;
  const remaining = 5 - invitesUsed;
  const [recipient, setRecipient] = useState('');
  const [link, setLink] = useState('');
  const [inviteId, setInviteId] = useState(null);

  const createInvite = async () => {
    try {
      const docRef = await addDoc(collection(db,'invites'),{
        inviterId:userId,
        recipient:'',
        created:new Date().toISOString(),
        gift:invitesEnabled && remaining > 0,
        accepted:false
      });
      setInviteId(docRef.id);
      const basePath = new URL('./invite.html', window.location.href).pathname;
      const base = window.location.origin + basePath;
      const giftParam = invitesEnabled && remaining > 0 ? '&gift=1' : '';
      setLink(`${base}?id=${userId}&invite=${docRef.id}${giftParam}`);
    } catch(err){
      console.error('Failed to create invite', err);
    }
  };

  useEffect(() => {
    createInvite();
  }, []);

  useEffect(() => {
    if (!inviteId) return;
    const basePath = new URL('./invite.html', window.location.href).pathname;
    const base = window.location.origin + basePath;
    const giftParam = invitesEnabled && remaining > 0 ? '&gift=1' : '';
    const recipientParam = recipient ? `&recipient=${encodeURIComponent(recipient)}` : '';
    setLink(`${base}?id=${userId}&invite=${inviteId}${giftParam}${recipientParam}`);
  }, [recipient, inviteId]);

  const updateRecipient = async () => {
    if (!inviteId) return;
    try {
      await updateDoc(doc(db,'invites', inviteId), { recipient });
    } catch(err) {
      console.error('Failed to update invite', err);
    }
  };

  const copy = async () => {
    try {
      await updateRecipient();
      await navigator.clipboard.writeText(link);
      alert(t('linkCopied'));
      setRecipient('');
    } catch(err) {
      console.error('Failed to copy link', err);
    }
  };

  const share = async () => {
    await updateRecipient();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'RealDate', url: link });
        setRecipient('');
        return;
      } catch (err) {
        console.error('Share failed', err);
      }
    }
    try {
      await navigator.clipboard.writeText(link);
      alert(t('linkCopied'));
      setRecipient('');
    } catch (err) {
      console.error('Failed to copy link', err);
    }
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
      React.createElement('input', { type: 'text', readOnly: true, className: 'border p-2 rounded w-full mb-2', value: link }),
      invites.length > 0 && React.createElement('div', { className:'mb-4' },
        React.createElement('h3', { className:'font-semibold text-sm mb-1' }, t('inviteList')),
        React.createElement('ul', { className:'text-sm space-y-1' },
          invites.map(inv => React.createElement('li', { key:inv.id, className:'flex justify-between border-b pb-1' },
            React.createElement('span', null, inv.recipient || '-'),
            React.createElement('span', { className: inv.accepted ? 'text-green-600' : 'text-gray-600' }, inv.accepted ? t('inviteAccepted') : t('invitePending'))
          ))
        )
      ),
      React.createElement(Button, { className: 'w-full bg-pink-500 text-white mb-2', onClick: share }, t('share')),
      React.createElement(Button, { className: 'w-full', onClick: copy }, t('copyLink')),
      React.createElement(Button, { className: 'w-full mt-2', onClick: onClose }, t('cancel'))
    )
  );
}
