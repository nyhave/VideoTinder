import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { useCollection, db, doc, updateDoc, deleteDoc } from '../firebase.js';

export default function ReportedContentScreen({ onBack }) {
  const reports = useCollection('reports');
  const profiles = useCollection('profiles');
  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));

  const openReports = reports.filter(r => r.status !== 'resolved')
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  const release = async id => {
    await updateDoc(doc(db, 'reports', id), { status: 'resolved' });
  };

  const remove = async r => {
    const p = profileMap[r.profileId];
    if (p && Array.isArray(p.videoClips)) {
      const updated = p.videoClips.filter(c => (c.url || c) !== r.clipURL);
      await updateDoc(doc(db, 'profiles', r.profileId), { videoClips: updated });
    }
    await deleteDoc(doc(db, 'reports', r.id));
  };

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: 'Anmeldt indhold', action: React.createElement(Button, { onClick: onBack }, 'Tilbage') }),
    openReports.length ?
      React.createElement('ul', { className: 'space-y-4 mt-4 overflow-y-auto max-h-[70vh]' },
        openReports.map(r =>
          React.createElement('li', { key: r.id, className: 'border p-2 rounded' },
            React.createElement('p', null, `Profil: ${profileMap[r.profileId]?.name || r.profileId}`),
            r.clipURL && React.createElement('video', { src: r.clipURL, controls: true, className: 'w-full mb-2' }),
            React.createElement('div', { className: 'flex gap-2' },
              React.createElement(Button, { className: 'bg-green-500 text-white', onClick: () => release(r.id) }, 'Frigiv'),
              React.createElement(Button, { className: 'bg-red-500 text-white', onClick: () => remove(r) }, 'Fjern')
            )
          )
        )
      ) :
      React.createElement('p', { className: 'text-center mt-4 text-gray-500' }, 'Ingen anmeldelser')
  );
}
