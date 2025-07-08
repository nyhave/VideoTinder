import React from 'https://cdn.skypack.dev/react';
export function Input({ className = '', ...props }) {
  return React.createElement('input', { className, ...props });
}
