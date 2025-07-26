import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { useCollection, db, doc, updateDoc, deleteDoc } from '../firebase.js';
import { useT } from '../i18n.js';

export default function ReportedContentScreen({ onBack }) {
  const reports = useCollection('reports');
  const profiles = useCollection('profiles');
  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
  const t = useT();

  const openReports = reports.filter(r => r.status !== 'resolved')
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  const [selectedProfile, setSelectedProfile] = useState(null);

  const release = async reps => {
    await Promise.all(reps.map(r => updateDoc(doc(db, 'reports', r.id), { status: 'resolved' })));
  };

  const remove = async reps => {
    const r = reps[0];
    const p = profileMap[r.profileId];
    if (r.clipURL && p && Array.isArray(p.videoClips)) {
      const updated = p.videoClips.filter(c => (c.url || c) !== r.clipURL);
      await updateDoc(doc(db, 'profiles', r.profileId), { videoClips: updated });
    }
    if (r.text) {
      await updateDoc(doc(db, 'profiles', r.profileId), { clip: '' });
    }
    await Promise.all(reps.map(rep => deleteDoc(doc(db, 'reports', rep.id))));
  };

  const groupedByProfile = openReports.reduce((acc, r) => {
    acc[r.profileId] = (acc[r.profileId] || 0) + 1;
    return acc;
  }, {});

  const contentByProfile = profileId => {
    const reportsForProfile = openReports.filter(r => r.profileId === profileId);
    const items = {};
    for (const r of reportsForProfile) {
      const key = r.clipURL ? 'clip:' + r.clipURL : 'text:' + r.text;
      if (!items[key]) items[key] = { clipURL: r.clipURL, text: r.text, reports: [] };
      items[key].reports.push(r);
    }
    return Object.values(items);
  };

  const listView = React.createElement('ul', { className:'space-y-4 mt-4 overflow-y-auto max-h-[70vh]' },
    Object.entries(groupedByProfile).map(([id, count]) =>
      React.createElement('li', { key:id, className:'border p-2 rounded flex justify-between items-center' },
        React.createElement('span', null, profileMap[id]?.name || id),
        React.createElement('div', { className:'flex items-center gap-2' },
          React.createElement('span', { className:'text-sm text-gray-600' }, count),
          React.createElement(Button, { onClick:()=>setSelectedProfile(id) }, 'Vis')
        )
      )
    )
  );

  const detailItems = selectedProfile ? contentByProfile(selectedProfile) : [];

  const detailView = React.createElement('div', null,
    React.createElement(Button, { className:'mb-2', onClick:()=>setSelectedProfile(null) }, 'Tilbage'),
    React.createElement('ul', { className:'space-y-4 overflow-y-auto max-h-[70vh]' },
      detailItems.map((item,i)=>
        React.createElement('li', { key:i, className:'border p-2 rounded' },
          item.clipURL && React.createElement('video', { src:item.clipURL, controls:true, controlsList:'nodownload noplaybackrate', onRateChange:e=>{e.currentTarget.playbackRate=1;}, className:'w-full mb-2' }),
          item.text && React.createElement('p', { className:'mb-2' }, item.text),
          React.createElement('p', { className:'text-sm text-gray-600 mb-1' }, `Antal anmeldelser: ${item.reports.length}`),
          React.createElement('ul', { className:'mb-2 list-disc list-inside text-sm' },
            item.reports.map(r => React.createElement('li', { key:r.id }, r.reason))
          ),
          React.createElement('div', { className:'flex gap-2' },
            React.createElement(Button, { className:'bg-green-500 text-white', onClick:()=>release(item.reports) }, 'Frigiv'),
            React.createElement(Button, { className:'bg-red-500 text-white', onClick:()=>remove(item.reports) }, 'Fjern')
          )
        )
      )
    )
  );

  return React.createElement(Card, { className:'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title:t('reportedContentTitle'), colorClass:'text-blue-600', action: React.createElement(Button, { onClick:onBack }, t('back')) }),
    openReports.length ? (selectedProfile ? detailView : listView)
      : React.createElement('p', { className:'text-center mt-4 text-gray-500' }, 'Ingen anmeldelser')
  );
}
