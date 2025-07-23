import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { useCollection, db, doc, updateDoc } from '../firebase.js';

export default function BugReportsScreen({ onBack }) {
  const bugReports = useCollection('bugReports');
  const [showClosed, setShowClosed] = useState(false);

  const copyText = async text => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const filtered = bugReports
    .filter(r => showClosed ? r.closed : !r.closed)
    .sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));

  const closeReport = async id => {
    await updateDoc(doc(db, 'bugReports', id), { closed: true });
  };

  const markReady = async id => {
    await updateDoc(doc(db, 'bugReports', id), { readyForTest: true });
  };

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: 'Fejlmeldinger', colorClass: 'text-blue-600', action: React.createElement(Button, { onClick: onBack }, 'Tilbage') }),
    React.createElement(Button, { className: 'mb-2', onClick: () => setShowClosed(!showClosed) }, showClosed ? 'Vis \u00E5bne' : 'Vis lukkede'),
    filtered.length ?
      React.createElement('ul', { className: 'space-y-4 mt-4 overflow-y-auto max-h-[70vh]' },
        filtered.map(r =>
          React.createElement('li', { key: r.id, className: 'border p-2 rounded' },
            r.screenshotURL && React.createElement('img', { src: r.screenshotURL, className: 'mb-2 max-h-40 object-contain w-full' }),
            React.createElement('div', { className: 'flex items-start gap-2 mb-2' },
              React.createElement('p', { className: 'text-sm flex-1' }, r.text),
              React.createElement(Button, { className: 'bg-gray-500 text-white px-2 py-1', onClick: () => copyText(r.text) }, 'Copy')
            ),
            !r.closed && React.createElement('div', { className: 'flex gap-2' },
              !r.readyForTest && React.createElement(Button, { className: 'bg-green-500 text-white flex-1', onClick: () => markReady(r.id) }, 'Klar til test'),
              React.createElement(Button, { className: 'bg-blue-500 text-white flex-1', onClick: () => closeReport(r.id) }, 'Luk')
            ),
            r.readyForTest && React.createElement('p', { className: 'text-green-600 text-sm mt-1' }, 'Klar til test')
          )
        )
      ) :
      React.createElement('p', { className: 'text-center mt-4 text-gray-500' }, showClosed ? 'Ingen lukkede fejl' : 'Ingen fejlmeldinger')
  );
}
