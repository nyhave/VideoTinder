import React, { useRef } from 'react';
import { X, Heart } from 'lucide-react';
import { db, doc, updateDoc, increment } from '../firebase.js';

export default function VideoOverlay({ src, profileId, liked = false, onLike, onClose }) {
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
      onLike && React.createElement('button', {
        onClick:onLike,
        className:`absolute top-2 left-2 rounded-full p-1 ${liked ? 'bg-pink-500 text-white' : 'bg-white text-pink-500 border border-pink-500'}`
      },
        React.createElement(Heart,{className:'w-6 h-6'})
      ),
      React.createElement('button', { onClick:handleClose, className:'absolute top-2 right-2 text-white bg-black/40 rounded-full p-1' },
        React.createElement(X,{className:'w-6 h-6'})
      )
    )
  );
}
