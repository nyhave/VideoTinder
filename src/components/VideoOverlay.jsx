import React, { useRef } from 'react';
import { X } from 'lucide-react';
import { db, doc, updateDoc, increment } from '../firebase.js';

export default function VideoOverlay({ src, profileId, onClose }) {
  const watched = useRef(0);
  const handleTime = e => { watched.current = e.currentTarget.currentTime; };
  const handleClose = () => {
    if(profileId && watched.current){
      updateDoc(doc(db,'profiles',profileId),{watchTime: increment(Math.floor(watched.current))}).catch(()=>{});
    }
    onClose && onClose();
  };
  return React.createElement('div', { className:'fixed inset-0 z-50 bg-black/70 flex items-center justify-center' },
    React.createElement('div', { className:'relative w-full max-w-md mx-4' },
      React.createElement('video', {
        src,
        controls:true,
        controlsList:'nodownload noplaybackrate',
        disablePictureInPicture:true,
        onRateChange:e=>{e.currentTarget.playbackRate=1;},
        onTimeUpdate:handleTime,
        className:'w-full rounded'
      }),
      React.createElement('button', { onClick:handleClose, className:'absolute top-2 right-2 text-white bg-black/40 rounded-full p-1' },
        React.createElement(X,{className:'w-6 h-6'})
      )
    )
  );
}
