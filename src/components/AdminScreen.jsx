import React from 'react';
import { languages, useLang, useT } from '../i18n.js';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import seedData from '../seedData.js';
import { db, updateDoc, doc } from '../firebase.js';


export default function AdminScreen({ onOpenStats, onOpenBugReports, onOpenMatchLog, onOpenScoreLog, onOpenReports, onOpenCallLog, onOpenFunctionTest, profiles = [], userId, onSwitchProfile }) {

  const { lang, setLang } = useLang();
  const t = useT();

  const sendPush = async body => {
    const resp = await fetch('/.netlify/functions/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body })
    });
    if (!resp.ok) {
      const text = await resp.text();
      alert('Failed: ' + text);
    }
  };


  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: 'Administration', colorClass: 'text-blue-600' }),
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
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 text-blue-600' }, 'Verificering'),
    React.createElement(Button, {
      className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded',
      onClick: async () => {
        const prof = profiles.find(p => p.id === userId) || {};
        await updateDoc(doc(db, 'profiles', userId), { verified: !prof.verified });
      }
    }, (profiles.find(p => p.id === userId) || {}).verified ? 'Fjern verificering' : 'Verificer profil'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 text-blue-600' }, 'Reset database'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: () => seedData().then(() => alert('Databasen er nulstillet')) }, 'Reset database'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, 'Push notifications'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded mr-2', onClick: () => sendPush('Dagens klip er klar') }, 'Dagens klip er klar'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: () => sendPush('Du har et match. Start samtalen') }, 'Du har et match. Start samtalen'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, 'Statistik'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenStats }, 'Vis statistik'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, 'Matchlog'),
      React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenMatchLog }, 'Se matchlog'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, 'Score log'),
      React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenScoreLog }, 'Se score log'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, 'Aktive opkald'),
      React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenCallLog }, 'Se aktive opkald'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, 'Anmeldt indhold'),
      React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenReports }, 'Se anmeldt indhold'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, 'Fejlmeldinger'),
      React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenBugReports }, 'Se alle fejlmeldinger'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, 'Funktionstest'),
      React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenFunctionTest }, 'Åbn funktionstest')
  );
}
