import React from 'react';

export default function VideoPreview({ src, onEnded }) {
  return React.createElement('video', {
    src,
    controls: true,
    className: 'w-full rounded',
    onEnded
  });
}
