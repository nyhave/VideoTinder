import React from 'react';

export default function PuzzleReveal({ label }) {
  return React.createElement('div', { className: 'puzzle-reveal absolute inset-0 rounded overflow-hidden pointer-events-none' },
    React.createElement('div', { className: 'piece tl reveal-animation' }),
    React.createElement('div', { className: 'piece tr reveal-animation' }),
    React.createElement('div', { className: 'piece bl reveal-animation' }),
    React.createElement('div', { className: 'piece br reveal-animation' }),
    React.createElement('div', { className: 'piece center reveal-animation flex items-center justify-center' },
      React.createElement('span', { className: 'text-pink-500 text-xs font-semibold' }, label)
    )
  );
}
