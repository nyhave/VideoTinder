import React, { useState, useEffect } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Star } from 'lucide-react';

export default function StoryLineOverlay({ profile, progress, onClose, onMatch }) {
  const [step, setStep] = useState(0); // 0 video,1 clip,2 audio,3 rating
  const [fade, setFade] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if(step < 3){
      const timer = setTimeout(() => {
        setFade(true);
        setTimeout(() => {
          setStep(step + 1);
          setFade(false);
        }, 500);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      const btnTimer = setTimeout(() => setShowButton(true), 2000);
      return () => clearTimeout(btnTimer);
    }
  }, [step]);

  const videoUrl = (profile.videoClips && profile.videoClips[0]) ? (profile.videoClips[0].url || profile.videoClips[0]) : null;
  const audioUrl = (profile.audioClips && profile.audioClips[0]) ? (profile.audioClips[0].url || profile.audioClips[0]) : null;

  const titles = [
    'Video (3 sec)',
    'About me',
    'Sound (3 sec)',
    'Your reflections'
  ];

  return React.createElement('div', { className:'fixed inset-0 z-50 bg-black/70 flex items-center justify-center' },
    React.createElement(Card, { className:'bg-white p-6 rounded shadow-xl max-w-sm w-full text-center' },
      React.createElement('h2', { className:'text-xl font-semibold mb-2 text-pink-600' }, titles[step]),
      React.createElement('p', { className:'text-sm text-gray-500 mb-4' }, `${step + 1} of 4`),
      React.createElement('div', { className:`transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}` },
        step === 0 && videoUrl && React.createElement('video', { src: videoUrl, autoPlay:true, className:'w-full rounded' }),
        step === 1 && React.createElement('p', { className:'text-lg mb-2' }, `“${profile.clip || ''}”`),
        step === 2 && audioUrl && React.createElement('audio', { src: audioUrl, autoPlay:true, className:'w-full', controls:false }),
        step === 3 && React.createElement('div', { className:'space-y-2' },
          progress?.rating && React.createElement('div', { className:'flex justify-center gap-1' },
            [1,2,3].map(n => React.createElement(Star, {
              key:n,
              className:`w-5 h-5 ${n <= progress.rating ? 'fill-pink-500 stroke-pink-500' : 'stroke-gray-400'}`
            }))
          ),
          progress?.reflection && React.createElement('p', { className:'italic' }, `“${progress.reflection}”`)
        )
      ),
      step === 3 && showButton && React.createElement(Button, { className:'w-full bg-pink-500 text-white mt-4', onClick:()=>onMatch && onMatch(profile.id) }, 'Match now?'),
      React.createElement(Button, { className:'w-full mt-2', onClick:onClose }, 'Close')
    )
  );
}
