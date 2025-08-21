import React, { useState } from 'react';
import BugReportOverlay from './BugReportOverlay.jsx';
import AdminHelpOverlay from './AdminHelpOverlay.jsx';
import { languages, useLang, useT } from '../i18n.js';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import seedData from '../seedData.js';
import { db, collection, getDocs, deleteDoc, updateDoc, doc, getDoc, query, where, storage, listAll, ref, getDownloadURL, deleteObject, setExtendedLogging, isExtendedLogging, useDoc } from '../firebase.js';
import { setConsoleCapture, isConsoleCapture, showConsolePanel } from '../consoleLogs.js';
import { advanceDay, resetDay, getTodayStr } from '../utils.js';
import { triggerHaptic } from '../haptics.js';


export default function AdminScreen({ onOpenStats, onOpenBugReports, onOpenMatchLog, onOpenScoreLog, onOpenReports, onOpenCallLog, onOpenGroupCallLog, onOpenFunctionTest, onOpenRevealTest, onOpenTextLog, onOpenTextPieces, onOpenServerLog, onOpenRecentLogins, profiles = [], userId, onSwitchProfile, onSaveUserLogout }) {

  const { lang, setLang } = useLang();
  const t = useT();
  const [showBugReport, setShowBugReport] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [logEnabled, setLogEnabled] = useState(isExtendedLogging());
  const [consoleEnabled, setConsoleEnabled] = useState(isConsoleCapture());
  const config = useDoc('config', 'app') || {};
  const invitesEnabled = config.premiumInvitesEnabled !== false;
  const showLevels = config.showLevels !== false;

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

  const showConsoleLog = () => {
    showConsolePanel();
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
    let { photoURL = '', videoClips = [], language = 'en' } = snap.data();
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
          const recordedAt = new Date().toISOString();
          videoClips.push({ url, lang: language, recordedAt, uploadedAt: recordedAt });
          updates.videoClips = videoClips;
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
        removeFrom('episodeProgress', 'profileId')
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

  const resetInvites = async () => {
    if (!userId) return;
    if (!window.confirm('Reset all invitations?')) return;
    try {
      const q = query(collection(db, 'invites'), where('inviterId', '==', userId));
      const snap = await getDocs(q);
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
      await updateDoc(doc(db, 'profiles', userId), { premiumInvitesUsed: 0 });
      alert('Invitations nulstillet');
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  const killRealettenSessions = async () => {
    if (!window.confirm('Delete all Realetten sessions?')) return;
    try {
      const list = await getDocs(collection(db, 'realetten'));
      for (const docSnap of list.docs) {
        const callsCol = collection(db, 'realetten', docSnap.id, 'calls');
        const calls = await getDocs(callsCol);
        for (const call of calls.docs) {
          const offers = await getDocs(collection(callsCol, call.id, 'offerCandidates'));
          const answers = await getDocs(collection(callsCol, call.id, 'answerCandidates'));
          await Promise.all([
            ...offers.docs.map(d => deleteDoc(d.ref)),
            ...answers.docs.map(d => deleteDoc(d.ref))
          ]);
          await deleteDoc(call.ref);
        }
        await deleteDoc(docSnap.ref);
        await deleteDoc(doc(db, 'turnGames', docSnap.id)).catch(() => {});
      }

      // Remove any stray turnGames documents that may remain
      const games = await getDocs(collection(db, 'turnGames'));
      for (const game of games.docs) {
        await deleteDoc(game.ref).catch(() => {});
      }

      alert('Alle Realetten sessions slettet');
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  const testHaptic = () => {
    triggerHaptic([100, 50, 100]);
  };

  const testRingtone = () => {
    const audio = new Audio('iphone_15.mp3');
    audio.play().catch(() => {});
  };

  const languageEntries = [['da', languages.da], ...Object.entries(languages).filter(([code]) => code !== 'da')];


  return React.createElement(React.Fragment, null,
    React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, {
      title: t('adminTitle'),
      colorClass: 'text-blue-600',
      action: React.createElement(Button, {
        onClick: () => setShowHelp(true),
        className: 'bg-blue-500 text-white px-2 py-1 rounded text-sm'
      }, t('helpTitle'))
    }),
    React.createElement('label', { className: 'block mb-1' }, t('chooseLanguage')),
    React.createElement('select', {
      className: 'border p-2 mb-4 w-full',
      value: lang,
      onChange: e => setLang(e.target.value)
    },
      languageEntries.map(([code, name]) =>
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
      }, t('saveAndLogout'))
    )
    ),

  React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement('h2', { className: 'text-xl font-semibold mb-2 text-pink-600' }, t('adminDaily')),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenReports }, 'Se anmeldt indhold'),
    React.createElement('div', { className: 'mt-2 flex flex-wrap gap-2' },
      React.createElement(Button, {
        className: 'bg-blue-500 text-white px-4 py-2 rounded',
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

  React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement('h2', { className: 'text-xl font-semibold mb-2 text-pink-600' }, t('adminBusiness')),
    React.createElement('div', { className: 'mt-2 flex flex-wrap gap-2' },
      React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenStats }, 'Vis statistik'),
      React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenRecentLogins }, 'Se seneste logins')
    )
  ),

  React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement('h2', { className: 'text-xl font-semibold mb-2 text-pink-600' }, t('adminTesters')),
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
    React.createElement('h4', { className: 'text-lg font-semibold mb-2 text-blue-600' }, t('adminBugReports')),
    React.createElement('div', { className: 'mt-2 flex flex-wrap gap-2' },
      React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenBugReports }, 'Se alle fejlmeldinger'),
      React.createElement(Button, { className: 'bg-pink-500 text-white px-4 py-2 rounded', onClick: () => setShowBugReport(true) }, 'Fejlmeld')
    ),
    React.createElement('h4', { className: 'text-lg font-semibold mb-2 mt-4 text-blue-600' }, t('adminDatabase')),
    React.createElement(Button, { className: 'mt-2 bg-red-500 text-white px-4 py-2 rounded', onClick: resetAllCandidates }, 'Reset all candidates'),
    React.createElement('h4', { className: 'text-lg font-semibold mb-2 mt-4 text-blue-600' }, t('adminHaptics')),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: testHaptic }, 'Test haptisk feedback'),
    React.createElement('h4', { className: 'text-lg font-semibold mb-2 mt-4 text-blue-600' }, t('adminFunctionTest')),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenFunctionTest }, 'Åbn funktionstest'),
    React.createElement('h4', { className: 'text-lg font-semibold mb-2 mt-4 text-blue-600' }, t('adminRevealTest')),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenRevealTest }, 'Åbn reveal test')
  ),

  React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement('h2', { className: 'text-xl font-semibold mb-2 text-pink-600' }, t('adminDevelopers')),
    React.createElement('h4', { className: 'text-lg font-semibold mb-2 text-blue-600' }, t('adminDatabase')),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: () => seedData().then(() => alert('Databasen er nulstillet')) }, 'Reset database'),
    React.createElement(Button, { className: 'mt-2 bg-blue-500 text-white px-4 py-2 rounded', onClick: recoverMissing }, 'Hent mistet fra DB'),
    React.createElement(Button, { className: 'mt-2 bg-red-500 text-white px-4 py-2 rounded', onClick: resetInvites }, 'Reset invitations'),
    React.createElement(Button, { className: 'mt-2 bg-red-500 text-white px-4 py-2 rounded', onClick: killRealettenSessions }, 'Kill Realetten sessions'),
    React.createElement('div', { className: 'mt-2 flex flex-wrap gap-2' },
      React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: checkAuthAccess }, 'Check Firebase Auth'),
      React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenServerLog }, 'Server log')
    ),
    React.createElement('h4', { className: 'text-lg font-semibold mb-2 mt-4 text-blue-600' }, t('adminLogging')),
    React.createElement('label', { className: 'flex items-center mb-2' },
      React.createElement('input', { type: 'checkbox', className: 'mr-2', checked: logEnabled, onChange: toggleLog }),
      'Udvidet logning'
    ),
    React.createElement('label', { className: 'flex items-center mb-2' },
      React.createElement('input', { type: 'checkbox', className: 'mr-2', checked: consoleEnabled, onChange: toggleConsole }),
      'Vis console log'
    ),
    React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded mb-2', onClick: showConsoleLog }, 'Åbn console vindue'),
    React.createElement('label', { className: 'flex items-center mb-2' },
      React.createElement('input', {
        type: 'checkbox',
        className: 'mr-2',
        checked: invitesEnabled,
        onChange: () => updateDoc(doc(db, 'config', 'app'), { premiumInvitesEnabled: !invitesEnabled })
      }),
      t('premiumInvites')
    ),
    React.createElement('label', { className: 'flex items-center mb-2' },
      React.createElement('input', {
        type: 'checkbox',
        className: 'mr-2',
        checked: showLevels,
        onChange: () => updateDoc(doc(db, 'config', 'app'), { showLevels: !showLevels })
      }),
      t('viewLevels')
    ),
    React.createElement('div', { className: 'mt-2 flex flex-wrap gap-2' },
      React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenTextLog }, 'Se log'),
      React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenMatchLog }, 'Se matchlog'),
      React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenScoreLog }, 'Se score log'),
      React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenTextPieces }, 'Alle tekststykker')
    ),
    React.createElement('h4', { className: 'text-lg font-semibold mb-2 mt-4 text-blue-600' }, t('videoCallsTitle')),
    React.createElement('div', { className: 'mt-2 flex flex-wrap gap-2' },
      React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenCallLog }, 'Se aktive opkald'),
      React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: onOpenGroupCallLog }, 'Se gruppeopkald'),
      React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: testRingtone }, t('adminTestRingtone'))
    )
  ),
    showBugReport && React.createElement(BugReportOverlay, { onClose: () => setShowBugReport(false) }),
    showHelp && React.createElement(AdminHelpOverlay, { onClose: () => setShowHelp(false) }),
  ));
}
