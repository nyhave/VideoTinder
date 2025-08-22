import React, { useEffect, useRef, useState } from 'react';
import { useT } from '../i18n.js';

export default function SnapVideoRecorder({ onCancel, onRecorded, maxDuration = 10000 }) {
  const streamRef = useRef();
  const recorderRef = useRef();
  const chunksRef = useRef([]);
  const timeoutRef = useRef();
  const videoRef = useRef();
  const [recording, setRecording] = useState(false);
  const [remaining, setRemaining] = useState(Math.round(maxDuration / 1000));
  const startTimeRef = useRef(null);
  const [stage, setStage] = useState('intro');
  const [count, setCount] = useState(3);
  const countdownRef = useRef();
  const t = useT();

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      clearInterval(countdownRef.current);
    };
  }, []);

  useEffect(() => {
    if ((stage === 'countdown' || stage === 'recording') && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      const p = videoRef.current.play();
      if (p && p.catch) p.catch(() => {});
    }
  }, [stage]);

  const startCountdown = async () => {
    streamRef.current = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: { echoCancellation: true }
    });
    if (videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      await videoRef.current.play();
    }
    setStage('countdown');
    let current = 3;
    setCount(current);
    countdownRef.current = setInterval(() => {
      current -= 1;
      setCount(current);
      if (current <= 0) {
        clearInterval(countdownRef.current);
        setStage('recording');
        start();
      }
    }, 1000);
  };

  const start = async () => {
    if (!streamRef.current) {
      return;
    }
    const recorder = new MediaRecorder(streamRef.current);
    recorderRef.current = recorder;
    chunksRef.current = [];
    recorder.ondataavailable = e => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      const file = new File([blob], `video-${Date.now()}.webm`, { type: blob.type });
      onRecorded && onRecorded(file);
    };
    recorder.start();
    setRecording(true);
    startTimeRef.current = Date.now();
    setRemaining(Math.round(maxDuration / 1000));
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      setRemaining(Math.max(0, Math.ceil((maxDuration - elapsed) / 1000)));
      if (elapsed >= maxDuration) {
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
    if(streamRef.current){
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const cancel = () => {
    clearInterval(countdownRef.current);
    stop();
    onCancel && onCancel();
  };

  const remainingSeconds = remaining;

  if(stage === 'intro'){
    return React.createElement('div', { className:'fixed inset-0 z-50 flex items-center justify-center bg-black/60' },
      React.createElement('div', { className:'bg-white p-4 rounded max-w-sm text-center' },
        React.createElement('p', { className:'mb-4' }, t('recordIntro')),
        React.createElement('div', { className:'flex justify-center gap-2' },
          React.createElement('button', { onClick: startCountdown, className:'bg-pink-500 text-white px-4 py-2 rounded' }, t('ok')),
          React.createElement('button', { onClick: cancel, className:'bg-gray-200 text-gray-700 px-4 py-2 rounded' }, t('cancel'))
        )
      )
    );
  }

  if(stage === 'countdown'){
    return React.createElement('div', { className:'fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60' },
      React.createElement('div', { className:'text-white text-6xl font-bold mb-4' }, count),
      React.createElement('video', { ref: videoRef, className:'w-72 h-72 object-cover rounded', autoPlay:true, muted:true, playsInline:true })
    );
  }

  return React.createElement('div', { className:'fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60' },
    React.createElement('div', { className:'text-white text-4xl font-bold mb-4' }, remainingSeconds),
    React.createElement('div', { className:'relative' },
      React.createElement('video', { ref: videoRef, className:'w-72 h-72 object-cover rounded', autoPlay:true, muted:true, playsInline:true }),
      React.createElement('button', { onClick: recording ? stop : cancel, className:'absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/40 text-white px-4 py-1 rounded' }, t(recording ? 'stop' : 'cancel'))
    )
  );
}

