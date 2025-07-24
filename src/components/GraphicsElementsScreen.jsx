import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Input } from './ui/input.js';
import { Textarea } from './ui/textarea.js';
import SectionTitle from './SectionTitle.jsx';
import InfoOverlay from './InfoOverlay.jsx';
import HelpOverlay from './HelpOverlay.jsx';
import PurchaseOverlay from './PurchaseOverlay.jsx';
import DeleteAccountOverlay from './DeleteAccountOverlay.jsx';

export default function GraphicsElementsScreen({ onBack }) {
  const [showInfo, setShowInfo] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const listItems = ['Liste element 1', 'Liste element 2', 'Liste element 3'];
  const chatMessages = [
    { self: true, text: 'Hej med dig', time: '12:34' },
    { self: false, text: 'Hej hej', time: '12:35' }
  ];

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90 overflow-y-auto max-h-[90vh]' },
    React.createElement(SectionTitle, { title: 'Grafikelementer', colorClass: 'text-blue-600', action: React.createElement(Button, { onClick: onBack, className: 'bg-blue-500 text-white px-4 py-2 rounded' }, 'Tilbage') }),

    React.createElement('div', { className: 'space-x-2 mb-4' },
      React.createElement(Button, { className: 'bg-green-500 text-white px-4 py-2 rounded', onClick: () => setShowInfo(true) }, 'Åbn infoboks'),
      React.createElement(Button, { className: 'bg-blue-500 text-white px-4 py-2 rounded', onClick: () => setShowHelp(true) }, 'Åbn hjælp'),
      React.createElement(Button, { className: 'bg-yellow-500 text-white px-4 py-2 rounded', onClick: () => setShowPurchase(true) }, 'Åbn køb'),
      React.createElement(Button, { className: 'bg-red-500 text-white px-4 py-2 rounded', onClick: () => setShowDelete(true) }, 'Slet konto')
    ),

    showInfo && React.createElement(InfoOverlay, { title: 'Eksempel', onClose: () => setShowInfo(false) },
      React.createElement('p', null, 'Dette er en infoboks')
    ),
    showHelp && React.createElement(HelpOverlay, { onClose: () => setShowHelp(false) }),
    showPurchase && React.createElement(PurchaseOverlay, { title: 'Køb premium', price: '99,-', onBuy: () => setShowPurchase(false), onClose: () => setShowPurchase(false) },
      React.createElement('p', null, 'Adgang til alle funktioner')
    ),
    showDelete && React.createElement(DeleteAccountOverlay, { onDelete: () => setShowDelete(false), onClose: () => setShowDelete(false) }),

    React.createElement('h3', { className: 'text-lg font-semibold mb-2 mt-4' }, 'Liste elementer'),
    React.createElement('ul', { className: 'list-disc ml-5 mb-4' },
      listItems.map((item, idx) => React.createElement('li', { key: idx }, item))
    ),

    React.createElement('h3', { className: 'text-lg font-semibold mb-2' }, 'Chatbobler'),
    React.createElement('div', { className: 'space-y-2 mb-4' },
      chatMessages.map((m, i) =>
        React.createElement('div', { key: i, className: `flex ${m.self ? 'justify-end' : 'justify-start'}` },
          React.createElement('div', { className: 'space-y-1 max-w-[75%]' },
            React.createElement('div', { className: 'text-xs text-gray-500' }, m.time),
            React.createElement('div', { className: `inline-block px-3 py-2 rounded-lg ${m.self ? 'bg-pink-500 text-white' : 'bg-gray-200 text-black'}` }, m.text)
          )
        )
      )
    ),

    React.createElement('h3', { className: 'text-lg font-semibold mb-2' }, 'Skærmeksempel'),
    React.createElement(Card, { className: 'p-4 mb-4 bg-gray-100' },
      React.createElement('p', { className: 'mb-2' }, 'Login skærm'),
      React.createElement('label', { className: 'block mb-1' }, 'Email'),
      React.createElement(Input, { className: 'border p-2 mb-2 w-full' }),
      React.createElement('label', { className: 'block mb-1' }, 'Password'),
      React.createElement(Input, { type: 'password', className: 'border p-2 mb-4 w-full' }),
      React.createElement(Button, { className: 'bg-pink-500 text-white px-4 py-2 rounded' }, 'Log ind')
    ),

    React.createElement('h3', { className: 'text-lg font-semibold mb-2' }, 'Tekstboks'),
    React.createElement(Textarea, { className: 'border p-2 w-full mb-4', placeholder: 'Skriv noget...' })
  );
}
