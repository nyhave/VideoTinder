import React, { useRef } from 'https://cdn.skypack.dev/react';

export default function VideoCard({ src, onSwipeLeft, onSwipeRight }) {
  const ref = useRef(null);
  let startX = null;

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    startX = touch.clientX;
  };

  const handleTouchEnd = (e) => {
    if (startX === null) return;
    const touch = e.changedTouches[0];
    const diffX = touch.clientX - startX;
    if (diffX > 50) {
      onSwipeRight();
    } else if (diffX < -50) {
      onSwipeLeft();
    }
    startX = null;
  };

  return React.createElement(
    'div',
    {
      ref: ref,
      className: 'video-card',
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
    },
    React.createElement('video', {
      src: src,
      autoPlay: true,
      // Remove the loop attribute so each video plays once
      muted: true,
      playsInline: true,
      width: 300,
      height: 500,
    })
  );
}
