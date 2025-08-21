import React from 'react';

export default function VideoPreview({ src, timestamp, onEnded }) {
  const formatted = timestamp ? new Date(timestamp).toLocaleString() : '';
  return React.createElement('div', { className: 'relative w-full' },
    React.createElement('video', {
      src,
      controls: true,
      controlsList: 'nodownload noplaybackrate',
      disablePictureInPicture: true,
      onRateChange: e => {
        e.currentTarget.playbackRate = 1;
      },
      className: 'w-full rounded',
      onEnded
    }),
    formatted && React.createElement('span', {
      className: 'absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 rounded'
    }, formatted)
  );
}
