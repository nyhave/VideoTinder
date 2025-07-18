import React from 'react';

export default function VideoPreview({ src, onEnded }) {
  return React.createElement('video', {
    src,
    controls: true,
    controlsList: 'nodownload noplaybackrate',
    className: 'w-full rounded',
    onEnded
  });
}
