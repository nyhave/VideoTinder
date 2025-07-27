import React from 'react';
import TurnGame from './TurnGame.jsx';
import { X } from 'lucide-react';

export default function RealettenGameOverlay({ players, onClose }) {
  return React.createElement('div', { className:'fixed inset-0 z-50 bg-black/70 flex items-center justify-center' },
    React.createElement('div', { className:'relative w-full max-w-md mx-4' },
      React.createElement(TurnGame, { players, onExit:onClose }),
      React.createElement('button', { className:'absolute top-2 right-2 text-white bg-black/40 rounded-full p-1', onClick:onClose },
        React.createElement(X, { className:'w-6 h-6' })
      )
    )
  );
}
