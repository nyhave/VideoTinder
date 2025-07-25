import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { useT } from '../i18n.js';

export default function ExtendAreaOverlay({ onExtend, onClose }) {
  const t = useT();
  return React.createElement('div', { className:'fixed inset-0 z-50 bg-black/50 flex items-center justify-center' },
    React.createElement(Card, { className:'bg-white p-6 rounded shadow-xl max-w-sm w-full text-center' },
      React.createElement('p', { className:'mb-4' }, t('extendAreaMessage')),
      React.createElement(Button, { className:'w-full mb-2 bg-pink-500 text-white', onClick:onExtend }, t('extendArea')),
      React.createElement(Button, { className:'w-full bg-gray-200 text-black', onClick:onClose }, t('ok'))
    )
  );
}
