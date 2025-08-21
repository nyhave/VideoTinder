import React from 'react';

export default function PuzzleReveal({ label }) {
  return React.createElement('div', { className: 'puzzle-reveal absolute inset-0 rounded overflow-hidden pointer-events-none' },
    React.createElement('div', { className: 'piece tl' }),
    React.createElement('div', { className: 'piece tr' }),
    React.createElement('div', { className: 'piece bl' }),
    React.createElement('div', { className: 'piece br' }),
    React.createElement('div', { className: 'piece center flex items-center justify-center' },
      React.createElement('span', { className: 'text-pink-500 text-xs font-semibold' }, label)
    )
  );
}
