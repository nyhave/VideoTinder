import React, { useEffect, useRef, useState } from 'react';
import { Camera as CameraIcon } from 'lucide-react';
import { useT } from '../i18n.js';
import { getCurrentDate } from '../utils.js';

export default function SnapVideoRecorder({ onCancel, onRecorded, maxDuration = 10000, user }) {
  const streamRef = useRef();
  const recorderRef = useRef();
  const chunksRef = useRef([]);
  const timeoutRef = useRef();
  const videoRef = useRef();
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef(null);
  const [music, setMusic] = useState(null);
  const t = useT();
  const tier = user?.subscriptionTier || 'free';
  const hasActiveSubscription =
    user?.subscriptionExpires && new Date(user.subscriptionExpires) > getCurrentDate();
  const canAddMusic = hasActiveSubscription && (tier === 'gold' || tier === 'platinum');

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: { echoCancellation: true } }).then(stream => {
      streamRef.current = stream;
      if(videoRef.current){
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      start();
    });
    return () => {
      if(streamRef.current){
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const start = () => {
    if(!streamRef.current) return;
    const recorder = new MediaRecorder(streamRef.current);
    recorderRef.current = recorder;
    chunksRef.current = [];
    recorder.ondataavailable = e => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      const file = new File([blob], `video-${Date.now()}.webm`, { type: blob.type });
      onRecorded && onRecorded(file, canAddMusic ? music : null);
    };
    recorder.start();
    setRecording(true);
    startTimeRef.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      setProgress(Math.min(elapsed / maxDuration, 1));
      if(elapsed >= maxDuration){
        stop();
      } else {
        timeoutRef.current = requestAnimationFrame(tick);
      }
    };
    timeoutRef.current = requestAnimationFrame(tick);
  };

  const stop = () => {
    if(recorderRef.current){
      recorderRef.current.stop();
      cancelAnimationFrame(timeoutRef.current);
      timeoutRef.current = null;
      setRecording(false);
    }
  };

  const cancel = () => {
    stop();
    onCancel && onCancel();
  };

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  const remainingSeconds = startTimeRef.current
    ? Math.max(0, Math.ceil((maxDuration - (Date.now() - startTimeRef.current)) / 1000))
    : Math.round(maxDuration / 1000);

  return React.createElement('div', { className:'fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60' },
    React.createElement('div', { className:'flex-1 flex items-center justify-center w-full' },
      React.createElement('div', { className:'relative w-72 h-72' },
        canAddMusic && React.createElement('label', { className:'absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded cursor-pointer' },
          t('addMusic'),
          React.createElement('input', { type:'file', accept:'audio/*', className:'hidden', onChange:e=>setMusic(e.target.files[0]) })
        ),
        React.createElement('svg', { className:'absolute inset-0 w-full h-full rotate-animation pointer-events-none z-10', viewBox:'0 0 100 100' },
          React.createElement('circle', { cx:'50', cy:'50', r:radius, stroke:'#9ca3af', strokeWidth:'8', fill:'none' }),
          React.createElement('circle', {
            cx:'50', cy:'50', r:radius, stroke:'#ff4895', strokeWidth:'8', fill:'none',
            strokeDasharray:circumference, strokeDashoffset:offset
          })
        ),
        React.createElement('button', { onClick: recording ? stop : start, className:'absolute inset-0 flex items-center justify-center text-pink-500 bg-white rounded-full border border-pink-500 w-20 h-20 z-20' },
          React.createElement(CameraIcon, { className:'w-10 h-10' })
        ),
        React.createElement('div', { className:'absolute inset-0 flex items-center justify-center text-white text-4xl font-bold pointer-events-none' }, remainingSeconds),
        React.createElement('button', { onClick: cancel, className:'absolute -bottom-12 left-1/2 -translate-x-1/2 text-white bg-black/40 px-4 py-1 rounded' }, 'Annuller')
      )
    ),
    React.createElement('div', { className:'flex-1 flex items-center justify-center w-full' },
      React.createElement('video', { ref: videoRef, className:'w-72 h-72 object-cover rounded', autoPlay:true, muted:true, playsInline:true })
    )
  );
}

