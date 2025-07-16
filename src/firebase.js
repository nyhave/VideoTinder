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

export async function requestNotificationPermission(userId) {

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
    const token = await getToken(messaging, {
      vapidKey: process.env.VAPID_KEY,
      serviceWorkerRegistration: fcmReg
    });
    if (token) {
      await setDoc(doc(db, 'pushTokens', token), { token, userId }, { merge: true });
    }
    return token;
  } catch (err) {
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
  arrayUnion,
  increment,
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
  messaging,
  onMessage,
  requestNotificationPermission
};

export { storage };
