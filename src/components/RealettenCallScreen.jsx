import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { deleteField } from 'firebase/firestore';

function sanitizeInterest(i){
  return encodeURIComponent(i || '').replace(/%20/g,'_');
}

export default function RealettenCallScreen({ interest, userId, botId, onEnd, onParticipantsChange }) {
  const HEARTBEAT_INTERVAL = 10000;
  const STALE_TIMEOUT = 30000;
  const [participants, setParticipants] = useState([]);
  const [count, setCount] = useState(null);
  const [connectFailed, setConnectFailed] = useState(false);
  const localRef = useRef(null);
  const localStreamRef = useRef(null);
  const [localReady, setLocalReady] = useState(false);
  const setLocalVideoRef = useCallback(el => {
    localRef.current = el;
    if (el && localStreamRef.current) {
      el.srcObject = localStreamRef.current;
      try { el.play(); } catch {}
    }
  }, []);
  const remoteRefs = useRef({});
  const remoteStreams = useRef({});
  const pcsRef = useRef({});

  useEffect(() => {
    if (participants.includes(userId)) {
      setCount(null);
      setConnectFailed(false);
    } else if (participants.length >= 4 && count === null && !connectFailed) {
      setCount(10);
    }
  }, [participants, userId, count, connectFailed]);

  useEffect(() => {
    if (count === null) return;
    if (count === 0) {
      setConnectFailed(true);
      return;
    }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  useEffect(() => {
    if (!interest || participants.includes(userId) || connectFailed) return;
    if (participants.length < 4) {
      const id = sanitizeInterest(interest);
      const ref = doc(db, 'realetten', id);
      updateDoc(ref, { participants: arrayUnion(userId), [`heartbeat.${userId}`]: new Date().toISOString() }).catch(() => {});
    }
  }, [participants, interest, userId, connectFailed]);

  useEffect(() => {
    let stream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: { echoCancellation: true } });
        localStreamRef.current = stream;
        if (localRef.current) {
          localRef.current.srcObject = stream;
          try { localRef.current.play(); } catch (e) {}
          setLocalReady(true);
        }
      } catch (err) {
        console.error('Failed to get media', err);
      }
    })();
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      localStreamRef.current = null;
      setLocalReady(false);
    };
  }, []);

  useEffect(() => {
    const id = sanitizeInterest(interest);
    const ref = doc(db, 'realetten', id);
    const join = async () => {
      const snap = await getDoc(ref);
      if(!snap.exists()) {
        await setDoc(ref, { interest, participants: [userId], heartbeat: { [userId]: new Date().toISOString() } });
      } else {
        const data = snap.data() || {};
        if((data.participants || []).length < 4) {
          await updateDoc(ref, { participants: arrayUnion(userId), [`heartbeat.${userId}`]: new Date().toISOString() });
        }
      }
    };
    const unsub = onSnapshot(ref, snap => {
      const data = snap.data();
      const list = data?.participants || [];
      const hb = data?.heartbeat || {};
      const now = Date.now();
      const stale = list.filter(uid => uid !== userId && now - new Date(hb[uid] || 0).getTime() > STALE_TIMEOUT);
      if (stale.length) {
        stale.forEach(uid => {
          updateDoc(ref, { participants: arrayRemove(uid), [`heartbeat.${uid}`]: deleteField() }).catch(() => {});
        });
      }
      const activeList = list.filter(uid => !stale.includes(uid));
      setParticipants(activeList);
      if (onParticipantsChange) onParticipantsChange(activeList);
    });
    join();
    return () => {
      (async () => {
        try {
          await updateDoc(ref, { participants: arrayRemove(userId), [`heartbeat.${userId}`]: deleteField() });
          const snap = await getDoc(ref);
          const data = snap.data() || {};
          if (!snap.exists() || !(data.participants || []).length) {
            await deleteDoc(ref);
          }
        } catch {}
      })();
      unsub();
      if (onParticipantsChange) onParticipantsChange([]);
    };
  }, [interest, userId]);

  useEffect(() => {
    if (!interest) return;
    const id = sanitizeInterest(interest);
    const ref = doc(db, 'realetten', id);
    const send = () => {
      updateDoc(ref, { [`heartbeat.${userId}`]: new Date().toISOString() }).catch(() => {});
    };
    send();
    const t = setInterval(send, HEARTBEAT_INTERVAL);
    return () => clearInterval(t);
  }, [interest, userId]);

  useEffect(() => {
    const localStream = localRef.current?.srcObject;
    if (!localStream) return;
    const id = sanitizeInterest(interest);

    const connect = async uid => {
      if (botId && uid === botId) return;
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
      remoteStreams.current[uid] = remoteStream;
      const refEl = remoteRefs.current[uid];
      if (refEl) {
        if (refEl.srcObject !== remoteStream) {
          refEl.srcObject = remoteStream;
        }
        if (refEl.paused) {
          try { refEl.play(); } catch {}
        }
      }
      pc.ontrack = evt => {
        evt.streams[0].getTracks().forEach(tr => remoteStream.addTrack(tr));
        const el = remoteRefs.current[uid];
        if (el && !el.srcObject) el.srcObject = remoteStream;
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
        const unsubDoc = onSnapshot(callDoc, async s => {
          const data = s.data();
          if (data?.offer && !pc.currentRemoteDescription) {
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await updateDoc(callDoc, { answer: { type: answer.type, sdp: answer.sdp } });
          }
        });
        pcsRef.current[uid] = { pc, remoteStream, callDoc, offerCandidates, answerCandidates, unsubOff, unsubAns, unsubDoc };
        return;
      }
      pcsRef.current[uid] = { pc, remoteStream, callDoc, offerCandidates, answerCandidates, unsubOff, unsubAns };
    };

    const disconnect = async uid => {
      const data = pcsRef.current[uid];
      if (!data) return;
      const { pc, unsubOff, unsubAns, unsubDoc, callDoc, offerCandidates, answerCandidates } = data;
      pc.close();
      unsubOff && unsubOff();
      unsubAns && unsubAns();
      unsubDoc && unsubDoc();
      try {
        const offSnap = await getDocs(offerCandidates);
        await Promise.all(offSnap.docs.map(d => deleteDoc(d.ref)));
        const ansSnap = await getDocs(answerCandidates);
        await Promise.all(ansSnap.docs.map(d => deleteDoc(d.ref)));
        await deleteDoc(callDoc);
      } catch {}
      delete pcsRef.current[uid];
      delete remoteStreams.current[uid];
    };

    const others = participants.filter(p => p !== userId);
    others.forEach(connect);
    Object.keys(pcsRef.current).forEach(uid => {
      if (!others.includes(uid)) disconnect(uid);
    });
    return () => {
      others.forEach(disconnect);
    };
  }, [participants, interest, localReady]);

  const slots = [0,1,2,3];

  const overlay = (count !== null || connectFailed) ?
    React.createElement('div', {
      className:'absolute inset-0 flex items-center justify-center bg-black/60 text-white text-xl'
    }, connectFailed ? 'could not connect' : `trying to connect... ${count}`)
    : null;

  return React.createElement('div', { className:'relative grid grid-cols-2 gap-2 flex-1' },
    overlay,
    slots.map((slot,i) => {
      const uid = participants[i];
      const isSelf = uid === userId;
      return React.createElement('div',{ key:i, className:'relative bg-black rounded overflow-hidden' },
        React.createElement('video', {
          ref: el => {
            if (isSelf) {
              setLocalVideoRef(el);
            } else if (uid) {
              if (el) {
                remoteRefs.current[uid] = el;
                const stream = remoteStreams.current[uid];
                if (stream) {
                  if (el.srcObject !== stream) {
                    el.srcObject = stream;
                  }
                  if (el.paused) {
                    try { el.play(); } catch {}
                  }
                }
              } else {
                delete remoteRefs.current[uid];
              }
            }
          },
          className:'w-full h-full object-cover',
          autoPlay:true,
          muted:isSelf,
          playsInline:true
        }),
        !uid && React.createElement('div',{className:'absolute inset-0 flex items-center justify-center text-white bg-black/60'},'Venter...'),
        uid === botId && React.createElement('div',{className:'absolute inset-0 flex items-center justify-center text-white bg-black/60'},'\u{1F916}'),
        uid && !isSelf && React.createElement('div',{className:'absolute bottom-1 right-1 text-xs text-white bg-black/40 px-1 rounded'},uid)
      );
    })
  );
}
