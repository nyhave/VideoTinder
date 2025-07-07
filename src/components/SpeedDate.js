import React from 'https://cdn.skypack.dev/react';

export default function SpeedDate({ onEnd }) {
  const videoSrc = 'sample1.mp4';
  return React.createElement(
    'div',
    { className: 'speed-date' },
    React.createElement('video', {
      src: videoSrc,
      autoPlay: true,
      muted: true,
      playsInline: true,
      className: 'remote-video',
    }),
    React.createElement('video', {
      src: videoSrc,
      autoPlay: true,
      muted: true,
      playsInline: true,
      className: 'local-video',
    }),
    React.createElement(
      'button',
      { onClick: onEnd, className: 'end-call-button' },
      'End Call'
    )
  );
}
