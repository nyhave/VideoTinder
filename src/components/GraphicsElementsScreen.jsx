import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import InfoOverlay from './InfoOverlay.jsx';

export default function GraphicsElementsScreen({ onBack }) {
  const [showInfo, setShowInfo] = useState(false);
  const listItems = ['Liste element 1', 'Liste element 2', 'Liste element 3'];
  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90 overflow-y-auto max-h-[90vh]' },
    React.createElement(SectionTitle, { title: 'Grafikelementer', colorClass: 'text-blue-600', action: React.createElement(Button, { onClick: onBack, className: 'bg-blue-500 text-white px-4 py-2 rounded' }, 'Tilbage') }),
    React.createElement(Button, { className: 'bg-green-500 text-white px-4 py-2 rounded mb-4', onClick: () => setShowInfo(true) }, 'Åbn infoboks'),
    showInfo && React.createElement(InfoOverlay, { title: 'Eksempel', onClose: () => setShowInfo(false) },
      React.createElement('p', null, 'Dette er en infoboks')
    ),
    React.createElement('h3', { className: 'text-lg font-semibold mb-2' }, 'Liste elementer'),
    React.createElement('ul', { className: 'list-disc ml-5 mb-4' },
      listItems.map((item, idx) => React.createElement('li', { key: idx }, item))
    ),
    React.createElement('h3', { className: 'text-lg font-semibold mb-2' }, 'Skærmeksempel'),
    React.createElement(Card, { className: 'p-4 mb-4 bg-gray-100' },
      React.createElement('p', { className: 'mb-2' }, 'Dette er en eksempel skærm.'),
      React.createElement(Button, { className: 'bg-blue-500 text-white px-2 py-1 rounded' }, 'Knap')
    )
  );
}
