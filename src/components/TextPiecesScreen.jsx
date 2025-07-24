import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { messages, languages } from '../i18n.js';

export default function TextPiecesScreen({ onBack }) {
  const [lang, setLang] = useState('da');
  const entries = Object.entries(messages).sort(([a], [b]) => a.localeCompare(b));
  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90 overflow-y-auto max-h-[90vh]' },
    React.createElement(SectionTitle, { title: 'Tekststykker', colorClass: 'text-blue-600', action: React.createElement(Button, { onClick: onBack, className: 'bg-blue-500 text-white px-4 py-2 rounded' }, 'Tilbage') }),
    React.createElement('label', { className: 'block mb-1' }, 'V\u00e6lg sprog'),
    React.createElement('select', { className: 'border p-2 mb-4 w-full', value: lang, onChange: e => setLang(e.target.value) },
      Object.entries(languages).map(([code, name]) => React.createElement('option', { key: code, value: code }, name))
    ),
    React.createElement('ul', { className: 'space-y-2 text-sm' },
      entries.map(([key, vals]) =>
        React.createElement('li', { key, className: 'border-b pb-1' },
          React.createElement('span', { className: 'font-mono text-xs text-gray-500 mr-2' }, key + ':'),
          React.createElement('span', null, vals[lang] || vals.en || '')
        )
      )
    )
  );
}
