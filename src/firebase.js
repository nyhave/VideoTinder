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
  setDoc
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBzhR7SOvS63dNS7fcF9OmyAEryfmHwbIY',
  authDomain: 'videotinder-38b8b.firebaseapp.com',
  projectId: 'videotinder-38b8b',
  storageBucket: 'videotinder-38b8b.firebasestorage.app',
  messagingSenderId: '1025473667340',
  appId: '1:1025473667340:web:757da72042b702a5966929'
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

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
  setDoc
};
