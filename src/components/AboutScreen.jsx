import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import BugReportOverlay from './BugReportOverlay.jsx';
import InviteOverlay from './InviteOverlay.jsx';
import version from '../version.js';
import { useT } from '../i18n.js';

export default function AboutScreen({ userId }) {
  const [showReport, setShowReport] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const t = useT();
  return React.createElement(React.Fragment, null,
    React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
      React.createElement('h1', { className: 'text-3xl font-bold mb-4 text-pink-600 text-center' }, 'Om RealDate'),
      React.createElement('p', { className: 'mb-4 text-gray-700' },
        'Velkommen til en ny måde at date på. Her handler det ikke om hurtige swipes, men om at tage sig tid til at lære hinanden at kende. '
        + 'RealDate er for dig, der søger noget ægte og meningsfuldt. Tag det stille og roligt, og find den forbindelse, der virkelig betyder noget.'
      ),
      React.createElement('p', { className: 'text-gray-500 text-sm text-center mb-4' }, `Version ${version}`),
      React.createElement(Button, { className: 'bg-blue-500 text-white w-full mb-2', onClick: () => setShowInvite(true) }, t('inviteFriend')),
      React.createElement(Button, { className: 'bg-pink-500 text-white w-full mb-2', onClick: () => setShowReport(true) }, 'Fejlmeld')
    ),
    showInvite && React.createElement(InviteOverlay, { userId, onClose: () => setShowInvite(false) }),
    showReport && React.createElement(BugReportOverlay, { onClose: () => setShowReport(false) })
  );
}
