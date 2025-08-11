import { db, auth, doc, setDoc } from './firebase.js';
import { detectOS, detectBrowser } from './utils.js';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function defaultSaveSubscription(sub) {
  try {
    const id = btoa(sub.endpoint);
    const user = auth.currentUser;
    await setDoc(doc(db, 'webPushSubscriptions', id), {
      subscription: sub,
      uid: user?.uid || null,
      os: detectOS(),
      browser: detectBrowser(),
      loginMethod: user ? (user.providerData?.[0]?.providerId === 'password' ? 'password' : 'admin') : 'unknown',
      updated: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to save subscription', err);
  }
}

export async function ensureWebPush(saveSubscription = defaultSaveSubscription) {
  try {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return null;
    }
    const base = process.env.FUNCTIONS_BASE_URL || '';
    const res = await fetch(`${base}/.netlify/functions/get-vapid-public-key`);
    const vapidKey = (await res.text()).trim();
    if (!vapidKey) return null;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      try { await sub.unsubscribe(); } catch (_) {}
    }
    const newSub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey)
    });
    await saveSubscription(newSub.toJSON ? newSub.toJSON() : newSub);
    return newSub;
  } catch (err) {
    console.error('ensureWebPush failed', err);
    return null;
  }
}
