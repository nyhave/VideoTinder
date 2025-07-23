import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import VideoPreview from './VideoPreview.jsx';
import { useDoc } from '../firebase.js';

export default function RevealTestScreen({ onBack }) {
  const profile = useDoc('profiles', '101');
  const [showReveal, setShowReveal] = useState(false);

  const runTest = () => {
    setShowReveal(true);
    const audio = new Audio('/reveal.mp3');
    audio.play().catch(err => console.error('Failed to play reveal sound', err));
    setTimeout(() => setShowReveal(false), 1000);
  };

  if (!profile) {
    return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
      React.createElement(SectionTitle, { title: 'Reveal test', colorClass: 'text-blue-600', action: React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: onBack }, 'Tilbage') }),
      React.createElement('p', null, 'Indl\u00e6ser...')
    );
  }

  const videoURL = profile.videoClips?.[0]?.url || profile.videoClips?.[0] || '';
  const audioURL = profile.audioClips?.[0]?.url || profile.audioClips?.[0] || '';

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: 'Reveal test', colorClass: 'text-blue-600', action: React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: onBack }, 'Tilbage') }),
    videoURL && React.createElement('div', { className: `mb-4 ${showReveal ? 'reveal-animation' : ''}` },
      React.createElement(VideoPreview, { src: videoURL })
    ),
    audioURL && React.createElement('div', { className: `mb-4 ${showReveal ? 'reveal-animation' : ''}` },
      React.createElement('audio', {
        src: audioURL,
        controls: true,
        controlsList: 'nodownload noplaybackrate',
        onRateChange: e => { e.currentTarget.playbackRate = 1; },
        className: 'w-full'
      })
    ),
    React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: runTest }, 'Test reveal')
  );
}
