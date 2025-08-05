import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function VerificationBadge(){
  return React.createElement('span', { className:'flex items-center gap-1 text-green-600 text-xs' },
    React.createElement(CheckCircle, { className:'w-4 h-4' }),
    'Verified'
  );
}
