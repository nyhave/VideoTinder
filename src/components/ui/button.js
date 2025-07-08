import React from 'react';
export function Button({ className = '', ...props }) {
  return React.createElement('button', { className, ...props }, props.children);
}
