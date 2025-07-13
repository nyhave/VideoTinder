import React from 'react';
import { languages, useLang, useT } from '../i18n.js';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import seedData from '../seedData.js';
import { db, collection, getDocs } from '../firebase.js';

export default function AdminScreen({ onOpenStats, onOpenBugReports, onOpenMatchLog, profiles = [], userId, onSwitchProfile }) {

  const { lang, setLang } = useLang();
  const t = useT();

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
    React.createElement('label', { className: 'block mb-1' }, t('chooseLanguage')),
    React.createElement('select', {
      className: 'border p-2 mb-4 w-full',
      value: lang,
      onChange: e => setLang(e.target.value)
    },
      Object.entries(languages).map(([code, name]) =>
        React.createElement('option', { key: code, value: code }, name)
      )
    ),
    React.createElement('label', { className: 'block mb-1' }, t('selectUser')),
    React.createElement('select', {
      className: 'border p-2 mb-4 w-full',
      value: userId || '',
      onChange: e => onSwitchProfile(e.target.value)
    },
      profiles.map(p => React.createElement('option', { key: p.id, value: p.id }, p.name))
    ),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 text-pink-600' }, 'Reset database'),
    React.createElement(Button, { className: 'mt-2 bg-pink-500 text-white px-4 py-2 rounded', onClick: () => seedData().then(() => alert('Databasen er nulstillet')) }, 'Reset database'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-pink-600' }, 'Push notifications'),
    React.createElement(Button, { className: 'mt-2 bg-pink-500 text-white px-4 py-2 rounded mr-2', onClick: () => sendPush('Dagens klip er klar') }, 'Dagens klip er klar'),
    React.createElement(Button, { className: 'mt-2 bg-pink-500 text-white px-4 py-2 rounded', onClick: () => sendPush('Du har et match. Start samtalen') }, 'Du har et match. Start samtalen'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-pink-600' }, 'Statistik'),
    React.createElement(Button, { className: 'mt-2 bg-pink-500 text-white px-4 py-2 rounded', onClick: onOpenStats }, 'Vis statistik'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-pink-600' }, 'Matchlog'),
    React.createElement(Button, { className: 'mt-2', onClick: onOpenMatchLog }, 'Se matchlog'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-pink-600' }, 'Fejlmeldinger'),
    React.createElement(Button, { className: 'mt-2', onClick: onOpenBugReports }, 'Se alle fejlmeldinger')
  );
}
