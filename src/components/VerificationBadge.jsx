import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useT } from '../i18n.js';

export default function VerificationBadge(){
  const t = useT();
  return React.createElement('span', { className:'flex items-center gap-1 text-green-600 text-xs' },
    React.createElement(CheckCircle, { className:'w-4 h-4' }),
    t('verified')
  );
}
