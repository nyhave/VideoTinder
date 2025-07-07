import React, { useState } from 'https://cdn.skypack.dev/react';
import VideoCard from './components/VideoCard.js';
import SpeedDate from './components/SpeedDate.js';

const sampleVideos = [
  'sample1.mp4',
  'sample2.mp4',
  'sample3.mp4',
];

export default function App() {
  const [videos, setVideos] = useState(sampleVideos);
  const [showSpeedDate, setShowSpeedDate] = useState(false);

  const handleSwipe = (direction) => {
    setVideos(videos.slice(1));
  };

  const inviteToSpeedDate = () => {
    setShowSpeedDate(true);
  };

  const endSpeedDate = () => {
    setShowSpeedDate(false);
  };

  const current = videos[0];

  if (showSpeedDate) {
    return React.createElement(SpeedDate, { onEnd: endSpeedDate });
  }

  return React.createElement(
    'div',
    { className: 'app' },
    current
      ? React.createElement(VideoCard, {
          src: current,
          onSwipeLeft: () => handleSwipe('left'),
          onSwipeRight: () => handleSwipe('right'),
        })
      : React.createElement('p', null, 'No more videos'),
    React.createElement(
      'button',
      { onClick: inviteToSpeedDate },
      'Invite to Speed Date'
    )
  );
}
