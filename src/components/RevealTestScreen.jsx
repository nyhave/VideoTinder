import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { useDoc } from '../firebase.js';
import { useT } from '../i18n.js';

export default function RevealTestScreen({ onBack }) {
  const profile = useDoc('profiles', '101');
  const [revealStep, setRevealStep] = useState(0);
  const [animatingPiece, setAnimatingPiece] = useState(null);
  const t = useT();

  const pieces = ['tl', 'tr', 'bl', 'br', 'center'];

  const nextStep = () => {
    if (revealStep >= pieces.length || animatingPiece !== null) return;
    const current = pieces[revealStep];
    setAnimatingPiece(current);
    const audio = new Audio('/reveal.mp3');
    audio.play().catch(err => console.error('Failed to play reveal sound', err));
    setTimeout(() => {
      setRevealStep(s => s + 1);
      setAnimatingPiece(null);
    }, 1000);
  };

  if (!profile) {
    return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
      React.createElement(SectionTitle, { title: t('revealTestTitle'), colorClass: 'text-blue-600', action: React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: onBack }, t('back')) }),
      React.createElement('p', null, 'Indl\u00e6ser...')
    );
  }

  const photoURL = profile.photoURL || '';

  const overlays = pieces.map((p, i) =>
    (i >= revealStep || animatingPiece === p) && React.createElement('div', {
      key: p,
      className: `piece ${p}${animatingPiece === p ? ' reveal-animation' : ''}`,
      style: { animationDelay: '0s' }
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
      React.createElement('div', { className: 'puzzle-reveal absolute inset-0 rounded overflow-hidden pointer-events-none' }, overlays)
    ),
    revealStep < pieces.length && React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: nextStep, disabled: animatingPiece !== null }, t('next'))
  );
}
