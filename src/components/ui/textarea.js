import React from 'react';
export function Textarea({ className = '', ...props }) {
  return React.createElement('textarea', { className, ...props }, props.children);
}
