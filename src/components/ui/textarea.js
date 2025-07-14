import React from 'react';
export const Textarea = React.forwardRef(function Textarea({ className = '', ...props }, ref){
  const base = 'w-full block';
  return React.createElement('textarea', { ref, className: `${base} ${className}`.trim(), ...props }, props.children);
});
