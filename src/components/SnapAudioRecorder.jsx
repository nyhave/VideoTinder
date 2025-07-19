import React, { useEffect, useRef, useState } from 'react';
import { Mic } from 'lucide-react';

export default function SnapAudioRecorder({ onCancel, onRecorded }) {
  const streamRef = useRef();
  const recorderRef = useRef();
  const chunksRef = useRef([]);
  const timeoutRef = useRef();
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);

  // track elapsed time in milliseconds so we can show a countdown
  const startTimeRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        streamRef.current = stream;
        try {
          start();
        } catch(err){
          console.error('Failed to start audio recorder', err);
          onCancel && onCancel();
        }
      })
      .catch(err => {
        console.error('Failed to access microphone', err);
        onCancel && onCancel();
      });
    return () => {
      if(streamRef.current){
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const start = () => {
    if(!streamRef.current) return;
    let recorder;
    try {
      recorder = new MediaRecorder(streamRef.current);
    } catch(err){
      console.error('Failed to create MediaRecorder', err);
      onCancel && onCancel();
      return;
    }
    recorderRef.current = recorder;
    chunksRef.current = [];
    recorder.ondataavailable = e => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      const file = new File([blob], `audio-${Date.now()}.webm`, { type: blob.type });
      onRecorded && onRecorded(file);
    };
    recorder.start();
    setRecording(true);
    startTimeRef.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      setProgress(Math.min(elapsed / 10000, 1));
      if(elapsed >= 10000){
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

  // size of the animated progress ring
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  // remaining seconds shown in the center of the circle
  const remainingSeconds = startTimeRef.current
    ? Math.max(0, 10 - Math.floor((Date.now() - startTimeRef.current) / 1000))
    : 10;

  return React.createElement('div', { className:'fixed inset-0 z-50 flex items-center justify-center bg-black/60' },
    React.createElement('div', { className:'relative w-48 h-48' },
      React.createElement('svg', { className:'absolute inset-0 w-full h-full rotate-animation', viewBox:'0 0 100 100' },
        React.createElement('circle', { cx:'50', cy:'50', r:radius, stroke:'#9ca3af', strokeWidth:'8', fill:'none' }),
        React.createElement('circle', {
          cx:'50', cy:'50', r:radius, stroke:'#ff4895', strokeWidth:'8', fill:'none',
          strokeDasharray:circumference, strokeDashoffset:offset
        })
      ),
      React.createElement('button', { onClick: recording ? stop : start, className:'absolute inset-0 flex items-center justify-center text-pink-500 bg-white rounded-full border border-pink-500 w-20 h-20' },
        React.createElement(Mic, { className:'w-10 h-10' })
      ),
      React.createElement('div', {
        className:'absolute inset-0 flex items-center justify-center text-white text-4xl font-bold pointer-events-none'
      }, remainingSeconds),
      React.createElement('button', { onClick: cancel, className:'absolute -bottom-12 left-1/2 -translate-x-1/2 text-white bg-black/40 px-4 py-1 rounded' }, 'Annuller')
    )
  );
}
