import React from 'react';
export const Card = React.forwardRef(function Card({ className = '', ...props }, ref) {
  return React.createElement('div', { className, ref, ...props }, props.children);
});
