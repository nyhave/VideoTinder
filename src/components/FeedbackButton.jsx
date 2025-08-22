import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from './ui/button.js';
import BugReportOverlay from './BugReportOverlay.jsx';

export default function FeedbackButton() {
  const [showReport, setShowReport] = useState(false);
  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: 'fixed top-1/2 right-0 z-40 transform -translate-y-1/2' },
      React.createElement(Button, {
        className: 'bg-pink-500 text-white p-2 rounded-l-lg shadow-md',
        onClick: () => setShowReport(true)
      }, React.createElement(MessageCircle, { className: 'w-6 h-6 text-white' }))
    ),
    showReport && React.createElement(BugReportOverlay, { onClose: () => setShowReport(false) })
  );
}
