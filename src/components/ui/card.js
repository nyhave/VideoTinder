import React from 'react';
export function Card({ className = '', ...props }) {
  return React.createElement('div', { className, ...props }, props.children);
}
