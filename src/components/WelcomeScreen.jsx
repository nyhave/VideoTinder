import React, { useState, useEffect } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Input } from './ui/input.js';
import { languages, useLang, useT } from '../i18n.js';
import { db, doc, setDoc } from '../firebase.js';

export default function WelcomeScreen({ profiles = [], onLogin }) {
  const [selected, setSelected] = useState(profiles[0]?.id || '');
  const [showRegister, setShowRegister] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState('Kvinde');
  const { lang, setLang } = useLang();
  const t = useT();

  useEffect(() => {
    if (!selected && profiles.length) {
      setSelected(profiles[0].id);
    }
  }, [profiles, selected]);

  const register = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = Date.now().toString();
    const profile = {
      id,
      name: trimmed,
      city: city.trim(),
      gender,
      interest: gender === 'Kvinde' ? 'Mand' : 'Kvinde',
      age: 18,
      language: lang,
      preferredLanguages: [lang],
      allowOtherLanguages: true,
      distanceRange: [10, 25],
      audioClips: [],
      videoClips: []
    };
    await setDoc(doc(db, 'profiles', id), profile);
    onLogin(id);
  };
  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    showRegister ? (
      React.createElement(React.Fragment, null,
        React.createElement('h1', { className: 'text-3xl font-bold mb-4 text-pink-600 text-center' }, t('register')),
        React.createElement(Input, {
          className: 'border p-2 mb-2 w-full',
          value: name,
          onChange: e => setName(e.target.value),
          placeholder: 'Fornavn',
          name: 'given-name',
          autoComplete: 'given-name'
        }),
        React.createElement('input', {
          list: 'city-list',
          className: 'border p-2 mb-2 w-full',
          value: city,
          onChange: e => setCity(e.target.value),
          placeholder: 'By',
          name: 'city',
          autoComplete: 'address-level2'
        }),
        React.createElement('datalist', { id: 'city-list' },
          ['København','Aarhus','Odense','Aalborg','Esbjerg','Randers'].map(c =>
            React.createElement('option', { key: c, value: c })
          )
        ),
        React.createElement('select', {
          className: 'border p-2 mb-4 w-full',
          value: gender,
          onChange: e => setGender(e.target.value)
        },
          React.createElement('option', { value: 'Kvinde' }, 'Kvinde'),
          React.createElement('option', { value: 'Mand' }, 'Mand')
        ),
        React.createElement('div', { className: 'flex justify-between' },
          React.createElement(Button, {
            onClick: register,
            className: 'bg-pink-500 text-white'
          }, t('register')),
          React.createElement(Button, {
            variant: 'outline',
            onClick: () => setShowRegister(false)
          }, t('cancel'))
        )
      )
    ) : (
      React.createElement(React.Fragment, null,
        React.createElement('h1', { className: 'text-3xl font-bold mb-4 text-pink-600 text-center' }, 'Om RealDate'),
        React.createElement('p', { className: 'mb-4 text-gray-700' },
          'Velkommen til en ny måde at date på. Her er fokus på at finde den personen med den rigtige energi. Det gør vi gennem lyd og video fremfor billeder.' +
          'Her handler det ikke om hurtige swipes.' +
          'RealDate er for dig, der søger noget ægte og meningsfuldt.'
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
        }, t('login')),
        React.createElement(Button, {
          className: 'mt-2 w-full',
          variant: 'outline',
          onClick: () => { setShowRegister(true); setName(''); setCity(''); }
        }, t('register'))
      )
    )
  );
}
