import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { useCollection, db, collection, query, where, getDocs, deleteDoc } from '../firebase.js';

export default function TrackUserScreen({ profiles = [], onBack }) {
  const [userId, setUserId] = useState(profiles[0]?.id || '');
  const logs = useCollection('textLogs', 'details.userId', userId);
  const sorted = logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const resetLogs = async () => {
    const q = query(collection(db, 'textLogs'), where('details.userId', '==', userId));
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
  };

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90 overflow-y-auto max-h-[90vh]' },
    React.createElement(SectionTitle, { title: 'F\u00f8lg bruger', colorClass: 'text-blue-600', action: React.createElement(Button, { onClick: onBack }, 'Tilbage') }),
    React.createElement('label', { className: 'block mb-1' }, 'V\u00e6lg bruger'),
    React.createElement('select', { className: 'border p-2 mb-4 w-full', value: userId, onChange: e => setUserId(e.target.value) },
      profiles.map(p => React.createElement('option', { key: p.id, value: p.id }, p.name))
    ),
    React.createElement(Button, { className: 'mb-4 bg-blue-500 text-white px-4 py-2 rounded', onClick: resetLogs }, 'Reset log'),
    sorted.length ?
      React.createElement('ul', { className: 'space-y-2' },
        sorted.map(l =>
          React.createElement('li', { key: l.id, className: 'border-b pb-1 text-sm' },
            React.createElement('div', { className: 'font-mono text-xs text-gray-500' }, l.timestamp),
            React.createElement('div', null, l.event),
            l.details && React.createElement('pre', { className: 'whitespace-pre-wrap break-words text-xs' }, JSON.stringify(l.details, null, 2))
          )
        )
      ) :
      React.createElement('p', { className: 'text-center mt-4 text-gray-500' }, 'Ingen logs')
  );
}
