import React from 'https://cdn.skypack.dev/react';

export default function SectionTitle({ title }) {
  return React.createElement('h2', { className: 'text-2xl font-semibold mb-2 text-pink-600' }, title);
}
