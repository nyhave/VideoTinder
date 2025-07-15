import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';

const features = [
  'Daily discovery of short video clips (up to 3 or 6 with subscription)',
  'Option to buy 3 extra clips for the day',
  'Monthly subscriptions with visible expiration date',
  'Basic chat between matched profiles with option to unmatch',
  'Improved chat layout with timestamps',
  'Celebration overlay when two profiles match',
  'Calendar for daily reflections',
  'Minimal profile settings and admin mode',
  'Preferred languages with option to allow other languages',
  'Choose up to five personal interests in profile settings',
  'Profile pictures, audio clips and video clips cached for offline viewing',
  'Premium page showing who liked you (subscription required)',
  'Seed data includes 11 test profiles matching the default user',
  'Video and audio clips limited to 10 seconds',
  'Countdown animation during recording',
  'Daily stats saved automatically and shown as graphs in admin',
  'Statistics on how often profiles are opened',
  'Graph of number of open bugs per day',
  'Match log accessible from admin'
];

export default function FunctionTestScreen({ onBack }) {
  const [results, setResults] = useState(() =>
    Object.fromEntries(features.map((_, i) => [i, { status: '', comment: '' }]))
  );

  const update = (index, field, value) => {
    setResults(r => ({ ...r, [index]: { ...r[index], [field]: value } }));
  };

  return React.createElement(Card, { className:'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title:'Funktionstest', colorClass:'text-blue-600', action: React.createElement(Button, { onClick: onBack }, 'Tilbage') }),
    React.createElement('ul', { className:'space-y-4 mt-4 overflow-y-auto max-h-[70vh]' },
      features.map((f, i) =>
        React.createElement('li', { key:i, className:'border p-2 rounded' },
          React.createElement('div', { className:'font-medium mb-1' }, f),
          React.createElement('div', { className:'flex space-x-2 mb-1' },
            React.createElement(Button, { className:`px-2 py-1 rounded ${results[i].status==='ok' ? 'bg-green-500 text-white' : 'bg-gray-200'}`, onClick:() => update(i,'status',results[i].status==='ok'?'':'ok') }, 'OK'),
            React.createElement(Button, { className:`px-2 py-1 rounded ${results[i].status==='fail' ? 'bg-red-500 text-white' : 'bg-gray-200'}`, onClick:() => update(i,'status',results[i].status==='fail'?'':'fail') }, 'Fejl')
          ),
          React.createElement('textarea', { className:'w-full border p-1 text-sm', placeholder:'Kommentar', value:results[i].comment, onChange:e=>update(i,'comment',e.target.value) })
        )
      )
    )
  );
}
