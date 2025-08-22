import { db, collection, query, where, getDocs, doc, getDoc } from './firebase.js';

let listeners = [];

function read() {
  if (typeof localStorage === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('notifications') || '[]');
  } catch (err) {
    return [];
  }
}

function write(list) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('notifications', JSON.stringify(list));
}

export function getNotifications() {
  return read();
}

export function addNotification(n) {
  const list = read();
  list.push({ ...n, timestamp: n.timestamp || new Date().toISOString(), read: false });
  write(list);
  listeners.forEach(fn => fn(list));
}

export function markNotificationsRead() {
  const list = read().map(n => ({ ...n, read: true }));
  write(list);
  listeners.forEach(fn => fn(list));
}

export function subscribeNotifications(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter(l => l !== fn);
  };
}

export async function showLocalNotification(title, body) {
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, { body, icon: 'icon-192.png' });
  } catch (err) {
    console.error('showLocalNotification failed', err);
  }
  addNotification({ title, body, type: 'local' });
}

export async function sendWebPushToProfile(profileId, title, body, silent = false, type = null) {
  try {
    const profileSnap = await getDoc(doc(db, 'profiles', profileId));
    const prefs = profileSnap.exists() ? (profileSnap.data().notificationPrefs || {}) : {};
    if (type && prefs.types && prefs.types[type] === false) return;

    const userSnap = await getDocs(query(collection(db, 'users'), where('profileId', '==', profileId)));
    if (userSnap.empty) return;
    const uid = userSnap.docs[0].id;
    const subSnap = await getDocs(query(collection(db, 'webPushSubscriptions'), where('uid', '==', uid)));
    const subs = subSnap.docs.map(d => d.data().subscription);
    if (!subs.length) return;
    const base = process.env.FUNCTIONS_BASE_URL || '';
    await fetch(`${base}/.netlify/functions/send-webpush`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, subscriptions: subs, silent })
    });
  } catch (err) {
    console.error('sendWebPushToProfile failed', err);
  }
}
