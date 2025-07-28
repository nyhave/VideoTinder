import React from 'react';
import { interestOptions, interestCategories } from '../interests.js';

export default function InterestsSelect({ value = [], onChange, className = '' }) {
  const categories = {};
  interestOptions.forEach(i => {
    const cat = interestCategories[i] || 'Andet';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(i);
  });

  const handleChange = e => {
    const opts = Array.from(e.target.selectedOptions).map(o => o.value);
    onChange(opts);
  };

  return React.createElement(
    'select',
    {
      multiple: true,
      value,
      onChange: handleChange,
      className: `border p-2 rounded w-full h-40 ${className}`
    },
    Object.entries(categories).map(([cat, opts]) =>
      React.createElement(
        'optgroup',
        { key: cat, label: cat },
        opts.map(o => React.createElement('option', { key: o, value: o }, o))
      )
    )
  );
}
