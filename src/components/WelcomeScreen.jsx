import React, { useState, useEffect } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { languages, useLang, useT } from '../i18n.js';

export default function WelcomeScreen({ profiles = [], onLogin }) {
  const [selected, setSelected] = useState(profiles[0]?.id || '');
  const { lang, setLang } = useLang();
  const t = useT();

  useEffect(() => {
    if (!selected && profiles.length) {
      setSelected(profiles[0].id);
    }
  }, [profiles, selected]);
  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement('h1', { className: 'text-3xl font-bold mb-4 text-pink-600 text-center' }, 'Om RealDate'),
    React.createElement('p', { className: 'mb-4 text-gray-700' },
      'Velkommen til en ny måde at date på. Her er fokus på at finde den personen med den rigtige energi. Det gør vi gennem lyd og video fremfor billeder.'
      + 'Her handler det ikke om hurtige swipes.'
      + 'RealDate er for dig, der søger noget ægte og meningsfuldt.'
    ),
    React.createElement('label', { className:'block mb-1' }, t('chooseLanguage')),
    React.createElement('select', {
      className: 'border p-2 mb-4 w-full',
      onChange: e => setLang(e.target.value),
      value: lang
    },
      Object.entries(languages).map(([code,name]) =>
        React.createElement('option', { key: code, value: code }, name)
      )
    ),
    React.createElement('select', {
      className: 'border p-2 mb-4 w-full',
      onChange: e => setSelected(e.target.value),
      value: selected || ''
    },
      React.createElement('option', { value: '' }, `-- ${t('selectUser')} --`),
      profiles.map(p => React.createElement('option', { key: p.id, value: p.id }, p.name))
    ),
    React.createElement(Button, {
      onClick: () => selected && onLogin(selected),
      className: 'bg-pink-500 hover:bg-pink-600 text-white mt-4',
      disabled: !selected
    }, t('login'))
  );
}
