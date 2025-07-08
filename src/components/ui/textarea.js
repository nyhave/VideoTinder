import React from 'react';
export function Textarea({ className = '', ...props }) {
  const base = 'w-full block';
  return React.createElement('textarea', { className: `${base} ${className}`.trim(), ...props }, props.children);
}
