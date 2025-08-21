import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import PuzzleReveal from './PuzzleReveal.jsx';
import { useDoc } from '../firebase.js';
import { useT } from '../i18n.js';

export default function RevealTestScreen({ onBack }) {
  const profile = useDoc('profiles', '101');
  const [showReveal, setShowReveal] = useState(false);
  const t = useT();

  const runTest = () => {
    setShowReveal(true);
    const audio = new Audio('/reveal.mp3');
    audio.play().catch(err => console.error('Failed to play reveal sound', err));
    setTimeout(() => setShowReveal(false), 1000);
  };

  if (!profile) {
    return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
      React.createElement(SectionTitle, { title: t('revealTestTitle'), colorClass: 'text-blue-600', action: React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: onBack }, t('back')) }),
      React.createElement('p', null, 'Indl\u00e6ser...')
    );
  }

  const photoURL = profile.photoURL || '';

  const overlay = showReveal
    ? React.createElement(PuzzleReveal, { label: t('dayLabel').replace('{day}', 1) })
    : React.createElement('div', { className:'absolute inset-0 bg-black/80 flex items-center justify-center rounded text-center px-2' },
      React.createElement('span', { className:'text-pink-500 text-xs font-semibold' }, t('dayLabel').replace('{day}', 1))
    );

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: t('revealTestTitle'), colorClass: 'text-blue-600', action: React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: onBack }, t('back')) }),
    photoURL && React.createElement('div', { className: 'mb-4 relative' },
      React.createElement('img', {
        src: photoURL,
        alt: profile.name || '',
        className: 'w-full rounded object-cover'
      }),
      overlay
    ),
    React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: runTest }, 'Test reveal')
  );
}
