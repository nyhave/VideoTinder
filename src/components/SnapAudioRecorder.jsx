import React, { useEffect, useRef, useState } from 'react';
import { Mic } from 'lucide-react';

export default function SnapAudioRecorder({ onCancel, onRecorded }) {
  const streamRef = useRef();
  const recorderRef = useRef();
  const chunksRef = useRef([]);
  const timeoutRef = useRef();
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      streamRef.current = stream;
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
      const file = new File([blob], `audio-${Date.now()}.webm`, { type: blob.type });
      onRecorded && onRecorded(file);
    };
    recorder.start();
    setRecording(true);
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
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

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return React.createElement('div', { className:'fixed inset-0 z-50 flex items-center justify-center bg-black/60' },
    React.createElement('div', { className:'relative w-32 h-32' },
      React.createElement('svg', { className:'absolute inset-0 w-full h-full rotate-animation', viewBox:'0 0 100 100' },
        React.createElement('circle', { cx:'50', cy:'50', r:radius, stroke:'#e5e7eb', strokeWidth:'5', fill:'none' }),
        React.createElement('circle', {
          cx:'50', cy:'50', r:radius, stroke:'#ff4895', strokeWidth:'5', fill:'none',
          strokeDasharray:circumference, strokeDashoffset:offset
        })
      ),
      React.createElement('button', { onClick: recording ? stop : start, className:'absolute inset-0 flex items-center justify-center text-pink-500 bg-white rounded-full' },
        React.createElement(Mic, { className:'w-8 h-8' })
      ),
      React.createElement('button', { onClick: cancel, className:'absolute -bottom-10 left-1/2 -translate-x-1/2 text-white' }, 'Annuller')
    )
  );
}
