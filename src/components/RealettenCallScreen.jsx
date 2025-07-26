import React, { useState, useEffect, useRef } from 'react';
import {
  db,
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  getDoc
} from '../firebase.js';

function sanitizeInterest(i){
  return encodeURIComponent(i || '').replace(/%20/g,'_');
}

export default function RealettenCallScreen({ interest, userId, onEnd }) {
  const [participants, setParticipants] = useState([]);
  const localRef = useRef(null);
  const remoteRefs = useRef({});
  const pcsRef = useRef({});

  useEffect(() => {
    let stream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: { echoCancellation: true } });
        if(localRef.current){
          localRef.current.srcObject = stream;
          try { localRef.current.play(); } catch(e) {}
        }
      } catch(err){
        console.error('Failed to get media', err);
      }
    })();
    return () => {
      stream && stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    const id = sanitizeInterest(interest);
    const ref = doc(db, 'realetten', id);
    const join = async () => {
      const snap = await getDoc(ref);
      if(!snap.exists()) {
        await setDoc(ref, { interest, participants: [userId] });
      } else {
        const data = snap.data() || {};
        if((data.participants || []).length < 4 && !(data.participants || []).includes(userId)) {
          await updateDoc(ref, { participants: arrayUnion(userId) });
        }
      }
    };
    const unsub = onSnapshot(ref, snap => {
      const data = snap.data();
      setParticipants(data?.participants || []);
    });
    join();
    return () => {
      updateDoc(ref, { participants: arrayRemove(userId) }).catch(()=>{});
      unsub();
    };
  }, [interest, userId]);

  useEffect(() => {
    const localStream = localRef.current?.srcObject;
    if (!localStream) return;
    const id = sanitizeInterest(interest);

    const connect = async uid => {
      if (pcsRef.current[uid]) return;
      const pairId = [userId, uid].sort().join('_');
      const callDoc = doc(db, 'realetten', id, 'calls', pairId);
      const offerCandidates = collection(callDoc, 'offerCandidates');
      const answerCandidates = collection(callDoc, 'answerCandidates');
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
      const remoteStream = new MediaStream();
      const refEl = remoteRefs.current[uid];
      if (refEl) refEl.srcObject = remoteStream;
      pc.ontrack = evt => {
        evt.streams[0].getTracks().forEach(tr => remoteStream.addTrack(tr));
        const el = remoteRefs.current[uid];
        if (el && el.paused) {
          try { el.play(); } catch {}
        }
      };
      let unsubOff;
      let unsubAns;
      if (userId < uid) {
        pc.onicecandidate = e => {
          if (e.candidate) addDoc(offerCandidates, e.candidate.toJSON());
        };
        unsubAns = onSnapshot(answerCandidates, snap => {
          snap.docChanges().forEach(ch => {
            if (ch.type === 'added') pc.addIceCandidate(new RTCIceCandidate(ch.doc.data()));
          });
        });
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await setDoc(callDoc, {
          offer: { type: offer.type, sdp: offer.sdp },
          from: userId,
          createdAt: new Date().toISOString()
        });
        unsubOff = onSnapshot(callDoc, s => {
          const d = s.data();
          if (d?.answer && !pc.currentRemoteDescription) {
            pc.setRemoteDescription(new RTCSessionDescription(d.answer));
          }
        });
      } else {
        pc.onicecandidate = e => {
          if (e.candidate) addDoc(answerCandidates, e.candidate.toJSON());
        };
        unsubOff = onSnapshot(offerCandidates, snap => {
          snap.docChanges().forEach(ch => {
            if (ch.type === 'added') pc.addIceCandidate(new RTCIceCandidate(ch.doc.data()));
          });
        });
        const snap = await getDoc(callDoc);
        if (snap.exists()) {
          const data = snap.data();
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await updateDoc(callDoc, { answer: { type: answer.type, sdp: answer.sdp } });
        }
      }
      pcsRef.current[uid] = { pc, callDoc, offerCandidates, answerCandidates, unsubOff, unsubAns };
    };

    const disconnect = async uid => {
      const data = pcsRef.current[uid];
      if (!data) return;
      const { pc, unsubOff, unsubAns, callDoc, offerCandidates, answerCandidates } = data;
      pc.getSenders().forEach(s => s.track && s.track.stop());
      pc.close();
      unsubOff && unsubOff();
      unsubAns && unsubAns();
      try {
        const offSnap = await getDocs(offerCandidates);
        await Promise.all(offSnap.docs.map(d => deleteDoc(d.ref)));
        const ansSnap = await getDocs(answerCandidates);
        await Promise.all(ansSnap.docs.map(d => deleteDoc(d.ref)));
        await deleteDoc(callDoc);
      } catch {}
      delete pcsRef.current[uid];
    };

    const others = participants.filter(p => p !== userId);
    others.forEach(connect);
    Object.keys(pcsRef.current).forEach(uid => {
      if (!others.includes(uid)) disconnect(uid);
    });
    return () => {
      others.forEach(disconnect);
    };
  }, [participants, interest]);

  const slots = [0,1,2,3];

  return React.createElement('div', { className:'grid grid-cols-2 gap-2 flex-1' },
    slots.map((slot,i) => {
      const uid = participants[i];
      const isSelf = uid === userId;
      return React.createElement('div',{ key:i, className:'relative bg-black rounded overflow-hidden' },
        React.createElement('video', {
          ref: el => {
            if (isSelf) {
              localRef.current = el;
            } else if (uid) {
              if (el) remoteRefs.current[uid] = el; else delete remoteRefs.current[uid];
            }
          },
          className:'w-full h-full object-cover',
          autoPlay:true,
          muted:isSelf,
          playsInline:true
        }),
        !uid && React.createElement('div',{className:'absolute inset-0 flex items-center justify-center text-white bg-black/60'},'Venter...'),
        uid && !isSelf && React.createElement('div',{className:'absolute bottom-1 right-1 text-xs text-white bg-black/40 px-1 rounded'},uid)
      );
    })
  );
}
