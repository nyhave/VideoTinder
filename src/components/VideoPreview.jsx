import React, { useRef } from 'react';
import { Button } from './ui/button.js';

export default function VideoPreview({ src }) {
  const videoRef = useRef(null);
  const openFullscreen = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
  };

  return React.createElement('div', { className: 'flex flex-col items-start' },
    React.createElement('video', {
      ref: videoRef,
      src,
      controls: true,
      className: 'w-40 rounded'
    }),
    React.createElement(Button, {
      className: 'mt-1 bg-pink-500 text-white',
      onClick: openFullscreen
    }, 'Fuldskærm')
  );
}
