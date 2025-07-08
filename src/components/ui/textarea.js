import React from 'https://cdn.skypack.dev/react';
export function Textarea({ className = '', ...props }) {
  return React.createElement('textarea', { className, ...props }, props.children);
}
