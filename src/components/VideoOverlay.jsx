import React from 'react';
import { X } from 'lucide-react';

export default function VideoOverlay({ src, onClose }) {
  return React.createElement('div', { className:'fixed inset-0 z-50 bg-black/70 flex items-center justify-center' },
    React.createElement('div', { className:'relative w-full max-w-md mx-4' },
      React.createElement('video', { src, controls:true, className:'w-full rounded' }),
      React.createElement('button', { onClick:onClose, className:'absolute top-2 right-2 text-white bg-black/40 rounded-full p-1' },
        React.createElement(X,{className:'w-6 h-6'})
      )
    )
  );
}
