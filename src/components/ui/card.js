import React from 'https://cdn.skypack.dev/react';
export function Card({ className = '', ...props }) {
  return React.createElement('div', { className, ...props }, props.children);
}
