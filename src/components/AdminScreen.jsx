import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import seedData from '../seedData.js';
import { db, collection, getDocs } from '../firebase.js';
import { useCollection } from '../firebase.js';

export default function AdminScreen({ onOpenStats }) {
  const bugReports = useCollection('bugReports');

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
    React.createElement('ul', { className: 'space-y-2' },
      bugReports.map(r => React.createElement('li', { key: r.id, className: 'border p-2 rounded' },
        r.screenshotURL && React.createElement('img', { src: r.screenshotURL, className: 'mb-2 max-h-40 object-contain w-full' }),
        React.createElement('p', { className: 'text-sm' }, r.text)
      ))
    )
  );
}
