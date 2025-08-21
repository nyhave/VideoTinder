import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { useT } from '../i18n.js';

export default function RevealTestScreen({ onBack }) {
  const [revealStep, setRevealStep] = useState(0);
  const t = useT();

  const nextStep = () => {
    if (revealStep >= 5) return;
    setRevealStep(s => s + 1);
  };

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: t('revealTestTitle'), colorClass: 'text-blue-600', action: React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: onBack }, t('back')) }),
    React.createElement('div', { className: 'mb-4 text-center' },
      React.createElement('span', { className: 'text-pink-500 text-xs font-semibold' }, t('dayLabel').replace('{day}', revealStep + 1))
    ),
    revealStep < 5 && React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: nextStep }, t('next'))
  );
}
