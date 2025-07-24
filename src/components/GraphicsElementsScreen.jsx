import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Input } from './ui/input.js';
import { Textarea } from './ui/textarea.js';
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

    React.createElement('h3', { className: 'text-lg font-semibold mb-2' }, 'Knapper'),
    React.createElement('div', { className: 'flex gap-2 mb-4 flex-wrap' },
      React.createElement(Button, { className: 'bg-pink-500 text-white px-4 py-2 rounded' }, 'Primær'),
      React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded' }, 'Sekundær'),
      React.createElement(Button, { className: 'bg-red-500 text-white px-4 py-2 rounded' }, 'Fare'),
      React.createElement(Button, { className: 'bg-gray-200 text-black px-4 py-2 rounded' }, 'Neutral')
    ),

    React.createElement('h3', { className: 'text-lg font-semibold mb-2' }, 'Indtastningsfelter'),
    React.createElement('div', { className: 'space-y-2 mb-4' },
      React.createElement(Input, { className: 'border p-2 w-full', placeholder: 'Tekstinput' }),
      React.createElement(Textarea, { className: 'border p-2 w-full', rows: 3, placeholder: 'Textarea' })
    ),
    React.createElement('h3', { className: 'text-lg font-semibold mb-2' }, 'Liste elementer'),
    React.createElement('ul', { className: 'list-disc ml-5 mb-4' },
      listItems.map((item, idx) => React.createElement('li', { key: idx }, item))
    ),

    React.createElement('h3', { className: 'text-lg font-semibold mb-2' }, 'Chatbobler'),
    React.createElement('div', { className: 'space-y-2 mb-4' },
      React.createElement('div', { className: 'flex justify-start' },
        React.createElement('div', { className: 'space-y-1 max-w-[75%]' },
          React.createElement('div', { className: 'text-xs text-gray-500' }, '10:00'),
          React.createElement('div', { className: 'inline-block px-3 py-2 rounded-lg bg-gray-200 text-black' }, 'Hej der!')
        )
      ),
      React.createElement('div', { className: 'flex justify-end' },
        React.createElement('div', { className: 'space-y-1 max-w-[75%]' },
          React.createElement('div', { className: 'text-xs text-gray-500 text-right' }, '10:05'),
          React.createElement('div', { className: 'inline-block px-3 py-2 rounded-lg bg-pink-500 text-white' }, 'Hej!')
        )
      )
    ),
    React.createElement('h3', { className: 'text-lg font-semibold mb-2' }, 'Skærmeksempel'),
    React.createElement(Card, { className: 'p-4 mb-4 bg-gray-100' },
      React.createElement('p', { className: 'mb-2' }, 'Dette er en eksempel skærm.'),
      React.createElement(Button, { className: 'bg-blue-500 text-white px-2 py-1 rounded' }, 'Knap')
    )
  );
}
