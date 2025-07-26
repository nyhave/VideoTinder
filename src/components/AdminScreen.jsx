import React, { useState } from 'react';
import { languages, useLang, useT } from '../i18n.js';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import seedData from '../seedData.js';
import { db, collection, getDocs, deleteDoc, updateDoc, doc, getDoc, query, where, storage, listAll, ref, getDownloadURL, deleteObject, messaging, setExtendedLogging, isExtendedLogging, useDoc } from '../firebase.js';
import { setConsoleCapture, isConsoleCapture } from '../consoleLogs.js';
import { advanceDay, resetDay, getTodayStr } from '../utils.js';
import { getToken } from 'firebase/messaging';
import { fcmReg } from '../swRegistration.js';
import { triggerHaptic } from '../haptics.js';


export default function AdminScreen({ onOpenStats, onOpenBugReports, onOpenMatchLog, onOpenScoreLog, onOpenReports, onOpenCallLog, onOpenFunctionTest, onOpenRevealTest, onOpenTextLog, onOpenTextPieces, onOpenUserLog, onOpenServerLog, onOpenRecentLogins, onOpenGraphics, profiles = [], userId, onSwitchProfile, onSaveUserLogout }) {

  const { lang, setLang } = useLang();
  const t = useT();
  const [logEnabled, setLogEnabled] = useState(isExtendedLogging());
  const [consoleEnabled, setConsoleEnabled] = useState(isConsoleCapture());
  const config = useDoc('config', 'app') || {};
  const invitesEnabled = config.premiumInvitesEnabled !== false;
  const showLevels = config.showLevels !== false;
  const pageInfoUrl = 'https://raw.githubusercontent.com/nyhave/VideoTinder/main/docs/app-pages-da.md';

  const toggleLog = () => {
    const val = !logEnabled;
    setLogEnabled(val);
    setExtendedLogging(val);
  };

  const toggleConsole = () => {
    const val = !consoleEnabled;
    setConsoleEnabled(val);
    setConsoleCapture(val);
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
        vapidKey: process.env.FCM_VAPID_KEY,
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

  const compareVapidKeys = async () => {
    const base = process.env.FUNCTIONS_BASE_URL || '';
    const toHex = buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    const hash = async str => toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)));
    try {
      const resp = await fetch(`${base}/.netlify/functions/vapid-info`);
      if (!resp.ok) throw new Error('status ' + resp.status);
      const server = await resp.json();
      const local = {
        WEB_PUSH_PUBLIC_KEY: process.env.WEB_PUSH_PUBLIC_KEY || '',
        WEB_PUSH_PRIVATE_KEY: process.env.WEB_PUSH_PRIVATE_KEY || ''
      };
      const lines = await Promise.all(Object.entries(local).map(async ([k, v]) => {
        const localLen = v.length;
        const localHash = await hash(v);
        const serverInfo = server[k] || { length: 0, sha256: '' };
        const match = localLen === serverInfo.length && localHash === serverInfo.sha256;
        return `${k}: ${match ? '✔' : '✖'} local ${localLen}, server ${serverInfo.length}`;
      }));
      alert(lines.join('\n'));
    } catch (err) {
      alert('Comparison failed: ' + err.message);
    }
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

  const checkAuthAccess = async () => {
    const base = process.env.FUNCTIONS_BASE_URL || '';
    try {
      const resp = await fetch(`${base}/.netlify/functions/check-auth`);
      if (!resp.ok) throw new Error(await resp.text());
      alert('Auth access OK');
    } catch (err) {
      alert('Auth check failed: ' + err.message);
    }
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

  const deleteUser = async () => {
    if (!userId) return;
    if (!window.confirm('Delete user?')) return;
    try {
      const snap = await getDoc(doc(db, 'profiles', userId));
      const uid = snap.exists() ? snap.data().uid : null;
      const removeFrom = async (col, field) => {
        const q = query(collection(db, col), where(field, '==', userId));
        const res = await getDocs(q);
        await Promise.all(res.docs.map(d => deleteDoc(d.ref)));
      };
      await Promise.all([
        removeFrom('likes', 'userId'),
        removeFrom('likes', 'profileId'),
        removeFrom('matches', 'userId'),
        removeFrom('matches', 'profileId'),
        removeFrom('reflections', 'userId'),
        removeFrom('episodeProgress', 'userId'),
        removeFrom('episodeProgress', 'profileId'),
        removeFrom('pushTokens', 'userId'),
        removeFrom('webPushSubscriptions', 'userId')
      ]);
      const logsQ = query(collection(db, 'textLogs'), where('details.userId', '==', userId));
      const logsRes = await getDocs(logsQ);
      await Promise.all(logsRes.docs.map(d => deleteDoc(d.ref)));
      if (uid) await deleteDoc(doc(db, 'users', uid));
      await deleteDoc(doc(db, 'profiles', userId));
      try {
        const folder = ref(storage, `profiles/${userId}`);
        const { items } = await listAll(folder);
        await Promise.all(items.map(i => deleteObject(i)));
      } catch (err) {
        console.error('Failed to delete storage', err);
      }
      onSwitchProfile(profiles.find(p => p.id !== userId)?.id || '');
    } catch (err) {
      alert('Failed to delete user: ' + err.message);
    }
  };

  const resetAllCandidates = async () => {
    if (!window.confirm('Reset all candidates?')) return;
    try {
      const removeAll = async col => {
        const snap = await getDocs(collection(db, col));
        await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
      };
      await Promise.all([
        removeAll('likes'),
        removeAll('matches'),
        removeAll('episodeProgress')
      ]);
      alert('Alle kandidater nulstillet');
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  const testHaptic = () => {
    triggerHaptic([100, 50, 100]);
  };


  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: t('adminTitle'), colorClass: 'text-blue-600' }),
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
    React.createElement('div', { className: 'flex gap-2 mb-4' },
      React.createElement('select', {
        className: 'border p-2 flex-1',
        value: userId || '',
        onChange: e => onSwitchProfile(e.target.value)
      },
        profiles.map(p => React.createElement('option', { key: p.id, value: p.id }, p.name))
      ),
      onSaveUserLogout && React.createElement(Button, {
        className: 'bg-blue-500 text-white px-4 py-2 rounded whitespace-nowrap',
        onClick: onSaveUserLogout
      }, 'Save & Logout')
    ),

  // Daily admin section
  React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, t('adminDaily')),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenReports }, 'Se anmeldt indhold'),
    React.createElement('div', { className: 'mt-2' },
      React.createElement(Button, {
        className: 'bg-blue-500 text-white px-4 py-2 rounded mr-2',
        onClick: async () => {
          const prof = profiles.find(p => p.id === userId) || {};
          await updateDoc(doc(db, 'profiles', userId), { verified: !prof.verified });
        }
      }, (profiles.find(p => p.id === userId) || {}).verified ? 'Fjern verificering' : 'Verificer profil'),
      React.createElement(Button, {
        className: 'bg-red-500 text-white px-4 py-2 rounded',
        onClick: deleteUser
      }, 'Delete user')
    ),

  // Business section
  React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, t('adminBusiness')),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenStats }, 'Vis statistik'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenRecentLogins }, 'Se seneste logins'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenCallLog }, 'Se aktive opkald'),

  // Tester section
  React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, t('adminTesters')),
    React.createElement('p', { className: 'mb-2' }, 'Dagens dato: ' + getTodayStr()),
    React.createElement('div', { className: 'flex gap-2 mb-4' },
      React.createElement(Button, {
        className: 'bg-blue-500 text-white px-4 py-2 rounded',
        onClick: () => { advanceDay(); location.reload(); }
      }, 'Næste dag'),
      React.createElement(Button, {
        className: 'bg-blue-500 text-white px-4 py-2 rounded',
        onClick: () => { resetDay(); location.reload(); }
      }, 'Reset dag')
    ),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 text-blue-600' }, t('adminBugReports')),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenBugReports }, 'Se alle fejlmeldinger'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, t('adminDatabase')),
    React.createElement(Button, { className: 'mt-2 bg-red-500 text-white px-4 py-2 rounded', onClick: resetAllCandidates }, 'Reset all candidates'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, t('adminLogging')),
    React.createElement('label', { className: 'flex items-center mb-2' },
      React.createElement('input', { type: 'checkbox', className: 'mr-2', checked: logEnabled, onChange: toggleLog }),
      'Udvidet logning'
    ),
    React.createElement('label', { className: 'flex items-center mb-2' },
      React.createElement('input', { type: 'checkbox', className: 'mr-2', checked: consoleEnabled, onChange: toggleConsole }),
      'Vis console log'
    ),
    React.createElement('label', { className: 'flex items-center mb-2' },
      React.createElement('input', {
        type: 'checkbox',
        className: 'mr-2',
        checked: invitesEnabled,
        onChange: () => updateDoc(doc(db, 'config', 'app'), { premiumInvitesEnabled: !invitesEnabled })
      }),
      'Premium invites'
    ),
    React.createElement('label', { className: 'flex items-center mb-2' },
      React.createElement('input', {
        type: 'checkbox',
        className: 'mr-2',
        checked: showLevels,
        onChange: () => updateDoc(doc(db, 'config', 'app'), { showLevels: !showLevels })
      }),
      'View levels'
    ),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenTextLog }, 'Se log'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenMatchLog }, 'Se matchlog'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenScoreLog }, 'Se score log'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenUserLog }, 'Følg bruger'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenTextPieces }, 'Alle tekststykker'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, t('adminHaptics')),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: testHaptic }, 'Test haptisk feedback'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, t('adminFunctionTest')),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenFunctionTest }, 'Åbn funktionstest'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, t('adminRevealTest')),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenRevealTest }, 'Åbn reveal test'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, t('adminGraphics')),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenGraphics }, 'Alle grafikelementer'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, t('adminPageInfo')),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: () => window.open(pageInfoUrl, '_blank') }, 'Åbn sideinfo'),

  // Developer section
  React.createElement('h3', { className: 'text-xl font-semibold mb-2 mt-4 text-blue-600' }, t('adminDevelopers')),
    React.createElement('h4', { className: 'text-lg font-semibold mb-2 text-blue-600' }, t('adminDatabase')),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: () => seedData().then(() => alert('Databasen er nulstillet')) }, 'Reset database'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: recoverMissing }, 'Hent mistet fra DB'),
    React.createElement('h3', { className: 'text-xl font-semibold mb-2 text-blue-600' }, t('adminPush')),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded mr-2', onClick: () => sendPush('Dagens klip er klar') }, 'Dagens klip er klar'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded mr-2', onClick: () => sendPush('Du har et match. Start samtalen') }, 'Du har et match. Start samtalen'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: logClientToken }, 'Log client token'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: showVapidKeys }, 'Show VAPID keys'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: compareVapidKeys }, 'Compare VAPID keys'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: showPushInfo }, 'Show push info'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: checkAuthAccess }, 'Check Firebase Auth'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenServerLog }, 'Server log')
  );
}
