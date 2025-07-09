import React, { useRef } from 'react';
import { Button } from './ui/button.js';

export default function VideoPreview({ src, onDelete, onReplace }) {
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
      className: 'w-28 rounded'
    }),
    React.createElement('div', { className: 'mt-1 flex gap-1' },
      React.createElement(Button, {
        className: 'flex-1 bg-pink-500 text-white',
        onClick: openFullscreen
      }, 'Fuldsk\u00e6rm'),
      onDelete && React.createElement(Button, {
        className: 'flex-1 bg-gray-200 text-gray-700',
        onClick: onDelete
      }, 'Slet'),
      onReplace && React.createElement(Button, {
        className: 'flex-1 bg-pink-500 text-white',
        onClick: onReplace
      }, 'Erstat')
    )
  );
}
