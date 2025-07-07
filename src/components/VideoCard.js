import React, { useRef, useState } from 'https://cdn.skypack.dev/react';

export default function VideoCard({ src, onSwipeLeft, onSwipeRight }) {
  const ref = useRef(null);
  const startX = useRef(null);
  const [offset, setOffset] = useState(0);

  const handlePointerDown = (e) => {
    startX.current = e.clientX;
  };

  const handlePointerMove = (e) => {
    if (startX.current === null) return;
    const diffX = e.clientX - startX.current;
    setOffset(diffX);
  };

  const handlePointerUp = (e) => {
    if (startX.current === null) return;
    const diffX = e.clientX - startX.current;
    if (diffX > 100) {
      onSwipeRight();
    } else if (diffX < -100) {
      onSwipeLeft();
    } else {
      setOffset(0);
    }
    startX.current = null;
  };

  return React.createElement(
    'div',
    {
      ref: ref,
      className: 'video-card',
      style: { transform: `translateX(${offset}px)` },
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
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
