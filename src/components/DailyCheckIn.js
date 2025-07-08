import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Textarea } from './ui/textarea.js';
import SectionTitle from './SectionTitle.js';
import { useCollection } from '../firebase.js';

export default function DailyCheckIn({ userId }) {
  const refs = useCollection('reflections','userId',userId);
  const days = Array.from({length:30},(_,i)=>i+1);

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: 'Dagens refleksion' }),
    React.createElement('div', { className: 'grid grid-cols-7 gap-1 mb-4' },
      days.map(day => (
        React.createElement('div', {
          key: day,
          className: `p-2 text-center text-sm ${refs.some(r=>r.day===day)?'bg-pink-200 rounded':''}`
        }, day)
      ))
    ),
    React.createElement('ul', { className: 'list-disc list-inside mb-4' },
      refs.map(r => React.createElement('li', { key: r.id }, `Dag ${r.day}: ${r.text}`))
    ),
    React.createElement(Textarea, { placeholder: 'Del din refleksion...', className: 'mb-4' }),
    React.createElement(Button, { className: 'bg-pink-500 text-white' }, 'Gem refleksion')
  );
}
