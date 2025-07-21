import React from 'react';
import InfoOverlay from './InfoOverlay.jsx';
import { useT } from '../i18n.js';

export default function ForgotPasswordOverlay({ onClose }) {
  const t = useT();
  return React.createElement(InfoOverlay, { title: t('forgotPassword'), onClose },
    React.createElement('p', { className: 'text-center' }, t('forgotPasswordInfo'))
  );
}
