import React, { useState } from 'react';
import InfoOverlay from './InfoOverlay.jsx';
import { Input } from './ui/input.js';
import { Button } from './ui/button.js';
import { useT } from '../i18n.js';
import { auth, sendPasswordResetEmail, fetchSignInMethodsForEmail } from '../firebase.js';

export default function ForgotPasswordOverlay({ onClose }) {
  const t = useT();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const sendReset = async () => {
    setStatus('');
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (!methods || methods.length === 0) {
        setStatus(t('resetEmailUserNotFound'));
        return;
      }
      await sendPasswordResetEmail(auth, email);
      setStatus(t('resetEmailSent'));
    } catch (err) {
      console.error('Failed to send reset email', err);
      setStatus(t('resetEmailFailed'));
    }
  };

  return React.createElement(InfoOverlay, { title: t('forgotPassword'), onClose },
    React.createElement('div', { className: 'space-y-2' },
      React.createElement(Input, {
        type: 'email',
        className: 'border p-2 w-full',
        value: email,
        onChange: e => setEmail(e.target.value),
        placeholder: 'you@example.com'
      }),
      React.createElement(Button, { className: 'w-full bg-pink-500 text-white', onClick: sendReset }, t('sendReset')),
      status && React.createElement('p', { className: 'text-center mt-2' }, status)
    )
  );
}
