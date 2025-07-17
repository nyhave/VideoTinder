import React, { useState } from 'react';
import { languages, useLang, useT } from '../i18n.js';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import seedData from '../seedData.js';
import { db, updateDoc, doc, getDoc, storage, listAll, ref, getDownloadURL, messaging, setExtendedLogging, isExtendedLogging } from '../firebase.js';
import { getToken } from 'firebase/messaging';
import { fcmReg } from '../swRegistration.js';


export default function AdminScreen({ onOpenStats, onOpenBugReports, onOpenMatchLog, onOpenScoreLog, onOpenReports, onOpenCallLog, onOpenFunctionTest, onOpenTextLog, profiles = [], userId, onSwitchProfile }) {

  const { lang, setLang } = useLang();
  const t = useT();
  const [logEnabled, setLogEnabled] = useState(isExtendedLogging());

  const toggleLog = () => {
    const val = !logEnabled;
    setLogEnabled(val);
    setExtendedLogging(val);
  };

  const sendPush = async body => {
    const base = process.env.FUNCTIONS_BASE_URL || '';

    const send = async endpoint => {
      const resp = await fetch(`${base}/.netlify/functions/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body })
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text);
      }
    };

    try {
      await send('send-push');
      await send('send-webpush');
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  const logClientToken = async () => {
    try {
      const token = await getToken(messaging, {
        vapidKey: process.env.VAPID_KEY,
        serviceWorkerRegistration: fcmReg
      });
      if (token) {
        alert('Client token: ' + token);
      } else {
        alert('No registration token available.');
      }
    } catch (err) {
      alert('Error getting token: ' + err);
    }
  };

  const showVapidKeys = () => {
    const pub = process.env.WEB_PUSH_PUBLIC_KEY || '';
    const priv = process.env.WEB_PUSH_PRIVATE_KEY || '';
    alert('Public: ' + pub + '\nPrivate: ' + priv);
  };

  const showPushInfo = async () => {
    const values = {
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      WEB_PUSH_PUBLIC_KEY: process.env.WEB_PUSH_PUBLIC_KEY,
      WEB_PUSH_PRIVATE_KEY: process.env.WEB_PUSH_PRIVATE_KEY,
      GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      FUNCTIONS_BASE_URL: process.env.FUNCTIONS_BASE_URL
    };
    let permission = Notification.permission;
    try {
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }
    } catch (err) {
      permission = 'error:' + err.message;
    }
    const lines = Object.entries(values).map(([k, v]) => `${k}: ${v}`);
    lines.push('Notification permission: ' + permission);
    alert(lines.join('\n'));
  };

  const recoverMissing = async () => {
    const profileRef = doc(db, 'profiles', userId);
    const snap = await getDoc(profileRef);
    if (!snap.exists()) return;
    let { photoURL = '', audioClips = [], videoClips = [], language = 'en' } = snap.data();
    const listRef = ref(storage, `profiles/${userId}`);
    const { items } = await listAll(listRef);
    const updates = {};
    for (const item of items) {
      const url = await getDownloadURL(item);
      const name = item.name;
      if (name.startsWith('photo-')) {
        if (!photoURL) {
          photoURL = url;
          updates.photoURL = url;
          updates.photoUploadedAt = new Date().toISOString();
        }
      } else if (name.startsWith('videoClips-')) {
        if (!videoClips.some(v => v.url === url)) {
          videoClips.push({ url, lang: language, uploadedAt: new Date().toISOString() });
          updates.videoClips = videoClips;
        }
      } else if (name.startsWith('audioClips-')) {
        if (!audioClips.some(a => a.url === url)) {
          audioClips.push({ url, lang: language, uploadedAt: new Date().toISOString() });
          updates.audioClips = audioClips;
        }
      }
    }
    if (Object.keys(updates).length) {
      await updateDoc(profileRef, updates);
      alert('Gendannede manglende filer');
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

    // Daily admin section
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, 'Daglig administration'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 text-blue-600' }, 'Fejlmeldinger'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenBugReports }, 'Se alle fejlmeldinger'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, 'Anmeldt indhold'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenReports }, 'Se anmeldt indhold'),

    // Troubleshooting section
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, 'Fejlsøgning og test'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 text-blue-600' }, 'Verificering'),
    React.createElement(Button, {
      className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded',
      onClick: async () => {
        const prof = profiles.find(p => p.id === userId) || {};
        await updateDoc(doc(db, 'profiles', userId), { verified: !prof.verified });
      }
    }, (profiles.find(p => p.id === userId) || {}).verified ? 'Fjern verificering' : 'Verificer profil'),

    React.createElement('h3', { className: 'text-xl font-semibold mb-2 text-blue-600' }, 'Database'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: () => seedData().then(() => alert('Databasen er nulstillet')) }, 'Reset database'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: recoverMissing }, 'Hent mistet fra DB'),

    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, 'Logging'),
    React.createElement('label', { className: 'flex items-center mb-2' },
      React.createElement('input', { type: 'checkbox', className: 'mr-2', checked: logEnabled, onChange: toggleLog }),
      'Udvidet logning'
    ),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenTextLog }, 'Se log'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenMatchLog }, 'Se matchlog'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenScoreLog }, 'Se score log'),

    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, 'Push notifications'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded mr-2', onClick: () => sendPush('Dagens klip er klar') }, 'Dagens klip er klar'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded mr-2', onClick: () => sendPush('Du har et match. Start samtalen') }, 'Du har et match. Start samtalen'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: logClientToken }, 'Log client token'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: showVapidKeys }, 'Show VAPID keys'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: showPushInfo }, 'Show push info'),

    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, 'Statistik'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenStats }, 'Vis statistik'),

    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, 'Aktive opkald'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenCallLog }, 'Se aktive opkald'),

    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, 'Funktionstest'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenFunctionTest }, 'Åbn funktionstest')
  );
}
