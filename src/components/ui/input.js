import React from 'react';
export function Input({ className = '', ...props }) {
  return React.createElement('input', { className, ...props });
}
