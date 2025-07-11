import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { useCollection, db, doc, updateDoc } from '../firebase.js';

export default function BugReportsScreen({ onBack }) {
  const bugReports = useCollection('bugReports');

  const closeReport = async id => {
    await updateDoc(doc(db, 'bugReports', id), { closed: true });
  };

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: 'Fejlmeldinger', action: React.createElement(Button, { onClick: onBack }, 'Tilbage') }),
    bugReports.length ?
      React.createElement('ul', { className: 'space-y-4 mt-4 overflow-y-auto max-h-[70vh]' },
        bugReports.map(r =>
          React.createElement('li', { key: r.id, className: 'border p-2 rounded' },
            r.screenshotURL && React.createElement('img', { src: r.screenshotURL, className: 'mb-2 max-h-40 object-contain w-full' }),
            React.createElement('p', { className: 'text-sm mb-2' }, r.text),
            !r.closed && React.createElement(Button, { className: 'bg-pink-500 text-white', onClick: () => closeReport(r.id) }, 'Luk')
          )
        )
      ) :
      React.createElement('p', { className: 'text-center mt-4 text-gray-500' }, 'Ingen fejlmeldinger')
  );
}
