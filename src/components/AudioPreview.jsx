import React from 'react';
import { Button } from './ui/button.js';

export default function AudioPreview({ src, onDelete, onReplace }) {
  return React.createElement('div', { className: 'flex flex-col items-start' },
    React.createElement('audio', {
      src,
      controls: true,
      className: 'w-28'
    }),
    React.createElement('div', { className: 'mt-1 flex gap-1' },
      onDelete && React.createElement(Button, {
        className: 'flex-1 bg-gray-200 text-gray-700',
        onClick: onDelete
      }, 'Slet'),
      onReplace && React.createElement(Button, {
        className: 'flex-1 bg-pink-500 text-white',
        onClick: onReplace
      }, 'Erstat')
    )
  );
}
