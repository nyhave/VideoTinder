import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Textarea } from './ui/textarea.js';
import { Input } from './ui/input.js';
import { db, storage, doc, setDoc, ref, uploadBytes, getDownloadURL } from '../firebase.js';

export default function BugReportOverlay({ onClose }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);

  const submit = async () => {
    const id = Date.now().toString();
    let screenshotURL = '';
    if (file) {
      const storageRef = ref(storage, `bugReports/${id}-${file.name}`);
      await uploadBytes(storageRef, file);
      screenshotURL = await getDownloadURL(storageRef);
    }
    await setDoc(doc(db, 'bugReports', id), {
      id,
      text,
      screenshotURL,
      createdAt: new Date().toISOString(),
      closed: false
    });
    onClose();
    alert('Tak for din fejlmelding');
  };

  return React.createElement('div', { className: 'fixed inset-0 z-50 bg-black/50 flex items-center justify-center' },
    React.createElement(Card, { className: 'bg-white p-6 rounded shadow-xl max-w-sm w-full' },
      React.createElement('h2', { className: 'text-xl font-semibold mb-4 text-pink-600 text-center' }, 'Rapport\u00E9r en fejl'),
      React.createElement(Textarea, {
        className: 'mb-2 border p-2 rounded w-full',
        placeholder: 'Beskriv fejlen...',
        value: text,
        onChange: e => setText(e.target.value)
      }),
      React.createElement(Input, {
        type: 'file',
        accept: 'image/*',
        className: 'mb-4 w-full',
        onChange: e => setFile(e.target.files[0])
      }),
      React.createElement(Button, {
        className: 'w-full bg-pink-500 text-white mb-2',
        disabled: !text.trim(),
        onClick: submit
      }, 'Send'),
      React.createElement(Button, { className: 'w-full', onClick: onClose }, 'Annuller')
    )
  );
}
