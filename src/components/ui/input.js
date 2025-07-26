import React from 'react';
export const Input = React.forwardRef(function Input({ className = '', ...props }, ref) {
  return React.createElement('input', { ref, className, ...props });
});
