import React from 'react';
import InfoOverlay from './InfoOverlay.jsx';
import { useT } from '../i18n.js';

export default function HelpOverlay({ onClose }) {
  const t = useT();
  return React.createElement(InfoOverlay, { title: t('helpTitle'), onClose },
    React.createElement('div', { className: 'space-y-2 text-sm' },
      React.createElement('p', null, t('helpLevels')),
      React.createElement('p', null, t('helpSupport')),
      React.createElement('p', null, t('helpInvites'))
    )
  );
}
