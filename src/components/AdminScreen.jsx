import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import seedData from '../seedData.js';
import { db, collection, getDocs, doc, updateDoc } from '../firebase.js';
import { useCollection } from '../firebase.js';

export default function AdminScreen({ onOpenStats, onOpenBugReports }) {
  const bugReports = useCollection('bugReports');

  const closeReport = async id => {
    await updateDoc(doc(db, 'bugReports', id), { closed: true });
  };

  const sendPush = async body => {
    const serverKey = process.env.FCM_SERVER_KEY;
    if (!serverKey) {
      alert('FCM_SERVER_KEY not set');
      return;
    }
    const tokensSnap = await getDocs(collection(db, 'pushTokens'));
    await Promise.all(tokensSnap.docs.map(d => {
      const token = d.id;
      return fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'key=' + serverKey
        },
        body: JSON.stringify({ to: token, notification: { title: 'RealDate', body } })
      });
    }));
  };


  const openReports = bugReports.filter(r => !r.closed).slice(0, 3);

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: 'Administration' }),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 text-pink-600' }, 'Reset database'),
    React.createElement(Button, { className: 'mt-2 bg-pink-500 text-white px-4 py-2 rounded', onClick: seedData }, 'Reset database'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-pink-600' }, 'Push notifications'),
    React.createElement(Button, { className: 'mt-2 bg-pink-500 text-white px-4 py-2 rounded mr-2', onClick: () => sendPush('Dagens klip er klar') }, 'Dagens klip er klar'),
    React.createElement(Button, { className: 'mt-2 bg-pink-500 text-white px-4 py-2 rounded', onClick: () => sendPush('Du har et match. Start samtalen') }, 'Du har et match. Start samtalen'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-pink-600' }, 'Statistik'),
    React.createElement(Button, { className: 'mt-2 bg-pink-500 text-white px-4 py-2 rounded', onClick: onOpenStats }, 'Vis statistik'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-pink-600' }, 'Fejlmeldinger'),
    openReports.length ? React.createElement('ul', { className: 'space-y-2' },
      openReports.map(r => React.createElement('li', { key: r.id, className: 'border p-2 rounded' },
        r.screenshotURL && React.createElement('img', { src: r.screenshotURL, className: 'mb-2 max-h-40 object-contain w-full' }),
        React.createElement('p', { className: 'text-sm mb-2' }, r.text),
        React.createElement(Button, { className: 'bg-pink-500 text-white', onClick: () => closeReport(r.id) }, 'Luk')
      ))
    ) : React.createElement('p', { className: 'text-sm text-gray-500' }, 'Ingen åbne fejl'),
    React.createElement(Button, { className: 'mt-2', onClick: onOpenBugReports }, 'Se alle fejlmeldinger')
  );
}
