import React, { useState, useEffect } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Star } from 'lucide-react';
import { useT } from '../i18n.js';

export default function StoryLineOverlay({ profile, progress, onClose, onMatch }) {
  const videoUrl = (profile.videoClips && profile.videoClips[0]) ? (profile.videoClips[0].url || profile.videoClips[0]) : null;

  const t = useT();

  const steps = [];
  const titles = [];
  if(videoUrl){
    steps.push('video');
    titles.push('Video (3 sec)');
  }
  steps.push('clip');
  titles.push('About me');
  steps.push('rating');
  titles.push('Your reflections');

  const [step, setStep] = useState(0);
  const [fade, setFade] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if(step < steps.length - 1){
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
  }, [step, steps.length]);

  return React.createElement('div', { className:'fixed inset-0 z-50 bg-black/70 flex items-center justify-center' },
    React.createElement(Card, { className:'bg-white p-6 rounded shadow-xl max-w-sm w-full text-center' },
      React.createElement('h2', { className:'text-xl font-semibold mb-2 text-pink-600' }, titles[step]),
      React.createElement('p', { className:'text-sm text-gray-500 mb-4' }, `${step + 1} of ${steps.length}`),
      React.createElement('div', { className:`transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}` },
        steps[step] === 'video' && React.createElement('video', { src: videoUrl, autoPlay:true, className:'w-full rounded' }),
        steps[step] === 'clip' && React.createElement('p', { className:'text-lg mb-2' }, `“${profile.clip || ''}”`),
        steps[step] === 'rating' && React.createElement('div', { className:'space-y-2' },
          progress?.rating && React.createElement('div', { className:'flex justify-center gap-1' },
            [1,2,3,4].map(n => React.createElement(Star, {
              key:n,
              className:`w-5 h-5 ${n <= progress.rating ? 'fill-pink-500 stroke-pink-500' : 'stroke-gray-400'}`
            }))
          ),
          progress?.rating >= 3 && React.createElement('p', { className:'text-xs text-green-700 font-medium' }, t('keepProfile')),
          progress?.reflection && React.createElement('p', { className:'italic' }, `“${progress.reflection}”`)
        )
      ),
      steps[step] === 'rating' && showButton && React.createElement(Button, { className:'w-full bg-pink-500 text-white mt-4', onClick:()=>onMatch && onMatch(profile.id) }, 'Match now?'),
      React.createElement(Button, { className:'w-full mt-2', onClick:onClose }, 'Close')
    )
  );
}
