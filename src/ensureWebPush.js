// src/push/ensureWebPush.js
// Minimal helper som altid resubscrib'er med serverens public key og gemmer i Firestore.

function urlBase64ToUint8Array(b64url) {
  const pad = '='.repeat((4 - (b64url.length % 4)) % 4);
  const base64 = (b64url + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

// Du kan erstatte saveSubscription med din eksisterende Firestore-lagring, hvis du allerede har en.
async function defaultSaveSubscriptionToFirestore(subJson) {
  // Kræver at din Firebase app allerede er initialiseret i projektet.
  const { getFirestore, doc, setDoc } = await import('firebase/firestore');
  const { getApp } = await import('firebase/app');

  const db = getFirestore(getApp());
  // Brug endpoint som dokument-id (url-safe)
  const id = encodeURIComponent(subJson.endpoint);
  await setDoc(doc(db, 'webPushSubscriptions', id), subJson, { merge: true });
}

export async function ensureWebPush({
  saveSubscription = defaultSaveSubscriptionToFirestore
} = {}) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Web Push not supported here');
  }

  // 1) Hent serverens public key (kilden til sandhed)
  const res = await fetch('/.netlify/functions/get-vapid-public-key', { cache: 'no-store' });
  const { publicKey } = await res.json();
  // Temporary debug output of VAPID key - remove before production.
  console.log('DEBUG: WEB_PUSH_PUBLIC_KEY (ensureWebPush)', publicKey); // TODO: Remove before production
  if (!publicKey) throw new Error('Missing publicKey from server');

  // 2) Sørg for service worker er klar
  const reg = await navigator.serviceWorker.ready;

  // 3) Fjern evt. eksisterende subscription (undgår VAPID-mismatch)
  try {
    const old = await reg.pushManager.getSubscription();
    if (old) await old.unsubscribe();
  } catch (err) {
    // ignore
  }

  // 4) Subscribe med serverens public key
  const appServerKey = urlBase64ToUint8Array(publicKey);
  const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: appServerKey });

  // 5) Gem hele subscription-objektet (endpoint + keys)
  await saveSubscription(sub.toJSON());

  return sub;
}
