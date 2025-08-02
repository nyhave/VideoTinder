import React from 'react';
import { Card } from './ui/card.js';
import SectionTitle from './SectionTitle.jsx';
import { Button } from './ui/button.js';
import { useT } from '../i18n.js';

export default function NotificationsScreen({ notifications, onBack }) {
  const t = useT();
  const items = [...notifications].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
  return React.createElement(Card, { className: 'relative p-6 m-4 shadow-xl bg-white/90 flex flex-col h-[calc(100dvh-8rem)]' },
    React.createElement(SectionTitle, {
      title: t('notificationsTitle'),
      action: React.createElement(Button, {
        onClick: onBack,
        className: 'bg-blue-500 text-white px-2 py-1 rounded text-sm'
      }, t('back'))
    }),
    items.length === 0 ?
      React.createElement('p', { className: 'text-gray-500' }, t('noNotifications')) :
      React.createElement('ul', { className: 'overflow-y-auto flex-1 space-y-2' },
        items.map((n, i) =>
          React.createElement('li', { key: i, className: 'border-b pb-2' },
            React.createElement('div', { className: 'font-semibold' }, n.title || ''),
            React.createElement('div', { className: 'text-sm text-gray-600' }, n.body || ''),
            React.createElement('div', { className: 'text-xs text-gray-400' }, new Date(n.timestamp).toLocaleString())
          )
        )
      )
  );
}
