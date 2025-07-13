import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Textarea } from './ui/textarea.js';
import { db, doc, setDoc } from '../firebase.js';

export default function ReportOverlay({ userId, profileId, clipURL = '', text = '', onClose }) {
  const [reason, setReason] = useState('');
  const submit = async () => {
    const id = Date.now().toString();
    await setDoc(doc(db, 'reports', id), {
      id,
      reporterId: userId,
      profileId,
      clipURL,
      text,
      reason,
      createdAt: new Date().toISOString(),
      status: 'open'
    });
    alert('Tak for din anmeldelse');
    onClose();
  };
  return React.createElement('div', { className:'fixed inset-0 z-50 bg-black/50 flex items-center justify-center' },
    React.createElement(Card, { className:'bg-white p-6 rounded shadow-xl max-w-sm w-full' },
      React.createElement('h2', { className:'text-xl font-semibold mb-4 text-pink-600 text-center' }, 'Anmeld indhold'),
      React.createElement('p', { className:'mb-2 text-center' }, 'Vil du anmelde dette indhold?'),
      React.createElement(Textarea, {
        className: 'mb-4 border p-2 rounded w-full',
        placeholder: 'Beskriv hvorfor...',
        value: reason,
        onChange: e => setReason(e.target.value)
      }),
      React.createElement(Button, { className:'w-full bg-pink-500 text-white mb-2', disabled: !reason.trim(), onClick: submit }, 'Anmeld'),
      React.createElement(Button, { className:'w-full', onClick: onClose }, 'Annuller')
    )
  );
}
