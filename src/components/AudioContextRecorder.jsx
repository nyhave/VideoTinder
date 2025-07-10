import React, { useRef, useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';

export default function AudioContextRecorder({ onCancel, onRecorded }) {
  const [recording, setRecording] = useState(false);
  const audioContextRef = useRef();
  const inputRef = useRef();
  const processorRef = useRef();
  const streamRef = useRef();
  const chunksRef = useRef([]);
  const timeoutRef = useRef();

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    inputRef.current = audioContextRef.current.createMediaStreamSource(stream);
    processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
    chunksRef.current = [];
    processorRef.current.onaudioprocess = e => {
      chunksRef.current.push(new Float32Array(e.inputBuffer.getChannelData(0)));
    };
    inputRef.current.connect(processorRef.current);
    processorRef.current.connect(audioContextRef.current.destination);
    timeoutRef.current = setTimeout(() => stop(), 10000);
    setRecording(true);
  };

  const mergeBuffers = buffers => {
    const length = buffers.reduce((acc, b) => acc + b.length, 0);
    const result = new Float32Array(length);
    let offset = 0;
    for (const b of buffers) {
      result.set(b, offset);
      offset += b.length;
    }
    return result;
  };

  const floatTo16BitPCM = (view, offset, input) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  };

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const encodeWAV = (samples, sampleRate) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);
    floatTo16BitPCM(view, 44, samples);
    return new Blob([view], { type: 'audio/wav' });
  };

  const stop = () => {
    if(!recording) return;
    processorRef.current.disconnect();
    inputRef.current.disconnect();
    streamRef.current.getTracks().forEach(t => t.stop());
    clearTimeout(timeoutRef.current);
    const sampleRate = audioContextRef.current.sampleRate;
    audioContextRef.current.close();
    const samples = mergeBuffers(chunksRef.current);
    const wavBlob = encodeWAV(samples, sampleRate);
    const file = new File([wavBlob], `audio-${Date.now()}.wav`, { type: 'audio/wav' });
    onRecorded && onRecorded(file);
    setRecording(false);
  };

  const cancel = () => {
    if(recording) stop();
    onCancel && onCancel();
  };

  return React.createElement('div', { className:'fixed inset-0 z-50 bg-black/50 flex items-center justify-center' },
    React.createElement(Card, { className:'bg-white p-4 rounded shadow-xl flex flex-col items-center' },
      React.createElement('p', { className:'mb-2' }, 'Klar til optag'),
      React.createElement('div', { className:'flex gap-2' },
        recording
          ? React.createElement(Button, { className:'bg-pink-500 text-white', onClick: stop }, 'Stop')
          : React.createElement(Button, { className:'bg-pink-500 text-white', onClick: start }, 'Start'),
        React.createElement(Button, { onClick: cancel }, 'Annuller')
      )
    )
  );
}
