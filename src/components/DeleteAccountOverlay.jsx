import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { useT } from '../i18n.js';

export default function DeleteAccountOverlay({ onDelete, onClose }) {
  const t = useT();
  return React.createElement('div', { className: 'fixed inset-0 z-50 bg-black/50 flex items-center justify-center' },
    React.createElement(Card, { className: 'bg-white p-6 rounded shadow-xl max-w-sm w-full' },
      React.createElement('h2', { className: 'text-xl font-semibold mb-4 text-pink-600 text-center' }, t('confirmDeleteTitle')),
      React.createElement('p', { className: 'mb-4 text-center' }, t('confirmDeleteDesc')),
      React.createElement(Button, { className: 'w-full bg-red-500 text-white mb-2', onClick: onDelete }, t('deleteAccount')),
      React.createElement(Button, { className: 'w-full', onClick: onClose }, t('cancel'))
    )
  );
}
