import React, { useState } from 'https://cdn.skypack.dev/react';

export default function SignUp({ onSignUp }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      try {
        localStorage.setItem('name', name.trim());
      } catch (err) {
        // ignore storage errors
      }
      onSignUp();
    }
  };

  return React.createElement(
    'form',
    { onSubmit: handleSubmit, className: 'signup-form' },
    React.createElement('h2', null, 'Sign Up'),
    React.createElement('input', {
      type: 'text',
      placeholder: 'Your name',
      value: name,
      onChange: (e) => setName(e.target.value),
    }),
    React.createElement(
      'button',
      { type: 'submit' },
      'Sign Up'
    )
  );
}
