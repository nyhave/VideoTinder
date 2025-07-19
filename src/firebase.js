import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  getDoc,
  updateDoc,
  setDoc,
  addDoc,
  arrayUnion,
  increment
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject
} from 'firebase/storage';
import {
  getMessaging,
  getToken,
  onMessage
} from 'firebase/messaging';
import { fcmReg } from './swRegistration.js';
import { detectOS, detectBrowser } from './utils.js';

let extendedLogging = false;
if (typeof window !== 'undefined') {
  extendedLogging = localStorage.getItem('extendedLogging') === 'true';
}

export function setExtendedLogging(val) {
  extendedLogging = val;
  if (typeof window !== 'undefined') {
    localStorage.setItem('extendedLogging', val ? 'true' : 'false');
  }
}

export function isExtendedLogging() {
  return extendedLogging;
}

function getUsernameForId(userId) {
  if (typeof window === 'undefined') return '';
  try {
    const creds = JSON.parse(localStorage.getItem('userCreds') || '{}');
    for (const [name, data] of Object.entries(creds)) {
      if (data && data.id === userId) {
        return name;
      }
    }
  } catch (err) {
    console.error('Failed to read userCreds', err);
  }
  return '';
}

export async function logEvent(event, details = {}) {
  if (!extendedLogging) return;
  try {
    await setDoc(doc(collection(db, 'textLogs')), {
      timestamp: new Date().toISOString(),
      event,
      details
    });
  } catch (err) {
    console.error('Failed to log event', err);
  }
}

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToWebPush(userId, loginMethod = 'password') {
  if (typeof window === 'undefined') return null;
  if (Notification.permission !== 'granted') return null;

  try {
    logEvent('subscribeToWebPush start', { userId });
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const appKey = urlB64ToUint8Array(process.env.WEB_PUSH_PUBLIC_KEY);
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appKey
      });
    }
    const safeId =
      btoa(sub.endpoint)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    await setDoc(doc(db, 'webPushSubscriptions', safeId), {
      ...sub.toJSON(),
      userId,
      username: getUsernameForId(userId),
      os: detectOS(),
      browser: detectBrowser(),
      loginMethod
    });
    logEvent('subscribeToWebPush success', { userId });
    return sub;
  } catch (err) {
    logEvent('subscribeToWebPush error', { error: err.message });
    console.error('Failed to subscribe to web push', err);
    return null;
  }
}

export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export let messaging;
if (typeof window !== 'undefined') {
  messaging = getMessaging(app);
}

export async function requestNotificationPermission(userId, loginMethod = 'password') {

  if (!messaging || Notification.permission === 'denied') return null;
  let permission = Notification.permission;
  if (permission === 'default') {
    try {
      permission = await Notification.requestPermission();
    } catch (err) {
      console.error('Failed to request notification permission', err);
      return null;
    }
  }
  if (permission !== 'granted') return null;

  try {
    logEvent('requestNotificationPermission start', { userId });
    const token = await getToken(messaging, {
      vapidKey: process.env.FCM_VAPID_KEY,
      serviceWorkerRegistration: fcmReg
    });
    if (token) {
      await setDoc(doc(db, 'pushTokens', token), {
        token,
        userId,
        username: getUsernameForId(userId),
        os: detectOS(),
        browser: detectBrowser(),
        loginMethod
      }, { merge: true });
    }
    logEvent('requestNotificationPermission success', { userId });
    return token;
  } catch (err) {
    logEvent('requestNotificationPermission error', { error: err.message });
    console.error('Failed to get FCM token', err);
    return null;
  }
}

export function useCollection(collectionName, field, value) {
  const [data, setData] = useState([]);
  useEffect(() => {
    const colRef = collection(db, collectionName);
    const q = field && value != null ? query(colRef, where(field, '==', value)) : colRef;
    const unsub = onSnapshot(q, snapshot => {
      setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [collectionName, field, value]);
  return data;
}

export function useDoc(collectionName, docId) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!docId) {
      setData(null);
      return;
    }
    const d = doc(db, collectionName, docId);
    const unsub = onSnapshot(d, snap => {
      setData(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
    return () => unsub();
  }, [collectionName, docId]);
  return data;
}

export {
  collection,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  getDoc,
  updateDoc,
  setDoc,
  addDoc,
  arrayUnion,
  increment,
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
  onMessage,
  
};

