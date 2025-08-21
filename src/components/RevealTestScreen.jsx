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
  const [revealStep, setRevealStep] = useState(0);
  const t = useT();

  const nextStep = () => {
    if (revealStep >= 5) return;
    setRevealStep(s => s + 1);
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

  const overlays = Array.from({ length: 5 }).map((_, i) =>
    revealStep <= i && React.createElement('div', {
      key: i,
      className: 'absolute top-0 h-full',
      style: { left: `${i * 20}%`, width: '20%', backgroundColor: '#ccc' }
    })
  );

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: t('revealTestTitle'), colorClass: 'text-blue-600', action: React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: onBack }, t('back')) }),
    photoURL && React.createElement('div', { className: 'mb-4 relative' },
      React.createElement('img', {
        src: photoURL,
        alt: profile.name || '',
        className: 'w-full rounded object-cover'
      }),
      overlays,
      revealStep < 5 && !showReveal && React.createElement('div', { className: 'absolute inset-0 flex items-center justify-center rounded text-center px-2 bg-black/80' },
        React.createElement('span', { className: 'text-pink-500 text-xs font-semibold' }, t('dayLabel').replace('{day}', 1))
      ),
      showReveal && React.createElement(PuzzleReveal, { label: t('dayLabel').replace('{day}', 1) })
    ),
    revealStep < 5 && React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: nextStep }, t('next'))
  );
}
