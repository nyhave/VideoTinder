import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function FeedbackButton({ onClick }) {
  return React.createElement(
    'button',
    {
      className: 'fixed right-2 top-1/2 bg-pink-500 text-white p-3 rounded-full shadow-lg z-20',
      style: { transform: 'translateY(-50%)' },
      onClick,
      'aria-label': 'Send feedback'
    },
    React.createElement(MessageSquare, { className: 'w-5 h-5' })
  );
}
