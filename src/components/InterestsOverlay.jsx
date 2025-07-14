import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { interestOptions, interestCategories } from '../interests.js';

export default function InterestsOverlay({ current = [], onSave, onClose }) {
  const [selected, setSelected] = useState(new Set(current));

  const toggle = i => {
    const next = new Set(selected);
    if (next.has(i)) next.delete(i); else next.add(i);
    setSelected(next);
  };

  const handleSave = () => {
    const arr = Array.from(selected);
    if (arr.length > 5) {
      alert('Du kan vælge op til 5 interesser');
      return;
    }
    onSave(arr);
    onClose();
  };

  const categories = {};
  interestOptions.forEach(i => {
    const cat = interestCategories[i] || 'Andet';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(i);
  });

  return React.createElement('div', { className:'fixed inset-0 z-50 bg-black/50 flex items-center justify-center overflow-auto' },
    React.createElement(Card, { className:'bg-white p-6 rounded shadow-xl max-h-[80vh] overflow-y-auto w-full max-w-sm' },
      React.createElement('h2', { className:'text-xl font-semibold mb-4 text-pink-600 text-center' }, 'Vælg interesser'),
      Object.entries(categories).map(([cat, opts]) =>
        React.createElement('div', { key:cat, className:'mb-2' },
          React.createElement('h3', { className:'font-semibold mb-1' }, cat),
          opts.map(o =>
            React.createElement('label', { key:o, className:'block text-sm' },
              React.createElement('input', { type:'checkbox', className:'mr-2', checked:selected.has(o), onChange:() => toggle(o) }),
              o
            )
          )
        )
      ),
      React.createElement(Button, { className:'w-full bg-pink-500 text-white mt-4', onClick: handleSave }, 'Tilføj'),
      React.createElement(Button, { className:'w-full mt-2', onClick: onClose }, 'Luk')
    )
  );
}
