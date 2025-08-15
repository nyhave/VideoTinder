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
  arrayRemove,
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
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
  onAuthStateChanged,
  signOut,
  deleteUser,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';

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
export const auth = getAuth(app);
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim())
  .filter(Boolean);

export function useCollection(collectionName, field, value) {
  const [data, setData] = useState([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const colRef = collection(db, collectionName);
    const q = field && value != null ? query(colRef, where(field, '==', value)) : colRef;
    const unsub = onSnapshot(q, snapshot => {
      setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoaded(true);
    });
    return () => unsub();
  }, [collectionName, field, value]);
  return Object.assign([...data], { loaded });
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

export function listenToDoc(collectionName, docId, callback) {
  if (!docId) return () => {};
  const d = doc(db, collectionName, docId);
  return onSnapshot(d, snap => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}

export function useAuth() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return () => unsub();
  }, []);
  return user;
}

export function isAdminUser(user) {
  return !!user && ADMIN_EMAILS.includes(user.email || '');
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  if (auth.currentUser) await signOut(auth);
  try {
    await logEvent('signInWithGoogle start');
    const cred = await signInWithPopup(auth, provider);
    await logEvent('signInWithGoogle success', { uid: cred.user?.uid });
    return cred;
  } catch (err) {
    await logEvent('signInWithGoogle error', { error: err.message });
    console.error('Google sign-in failed', err);
    if (auth.currentUser) {
      await logEvent('signInWithGoogle recovered', { uid: auth.currentUser.uid });
      return { user: auth.currentUser };
    }
    throw err;
  }
}

export function signOutUser() {
  return signOut(auth);
}

export async function deleteAccount(profileId) {
  const uid = auth.currentUser?.uid;
  try {
    await Promise.all([
      deleteDoc(doc(db, 'profiles', profileId)),
      uid ? deleteDoc(doc(db, 'users', uid)) : Promise.resolve()
    ]);

    const clean = async (col, field1, field2) => {
      const promises = [];
      for (const f of [field1, field2]) {
        if (!f) continue;
        const q = query(collection(db, col), where(f, '==', profileId));
        const snap = await getDocs(q);
        promises.push(...snap.docs.map(d => deleteDoc(d.ref)));
      }
      await Promise.all(promises);
    };

    await clean('likes', 'userId', 'profileId');
    await clean('matches', 'userId', 'profileId');
    await clean('reflections', 'userId');
    await clean('episodeProgress', 'userId', 'profileId');

    try {
      const list = await listAll(ref(storage, `profiles/${profileId}`));
      await Promise.all(list.items.map(i => deleteObject(i)));
    } catch (err) {}

    if (auth.currentUser) {
      try {
        await deleteUser(auth.currentUser);
      } catch (err) {}
    }
  } catch (err) {
    console.error('Failed to delete account', err);
    throw err;
  }
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
  arrayRemove,
  increment,
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
  onAuthStateChanged,
  signOut
};
