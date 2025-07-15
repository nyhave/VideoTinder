import React, { useEffect, useRef } from 'react';
import { db } from '../firebase.js';
import { collection, doc, setDoc, getDoc, updateDoc, addDoc, onSnapshot } from 'firebase/firestore';

export default function VideoCallScreen({ matchId, userId, onEnd }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    pcRef.current = pc;

    const callDoc = doc(db, 'calls', matchId);
    const offerCandidates = collection(callDoc, 'offerCandidates');
    const answerCandidates = collection(callDoc, 'answerCandidates');

    let unsubAnsCand;
    let unsubOffer;

    const init = async () => {
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = localStream;
      if (localVideoRef.current?.play) {
        try { localVideoRef.current.play(); } catch(e) { /* ignore autoplay errors */ }
      }
      localStream.getTracks().forEach(t => pc.addTrack(t, localStream));

      const remoteStream = new MediaStream();
      remoteVideoRef.current.srcObject = remoteStream;
      if (remoteVideoRef.current?.play) {
        try { remoteVideoRef.current.play(); } catch(e) { /* ignore autoplay errors */ }
      }
      pc.ontrack = event => {
        event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
        if (remoteVideoRef.current?.play) {
          try { remoteVideoRef.current.play(); } catch(e) { /* ignore */ }
        }
      };

      const snap = await getDoc(callDoc);
      if (snap.exists()) {
        // Join call
        pc.onicecandidate = e => {
          if (e.candidate) addDoc(answerCandidates, e.candidate.toJSON());
        };

        onSnapshot(offerCandidates, snapshot => {
          snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
              pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
            }
          });
        });

        const data = snap.data();
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await updateDoc(callDoc, { answer: { type: answer.type, sdp: answer.sdp } });
      } else {
        // Create call
        pc.onicecandidate = e => {
          if (e.candidate) addDoc(offerCandidates, e.candidate.toJSON());
        };

        unsubAnsCand = onSnapshot(answerCandidates, snapshot => {
          snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
              pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
            }
          });
        });

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await setDoc(callDoc, { offer: { type: offer.type, sdp: offer.sdp }, from: userId });

        unsubOffer = onSnapshot(callDoc, snapshot => {
          const data = snapshot.data();
          if (data?.answer && !pc.currentRemoteDescription) {
            pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          }
        });
      }
    };

    init();

    return () => {
      pc.getSenders().forEach(s => s.track && s.track.stop());
      pc.close();
      unsubAnsCand && unsubAnsCand();
      unsubOffer && unsubOffer();
      onEnd && onEnd();
    };
  }, [matchId, userId, onEnd]);

  return (
    React.createElement('div', { className: 'speed-date' },
      React.createElement('video', { ref: remoteVideoRef, className: 'remote-video', autoPlay: true, playsInline: true }),
      React.createElement('video', { ref: localVideoRef, className: 'local-video', autoPlay: true, muted: true, playsInline: true }),
      React.createElement('button', { className: 'end-call-button', onClick: onEnd }, 'Afslut')
    )
  );
}
