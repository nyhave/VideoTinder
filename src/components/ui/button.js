import React from 'https://cdn.skypack.dev/react';
export function Button({ className = '', ...props }) {
  return React.createElement('button', { className, ...props }, props.children);
}
