import React, { useState, useEffect } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { useCollection, db, collection, query, where, getDocs, deleteDoc, messaging } from '../firebase.js';
import { useT } from '../i18n.js';
import { getToken } from 'firebase/messaging';
import { fcmReg } from '../swRegistration.js';

export default function TrackUserScreen({ profiles = [], onBack }) {
  const [userId, setUserId] = useState(profiles[0]?.id || '');
  const t = useT();
  const logs = useCollection('textLogs', 'details.userId', userId);
  const sorted = logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const hasReceivedNotification = logs.some(l => l.event === 'push received');

  const [checkResult, setCheckResult] = useState({});

  useEffect(() => {
    async function runChecks() {
      if (typeof window === 'undefined') return;
      const installed = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
      const permission = Notification.permission;
      const online = navigator.onLine;
      let serviceWorkerActive = false;
      let webPushSub = false;
      let fcmToken = false;
      try {
        const reg = await navigator.serviceWorker.ready;
        serviceWorkerActive = !!reg;
        const sub = await reg.pushManager.getSubscription();
        if (sub && sub.endpoint) {
          webPushSub = sub.endpoint.includes('apple.com');
        }
      } catch {}
      if (messaging && permission === 'granted') {
        try {
          const tok = await getToken(messaging, { vapidKey: process.env.FCM_VAPID_KEY, serviceWorkerRegistration: fcmReg });
          fcmToken = !!tok;
        } catch {}
      }
      let dbConn = false;
      try {
        await getDocs(collection(db, 'profiles'));
        dbConn = true;
      } catch {}
      setCheckResult({ installed, permission, online, serviceWorkerActive, webPushSub, fcmToken, dbConn });
    }
    runChecks();
  }, []);

  const resetLogs = async () => {
    const q = query(collection(db, 'textLogs'), where('details.userId', '==', userId));
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
  };

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90 overflow-y-auto max-h-[90vh]' },
    React.createElement(SectionTitle, { title: t('trackUserTitle'), colorClass: 'text-blue-600', action: React.createElement(Button, { onClick: onBack }, 'Tilbage') }),
    React.createElement('label', { className: 'block mb-1' }, 'V\u00e6lg bruger'),
    React.createElement('select', { className: 'border p-2 mb-4 w-full', value: userId, onChange: e => setUserId(e.target.value) },
      profiles.map(p => React.createElement('option', { key: p.id, value: p.id }, p.name))
    ),
    React.createElement(Button, { className: 'mb-4 bg-blue-500 text-white px-4 py-2 rounded', onClick: resetLogs }, 'Reset log'),
    React.createElement('h3', { className: 'text-lg font-semibold mb-2' }, 'Tjekliste for push notifikationer'),
    React.createElement('div', { className: 'space-y-2 mb-4 text-sm' },
      React.createElement('div', null,
        React.createElement('h4', { className: 'font-medium' }, 'F\u00e6lles'),
        React.createElement('ul', { className: 'list-disc ml-5' },
          React.createElement('li', { className: checkResult.installed ? 'text-green-600' : 'text-red-600' },
            (checkResult.installed ? '✔' : '✖') + ' App installeret p\u00e5 hjemmesk\u00e6rm'
          ),
          React.createElement('li', { className: checkResult.permission === 'granted' ? 'text-green-600' : 'text-red-600' },
            (checkResult.permission === 'granted' ? '✔' : '✖') + ' Tilladelse til notifikationer'
          ),
          React.createElement('li', { className: checkResult.dbConn ? 'text-green-600' : 'text-red-600' },
            (checkResult.dbConn ? '✔' : '✖') + ' Forbindelse til databasen'
          ),
          React.createElement('li', { className: checkResult.serviceWorkerActive ? 'text-green-600' : 'text-red-600' },
            (checkResult.serviceWorkerActive ? '✔' : '✖') + ' Service worker aktiv'
          ),
          React.createElement('li', { className: hasReceivedNotification ? 'text-green-600' : 'text-red-600' },
            (hasReceivedNotification ? '✔' : '✖') + ' Har modtaget mindst en notifikation'
          ),
          React.createElement('li', { className: checkResult.online ? 'text-green-600' : 'text-red-600' },
            (checkResult.online ? '✔' : '✖') + ' Browseren er online'
          )
        )
      ),
      React.createElement('div', null,
        React.createElement('h4', { className: 'font-medium' }, 'iOS (Web Push)'),
        React.createElement('ul', { className: 'list-disc ml-5' },
          React.createElement('li', { className: checkResult.webPushSub ? 'text-green-600' : 'text-red-600' },
            (checkResult.webPushSub ? '✔' : '✖') + ' Web Push subscription registreret'
          )
        )
      ),
      React.createElement('div', null,
        React.createElement('h4', { className: 'font-medium' }, 'Android/desktop (FCM)'),
        React.createElement('ul', { className: 'list-disc ml-5' },
          React.createElement('li', { className: checkResult.fcmToken ? 'text-green-600' : 'text-red-600' },
            (checkResult.fcmToken ? '✔' : '✖') + ' FCM token tilg\u00e6ngelig'
          )
        )
      )
    ),
    sorted.length ?
      React.createElement('ul', { className: 'space-y-2' },
        sorted.map(l =>
          React.createElement('li', { key: l.id, className: 'border-b pb-1 text-sm' },
            React.createElement('div', { className: 'font-mono text-xs text-gray-500' }, l.timestamp),
            React.createElement('div', null, l.event),
            l.details && React.createElement('pre', { className: 'whitespace-pre-wrap break-words text-xs' }, JSON.stringify(l.details, null, 2))
          )
        )
      ) :
      React.createElement('p', { className: 'text-center mt-4 text-gray-500' }, 'Ingen logs')
  );
}
