import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import seedData from '../seedData.js';
import { db, collection, getDocs } from '../firebase.js';

export default function AdminScreen() {
  const [firestoreInfo, setFirestoreInfo] = useState(null);

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

  const showFirestoreInfo = async () => {
    const config = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID
    };
    let status = 'OK';
    try {
      await getDocs(collection(db, 'profiles'));
    } catch (err) {
      status = 'FAILED';
    }
    setFirestoreInfo({ config, status });
  };

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: 'Administration' }),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-pink-600' }, 'Firestore info'),
    React.createElement(Button, { className: 'mt-2 bg-pink-500 text-white px-4 py-2 rounded', onClick: showFirestoreInfo }, 'Show credentials'),
    firestoreInfo && React.createElement('pre', { className: 'mt-2 bg-gray-100 p-2 rounded whitespace-pre-wrap text-xs' },
      JSON.stringify(firestoreInfo.config, null, 2) + '\nStatus: ' + firestoreInfo.status
    ),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 text-pink-600' }, 'Reset database'),
    React.createElement(Button, { className: 'mt-2 bg-pink-500 text-white px-4 py-2 rounded', onClick: seedData }, 'Reset database'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-pink-600' }, 'Push notifications'),
    React.createElement(Button, { className: 'mt-2 bg-pink-500 text-white px-4 py-2 rounded mr-2', onClick: () => sendPush('Dagens klip er klar') }, 'Dagens klip er klar'),
    React.createElement(Button, { className: 'mt-2 bg-pink-500 text-white px-4 py-2 rounded', onClick: () => sendPush('Du har et match. Start samtalen') }, 'Du har et match. Start samtalen')
  );
}
