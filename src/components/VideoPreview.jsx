import React from 'react';

export default function VideoPreview({ src, onEnded }) {
  return React.createElement('video', {
    src,
    controls: true,
    controlsList: 'nodownload noplaybackrate',
    onRateChange: e => {
      e.currentTarget.playbackRate = 1;
    },
    className: 'w-full rounded',
    onEnded
  });
}
