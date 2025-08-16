import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { ArrowLeft } from 'lucide-react';
import { useT } from '../i18n.js';

export default function FaqScreen({ onBack }) {
  const t = useT();
  const action = React.createElement(Button, { className: 'flex items-center gap-1', onClick: onBack },
    React.createElement(ArrowLeft, { className: 'w-4 h-4' }), t('back'));
  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: t('faq'), action }),
    React.createElement('p', { className: 'mb-4 text-gray-700' }, t('faqIntro')),
    React.createElement('ul', { className: 'list-disc pl-5 text-gray-700' },
      React.createElement('li', null, 'Hvordan fungerer RealDate? RealDate bruger korte videoklip til at vise energi og personlighed.'),
      React.createElement('li', null, 'Hvordan kontakter jeg support? Brug knappen "Fejlmeld" på Om RealDate-siden.')
    )
  );
}
