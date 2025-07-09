import React, { useRef, useEffect, useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';

export default function VideoRecorder({ onCancel, onRecorded }) {
  const videoRef = useRef();
  const streamRef = useRef();
  const recorderRef = useRef();
  const chunksRef = useRef([]);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      streamRef.current = stream;
      if(videoRef.current) videoRef.current.srcObject = stream;
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
      onRecorded && onRecorded(file);
    };
    recorder.start();
    setRecording(true);
  };

  const stop = () => {
    if(recorderRef.current){
      recorderRef.current.stop();
      setRecording(false);
    }
  };

  const cancel = () => {
    if(recording) stop();
    onCancel && onCancel();
  };

  return React.createElement('div', { className:'fixed inset-0 z-50 bg-black/50 flex items-center justify-center' },
    React.createElement(Card, { className:'bg-white p-4 rounded shadow-xl flex flex-col items-center' },
      React.createElement('video', { ref: videoRef, autoPlay: true, className:'w-64 h-48 bg-black rounded mb-2' }),
      React.createElement('div', { className:'flex gap-2' },
        recording
          ? React.createElement(Button, { className:'bg-pink-500 text-white', onClick: stop }, 'Stop')
          : React.createElement(Button, { className:'bg-pink-500 text-white', onClick: start }, 'Start'),
        React.createElement(Button, { onClick: cancel }, 'Annuller')
      )
    )
  );
}
