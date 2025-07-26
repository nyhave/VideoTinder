import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { useCollection } from '../firebase.js';
import { useT } from '../i18n.js';

export default function ServerLogScreen({ onBack }) {
  const logs = useCollection('serverLogs');
  const sorted = logs.sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));
  const latest = sorted[0] || {};
  const t = useT();
  const checks = [
    { label: 'Seneste log registreret', ok: !!latest.timestamp },
    { label: 'Seneste kald lykkedes', ok: !latest.error },
    { label: 'Ingen fejl i loggen', ok: !sorted.some(l => l.error) }
  ];
  return React.createElement(Card, { className:'p-6 m-4 shadow-xl bg-white/90 overflow-y-auto max-h-[90vh]' },
    React.createElement(SectionTitle, { title:t('serverLogTitle'), colorClass:'text-blue-600', action: React.createElement(Button,{onClick:onBack},t('back')) }),
    React.createElement('h3',{className:'text-lg font-semibold mb-2'},'Tjekliste'),
    React.createElement('ul',{className:'list-disc ml-5 mb-4 text-sm'},
      checks.map((c,i)=>React.createElement('li',{key:i,className:c.ok?'text-green-600':'text-red-600'},(c.ok?'\u2714':'\u2716')+' '+c.label))
    ),
    sorted.length ? (
      React.createElement('ul',{className:'space-y-2'},
        sorted.map(l=>React.createElement('li',{key:l.id,className:'border-b pb-1 text-sm'},
          React.createElement('div',{className:'font-mono text-xs text-gray-500'},l.timestamp),
          React.createElement('div',null,`${l.type||''} ${l.body||''}`),
          React.createElement('div',{className:'text-xs'},`success: ${l.successCount||0}, failed: ${l.failed||l.errorCount||0}`),
          l.error && React.createElement('div',{className:'text-red-600 text-xs'},`error: ${l.error}`)
        ))
      )
    ) : React.createElement('p',{className:'text-center mt-4 text-gray-500'},'Ingen logs')
  );
}
