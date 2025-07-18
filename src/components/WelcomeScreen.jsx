import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Input } from './ui/input.js';
import InfoOverlay from './InfoOverlay.jsx';
import { UserPlus, LogIn } from 'lucide-react';
import { useLang, useT } from '../i18n.js';
import { db, doc, setDoc, updateDoc, increment } from '../firebase.js';
import { getAge } from '../utils.js';

export default function WelcomeScreen({ onLogin }) {
  const [showRegister, setShowRegister] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('Kvinde');
  const [birthday, setBirthday] = useState('');
  const [showBirthdayOverlay, setShowBirthdayOverlay] = useState(false);
  const [showMissingFields, setShowMissingFields] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);
  const { lang } = useLang();
  const t = useT();

  const handleBirthdayBlur = () => {
    setShowBirthdayOverlay(false);
    if (birthday && getAge(birthday) < 18) {
      alert('Du skal v\u00e6re mindst 18 \u00e5r for at bruge appen');
    }
  };

  const register = async () => {
    const trimmedName = name.trim();
    const trimmedCity = city.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedCity || !trimmedEmail || !birthday) {
      setTriedSubmit(true);
      setShowMissingFields(true);
      return;
    }
    // Require a valid birthday confirming the user is at least 18
    if (!birthday || getAge(birthday) < 18) {
      alert('Du skal v\u00e6re mindst 18 \u00e5r for at bruge appen');
      return;
    }
    const id = Date.now().toString();
    const params = new URLSearchParams(window.location.search);
    const giftFrom = params.get('gift');
    const profile = {
      id,
      name: trimmedName,
      city: trimmedCity,
      email: trimmedEmail,
      gender,
      interest: gender === 'Kvinde' ? 'Mand' : 'Kvinde',
      birthday,
      age: birthday ? getAge(birthday) : 18,
      language: lang,
      preferredLanguages: [lang],
      allowOtherLanguages: true,
      distanceRange: [10, 25],
      audioClips: [],
      videoClips: [],
      interests: []
    };
    if (giftFrom) {
      const now = new Date();
      const expiry = new Date(now);
      expiry.setMonth(expiry.getMonth() + 3);
      profile.subscriptionActive = true;
      profile.subscriptionPurchased = now.toISOString();
      profile.subscriptionExpires = expiry.toISOString();
      profile.giftedBy = giftFrom;
      try {
        await updateDoc(doc(db, 'profiles', giftFrom), { premiumInvitesUsed: increment(1) });
      } catch (err) {
        console.error('Failed to update inviter', err);
      }
    }
    await setDoc(doc(db, 'profiles', id), profile);
    alert(t(giftFrom ? 'profileCreatedGift' : 'profileCreated'));
    onLogin(id);
  };
  return React.createElement(
    React.Fragment,
    null,
    showBirthdayOverlay && React.createElement('div', {
      className: 'fixed inset-0 flex flex-col items-center justify-center bg-black/80 z-50'
    },
      React.createElement('h1', {
        className: 'text-3xl font-bold text-pink-600 text-center mb-4 mt-10'
      }, t('chooseBirthday')),
      React.createElement(Input, {
        type: 'date',
        className: 'border p-2',
        value: birthday,
        onChange: e => setBirthday(e.target.value),
        onBlur: handleBirthdayBlur,
        autoFocus: true
      })
    ),
    showMissingFields && React.createElement(InfoOverlay, {
      title: t('missingFieldsTitle'),
      onClose: () => setShowMissingFields(false)
    },
      React.createElement('p', null, t('missingFieldsDesc'))
    ),
    React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
      showRegister ? (
      React.createElement(React.Fragment, null,
        React.createElement('h1', { className: 'text-3xl font-bold mb-4 text-pink-600 text-center' }, t('register')),
        React.createElement('label', { className:'block mb-1' }, t('firstName')),
        React.createElement(Input, {
          className: `border p-2 mb-2 w-full ${triedSubmit && !name.trim() ? 'border-red-500' : ''}`,
          value: name,
          onChange: e => setName(e.target.value),
          placeholder: 'Fornavn',
          name: 'given-name',
          autoComplete: 'given-name',
          required: true
        }),
        React.createElement('label', { className:'block mb-1' }, t('city')),
        React.createElement('input', {
          className: `border p-2 mb-2 w-full ${triedSubmit && !city.trim() ? 'border-red-500' : ''}`,
          value: city,
          onChange: e => setCity(e.target.value),
          placeholder: 'By',
          name: 'cityname',
          autoComplete: 'address-level2',
          required: true
        }),
        React.createElement('label', { className:'block mb-1' }, t('birthday')),
        React.createElement(Input, {
          type: 'date',
          className: `border p-2 mb-2 w-full ${triedSubmit && !birthday ? 'border-red-500' : ''}`,
          value: birthday,
          onFocus: () => setShowBirthdayOverlay(true),
          onChange: e => setBirthday(e.target.value),
          placeholder: 'F\u00f8dselsdag',
          required: true
        }),
        React.createElement('label', { className:'block mb-1' }, t('email')),
        React.createElement(Input, {
          type: 'email',
          className: `border p-2 mb-2 w-full ${triedSubmit && !email.trim() ? 'border-red-500' : ''}`,
          value: email,
          onChange: e => setEmail(e.target.value),
          placeholder: 'you@example.com',
          name: 'email',
          autoComplete: 'email',
          required: true
        }),
        React.createElement('p', {
          className:'text-xs text-gray-500 mb-2'
        }, t('emailPrivate')),
        React.createElement('label', { className:'block mb-1' }, t('gender')),
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
        
        React.createElement(Button, {
          className: 'bg-pink-500 text-white mb-4',
          onClick: () => onLogin()
        }, t('login')),
        React.createElement(Button, {
          className: 'bg-pink-500 text-white',
          onClick: () => { setShowRegister(true); setName(''); setCity(''); }
        }, t('register'))
      )
    )
  ));
}
