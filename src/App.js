import React, { useState } from 'https://cdn.skypack.dev/react';
import VideoCard from './components/VideoCard.js';

const sampleVideos = [
  'sample1.mp4',
  'sample2.mp4',
  'sample3.mp4',
];

export default function App() {
  const [videos, setVideos] = useState(sampleVideos);

  const handleSwipe = (direction) => {
    setVideos(videos.slice(1));
  };

  const inviteToSpeedDate = () => {
    alert('Speed date invitation sent!');
  };

  const current = videos[0];

  return (
    <div className="app">
      {current ? (
        <VideoCard
          src={current}
          onSwipeLeft={() => handleSwipe('left')}
          onSwipeRight={() => handleSwipe('right')}
        />
      ) : (
        <p>No more videos</p>
      )}
      <button onClick={inviteToSpeedDate}>Invite to Speed Date</button>
    </div>
  );
}
